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
    <header className="bg-white dark:bg-[#161b22] border-b-2 border-orange-500 shadow-sm sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4">
        
        {/* --- MAIN HEADER ROW --- */}
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          
          {/* 1. Branding (Always visible) */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.svg" alt="Logo" className="h-10 md:h-14 w-auto" />
            <h1 className="text-lg md:text-2xl font-black bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              राष्ट्रीय प्रहरी <span className="block md:inline text-xs md:text-2xl">भारत</span>
            </h1>
          </Link>

          {/* 2. Desktop Navigation (Hidden on Mobile) */}
          {/* This row only shows on Large screens to prevent "crowding" */}
          <nav className="hidden xl:flex items-center gap-6">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 transition-colors whitespace-nowrap">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* 3. Action Area (Search, Theme, Menu) */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Desktop Search (Hidden on Mobile) */}
            <div className="hidden lg:block relative">
              <input type="text" placeholder="खोजें..." className="bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-1.5 text-sm w-32 focus:w-48 transition-all dark:text-white" />
            </div>

            <div className="hidden sm:block">
              <PushNotificationButton />
            </div>

            <button onClick={toggleTheme} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* HAMBURGER BUTTON (Visible only on screens smaller than XL) */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="xl:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* --- MOBILE/TABLET DROPDOWN MENU --- */}
        {menuOpen && (
          <div className="xl:hidden absolute top-full left-0 w-full bg-white dark:bg-[#161b22] border-b border-gray-200 dark:border-gray-800 shadow-xl py-4 flex flex-col z-50">
            {/* Mobile Search */}
            <div className="px-6 mb-4">
              <input type="text" placeholder="खबरें खोजें..." className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm dark:text-white" />
            </div>
            
            {/* Navigation Links */}
            <div className="flex flex-col">
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
            </div>

            {/* Mobile Push Button */}
            <div className="px-6 pt-4 flex justify-center">
              <PushNotificationButton />
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
