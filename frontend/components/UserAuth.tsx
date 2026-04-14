"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";

// ── Types ─────────────────────────────────────────────────────────────────
interface Profile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
}

type AuthMode = "idle" | "signin" | "signup" | "profile";

// ── Component ─────────────────────────────────────────────────────────────
export default function UserAuth() {
  const supabase: SupabaseClient | null = useMemo(() => {
    if (typeof window === "undefined") return null;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  }, []);

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mode, setMode] = useState<AuthMode>("idle");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  // ── Auth listener ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  // Fetch profile when user changes
  useEffect(() => {
    if (user && supabase) fetchProfile();
    else setProfile(null);
  }, [user]);

  const fetchProfile = async () => {
    if (!supabase || !user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) setProfile(data);
  };

  // Close modal on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeModal();
      }
    };
    if (mode !== "idle") document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mode]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const closeModal = () => {
    setMode("idle");
    setError("");
    setSuccess("");
    setEmail("");
    setPassword("");
    setDisplayName("");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    if (error) {
      setError(error.message === "User already registered"
        ? "यह ईमेल पहले से पंजीकृत है। साइन इन करें।"
        : "पंजीकरण नहीं हो सका। कृपया पुनः प्रयास करें।");
    } else {
      setSuccess("✅ पंजीकरण सफल! कृपया अपना ईमेल सत्यापित करें।");
    }
    setSubmitting(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("गलत ईमेल या पासवर्ड। कृपया पुनः प्रयास करें।");
    } else {
      closeModal();
    }
    setSubmitting(false);
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setMode("idle");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    setSubmitting(true);
    setError("");
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: editingName })
      .eq("id", user.id);
    if (error) {
      setError("प्रोफाइल अपडेट नहीं हो सकी।");
    } else {
      await fetchProfile();
      setSuccess("✅ प्रोफाइल अपडेट हो गई!");
      setTimeout(() => setSuccess(""), 3000);
    }
    setSubmitting(false);
  };

  const openProfile = () => {
    setEditingName(profile?.display_name || "");
    setError("");
    setSuccess("");
    setMode("profile");
  };

  if (!supabase) return null;

  const displayLabel = profile?.display_name || user?.email?.split("@")[0] || "उपयोगकर्ता";
  const avatarLetter = displayLabel[0]?.toUpperCase();

  return (
    <>
      {/* ── Trigger Button ── */}
      {loading ? (
        <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
      ) : user ? (
        <button
          onClick={openProfile}
          className="flex items-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 hover:border-orange-500/50 rounded-full pl-1 pr-3 py-1 transition-all group"
        >
          <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {avatarLetter}
          </div>
          <span className="text-sm text-orange-300 group-hover:text-orange-200 max-w-[100px] truncate hidden sm:block">
            {displayLabel}
          </span>
        </button>
      ) : (
        <button
          onClick={() => { setMode("signin"); setError(""); }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
        >
          <span>👤</span>
          <span className="hidden sm:inline">साइन इन</span>
        </button>
      )}

      {/* ── Modal Overlay ── */}
      {mode !== "idle" && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            ref={modalRef}
            className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            {/* ── Sign In ── */}
            {mode === "signin" && (
              <>
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">साइन इन करें</h2>
                  <button onClick={closeModal} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
                </div>
                <form onSubmit={handleSignIn} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">ईमेल पता</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="your@email.com"
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">पासवर्ड</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="••••••••"
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600 text-sm" />
                  </div>
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button type="submit" disabled={submitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
                    {submitting ? "लॉग इन हो रहा है..." : "साइन इन करें →"}
                  </button>
                  <p className="text-center text-sm text-gray-500">
                    खाता नहीं है?{" "}
                    <button type="button" onClick={() => { setMode("signup"); setError(""); }}
                      className="text-orange-400 hover:text-orange-300 font-medium">
                      अभी बनाएं
                    </button>
                  </p>
                </form>
              </>
            )}

            {/* ── Sign Up ── */}
            {mode === "signup" && (
              <>
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">नया खाता बनाएं</h2>
                  <button onClick={closeModal} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
                </div>
                {success ? (
                  <div className="p-8 text-center">
                    <div className="text-5xl mb-4">📬</div>
                    <h3 className="text-lg font-bold text-white mb-2">ईमेल जाँचें!</h3>
                    <p className="text-gray-400 text-sm mb-6">हमने आपके ईमेल पर सत्यापन लिंक भेजा है।</p>
                    <button onClick={closeModal}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors">
                      ठीक है
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSignUp} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">आपका नाम</label>
                      <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                        placeholder="अपना नाम दर्ज करें"
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">ईमेल पता <span className="text-red-400">*</span></label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        placeholder="your@email.com"
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">पासवर्ड <span className="text-red-400">*</span></label>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                        placeholder="कम से कम 6 अक्षर" minLength={6}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600 text-sm" />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button type="submit" disabled={submitting}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
                      {submitting ? "बन रहा है..." : "खाता बनाएं →"}
                    </button>
                    <p className="text-center text-sm text-gray-500">
                      पहले से खाता है?{" "}
                      <button type="button" onClick={() => { setMode("signin"); setError(""); }}
                        className="text-orange-400 hover:text-orange-300 font-medium">
                        साइन इन करें
                      </button>
                    </p>
                  </form>
                )}
              </>
            )}

            {/* ── Profile ── */}
            {mode === "profile" && user && (
              <>
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">मेरी प्रोफाइल</h2>
                  <button onClick={closeModal} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
                </div>
                <div className="p-6 space-y-5">
                  {/* Avatar & info */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                      {avatarLetter}
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">{displayLabel}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                      {profile?.created_at && (
                        <div className="text-xs text-gray-600 mt-0.5">
                          सदस्य: {new Date(profile.created_at).toLocaleDateString("hi-IN", { month: "long", year: "numeric" })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Edit display name */}
                  <form onSubmit={handleUpdateProfile} className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">प्रदर्शन नाम बदलें</label>
                      <input type="text" value={editingName} onChange={e => setEditingName(e.target.value)}
                        placeholder="अपना नाम दर्ज करें"
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600 text-sm" />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    {success && <p className="text-green-400 text-sm">{success}</p>}
                    <button type="submit" disabled={submitting}
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm">
                      {submitting ? "अपडेट हो रहा है..." : "नाम अपडेट करें"}
                    </button>
                  </form>

                  <hr className="border-gray-800" />

                  <button onClick={handleSignOut}
                    className="w-full bg-red-900/30 hover:bg-red-900/50 border border-red-800/40 text-red-400 hover:text-red-300 font-medium py-3 rounded-xl transition-colors text-sm">
                    साइन आउट करें
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
