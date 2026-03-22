"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, useMemo } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Article {
  id: string;
  title_hi: string;
  title_en: string;
  content: string;
  category: string;
  image_url: string;
  is_breaking: boolean;
  is_published: boolean;
  created_at: string;
}

interface PDF {
  id: string;
  title: string;
  file_url: string;
  created_at: string;
}

const CATEGORIES = ["राजनीति", "खेल", "मनोरंजन", "तकनीक", "व्यापार", "स्वास्थ्य", "करियर", "अंतर्राष्ट्रीय"];

const emptyArticle = {
  title_hi: "", title_en: "", content: "", category: CATEGORIES[0],
  image_url: "", is_breaking: false, is_published: true,
};

export default function AdminPage() {
  // Create supabase client once, safely inside component
  const supabase: SupabaseClient | null = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  }, []);

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [tab, setTab] = useState<"articles" | "pdfs">("articles");
  const [articles, setArticles] = useState<Article[]>([]);
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyArticle);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [imageUploading, setImageUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfTitle, setPdfTitle] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Auth check — fixed: only runs when supabase is ready
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (session) {
      fetchArticles();
      fetchPdfs();
    }
  }, [session]);

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
    try {
      const { data } = await supabase.from("pdfs").select("*").order("created_at", { ascending: false });
      setPdfs(data || []);
    } catch (e) { console.error(e); }
  };

  const getToken = async (): Promise<string | null> => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoginLoading(true);
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("गलत ईमेल या पासवर्ड। कृपया पुनः प्रयास करें।");
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const openAddForm = () => {
    setForm(emptyArticle);
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (article: Article) => {
    setForm({
      title_hi: article.title_hi || "",
      title_en: article.title_en || "",
      content: article.content || "",
      category: article.category || CATEGORIES[0],
      image_url: article.image_url || "",
      is_breaking: article.is_breaking || false,
      is_published: article.is_published !== false,
    });
    setEditingId(article.id);
    setFormError("");
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_hi.trim()) { setFormError("हिंदी शीर्षक आवश्यक है।"); return; }
    setFormLoading(true);
    setFormError("");
    try {
      const token = await getToken();
      const url = editingId ? `${API}/api/v1/news/${editingId}` : `${API}/api/v1/news`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Server error");
      setShowForm(false);
      fetchArticles();
      showSuccess(editingId ? "✅ लेख अपडेट हो गया!" : "✅ नया लेख जोड़ा गया!");
    } catch (err) {
      setFormError("कुछ गड़बड़ हुई। कृपया पुनः प्रयास करें।");
    }
    setFormLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await getToken();
      await fetch(`${API}/api/v1/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteConfirm(null);
      fetchArticles();
      showSuccess("🗑️ लेख हटा दिया गया!");
    } catch (e) { console.error(e); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/api/v1/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const { url } = await res.json();
      setForm(f => ({ ...f, image_url: url }));
      showSuccess("✅ इमेज अपलोड हो गई!");
    } catch (e) { alert("इमेज अपलोड नहीं हुई।"); }
    setImageUploading(false);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pdfTitle.trim()) { alert("पहले PDF का शीर्षक दर्ज करें।"); return; }
    if (!supabase) return;
    setPdfUploading(true);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/api/v1/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const { url } = await res.json();
      await supabase.from("pdfs").insert([{ title: pdfTitle, file_url: url }]);
      setPdfTitle("");
      fetchPdfs();
      showSuccess("✅ PDF अपलोड हो गया!");
    } catch (e) { alert("PDF अपलोड नहीं हुआ।"); }
    setPdfUploading(false);
  };

  const handleDeletePdf = async (id: string) => {
    if (!supabase) return;
    await supabase.from("pdfs").delete().eq("id", id);
    fetchPdfs();
    showSuccess("🗑️ PDF हटाया गया!");
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" });

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-orange-500 text-4xl animate-spin">⚙️</div>
    </div>
  );

  if (!supabase) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 text-center">
      <div>
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-white text-xl font-bold mb-2">Supabase not configured</h2>
        <p className="text-gray-400 text-sm">Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel environment variables.</p>
      </div>
    </div>
  );

  if (!session) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📰</div>
          <h1 className="text-3xl font-bold text-white mb-1">राष्ट्रीय प्रहरी भारत</h1>
          <p className="text-gray-400 text-sm">Admin Panel • प्रशासन पैनल</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">लॉग इन करें</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">ईमेल</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com" required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">पासवर्ड</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
            </div>
            {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
            <button type="submit" disabled={loginLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors duration-200 mt-2">
              {loginLoading ? "लॉग इन हो रहा है..." : "लॉग इन करें →"}
            </button>
          </form>
        </div>
        <p className="text-center text-gray-600 text-xs mt-4">Only authorized admins can access this panel.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📰</span>
          <div>
            <h1 className="font-bold text-white leading-none">राष्ट्रीय प्रहरी</h1>
            <p className="text-xs text-orange-400">Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 hidden md:block">{session.user.email}</span>
          <button onClick={handleLogout} className="text-sm bg-gray-800 hover:bg-red-900 text-gray-300 hover:text-red-300 px-4 py-2 rounded-lg transition-colors">
            लॉग आउट
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {successMsg && (
          <div className="fixed top-20 right-6 bg-green-900 border border-green-700 text-green-300 px-5 py-3 rounded-xl shadow-2xl z-50 animate-pulse">
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "कुल लेख", value: articles.length, icon: "📰" },
            { label: "ब्रेकिंग न्यूज़", value: articles.filter(a => a.is_breaking).length, icon: "🔴" },
            { label: "प्रकाशित", value: articles.filter(a => a.is_published).length, icon: "✅" },
            { label: "PDF फाइलें", value: pdfs.length, icon: "📄" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab("articles")} className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${tab === "articles" ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            📰 लेख प्रबंधन
          </button>
          <button onClick={() => setTab("pdfs")} className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${tab === "pdfs" ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            📄 PDF प्रबंधन
          </button>
        </div>

        {tab === "articles" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">सभी लेख ({articles.length})</h2>
              <button onClick={openAddForm} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors">
                ＋ नया लेख जोड़ें
              </button>
            </div>
            {dataLoading ? (
              <div className="text-center py-20 text-gray-500">लोड हो रहा है...</div>
            ) : articles.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-400">कोई लेख नहीं मिला। पहला लेख जोड़ें!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {articles.map((article) => (
                  <div key={article.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition-colors">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                      {article.image_url
                        ? <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">📰</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {article.is_breaking && <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full">🔴 ब्रेकिंग</span>}
                        {!article.is_published && <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">ड्राफ्ट</span>}
                        <span className="text-xs bg-gray-800 text-orange-400 px-2 py-0.5 rounded-full">{article.category}</span>
                      </div>
                      <h3 className="font-medium text-white truncate">{article.title_hi}</h3>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(article.created_at)}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => openEditForm(article)} className="bg-gray-800 hover:bg-blue-900 text-gray-300 hover:text-blue-300 px-3 py-2 rounded-lg text-sm transition-colors">✏️ संपादित</button>
                      <button onClick={() => setDeleteConfirm(article.id)} className="bg-gray-800 hover:bg-red-900 text-gray-300 hover:text-red-300 px-3 py-2 rounded-lg text-sm transition-colors">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "pdfs" && (
          <div>
            <div className="bg-gray-900 border border-gray-800 border-dashed rounded-xl p-6 mb-6">
              <h3 className="font-bold text-white mb-4">📤 नई PDF अपलोड करें</h3>
              <div className="flex flex-col md:flex-row gap-3">
                <input type="text" value={pdfTitle} onChange={e => setPdfTitle(e.target.value)}
                  placeholder="PDF का शीर्षक दर्ज करें..."
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
                <button onClick={() => pdfInputRef.current?.click()} disabled={pdfUploading || !pdfTitle.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
                  {pdfUploading ? "अपलोड हो रहा है..." : "📄 PDF चुनें और अपलोड करें"}
                </button>
                <input ref={pdfInputRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-4">अपलोड किए गए PDF ({pdfs.length})</h2>
            {pdfs.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">📂</div>
                <p className="text-gray-400">कोई PDF नहीं मिला। पहला PDF अपलोड करें!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pdfs.map((pdf) => (
                  <div key={pdf.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition-colors">
                    <div className="text-3xl">📄</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white">{pdf.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(pdf.created_at)}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={pdf.file_url} target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-green-900 text-gray-300 hover:text-green-300 px-3 py-2 rounded-lg text-sm transition-colors">👁️ देखें</a>
                      <button onClick={() => handleDeletePdf(pdf.id)} className="bg-gray-800 hover:bg-red-900 text-gray-300 hover:text-red-300 px-3 py-2 rounded-lg text-sm transition-colors">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold">{editingId ? "✏️ लेख संपादित करें" : "➕ नया लेख जोड़ें"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">हिंदी शीर्षक <span className="text-red-400">*</span></label>
                <input type="text" value={form.title_hi} onChange={e => setForm(f => ({ ...f, title_hi: e.target.value }))}
                  placeholder="लेख का हिंदी शीर्षक..."
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">English Title</label>
                <input type="text" value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))}
                  placeholder="Article title in English..."
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">श्रेणी</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">सामग्री / Content</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="लेख की सामग्री यहाँ लिखें..." rows={5}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600 resize-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">इमेज</label>
                <div className="flex gap-3">
                  <input type="text" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                    placeholder="इमेज URL या नीचे से अपलोड करें..."
                    className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
                  <button type="button" onClick={() => imageInputRef.current?.click()} disabled={imageUploading}
                    className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-colors whitespace-nowrap text-sm">
                    {imageUploading ? "..." : "📷 अपलोड"}
                  </button>
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
                {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-gray-700" />}
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setForm(f => ({ ...f, is_breaking: !f.is_breaking }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${form.is_breaking ? "bg-red-500" : "bg-gray-700"}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.is_breaking ? "translate-x-7" : "translate-x-1"}`} />
                  </div>
                  <span className="text-sm text-gray-300">🔴 ब्रेकिंग न्यूज़</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${form.is_published ? "bg-green-500" : "bg-gray-700"}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.is_published ? "translate-x-7" : "translate-x-1"}`} />
                  </div>
                  <span className="text-sm text-gray-300">✅ प्रकाशित करें</span>
                </label>
              </div>
              {formError && <p className="text-red-400 text-sm">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors">रद्द करें</button>
                <button type="submit" disabled={formLoading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
                  {formLoading ? "सहेजा जा रहा है..." : editingId ? "अपडेट करें ✓" : "जोड़ें ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">क्या आप निश्चित हैं?</h3>
            <p className="text-gray-400 text-sm mb-6">यह लेख स्थायी रूप से हटा दिया जाएगा।</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors">रद्द करें</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors">हाँ, हटाएं</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}