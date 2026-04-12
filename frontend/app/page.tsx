"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Article {
  id: string;
  title_hi: string;
  title_en: string;
  content: string;
  category: string;
  image_url: string;
  pdf_url?: string;
  is_breaking: boolean;
  is_published: boolean;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ['सभी', 'राजनीति', 'खेल', 'मनोरंजन', 'तकनीक', 'व्यापार', 'स्वास्थ्य', 'करियर', 'अंतर्राष्ट्रीय'];
const PAGE_SIZE = 8;
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';

// ─── Helpers ──────────────────────────────────────────────────────────────────
// ✅ IMAGE FIX: always returns a valid image URL, never a PDF URL
const getImage = (a: Article) =>
  a.image_url && !a.image_url.toLowerCase().includes('.pdf') ? a.image_url : FALLBACK_IMG;

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (h < 1) return `${Math.max(1, m)} मिनट पहले`;
  if (h < 24) return `${h} घंटे पहले`;
  return formatDate(d);
};

// ─── Breaking News Ticker ─────────────────────────────────────────────────────
function BreakingTicker({ text }: { text: string }) {
  return (
    <div className="bg-red-600 text-white py-2.5 overflow-hidden border-b border-red-700">
      <div className="container mx-auto px-4 flex items-center gap-4">
        <span className="font-bold whitespace-nowrap flex items-center gap-2 bg-white text-red-600 px-3 py-0.5 rounded text-sm shrink-0">
          <span className="animate-pulse inline-block w-2 h-2 bg-red-600 rounded-full" />
          ब्रेकिंग
        </span>
        <div className="overflow-hidden flex-1">
          <div className="animate-marquee whitespace-nowrap text-sm font-medium">{text}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Article Cards ────────────────────────────────────────────────────────────
function HeroCard({ article, onClick }: { article: Article; onClick: () => void }) {
  const img = getImage(article);
  return (
    <div onClick={onClick}
      className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-2xl"
      style={{ aspectRatio: '16/9' }}>
      <img src={img} alt={article.title_hi}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      {article.pdf_url && (
        <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          📄 PDF
        </div>
      )}
      <div className="absolute bottom-0 p-6 md:p-8">
        {article.is_breaking && (
          <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            ब्रेकिंग न्यूज़
          </span>
        )}
        <span className="block text-orange-400 text-xs font-semibold uppercase tracking-widest mb-2">{article.category}</span>
        <h2 className="text-white font-black text-2xl md:text-4xl leading-tight mb-3 group-hover:text-orange-300 transition-colors news-serif">
          {article.title_hi}
        </h2>
        {article.content && (
          <p className="text-gray-300 text-sm md:text-base line-clamp-2 mb-3 max-w-2xl">{article.content}</p>
        )}
        <div className="flex items-center gap-3 text-gray-400 text-xs">
          <span>{timeAgo(article.created_at)}</span>
          <span className="text-orange-500">•</span>
          <span className="text-orange-400 font-semibold">पढ़ें →</span>
        </div>
      </div>
    </div>
  );
}

function GridCard({ article, onClick }: { article: Article; onClick: () => void }) {
  const img = getImage(article);
  return (
    <div onClick={onClick}
      className="bg-white dark:bg-[#161b22] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border border-gray-100 dark:border-gray-800">
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img src={img} alt={article.title_hi}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        {article.pdf_url && (
          <div className="absolute bottom-2 right-2 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
            📄 PDF
          </div>
        )}
        {article.is_breaking && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> ब्रेकिंग
          </div>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">{article.category}</span>
        <h3 className="font-bold text-gray-900 dark:text-white mt-1.5 mb-2 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug news-serif"
          style={{ fontSize: '1.05rem' }}>
          {article.title_hi}
        </h3>
        {article.content && (
          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-3">{article.content}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{timeAgo(article.created_at)}</span>
          <span className="text-orange-500 font-semibold group-hover:translate-x-1 transition-transform inline-block">पढ़ें →</span>
        </div>
      </div>
    </div>
  );
}

function CompactCard({ article, rank, onClick }: { article: Article; rank: number; onClick: () => void }) {
  return (
    <div onClick={onClick}
      className="flex gap-3 items-start cursor-pointer group py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-orange-50/50 dark:hover:bg-gray-800/50 -mx-2 px-2 rounded-lg transition-colors">
      <span className="text-2xl font-black text-orange-400 leading-none w-6 shrink-0">{rank}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
          {article.title_hi}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">{timeAgo(article.created_at)}</span>
          {article.pdf_url && <span className="text-xs text-blue-500">📄</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Article Modal ────────────────────────────────────────────────────────────
function ArticleModal({ article, onClose }: { article: Article; onClose: () => void }) {
  const img = getImage(article);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handler); };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl my-8 shadow-2xl overflow-hidden animate-modal-in">
        <div className="relative" style={{ aspectRatio: '16/9' }}>
          <img src={img} alt={article.title_hi} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <button onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-xl transition-colors">
            ×
          </button>
          {article.is_breaking && (
            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> ब्रेकिंग न्यूज़
            </div>
          )}
          <div className="absolute bottom-4 left-6">
            <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">{article.category}</span>
          </div>
        </div>
        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-2 news-serif">
            {article.title_hi}
          </h1>
          {article.title_en && (
            <p className="text-gray-500 dark:text-gray-400 text-base italic mb-4">{article.title_en}</p>
          )}
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <span>📅 {formatDate(article.created_at)}</span>
            <span>•</span>
            <span>📁 {article.category}</span>
          </div>
          {article.content ? (
            <div>
              {article.content.split('\n').filter(p => p.trim()).map((para, i) => (
                <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-base">{para}</p>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">इस लेख की सामग्री उपलब्ध नहीं है।</p>
          )}
          {article.pdf_url && (
            <div className="mt-8 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📄</div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white">पूरी रिपोर्ट PDF में उपलब्ध है</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">विस्तृत जानकारी के लिए PDF खोलें</p>
                </div>
                <a href={article.pdf_url} target="_blank" rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap">
                  📄 PDF खोलें
                </a>
              </div>
            </div>
          )}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button onClick={onClose}
              className="bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-gray-700 dark:text-gray-300 hover:text-orange-600 font-semibold px-6 py-2.5 rounded-xl transition-colors">
              बंद करें ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [breakingNews, setBreakingNews] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('सभी');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') { setDarkMode(true); document.documentElement.classList.add('dark'); }
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL;
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/news`).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/news/breaking`).then(r => r.json()),
    ]).then(([newsRes, breakingRes]) => {
      setArticles(newsRes.data || []);
      if (breakingRes.data?.length > 0)
        setBreakingNews(breakingRes.data.map((n: Article) => n.title_hi).join('   •   '));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = articles.filter(a => a.is_published !== false);
    if (activeCategory !== 'सभी') list = list.filter(a => a.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        a.title_hi.toLowerCase().includes(q) ||
        (a.title_en || '').toLowerCase().includes(q) ||
        (a.content || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [articles, activeCategory, searchQuery]);

  const visible = filtered.slice(0, visibleCount);
  const hero = visible[0];
  const grid = visible.slice(1);
  const trending = articles.slice(0, 6);
  const hasMore = visibleCount < filtered.length;

  const changeCategory = useCallback((cat: string) => {
    setActiveCategory(cat);
    setVisibleCount(PAGE_SIZE);
    setSearchQuery('');
  }, []);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Mukta:wght@400;600;700;800&display=swap');
        body, * { font-family: 'Mukta', 'Noto Sans Devanagari', sans-serif; }
        .news-serif { font-family: 'Playfair Display', 'Noto Serif Devanagari', serif !important; }
        @keyframes marquee { from { transform: translateX(100vw); } to { transform: translateX(-100%); } }
        .animate-marquee { animation: marquee 35s linear infinite; }
        @keyframes modal-in { from { opacity:0; transform:translateY(20px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        .animate-modal-in { animation: modal-in 0.25s ease-out forwards; }
        @keyframes fade-up { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fade-up 0.4s ease-out both; }
        .hide-scroll::-webkit-scrollbar { display:none; }
        .hide-scroll { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      <div className="min-h-screen bg-gray-50 dark:bg-[#0e1117]">

        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="bg-white dark:bg-[#161b22] border-b-2 border-orange-500 shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-3 gap-3">

              {/* Logo */}
              <div className="flex items-center gap-2 shrink-0">
                <img
                  src="/logo.svg"
                  alt="logo"
                  className="w-11 h-11 rounded-full shadow-lg shrink-0 object-cover border-2 border-orange-200 dark:border-orange-800"
                  onError={e => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.style.display = 'none';
                    const fb = el.nextElementSibling as HTMLElement;
                    if (fb) fb.style.display = 'flex';
                  }}
                />
                <div style={{display:'none'}}
                  className="w-11 h-11 bg-gradient-to-br from-orange-500 to-red-500 rounded-full items-center justify-center text-white font-black text-lg shadow-lg shrink-0">
                  रा
                </div>
                <div>
                  <h1 style={{
                    fontFamily:"'Playfair Display','Noto Serif Devanagari',serif",
                    fontWeight:900,
                    lineHeight:'1.4',
                    paddingTop:'3px',
                    paddingBottom:'3px',
                    background:'linear-gradient(to right,#f97316,#ef4444)',
                    WebkitBackgroundClip:'text',
                    WebkitTextFillColor:'transparent',
                    backgroundClip:'text',
                    whiteSpace:'nowrap',
                    fontSize:'clamp(15px,3vw,20px)',
                    display:'block',
                  }}>
                    राष्ट्रीय प्रहरी भारत
                  </h1>
                  <p className="text-xs text-gray-400 hidden sm:block whitespace-nowrap" style={{lineHeight:'1.4'}}>
                    एक राष्ट्र पहली • India's Trusted News
                  </p>
                </div>
              </div>

              {/* Desktop nav */}
              <nav className="hidden lg:flex items-center gap-1">
                {['मुख्य पृष्ठ', 'राजनीति', 'खेल', 'मनोरंजन', 'तकनीक', 'व्यापार'].map(n => (
                  <button key={n}
                    onClick={() => changeCategory(n === 'मुख्य पृष्ठ' ? 'सभी' : n)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                      (n === 'मुख्य पृष्ठ' && activeCategory === 'सभी') || activeCategory === n
                        ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400'
                        : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                    }`}>
                    {n}
                  </button>
                ))}
                <Link href="/epaper"
                 className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                  📰 ई-पेपर</Link>
                  <Link href="/rashifal"
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                    🔮 राशिफल</Link>
              </nav>

              {/* Search + theme */}
              <div className="flex items-center gap-2">
                <div className={`relative transition-all duration-300 ${searchFocused ? 'w-56' : 'w-36'} hidden sm:block`}>
                  <input type="text" value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="खबर खोजें..."
                    className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-orange-400 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:bg-white dark:focus:bg-gray-700 transition-all placeholder-gray-400 dark:text-white" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
                </div>
                <button onClick={toggleTheme}
                  className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 flex items-center justify-center transition-colors">
                  {darkMode ? '☀️' : '🌙'}
                </button>
              </div>
            </div>

            {/* Mobile search */}
            <div className="sm:hidden pb-3">
              <input type="text" value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
                placeholder="खबर खोजें..."
                className="w-full bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-400 dark:text-white" />
            </div>

            {/* Category pills */}
            <div className="border-t border-gray-100 dark:border-gray-800">
              <div className="flex gap-1.5 overflow-x-auto hide-scroll py-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => changeCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                      activeCategory === cat
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* ── Breaking ticker ─────────────────────────────────────── */}
        {breakingNews && <BreakingTicker text={breakingNews} />}

        {/* ── Main ───────────────────────────────────────────────── */}
        <main className="container mx-auto px-4 py-6">

          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-gray-400 font-medium">खबरें लोड हो रही हैं...</p>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <div className="text-6xl">🔍</div>
              <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400">कोई खबर नहीं मिली</h3>
              <p className="text-sm text-gray-400">
                {searchQuery ? `"${searchQuery}" के लिए कोई परिणाम नहीं` : 'इस श्रेणी में कोई लेख नहीं'}
              </p>
              <button onClick={() => { setSearchQuery(''); changeCategory('सभी'); }}
                className="mt-2 text-orange-500 font-semibold text-sm underline">
                सभी खबरें देखें
              </button>
            </div>
          )}

          {!loading && visible.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

              {/* ── Main column ──────────────────────────────────── */}
              <div className="xl:col-span-3 space-y-8">

                {/* Hero article */}
                {hero && (
                  <div className="fade-up">
                    <Link href={`/news/${hero.id}`} className="block"><HeroCard article={hero} onClick={() => {}} /></Link>
                  </div>
                )}

                {/* Section heading */}
                {grid.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-7 bg-orange-500 rounded-full" />
                    <h2 className="text-xl font-black text-gray-900 dark:text-white news-serif">
                      {activeCategory === 'सभी' ? 'ताज़ा खबरें' : activeCategory}
                    </h2>
                    <span className="text-sm text-gray-400">({filtered.length})</span>
                  </div>
                )}

                {/* Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {grid.map((article, i) => (
                    <div key={article.id} className="fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                      <Link href={`/news/${article.id}`} className="block"><GridCard article={article} onClick={() => {}} /></Link>
                    </div>
                  ))}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div className="flex justify-center pt-2">
                    <button onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                      className="group flex items-center gap-2 bg-white dark:bg-gray-800 border-2 border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white font-bold px-8 py-3 rounded-full transition-all duration-300 shadow-sm">
                      और खबरें देखें
                      <span className="group-hover:translate-y-0.5 transition-transform inline-block">↓</span>
                    </button>
                  </div>
                )}

                {!hasMore && filtered.length > PAGE_SIZE && (
                  <p className="text-center text-gray-400 text-sm py-2">
                    सभी {filtered.length} खबरें दिखाई जा चुकी हैं ✓
                  </p>
                )}
              </div>

              {/* ── Sidebar ──────────────────────────────────────── */}
              <div className="space-y-6">

                {/* Trending */}
                <div className="bg-white dark:bg-[#161b22] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <span>🔥</span>
                    <h3 className="font-black text-gray-900 dark:text-white news-serif">ट्रेंडिंग</h3>
                  </div>
                  {trending.map((a, i) => (
                    <Link key={a.id} href={`/news/${a.id}`} className="block"><CompactCard article={a} rank={i + 1} onClick={() => {}} /></Link>
                  ))}
                </div>

                {/* Categories */}
                <div className="bg-white dark:bg-[#161b22] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <span>📂</span>
                    <h3 className="font-black text-gray-900 dark:text-white news-serif">श्रेणियाँ</h3>
                  </div>
                  <div className="space-y-1">
                    {CATEGORIES.filter(c => c !== 'सभी').map(cat => {
                      const count = articles.filter(a => a.category === cat).length;
                      return (
                        <button key={cat} onClick={() => changeCategory(cat)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                            activeCategory === cat
                              ? 'bg-orange-500 text-white'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400'
                          }`}>
                          <span>{cat}</span>
                          {count > 0 && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === cat ? 'bg-white/25 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* App CTA */}
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl shadow-orange-200 dark:shadow-orange-900/20">
                  <div className="text-4xl mb-3">📱</div>
                  <h3 className="font-black text-xl mb-2 news-serif">ऐप डाउनलोड करें</h3>
                  <p className="text-sm text-orange-100 mb-4 leading-relaxed">
                    तेज़ खबरें, ऑफलाइन पढ़ना और नोटिफिकेशन के लिए हमारा ऐप डाउनलोड करें!
                  </p>
                  <button className="block w-full text-center bg-white text-orange-600 font-bold py-3 rounded-xl hover:bg-orange-50 transition-colors text-sm shadow-lg">
                    ▶ Play Store पर जल्द आ रहा है
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer className="bg-gray-900 dark:bg-black text-white mt-16 border-t-4 border-orange-500">
          <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <h3 className="text-2xl font-black mb-3 bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent news-serif">
                  राष्ट्रीय प्रहरी भारत
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-sm">
                  भारत का सबसे विश्वसनीय डिजिटल समाचार मंच। सत्य, निष्पक्ष और तेज़ खबरें — हर पल, हर जगह।
                </p>
                <div className="flex gap-3">
                  {['📘', '📷', '🐦', '▶️'].map((icon, i) => (
                    <a key={i} href="#"
                      className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-xl flex items-center justify-center transition-colors text-lg">
                      {icon}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-gray-200">त्वरित लिंक</h4>
                <div className="space-y-2">
                  {['हमारे बारे में', 'संपर्क करें', 'गोपनीयता नीति', 'विज्ञापन', 'करियर'].map(l => (
                    <a key={l} href="#" className="block text-gray-400 hover:text-orange-400 transition-colors text-sm">{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-gray-200">श्रेणियाँ</h4>
                <div className="space-y-2">
                  {CATEGORIES.filter(c => c !== 'सभी').slice(0, 5).map(c => (
                    <button key={c} onClick={() => changeCategory(c)}
                      className="block text-gray-400 hover:text-orange-400 transition-colors text-sm text-left">
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-center pt-8 border-t border-gray-800">
              <p className="text-sm text-gray-500">© 2026 Rashtriya Prahari Bharat. All rights reserved. | Made with ❤️ in India</p>
            </div>
          </div>
        </footer>

        {/* ── Article Modal ───────────────────────────────────────── */}
        {selectedArticle && (
          <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
        )}
      </div>
    </div>
  );
}