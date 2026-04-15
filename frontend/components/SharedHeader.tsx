"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SharedHeader() {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const NAV_LINKS = [
    { href: '/', label: 'मुख्य पृष्ठ' },
    { href: '/epaper', label: '📰 ई-पेपर' },
    { href: '/rashifal', label: '🔮 राशिफल' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Mukta:wght@400;600;700;800&display=swap');
        body, * { font-family: 'Mukta', 'Noto Sans Devanagari', sans-serif; }
        .news-serif { font-family: 'Playfair Display', 'Noto Serif Devanagari', serif !important; }
      `}</style>
      <header className="bg-white dark:bg-[#161b22] border-b-2 border-orange-500 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 gap-3">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="h-12 w-auto flex items-center">
                <img
                  src="/logo.svg"
                  alt="राष्ट्रीय प्रहरी भारत न्यूज़"
                  className="h-12 w-auto object-contain"
                  style={{ maxWidth: '180px' }}
                />
              </div>
            </Link>


            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <h3 className="text-2xl font-black mb-3 bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent news-serif">
                  राष्ट्रीय प्रहरी भारत
                </h3>
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button onClick={toggleTheme}
                className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 flex items-center justify-center transition-colors">
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-colors">
                {menuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 py-3 space-y-1">
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>
    </>
  );
}