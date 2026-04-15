"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PushNotificationButton from "./PushNotificationButton";

export default function SharedHeader() {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className="bg-white dark:bg-[#1a1a1a] border-b-2 border-orange-500 sticky top-0 z-50 w-full shadow-md">
      <div className="container mx-auto px-4">
        
        {/* --- TOP ROW: Branding & Primary Tools --- */}
        <div className="flex items-center justify-between h-16">
          {/* Logo & Name */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.svg" alt="Logo" className="h-10 md:h-12 w-auto" />
            <span className="text-lg font-black text-orange-600 dark:text-orange-500 whitespace-nowrap">
              राष्ट्रीय प्रहरी भारत
            </span>
          </Link>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm">
              {darkMode ? '☀️' : '🌙'}
            </button>
            {/* Hamburger Button - Guaranteed to show on Mobile */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* --- SECOND ROW (Mobile): Search Bar --- */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <input 
              type="text" 
              placeholder="खबरें खोजें..." 
              className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full px-5 py-2 text-sm dark:text-white focus:ring-2 focus:ring-orange-500" 
            />
            <span className="absolute right-4 top-2 text-gray-400 text-sm">🔍</span>
          </div>
        </div>

        {/* --- DESKTOP ONLY: Navigation Bar --- */}
        <nav className="hidden lg:flex items-center justify-center gap-8 py-3 border-t border-gray-50 dark:border-gray-800">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* --- MOBILE DROPDOWN MENU --- */}
        {menuOpen && (
          <div className="absolute top-full left-0 w-full bg-white dark:bg-[#1a1a1a] shadow-2xl border-t border-gray-100 dark:border-gray-800 py-4 flex flex-col z-50">
            {NAV_LINKS.map(l => (
              <Link 
                key={l.href} 
                href={l.href} 
                onClick={() => setMenuOpen(false)} 
                className="px-6 py-4 text-base font-bold text-gray-700 dark:text-gray-200 border-b border-gray-50 dark:border-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/10"
              >
                {l.label}
              </Link>
            ))}
            <div className="px-6 pt-4 flex justify-center">
              <PushNotificationButton />
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
