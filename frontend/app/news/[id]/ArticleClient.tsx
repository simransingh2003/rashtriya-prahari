"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';
const API = process.env.NEXT_PUBLIC_API_URL;

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
  view_count?: number;
}

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

function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="my-6 rounded-xl overflow-hidden shadow-lg" style={{ aspectRatio: '16/9' }}>
      <iframe src={`https://www.youtube.com/embed/${videoId}`} title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen className="w-full h-full" />
    </div>
  );
}

// ── Text Size Adjuster ────────────────────────────────────────────────────────
function TextSizeAdjuster({ size, setSize }: { size: number; setSize: (n: number) => void }) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5">
      <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">अ</span>
      <button onClick={() => setSize(Math.max(14, size - 2))}
        className="w-6 h-6 rounded-full bg-white dark:bg-gray-700 shadow text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors text-sm font-bold flex items-center justify-center">
        −
      </button>
      <button onClick={() => setSize(Math.min(26, size + 2))}
        className="w-6 h-6 rounded-full bg-white dark:bg-gray-700 shadow text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors text-sm font-bold flex items-center justify-center">
        +
      </button>
      <span className="text-lg text-gray-500 dark:text-gray-400 font-bold">अ</span>
    </div>
  );
}

// ── Content Renderer ──────────────────────────────────────────────────────────
function ContentRenderer({ content, fontSize }: { content: string; fontSize: number }) {
  const isHTML = /<[a-z][\s\S]*>/i.test(content);
  if (isHTML) {
    return (
      <div style={{ fontSize: `${fontSize}px` }}
        className="prose prose-lg dark:prose-invert max-w-none
          prose-headings:font-black prose-headings:text-gray-900 dark:prose-headings:text-white
          prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
          prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-xl prose-img:shadow-lg"
        dangerouslySetInnerHTML={{ __html: content }} />
    );
  }
  const paragraphs = content.split('\n').filter(p => p.trim());
  return (
    <div className="space-y-4" style={{ fontSize: `${fontSize}px` }}>
      {paragraphs.map((para, i) => {
        const trimmed = para.trim();
        const ytId = getYouTubeId(trimmed);
        if (ytId) return <YouTubeEmbed key={i} videoId={ytId} />;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        if (urlRegex.test(trimmed)) {
          const parts = trimmed.split(/(https?:\/\/[^\s]+)/g);
          return (
            <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {parts.map((part, j) => part.match(/^https?:\/\//) ? (
                <a key={j} href={part} target="_blank" rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-600 underline break-all">{part}</a>
              ) : part)}
            </p>
          );
        }
        return <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed">{trimmed}</p>;
      })}
    </div>
  );
}

// ── Share Bar ─────────────────────────────────────────────────────────────────
function ShareBar({ article }: { article: Article }) {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const text = `${article.title_hi} - राष्ट्रीय प्रहरी भारत`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
  const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const copyLink = () => { navigator.clipboard.writeText(url); alert('लिंक कॉपी हो गया! ✅'); };
  return (
    <div className="flex flex-wrap items-center gap-3 py-4 border-t border-b border-gray-200 dark:border-gray-700 my-6">
      <span className="text-sm font-bold text-gray-600 dark:text-gray-400">शेयर करें:</span>
      <a href={whatsapp} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-full transition-colors">
        📱 WhatsApp
      </a>
      <a href={twitter} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold px-4 py-2 rounded-full transition-colors">
        🐦 Twitter
      </a>
      <a href={facebook} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-full transition-colors">
        📘 Facebook
      </a>
      <button onClick={copyLink}
        className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-bold px-4 py-2 rounded-full transition-colors">
        🔗 लिंक कॉपी करें
      </button>
    </div>
  );
}

