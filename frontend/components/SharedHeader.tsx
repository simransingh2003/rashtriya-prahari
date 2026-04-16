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

  // Close menu on route change / outside click
  useEffect(() => {
    const close = () => setMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
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
      <div className="container mx-auto px-3 sm:px-4">

        {/* Top row */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
            <img src="/logo.svg" alt="Logo" className="h-8 sm:h-10 md:h-12 w-auto shrink-0" />
            <span className="text-sm sm:text-base lg:text-lg font-black text-orange-600 dark:text-orange-500 leading-tight line-clamp-2 sm:whitespace-nowrap">
              राष्ट्रीय प्रहरी भारत
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href}
                className="px-2.5 xl:px-3 py-1.5 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors whitespace-nowrap">
                {l.label}
              </Link>
            ))}
            <PushNotificationButton />
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-base sm:text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
              aria-label="Toggle theme">
              {darkMode ? '☀️' : '🌙'}
            </button>
            {/* Hamburger — visible below lg */}
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
              className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
              aria-label="Open menu">
              <span className="text-lg leading-none">{menuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="pb-2.5 lg:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="खबरें खोजें..."
              className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full px-4 py-2 text-sm dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            <span className="absolute right-3.5 top-2 text-gray-400 text-sm pointer-events-none">🔍</span>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div
            onClick={e => e.stopPropagation()}
            className="absolute top-full left-0 w-full bg-white dark:bg-[#1a1a1a] shadow-2xl border-t border-gray-100 dark:border-gray-800 flex flex-col z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="px-5 py-4 text-base font-bold text-gray-700 dark:text-gray-200 border-b border-gray-50 dark:border-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/10 active:bg-orange-100 transition-colors">
                {l.label}
              </Link>
            ))}
            <div className="px-5 py-4">
              <PushNotificationButton />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
