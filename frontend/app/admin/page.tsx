"use client";

export const dynamic = "force-dynamic";

import RichEditor from '@/components/RichEditor';
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const API = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rashtriya-prahari.vercel.app";

// ── Types ──────────────────────────────────────────────────────────────────
interface Article {
  id: string;
  title_hi: string;
  title_en: string;
  content: string;
  category: string;
  pdf_url?: string;
  image_url: string;
  is_breaking: boolean;
  is_published: boolean;
  created_at: string;
  scheduled_at?: string;
  view_count?: number;
}
interface PDF { id: string; title: string; file_url: string; created_at: string; }
interface UserProfile { id: string; email: string; display_name?: string; created_at: string; }
interface FooterPage { id: string; slug: string; title: string; content: string; updated_at: string; }
interface ActivityLog { id: string; action: string; article_title: string; timestamp: string; admin_email: string; }

const CATEGORIES = ["राजनीति", "खेल", "मनोरंजन", "तकनीक", "व्यापार", "स्वास्थ्य", "करियर", "अंतर्राष्ट्रीय"];
const FOOTER_SLUGS = [
  { slug: "about", title: "हमारे बारे में" },
  { slug: "contact", title: "संपर्क करें" },
  { slug: "privacy", title: "गोपनीयता नीति" },
  { slug: "terms", title: "नियम और शर्तें" },
  { slug: "disclaimer", title: "अस्वीकरण" },
];
const emptyArticle = {
  title_hi: "", title_en: "", content: "", category: CATEGORIES[0],
  image_url: "", pdf_url: "", is_breaking: false, is_published: true, scheduled_at: "",
};
type Tab = "dashboard" | "articles" | "pdfs" | "users" | "footer" | "notifications" | "activity";

