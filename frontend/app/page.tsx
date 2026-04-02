"use client";

import { useState, useEffect } from 'react';

interface Article {
  id: string;
  title_hi: string;
  title_en: string;
  category: string;
  image_url: string;
  pdf_url: string;       // ✅ FIX: Added pdf_url field
  created_at: string;
  is_breaking: boolean;
}

// ✅ FIX: Helper to detect if a URL points to a PDF
const isPdfUrl = (url: string) =>
  url && (url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('/pdfs/'));

// ✅ FIX: Component to render article media — image OR pdf card
function ArticleMedia({ article, className }: { article: Article; className?: string }) {
  if (article.pdf_url) {
    return (
      <a
        href={article.pdf_url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 border-2 border-dashed border-orange-300 dark:border-orange-600 rounded-lg hover:border-orange-500 transition-colors group ${className}`}
      >
        <div className="text-5xl mb-2 group-hover:scale-110 transition-transform duration-300">📄</div>
        <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">PDF देखें / Read PDF</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">क्लिक करें</span>
      </a>
    );
  }

  const imgSrc = article.image_url && !isPdfUrl(article.image_url)
    ? article.image_url
    : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';

  return (
    <img
      src={imgSrc}
      alt={article.title_hi}
      className={`object-cover ${className}`}
    />
  );
}

// ✅ FIX: Hero article media — handles full-bleed image OR pdf banner
function HeroMedia({ article }: { article: Article }) {
  if (article.pdf_url) {
    return (
      <a
        href={article.pdf_url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full h-96 flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-red-100 dark:from-gray-800 dark:to-gray-900 border-2 border-orange-300 dark:border-orange-700 rounded-xl hover:border-orange-500 transition-all group"
      >
        <div className="text-8xl mb-4 group-hover:scale-110 transition-transform duration-300">📰</div>
        <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">PDF रिपोर्ट देखें</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">नया टैब में खुलेगा • Opens in new tab</span>
      </a>
    );
  }

  const imgSrc = article.image_url && !isPdfUrl(article.image_url)
    ? article.image_url
    : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';

  return (
    <img
      src={imgSrc}
      alt={article.title_hi}
      className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
    />
  );
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [newsArticles, setNewsArticles] = useState<Article[]>([]);
  const [breakingNews, setBreakingNews] = useState('');
  const [loading, setLoading] = useState(true);

  // Dark mode persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Fetch live data
  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL;

    fetch(`${API}/api/v1/news`)
      .then(res => res.json())
      .then(({ data }) => {
        setNewsArticles(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch news:', err);
        setLoading(false);
      });

    fetch(`${API}/api/v1/news/breaking`)
      .then(res => res.json())
      .then(({ data }) => {
        if (data && data.length > 0) {
          setBreakingNews(data.map((n: Article) => n.title_hi).join(' • '));
        }
      })
      .catch(err => console.error('Failed to fetch breaking news:', err));
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 shadow-md border-b-4 border-orange-500 transition-colors duration-300">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-5xl">📰</div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                  राष्ट्रीय प्रहरी भारत
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">एक राष्ट्र पहली • India's Trusted News</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex gap-6">
                <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors">मुख्य पृष्ठ</a>
                <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors">राजनीति</a>
                <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors">खेल</a>
                <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors">मनोरंजन</a>
              </nav>
              <button onClick={toggleTheme}
                className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-110"
                aria-label="Toggle dark mode">
                {darkMode ? <span className="text-2xl">☀️</span> : <span className="text-2xl">🌙</span>}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-red-600 dark:bg-red-700 text-white py-2 overflow-hidden">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <span className="font-bold whitespace-nowrap flex items-center gap-2">
            <span className="animate-pulse">⚡</span>
            ब्रेकिंग न्यूज़:
          </span>
          <div className="animate-scroll whitespace-nowrap">
            {breakingNews || 'लोड हो रहा है...'}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="text-5xl mb-4 animate-spin">⚙️</div>
              <p className="text-gray-500 dark:text-gray-400">खबरें लोड हो रही हैं...</p>
            </div>
          </div>
        )}

        {!loading && newsArticles.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-500 dark:text-gray-400">कोई खबर उपलब्ध नहीं है।</p>
            </div>
          </div>
        )}

        {!loading && newsArticles.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b-4 border-orange-500 pb-2 inline-block">
                ताज़ा खबरें
              </h2>

              {/* ✅ FIX: Hero article now uses HeroMedia component */}
              {newsArticles[0] && (
                <div className="relative mb-8 rounded-xl overflow-hidden shadow-lg group cursor-pointer">
                  {newsArticles[0].pdf_url ? (
                    // PDF hero: no overlay needed, show the PDF card directly
                    <a
                      href={newsArticles[0].pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-96 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 block"
                    >
                      <div className="text-8xl mb-4 group-hover:scale-110 transition-transform duration-300">📰</div>
                      <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">PDF रिपोर्ट देखें</span>
                      <span className="text-sm text-gray-400 mt-2">नया टैब में खुलेगा</span>
                      <div className="mt-4 px-8 py-2 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors">
                        📄 खोलें
                      </div>
                      <div className="mt-4 px-6 text-center">
                        {newsArticles[0].is_breaking && (
                          <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block text-white animate-pulse">
                            🔴 ब्रेकिंग न्यूज़
                          </span>
                        )}
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{newsArticles[0].title_hi}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatDate(newsArticles[0].created_at)} • {newsArticles[0].category}</p>
                      </div>
                    </a>
                  ) : (
                    <>
                      <img
                        src={
                          newsArticles[0].image_url && !isPdfUrl(newsArticles[0].image_url)
                            ? newsArticles[0].image_url
                            : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'
                        }
                        alt={newsArticles[0].title_hi}
                        className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                      <div className="absolute bottom-0 p-6 text-white">
                        {newsArticles[0].is_breaking && (
                          <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block animate-pulse">
                            🔴 ब्रेकिंग न्यूज़
                          </span>
                        )}
                        <h3 className="text-3xl font-bold mb-2 hover:text-orange-400 transition-colors">{newsArticles[0].title_hi}</h3>
                        <p className="text-sm text-gray-300">{formatDate(newsArticles[0].created_at)} • {newsArticles[0].category}</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ✅ FIX: Article cards now render PDF badge + link if pdf_url is present */}
              <div className="grid md:grid-cols-2 gap-6">
                {newsArticles.slice(1).map((article) => (
                  <div key={article.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <div className="relative overflow-hidden h-48">
                      {article.pdf_url ? (
                        // ✅ PDF thumbnail card
                        <a
                          href={article.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 border-b-2 border-orange-200 dark:border-orange-800 hover:from-orange-50 hover:to-red-50 transition-all group"
                        >
                          <div className="text-5xl mb-2 group-hover:scale-110 transition-transform duration-300">📄</div>
                          <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-3 py-1 rounded-full">
                            PDF देखें
                          </span>
                        </a>
                      ) : (
                        <img
                          src={
                            article.image_url && !isPdfUrl(article.image_url)
                              ? article.image_url
                              : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'
                          }
                          alt={article.title_hi}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                          {article.category}
                        </span>
                        {/* ✅ PDF badge */}
                        {article.pdf_url && (
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                            📄 PDF
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg mt-3 mb-2 line-clamp-2 text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                        {article.title_hi}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(article.created_at)}</p>
                      {/* ✅ PDF open link at bottom of card */}
                      {article.pdf_url && (
                        <a
                          href={article.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                        >
                          📄 पूरी रिपोर्ट पढ़ें →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-colors duration-300">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white border-b-2 border-orange-500 pb-2">🔥 ट्रेंडिंग</h3>
                <div className="space-y-4">
                  {newsArticles.slice(0, 5).map((article, i) => (
                    <div key={article.id} className="flex gap-3 items-start border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded transition-colors cursor-pointer">
                      <span className="text-2xl font-bold text-orange-500 dark:text-orange-400">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors">{article.title_hi}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(article.created_at)}</span>
                          {article.pdf_url && <span className="text-xs text-blue-500">📄</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 text-white rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl">
                <div className="text-center">
                  <div className="text-5xl mb-3">📱</div>
                  <h3 className="text-xl font-bold mb-3">ऐप डाउनलोड करें</h3>
                  <p className="text-sm mb-4 opacity-90">तेज़ खबरें और ऑफलाइन पढ़ने के लिए हमारा मोबाइल ऐप डाउनलोड करें!</p>
                  <button className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all w-full hover:scale-105 transform duration-300 shadow-lg">
                    अभी डाउनलोड करें
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-colors duration-300">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">श्रेणियाँ</h3>
                <div className="space-y-2">
                  {['राजनीति', 'खेल', 'मनोरंजन', 'तकनीक', 'व्यापार', 'स्वास्थ्य'].map((category) => (
                    <a key={category} href="#"
                      className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                      {category}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 dark:bg-black text-white mt-16 py-12 border-t-4 border-orange-500">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">राष्ट्रीय प्रहरी भारत</h3>
              <p className="text-gray-400 text-sm">भारत का सबसे विश्वसनीय समाचार स्रोत। सत्य, निष्पक्ष और तेज़ खबरें।</p>
            </div>
            <div>
              <h4 className="font-bold mb-3">त्वरित लिंक</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-orange-500 transition-colors text-sm">हमारे बारे में</a>
                <a href="#" className="block text-gray-400 hover:text-orange-500 transition-colors text-sm">संपर्क करें</a>
                <a href="#" className="block text-gray-400 hover:text-orange-500 transition-colors text-sm">गोपनीयता नीति</a>
                <a href="#" className="block text-gray-400 hover:text-orange-500 transition-colors text-sm">विज्ञापन</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-3">हमसे जुड़ें</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors"><span>📘</span></a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors"><span>📷</span></a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors"><span>🐦</span></a>
              </div>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-500">© 2026 Rashtriya Prahari Bharat. All rights reserved. | Made with ❤️ in India</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
      `}</style>
    </div>
  );
}