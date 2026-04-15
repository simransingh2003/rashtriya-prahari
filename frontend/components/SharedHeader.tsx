"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PushNotificationButton from "./PushNotificationButton";

export default function SharedHeader() {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Theme Sync
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const NAV_LINKS = [
    { href: '/', label: 'मुख्य पृष्ठ' },
    { href: '/category/राजनीति', label: 'राजनीति' },
    { href: '/category/खेल', label: 'खेल' },
    { href: '/category/मनोरंजन', label: 'मनोरंजन' },
    { href: '/epaper', label: '📰 ई-पेपर' },
    { href: '/rashifal', label: '🔮 राशिफल' },
  ];

  return (
    <>
      <style>{`
        @import url('https://googleapis.com');
        body, * { font-family: 'Mukta', sans-serif; }
        .news-serif { font-family: 'Playfair Display', serif !important; }
      `}</style>

      <header className="bg-white dark:bg-[#161b22] border-b-2 border-orange-500 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          
          {/* --- TOP ROW: Branding & Controls --- */}
          <div className="flex items-center justify-between py-3">
            
            {/* Logo & Name (Visible everywhere) */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img src="/logo.svg" alt="Logo" className="h-10 md:h-12 w-auto" />
              <h1 className="text-lg md:text-2xl font-black bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent news-serif" suppressHydrationWarning>
                राष्ट्रीय प्रहरी भारत
              </h1>
            </Link>

            {/* Desktop Center: Search (Hidden on Mobile) */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input 
                  type="text" 
                  placeholder="खबरें खोजें..." 
                  className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full px-5 py-2 text-sm focus:ring-2 focus:ring-orange-500 dark:text-white"
                />
                <span className="absolute right-4 top-2">🔍</span>
              </div>
            </div>

            {/* Right Side: Tools */}
            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <PushNotificationButton />
              </div>
              <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                {darkMode ? '☀️' : '🌙'}
              </button>
              {/* Mobile Menu Toggle */}
              <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                {menuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          {/* --- BOTTOM ROW: Categories (Desktop Only) --- */}
          <nav className="hidden lg:flex items-center justify-center gap-8 py-3 border-t border-gray-50 dark:border-gray-800">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* --- MOBILE MENU: Dropdown --- */}
          {menuOpen && (
            <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 py-4 space-y-2">
              {/* Search in Mobile Menu */}
              <div className="px-4 mb-4">
                <input type="text" placeholder="खोजें..." className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2 text-sm" />
              </div>
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                  {l.label}
                </Link>
              ))}
              <div className="px-4 pt-2">
                 <PushNotificationButton />
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
