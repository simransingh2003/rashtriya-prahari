"use client";

import { useState, useEffect } from 'react';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
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

  const newsArticles = [
    {
      id: 1,
      title_hi: "प्रधानमंत्री ने नई शिक्षा नीति की घोषणा की",
      title_en: "Prime Minister Announces New Education Policy",
      category: "राजनीति",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
      date: "13 मार्च 2026",
      isBreaking: true
    },
    {
      id: 2,
      title_hi: "भारतीय क्रिकेट टीम ने जीता विश्व कप",
      title_en: "Indian Cricket Team Wins World Cup",
      category: "खेल",
      image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
      date: "12 मार्च 2026",
      isBreaking: false
    },
    {
      id: 3,
      title_hi: "तकनीकी क्षेत्र में नए रोजगार के अवसर",
      title_en: "New Job Opportunities in Tech Sector",
      category: "करियर",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80",
      date: "11 मार्च 2026",
      isBreaking: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
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
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-110"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <span className="text-2xl">☀️</span>
                ) : (
                  <span className="text-2xl">🌙</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Breaking News Ticker */}
      <div className="bg-red-600 dark:bg-red-700 text-white py-2 overflow-hidden">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <span className="font-bold whitespace-nowrap flex items-center gap-2">
            <span className="animate-pulse">⚡</span>
            ब्रेकिंग न्यूज़:
          </span>
          <div className="animate-scroll whitespace-nowrap">
            प्रधानमंत्री ने नई शिक्षा नीति की घोषणा की • भारतीय अर्थव्यवस्था में तेजी • नई तकनीक से बदलेगा शिक्षा का भविष्य • क्रिकेट विश्व कप में भारत की जीत
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main News Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b-4 border-orange-500 pb-2 inline-block">
              ताज़ा खबरें
            </h2>
            
            {/* Featured Article */}
            {newsArticles[0] && (
              <div className="relative mb-8 rounded-xl overflow-hidden shadow-lg group cursor-pointer">
                <img 
                  src={newsArticles[0].image} 
                  alt={newsArticles[0].title_hi}
                  className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                <div className="absolute bottom-0 p-6 text-white">
                  {newsArticles[0].isBreaking && (
                    <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block animate-pulse">
                      🔴 ब्रेकिंग न्यूज़
                    </span>
                  )}
                  <h3 className="text-3xl font-bold mb-2 hover:text-orange-400 transition-colors">{newsArticles[0].title_hi}</h3>
                  <p className="text-sm text-gray-300">{newsArticles[0].date} • {newsArticles[0].category}</p>
                </div>
              </div>
            )}

            {/* News Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {newsArticles.slice(1).map((article) => (
                <div key={article.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="relative overflow-hidden">
                    <img 
                      src={article.image} 
                      alt={article.title_hi}
                      className="w-full h-48 object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                      {article.category}
                    </span>
                    <h3 className="font-bold text-lg mt-3 mb-2 line-clamp-2 text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                      {article.title_hi}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{article.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-colors duration-300">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white border-b-2 border-orange-500 pb-2">
                🔥 ट्रेंडिंग
              </h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-3 items-start border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded transition-colors cursor-pointer">
                    <span className="text-2xl font-bold text-orange-500 dark:text-orange-400">{i}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                        महत्वपूर्ण खबर का शीर्षक यहाँ दिखाई देगा और यह बहुत रोचक होगा
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">2 घंटे पहले</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* App Download */}
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

            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-colors duration-300">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">श्रेणियाँ</h3>
              <div className="space-y-2">
                {['राजनीति', 'खेल', 'मनोरंजन', 'तकनीक', 'व्यापार', 'स्वास्थ्य'].map((category) => (
                  <a
                    key={category}
                    href="#"
                    className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                    {category}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white mt-16 py-12 border-t-4 border-orange-500">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                राष्ट्रीय प्रहरी भारत
              </h3>
              <p className="text-gray-400 text-sm">
                भारत का सबसे विश्वसनीय समाचार स्रोत। सत्य, निष्पक्ष और तेज़ खबरें।
              </p>
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
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors">
                  <span>📘</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors">
                  <span>📷</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors">
                  <span>🐦</span>
                </a>
              </div>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-500">
              © 2026 Rashtriya Prahari Bharat. All rights reserved. | Made with ❤️ in India
            </p>
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