// ── Related Articles ──────────────────────────────────────────────────────────
function RelatedArticles({ articleId, category }: { articleId: string; category: string }) {
  const [related, setRelated] = useState<Article[]>([]);
  useEffect(() => {
    fetch(`${API}/api/v1/news/${articleId}/related?category=${encodeURIComponent(category)}`)
      .then(r => r.json()).then(({ data }) => setRelated(data || [])).catch(console.error);
  }, [articleId, category]);
  if (related.length === 0) return null;
  return (
    <div className="mt-12 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-orange-500 rounded-full" />
        <h3 className="text-xl font-black text-gray-900 dark:text-white">संबंधित खबरें</h3>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {related.map(a => {
          const img = getImage(a);
          return (
            <Link key={a.id} href={`/news/${a.id}`}
              className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
              <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <img src={img} alt={a.title_hi}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                {a.is_breaking && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">🔴 ब्रेकिंग</div>
                )}
              </div>
              <div className="p-3">
                <span className="text-xs font-bold text-orange-500 uppercase">{a.category}</span>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm mt-1 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
                  {a.title_hi}
                </h4>
                <p className="text-xs text-gray-400 mt-2">{timeAgo(a.created_at)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ArticleClient({ article }: { article: Article | null }) {
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => {
    window.scrollTo(0, 0);
    const saved = localStorage.getItem('fontSize');
    if (saved) setFontSize(Number(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('fontSize', String(fontSize));
  }, [fontSize]);

  // Track view count (once per session per article)
  useEffect(() => {
    if (!article) return;
    const key = `viewed_${article.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    fetch(`${API}/api/v1/news/${article.id}/view`, { method: 'POST' }).catch(() => {});
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0e1117] flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">📭</div>
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300">लेख नहीं मिला</h1>
        <p className="text-gray-500">यह लेख उपलब्ध नहीं है या हटा दिया गया है।</p>
        <Link href="/" className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
          ← मुख्य पृष्ठ पर जाएं
        </Link>
      </div>
    );
  }

  const img = getImage(article);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0e1117]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Mukta:wght@400;600;700;800&display=swap');
        body, * { font-family: 'Mukta', 'Noto Sans Devanagari', sans-serif; }
        .news-serif { font-family: 'Playfair Display', 'Noto Serif Devanagari', serif !important; }
      `}</style>

      {/* Nav */}
      <header className="bg-white dark:bg-[#161b22] border-b-2 border-orange-500 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="logo" className="w-9 h-9 rounded-xl"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            <span className="font-black text-lg bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent news-serif">
              राष्ट्रीय प्रहरी भारत
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <TextSizeAdjuster size={fontSize} setSize={setFontSize} />
            <Link href="/" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors hidden sm:block">
              ← वापस जाएं
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="w-full" style={{ maxHeight: '520px', overflow: 'hidden' }}>
        <img src={img} alt={article.title_hi} className="w-full object-cover"
          style={{ maxHeight: '520px', objectPosition: 'center' }} />
      </div>

      {/* Body */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">
            {article.category}
          </span>
          {article.is_breaking && (
            <span className="text-xs font-bold text-white bg-red-600 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />ब्रेकिंग न्यूज़
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-3 news-serif">
          {article.title_hi}
        </h1>

        {article.title_en && (
          <p className="text-gray-500 dark:text-gray-400 text-lg italic mb-4">{article.title_en}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <span>📅 {formatDate(article.created_at)}</span>
          <span>📁 {article.category}</span>
          <span>🗞️ राष्ट्रीय प्रहरी भारत</span>
          {!!article.view_count && (
            <span className="flex items-center gap-1 text-orange-500 font-semibold">
              👁️ {article.view_count.toLocaleString('hi-IN')} बार पढ़ा गया
            </span>
          )}
        </div>

        <ShareBar article={article} />

        {article.content ? (
          <div className="mt-6">
            <ContentRenderer content={article.content} fontSize={fontSize} />
          </div>
        ) : (
          <p className="text-gray-400 italic mt-6">इस लेख की सामग्री उपलब्ध नहीं है।</p>
        )}

        {article.pdf_url && (
          <div className="mt-10 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl">📄</div>
              <div className="flex-1">
                <p className="font-bold text-lg text-gray-900 dark:text-white">पूरी रिपोर्ट PDF में उपलब्ध है</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">विस्तृत जानकारी के लिए नीचे दिए गए बटन से PDF डाउनलोड करें</p>
              </div>
              <a href={article.pdf_url} target="_blank" rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap shadow-lg">
                📄 PDF खोलें
              </a>
            </div>
          </div>
        )}

        <RelatedArticles articleId={article.id} category={article.category} />

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-bold transition-colors">
            ← सभी खबरें देखें
          </Link>
          <span className="text-xs text-gray-400">© 2026 राष्ट्रीय प्रहरी भारत</span>
        </div>
      </main>
    </div>
  );
}