// ── Component ──────────────────────────────────────────────────────────────
export default function AdminPage() {
  const supabase: SupabaseClient | null = useMemo(() => {
    if (typeof window === "undefined") return null;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  }, []);

  // Auth
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Navigation
  const [tab, setTab] = useState<Tab>("dashboard");

  // Data
  const [articles, setArticles] = useState<Article[]>([]);
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [footerPages, setFooterPages] = useState<FooterPage[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [pushCount, setPushCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);

  // Article form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyArticle);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [scheduling, setScheduling] = useState(false);

  // Footer editor
  const [editingFooter, setEditingFooter] = useState<FooterPage | null>(null);
  const [footerSaving, setFooterSaving] = useState(false);

  // Push notification composer
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushUrl, setPushUrl] = useState("/");
  const [pushSending, setPushSending] = useState(false);
  const [pushResult, setPushResult] = useState<{ sent: number; failed: number } | null>(null);

  // Uploads
  const [imageUploading, setImageUploading] = useState(false);
  const [articlePdfUploading, setArticlePdfUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfTitle, setPdfTitle] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const articlePdfInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // ── Auth ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (session) { fetchArticles(); fetchPdfs(); fetchUsers(); fetchFooterPages(); loadActivityLog(); fetchPushCount(); }
  }, [session]);

  // ── Fetchers ─────────────────────────────────────────────────────────────
  const fetchArticles = async () => {
    setDataLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/news`);
      const { data } = await res.json();
      setArticles(data || []);
    } catch (e) { console.error(e); }
    setDataLoading(false);
  };

  const fetchPdfs = async () => {
    if (!supabase) return;
    const { data } = await supabase.from("pdfs").select("*").order("created_at", { ascending: false });
    setPdfs(data || []);
  };

  const fetchUsers = async () => {
    if (!supabase) return;
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
  };

  const fetchFooterPages = async () => {
    if (!supabase) return;
    const { data } = await supabase.from("footer_pages").select("*").order("slug");
    setFooterPages(data || []);
  };

  const fetchPushCount = async () => {
    try {
      const res = await fetch(`${API}/api/v1/push/count`);
      const { count } = await res.json();
      setPushCount(count || 0);
    } catch (e) {}
  };

  const loadActivityLog = () => {
    try {
      const saved = localStorage.getItem("rp_activity_log");
      if (saved) setActivityLog(JSON.parse(saved));
    } catch (e) {}
  };

  const logActivity = useCallback((action: string, articleTitle: string) => {
    if (!session) return;
    const entry: ActivityLog = {
      id: Date.now().toString(), action, article_title: articleTitle,
      timestamp: new Date().toISOString(), admin_email: session.user.email,
    };
    setActivityLog(prev => {
      const updated = [entry, ...prev].slice(0, 50);
      try { localStorage.setItem("rp_activity_log", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  }, [session]);

  const getToken = async (): Promise<string | null> => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  };

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 3500); };

  // ── Article CRUD ──────────────────────────────────────────────────────────
  const openAddForm = () => { setForm(emptyArticle); setEditingId(null); setFormError(""); setScheduling(false); setShowForm(true); };

  const openEditForm = (article: Article) => {
    setForm({
      title_hi: article.title_hi || "", title_en: article.title_en || "",
      content: article.content || "", category: article.category || CATEGORIES[0],
      image_url: article.image_url || "", pdf_url: article.pdf_url || "",
      is_breaking: article.is_breaking || false, is_published: article.is_published !== false,
      scheduled_at: article.scheduled_at || "",
    });
    setEditingId(article.id); setFormError(""); setScheduling(!!article.scheduled_at); setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_hi.trim()) { setFormError("हिंदी शीर्षक आवश्यक है।"); return; }
    setFormLoading(true); setFormError("");
    try {
      const token = await getToken();
      const url = editingId ? `${API}/api/v1/news/${editingId}` : `${API}/api/v1/news`;
      const payload = { ...form, is_published: scheduling ? false : form.is_published, scheduled_at: scheduling && form.scheduled_at ? form.scheduled_at : null };
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Server error");

      // Auto-send push if breaking news and published now
      if (form.is_breaking && form.is_published && !scheduling) {
        sendPushNotification(form.title_hi, "ब्रेकिंग न्यूज़ - राष्ट्रीय प्रहरी भारत", "/");
      }

      setShowForm(false); fetchArticles();
      logActivity(editingId ? "✏️ संपादित" : "➕ जोड़ा", form.title_hi);
      showSuccess(editingId ? "✅ लेख अपडेट हो गया!" : scheduling ? "🕐 लेख शेड्यूल हो गया!" : "✅ नया लेख जोड़ा गया!");
    } catch (err) { setFormError("कुछ गड़बड़ हुई। कृपया पुनः प्रयास करें।"); }
    setFormLoading(false);
  };

  const handleDelete = async (id: string) => {
    const article = articles.find(a => a.id === id);
    try {
      const token = await getToken();
      await fetch(`${API}/api/v1/news/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setDeleteConfirm(null); fetchArticles();
      logActivity("🗑️ हटाया", article?.title_hi || id);
      showSuccess("🗑️ लेख हटा दिया गया!");
    } catch (e) { console.error(e); }
  };

  // ── Footer editor ─────────────────────────────────────────────────────────
  const saveFooterPage = async () => {
    if (!supabase || !editingFooter) return;
    setFooterSaving(true);
    await supabase.from("footer_pages")
      .update({ content: editingFooter.content, title: editingFooter.title, updated_at: new Date().toISOString() })
      .eq("id", editingFooter.id);
    await fetchFooterPages();
    setFooterSaving(false);
    showSuccess("✅ पृष्ठ सहेजा गया!");
  };

  // ── Push notifications ────────────────────────────────────────────────────
  const sendPushNotification = async (title: string, body: string, url: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/v1/push/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, body, url }),
      });
      return await res.json();
    } catch (e) { console.error(e); }
  };

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim()) return;
    setPushSending(true);
    setPushResult(null);
    const result = await sendPushNotification(pushTitle, pushBody, pushUrl);
    if (result) {
      setPushResult({ sent: result.sent, failed: result.failed });
      logActivity("🔔 नोटिफिकेशन भेजा", pushTitle);
      showSuccess(`✅ ${result.sent} उपयोगकर्ताओं को नोटिफिकेशन भेजा गया!`);
    }
    setPushSending(false);
  };

  // ── Upload handlers ───────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImageUploading(true);
    try {
      const token = await getToken(); const fd = new FormData(); fd.append("file", file);
      const res = await fetch(`${API}/api/v1/upload`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const { url, fileType } = await res.json();
      if (fileType === "pdf") setForm(f => ({ ...f, pdf_url: url }));
      else setForm(f => ({ ...f, image_url: url }));
      showSuccess("✅ इमेज अपलोड हो गई!");
    } catch (e) { alert("इमेज अपलोड नहीं हुई।"); }
    setImageUploading(false);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleArticlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) { alert("केवल PDF फ़ाइल चुनें।"); return; }
    setArticlePdfUploading(true);
    try {
      const token = await getToken(); const fd = new FormData(); fd.append("file", file);
      const res = await fetch(`${API}/api/v1/upload`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const { url } = await res.json();
      if (url) { setForm(f => ({ ...f, pdf_url: url })); showSuccess("✅ PDF जोड़ा गया!"); }
    } catch (e) { alert("PDF अपलोड नहीं हुआ।"); }
    setArticlePdfUploading(false);
    if (articlePdfInputRef.current) articlePdfInputRef.current.value = "";
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!pdfTitle.trim()) { alert("शीर्षक दर्ज करें।"); return; }
    if (!supabase) return;
    setPdfUploading(true);
    try {
      const token = await getToken(); const fd = new FormData(); fd.append("file", file);
      const res = await fetch(`${API}/api/v1/upload`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const { url } = await res.json();
      if (!url) { alert("PDF अपलोड नहीं हुआ।"); setPdfUploading(false); return; }
      await supabase.from("pdfs").insert({ title: pdfTitle.trim(), file_url: url });
      setPdfTitle(""); fetchPdfs(); showSuccess("✅ PDF सहेजा गया!");
    } catch (e) { alert("PDF अपलोड नहीं हुआ।"); }
    setPdfUploading(false);
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  const handleDeletePdf = async (id: string) => {
    if (!supabase) return;
    await supabase.from("pdfs").delete().eq("id", id);
    fetchPdfs(); showSuccess("🗑️ PDF हटाया गया!");
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDate = (d: string) => new Date(d).toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" });
  const formatDateTime = (d: string) => new Date(d).toLocaleString("hi-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const filteredArticles = articles.filter(a => {
    const matchSearch = !searchQuery || a.title_hi.toLowerCase().includes(searchQuery.toLowerCase()) || a.title_en?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === "all" || a.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalViews = articles.reduce((sum, a) => sum + (a.view_count || 0), 0);
  const scheduledCount = articles.filter(a => a.scheduled_at && !a.is_published).length;
  const topArticles = [...articles].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5);
  const maxCatCount = Math.max(...CATEGORIES.map(c => articles.filter(a => a.category === c).length), 1);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">लोड हो रहा है...</p>
      </div>
    </div>
  );

  if (!supabase) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 text-center">
      <div>
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-white text-xl font-bold mb-2">Supabase not configured</h2>
        <p className="text-gray-400 text-sm">Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to environment variables.</p>
      </div>
    </div>
  );

  // ── Login ─────────────────────────────────────────────────────────────────
  if (!session) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">📰</div>
          <h1 className="text-3xl font-bold text-white mb-1">राष्ट्रीय प्रहरी भारत</h1>
          <p className="text-gray-400 text-sm">Admin Panel • प्रशासन पैनल</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">लॉग इन करें</h2>
          <form onSubmit={async (e) => {
            e.preventDefault(); if (!supabase) return;
            setLoginLoading(true); setLoginError("");
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setLoginError("गलत ईमेल या पासवर्ड।");
            setLoginLoading(false);
          }} className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
            {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
            <button type="submit" disabled={loginLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
              {loginLoading ? "लॉग इन हो रहा है..." : "लॉग इन करें →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  // ── Sidebar nav ───────────────────────────────────────────────────────────
  const navItems: { id: Tab; icon: string; label: string; count?: number }[] = [
    { id: "dashboard",     icon: "📊", label: "डैशबोर्ड" },
    { id: "articles",      icon: "📰", label: "लेख",            count: articles.length },
    { id: "pdfs",          icon: "📄", label: "PDF",             count: pdfs.length },
    { id: "notifications", icon: "🔔", label: "नोटिफिकेशन",    count: pushCount },
    { id: "footer",        icon: "📋", label: "फुटर पृष्ठ",     count: footerPages.length },
    { id: "users",         icon: "👥", label: "उपयोगकर्ता",     count: users.length },
    { id: "activity",      icon: "🕐", label: "गतिविधि" },
  ];

  // ── Main layout ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white flex">

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex-col sticky top-0 h-screen hidden md:flex">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">रा</div>
            <div>
              <div className="font-bold text-white text-sm">राष्ट्रीय प्रहरी</div>
              <div className="text-xs text-orange-400">Admin Panel</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === item.id ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
              <span>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.count !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${tab === item.id ? "bg-orange-500/20 text-orange-400" : "bg-gray-700 text-gray-500"}`}>{item.count}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800 space-y-2">
          <a href={SITE_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 w-full px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
            <span>🌐</span><span>मुख्य वेबसाइट</span><span className="ml-auto text-gray-500 text-xs">↗</span>
          </a>
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center text-sm font-bold text-orange-400">
              {session.user.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white truncate">{session.user.email}</div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>
            <button onClick={async () => { await supabase?.auth.signOut(); setSession(null); }}
              title="लॉग आउट" className="text-gray-500 hover:text-red-400 transition-colors">⏻</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {/* Mobile header */}
        <header className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <span className="font-bold text-sm">📰 Admin</span>
          <div className="flex gap-2">
            <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="text-xs bg-gray-800 px-3 py-1.5 rounded-lg text-gray-300">🌐</a>
            <button onClick={async () => { await supabase?.auth.signOut(); setSession(null); }}
              className="text-xs bg-gray-800 hover:bg-red-900 text-gray-300 hover:text-red-300 px-3 py-1.5 rounded-lg">लॉग आउट</button>
          </div>
        </header>
        <div className="md:hidden flex overflow-x-auto gap-2 px-4 py-3 bg-gray-900 border-b border-gray-800">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium ${tab === item.id ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-400"}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          {successMsg && (
            <div className="fixed top-6 right-6 bg-gray-900 border border-green-700 text-green-300 px-5 py-3 rounded-xl shadow-2xl z-50">{successMsg}</div>
          )}

          {/* ═══════════ DASHBOARD ═══════════ */}
          {tab === "dashboard" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold">डैशबोर्ड</h1>
                <p className="text-gray-400 text-sm mt-1">{new Date().toLocaleDateString("hi-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "कुल लेख",      value: articles.length,              icon: "📰", color: "text-orange-400", border: "border-orange-500/20" },
                  { label: "कुल व्यूज़",   value: totalViews.toLocaleString(),  icon: "👁️", color: "text-blue-400",   border: "border-blue-500/20" },
                  { label: "सब्सक्राइबर", value: pushCount,                    icon: "🔔", color: "text-yellow-400", border: "border-yellow-500/20" },
                  { label: "उपयोगकर्ता",  value: users.length,                 icon: "👥", color: "text-purple-400", border: "border-purple-500/20" },
                ].map(s => (
                  <div key={s.label} className={`bg-gray-900 border ${s.border} rounded-2xl p-5`}>
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-sm text-gray-400 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "ब्रेकिंग", value: articles.filter(a => a.is_breaking).length, icon: "🔴" },
                  { label: "प्रकाशित", value: articles.filter(a => a.is_published).length, icon: "✅" },
                  { label: "शेड्यूल्ड", value: scheduledCount, icon: "🕐" },
                  { label: "PDF",     value: pdfs.length, icon: "📄" },
                ].map(s => (
                  <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className="text-3xl font-bold text-white">{s.value}</div>
                    <div className="text-sm text-gray-400 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Analytics chart */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-5">📊 श्रेणी विश्लेषण</h3>
                <div className="space-y-3">
                  {CATEGORIES.map(cat => {
                    const count = articles.filter(a => a.category === cat).length;
                    const pct = Math.round((count / maxCatCount) * 100);
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <div className="w-28 text-sm text-gray-400 text-right flex-shrink-0">{cat}</div>
                        <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                          <div className="bg-gradient-to-r from-orange-600 to-orange-400 h-3 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }} />
                        </div>
                        <div className="text-sm text-gray-400 w-8 text-right">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top articles */}
              {topArticles.some(a => (a.view_count || 0) > 0) && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4">🔥 सबसे ज़्यादा पढ़े गए</h3>
                  <div className="space-y-3">
                    {topArticles.map((a, i) => (
                      <div key={a.id} className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          i === 0 ? "bg-yellow-500/20 text-yellow-400" : i === 1 ? "bg-gray-500/20 text-gray-300" : i === 2 ? "bg-orange-800/30 text-orange-500" : "bg-gray-800 text-gray-500"
                        }`}>{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate">{a.title_hi}</div>
                          <div className="text-xs text-gray-500">{a.category}</div>
                        </div>
                        <div className="text-sm text-blue-400">{(a.view_count || 0).toLocaleString()} 👁️</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onClick={() => { setTab("articles"); openAddForm(); }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-3 rounded-xl text-sm">＋ नया लेख</button>
                <button onClick={() => setTab("notifications")}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium px-4 py-3 rounded-xl text-sm">🔔 नोटिफिकेशन</button>
                <button onClick={() => setTab("footer")}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium px-4 py-3 rounded-xl text-sm">📋 फुटर एडिट</button>
                <a href={SITE_URL} target="_blank" rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium px-4 py-3 rounded-xl text-sm text-center">🌐 वेबसाइट ↗</a>
              </div>
            </div>
          )}

          {/* ═══════════ ARTICLES ═══════════ */}
          {tab === "articles" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div><h1 className="text-2xl font-bold">लेख प्रबंधन</h1><p className="text-gray-400 text-sm mt-0.5">{articles.length} लेख</p></div>
                <button onClick={openAddForm} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl">＋ नया लेख</button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input type="text" placeholder="लेख खोजें..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-500 text-sm placeholder-gray-600" />
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-500 text-sm">
                  <option value="all">सभी श्रेणियाँ</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {dataLoading ? <div className="text-center py-20 text-gray-500">लोड हो रहा है...</div> : filteredArticles.length === 0 ? (
                <div className="text-center py-20"><div className="text-5xl mb-4">📭</div><p className="text-gray-400">कोई लेख नहीं मिला।</p></div>
              ) : (
                <div className="space-y-3">
                  {filteredArticles.map(article => (
                    <div key={article.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition-colors">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                        {article.image_url ? <img src={article.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📰</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {article.is_breaking && <span className="text-xs bg-red-900/60 text-red-300 px-2 py-0.5 rounded-full">🔴 ब्रेकिंग</span>}
                          {!article.is_published && !article.scheduled_at && <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">📝 ड्राफ्ट</span>}
                          {article.scheduled_at && !article.is_published && <span className="text-xs bg-yellow-900/60 text-yellow-300 px-2 py-0.5 rounded-full">🕐 शेड्यूल्ड</span>}
                          <span className="text-xs bg-gray-800 text-orange-400 px-2 py-0.5 rounded-full">{article.category}</span>
                        </div>
                        <h3 className="font-medium text-white truncate">{article.title_hi}</h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-gray-500">{formatDate(article.created_at)}</span>
                          {article.view_count !== undefined && <span className="text-xs text-blue-400">👁️ {article.view_count}</span>}
                          {article.scheduled_at && <span className="text-xs text-yellow-400">🕐 {formatDateTime(article.scheduled_at)}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <a href={`${SITE_URL}/news/${article.id}`} target="_blank" rel="noopener noreferrer"
                          className="bg-gray-800 hover:bg-green-900 text-gray-300 hover:text-green-300 px-3 py-2 rounded-lg text-sm transition-colors">👁️</a>
                        <button onClick={() => openEditForm(article)} className="bg-gray-800 hover:bg-blue-900 text-gray-300 hover:text-blue-300 px-3 py-2 rounded-lg text-sm transition-colors">✏️</button>
                        <button onClick={() => setDeleteConfirm(article.id)} className="bg-gray-800 hover:bg-red-900 text-gray-300 hover:text-red-300 px-3 py-2 rounded-lg text-sm transition-colors">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════ PDFs ═══════════ */}
          {tab === "pdfs" && (
            <div>
              <div className="mb-6"><h1 className="text-2xl font-bold">PDF प्रबंधन</h1><p className="text-gray-400 text-sm mt-0.5">{pdfs.length} PDF</p></div>
              <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-white mb-4">📤 नई PDF अपलोड करें</h3>
                <div className="flex flex-col md:flex-row gap-3">
                  <input type="text" value={pdfTitle} onChange={e => setPdfTitle(e.target.value)} placeholder="PDF का शीर्षक..."
                    className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 placeholder-gray-600" />
                  <button onClick={() => pdfInputRef.current?.click()} disabled={pdfUploading || !pdfTitle.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold px-6 py-3 rounded-xl whitespace-nowrap">
                    {pdfUploading ? "अपलोड हो रहा है..." : "📄 अपलोड करें"}
                  </button>
                  <input ref={pdfInputRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
                </div>
              </div>
              <div className="space-y-3">
                {pdfs.map(pdf => (
                  <div key={pdf.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition-colors">
                    <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📄</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white">{pdf.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(pdf.created_at)}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={pdf.file_url} target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-green-900 text-gray-300 hover:text-green-300 px-3 py-2 rounded-lg text-sm">👁️</a>
                      <button onClick={() => handleDeletePdf(pdf.id)} className="bg-gray-800 hover:bg-red-900 text-gray-300 hover:text-red-300 px-3 py-2 rounded-lg text-sm">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════ NOTIFICATIONS ═══════════ */}
          {tab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">🔔 पुश नोटिफिकेशन</h1>
                <p className="text-gray-400 text-sm mt-1">अभी <span className="text-yellow-400 font-medium">{pushCount}</span> सब्सक्राइबर हैं</p>
              </div>

              {/* Compose */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-5">नोटिफिकेशन भेजें</h3>
                <form onSubmit={handleSendPush} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">शीर्षक <span className="text-red-400">*</span></label>
                    <input type="text" value={pushTitle} onChange={e => setPushTitle(e.target.value)} required
                      placeholder="ब्रेकिंग न्यूज़: ..."
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 placeholder-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">संदेश</label>
                    <input type="text" value={pushBody} onChange={e => setPushBody(e.target.value)}
                      placeholder="खबर का संक्षिप्त विवरण..."
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 placeholder-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">लिंक (वैकल्पिक)</label>
                    <select value={pushUrl} onChange={e => setPushUrl(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500">
                      <option value="/">होमपेज</option>
                      {articles.slice(0, 10).map(a => (
                        <option key={a.id} value={`/news/${a.id}`}>{a.title_hi.slice(0, 60)}</option>
                      ))}
                    </select>
                  </div>
                  {pushResult && (
                    <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-3 text-sm text-green-300">
                      ✅ भेजा गया: {pushResult.sent} | ❌ विफल: {pushResult.failed}
                    </div>
                  )}
                  <button type="submit" disabled={pushSending || pushCount === 0}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
                    {pushSending ? "भेजा जा रहा है..." : `🔔 ${pushCount} सब्सक्राइबर को भेजें`}
                  </button>
                  {pushCount === 0 && <p className="text-xs text-gray-500 text-center">अभी कोई सब्सक्राइबर नहीं। मुख्य साइट पर नोटिफिकेशन बटन जोड़ें।</p>}
                </form>
              </div>

              
            </div>
          )}

          {/* ═══════════ FOOTER PAGES ═══════════ */}
          {tab === "footer" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">📋 फुटर पृष्ठ</h1>
                <p className="text-gray-400 text-sm mt-1">5 पृष्ठ — क्लिक करके संपादित करें</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FOOTER_SLUGS.map(({ slug, title }) => {
                  const page = footerPages.find(p => p.slug === slug);
                  return (
                    <button key={slug} onClick={() => setEditingFooter(page || { id: "", slug, title, content: "", updated_at: "" })}
                      className={`bg-gray-900 border rounded-xl p-5 text-left hover:border-orange-500/40 transition-colors ${editingFooter?.slug === slug ? "border-orange-500/40 bg-orange-500/5" : "border-gray-800"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-white">{title}</h3>
                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-lg">/{slug}</span>
                      </div>
                      {page?.updated_at && <p className="text-xs text-gray-500">अपडेट: {formatDate(page.updated_at)}</p>}
                      <p className="text-xs text-orange-400 mt-2">क्लिक करके संपादित करें →</p>
                    </button>
                  );
                })}
              </div>

              {/* Editor */}
              {editingFooter && (
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-white text-lg">✏️ {editingFooter.title} संपादित करें</h3>
                    <a href={`${SITE_URL}/page/${editingFooter.slug}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-orange-400 hover:text-orange-300 bg-orange-500/10 px-3 py-1.5 rounded-lg">
                      लाइव देखें ↗
                    </a>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">शीर्षक</label>
                      <input type="text" value={editingFooter.title}
                        onChange={e => setEditingFooter(f => f ? { ...f, title: e.target.value } : f)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">सामग्री (HTML supported)</label>
                      <textarea
                        value={editingFooter.content}
                        onChange={e => setEditingFooter(f => f ? { ...f, content: e.target.value } : f)}
                        rows={12}
                        placeholder="<p>यहाँ लिखें...</p>"
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 font-mono text-sm resize-y"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setEditingFooter(null)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl transition-colors">
                        रद्द करें
                      </button>
                      <button onClick={saveFooterPage} disabled={footerSaving}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
                        {footerSaving ? "सहेजा जा रहा है..." : "सहेजें ✓"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ USERS ═══════════ */}
          {tab === "users" && (
            <div>
              <div className="mb-6"><h1 className="text-2xl font-bold">👥 उपयोगकर्ता</h1><p className="text-gray-400 text-sm mt-0.5">{users.length} पंजीकृत</p></div>
              {users.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">👥</div>
                  <p className="text-gray-400">कोई उपयोगकर्ता नहीं मिला।</p>
                  <p className="text-gray-500 text-sm mt-2">जब उपयोगकर्ता साइन अप करेंगे, वे यहाँ दिखेंगे।</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map(user => (
                    <div key={user.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition-colors">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-sm font-bold text-purple-400">
                        {user.email?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{user.display_name || user.email}</div>
                        {user.display_name && <div className="text-xs text-gray-500">{user.email}</div>}
                        <div className="text-xs text-gray-600 mt-0.5">जुड़े: {formatDate(user.created_at)}</div>
                      </div>
                      <span className="text-xs bg-green-900/40 text-green-400 px-2 py-1 rounded-full">सक्रिय</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════ ACTIVITY ═══════════ */}
          {tab === "activity" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div><h1 className="text-2xl font-bold">🕐 गतिविधि लॉग</h1><p className="text-gray-400 text-sm mt-0.5">अंतिम {activityLog.length} क्रियाएँ</p></div>
                {activityLog.length > 0 && (
                  <button onClick={() => { setActivityLog([]); localStorage.removeItem("rp_activity_log"); }}
                    className="text-xs text-red-400 bg-red-900/20 hover:bg-red-900/30 px-3 py-2 rounded-lg">🗑️ साफ करें</button>
                )}
              </div>
              {activityLog.length === 0 ? (
                <div className="text-center py-20"><div className="text-5xl mb-4">📋</div><p className="text-gray-400">कोई गतिविधि नहीं।</p></div>
              ) : (
                <div className="space-y-3">
                  {activityLog.map(log => (
                    <div key={log.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start gap-4">
                      <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                        {log.action.split(" ")[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-white">{log.action}</span>
                        <span className="text-sm text-gray-400"> — {log.article_title}</span>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">{log.admin_email}</span>
                          <span className="text-xs text-gray-600">•</span>
                          <span className="text-xs text-gray-500">{formatDateTime(log.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ═══════════ ARTICLE FORM MODAL ═══════════ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold">{editingId ? "✏️ लेख संपादित करें" : "➕ नया लेख जोड़ें"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">हिंदी शीर्षक <span className="text-red-400">*</span></label>
                <input type="text" value={form.title_hi} onChange={e => setForm(f => ({ ...f, title_hi: e.target.value }))}
                  placeholder="लेख का हिंदी शीर्षक..."
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 placeholder-gray-600" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">English Title</label>
                <input type="text" value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))}
                  placeholder="Article title in English..."
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 placeholder-gray-600" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">श्रेणी</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">सामग्री</label>
                <RichEditor value={form.content} onChange={val => setForm(f => ({ ...f, content: val }))} placeholder="लेख की सामग्री यहाँ लिखें..." />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">इमेज</label>
                <div className="flex gap-3">
                  <input type="text" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                    placeholder="URL या अपलोड करें..." className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 placeholder-gray-600" />
                  <button type="button" onClick={() => imageInputRef.current?.click()} disabled={imageUploading}
                    className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-3 rounded-xl text-sm whitespace-nowrap">
                    {imageUploading ? "..." : "📷 अपलोड"}
                  </button>
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
                {form.image_url && <img src={form.image_url} alt="" className="mt-2 w-full h-32 object-cover rounded-lg border border-gray-700" />}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">PDF (वैकल्पिक)</label>
                <div className="flex gap-3">
                  <input type="text" value={form.pdf_url} onChange={e => setForm(f => ({ ...f, pdf_url: e.target.value }))}
                    placeholder="PDF URL..." className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 placeholder-gray-600" />
                  <button type="button" onClick={() => articlePdfInputRef.current?.click()} disabled={articlePdfUploading}
                    className="bg-gray-700 hover:bg-blue-800 disabled:opacity-50 text-white px-4 py-3 rounded-xl text-sm">
                    {articlePdfUploading ? "..." : "📄 PDF"}
                  </button>
                  <input ref={articlePdfInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleArticlePdfUpload} />
                </div>
              </div>
              <div className="flex gap-6 flex-wrap">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setForm(f => ({ ...f, is_breaking: !f.is_breaking }))}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${form.is_breaking ? "bg-red-500" : "bg-gray-700"}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.is_breaking ? "translate-x-7" : "translate-x-1"}`} />
                  </div>
                  <span className="text-sm text-gray-300">🔴 ब्रेकिंग न्यूज़</span>
                </label>
                {!scheduling && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${form.is_published ? "bg-green-500" : "bg-gray-700"}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.is_published ? "translate-x-7" : "translate-x-1"}`} />
                    </div>
                    <span className="text-sm text-gray-300">✅ अभी प्रकाशित</span>
                  </label>
                )}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setScheduling(s => !s)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${scheduling ? "bg-yellow-500" : "bg-gray-700"}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${scheduling ? "translate-x-7" : "translate-x-1"}`} />
                  </div>
                  <span className="text-sm text-gray-300">🕐 शेड्यूल</span>
                </label>
              </div>
              {scheduling && (
                <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-4">
                  <label className="block text-sm text-yellow-300 mb-2">📅 प्रकाशन तिथि और समय</label>
                  <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full bg-gray-800 border border-yellow-700/40 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500" />
                </div>
              )}
              {form.is_breaking && form.is_published && !scheduling && (
                <div className="bg-orange-900/20 border border-orange-700/40 rounded-xl p-3 text-xs text-orange-300">
                  🔔 ब्रेकिंग न्यूज़ प्रकाशित होने पर सभी सब्सक्राइबर को स्वचालित नोटिफिकेशन जाएगा।
                </div>
              )}
              {formError && <p className="text-red-400 text-sm">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl">रद्द करें</button>
                <button type="submit" disabled={formLoading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl">
                  {formLoading ? "सहेजा जा रहा है..." : editingId ? "अपडेट ✓" : scheduling ? "शेड्यूल 🕐" : "जोड़ें ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">क्या आप निश्चित हैं?</h3>
            <p className="text-gray-400 text-sm mb-6">यह लेख स्थायी रूप से हटा दिया जाएगा।</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl">रद्द करें</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl">हाँ, हटाएं</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}