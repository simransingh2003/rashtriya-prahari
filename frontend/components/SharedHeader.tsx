"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CATEGORIES = ['सभी', 'राजनीति', 'खेल', 'मनोरंजन', 'तकनीक', 'व्यापार', 'स्वास्थ्य', 'करियर', 'अंतर्राष्ट्रीय'];

const NAV_LINKS = [
  { label: 'मुख्य पृष्ठ', cat: 'सभी' },
  { label: 'राजनीति', cat: 'राजनीति' },
  { label: 'खेल', cat: 'खेल' },
  { label: 'मनोरंजन', cat: 'मनोरंजन' },
  { label: 'तकनीक', cat: 'तकनीक' },
  { label: 'व्यापार', cat: 'व्यापार' },
];

interface SharedHeaderProps {
  activeCategory?: string;
  searchQuery?: string;
  darkMode?: boolean;
  onCategoryChange?: (cat: string) => void;
  onSearchChange?: (q: string) => void;
  onThemeToggle?: () => void;
}

export default function SharedHeader({
  activeCategory = 'सभी',
  searchQuery = '',
  darkMode = false,
  onCategoryChange,
  onSearchChange,
  onThemeToggle,
}: SharedHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [activeCategory]);

  // For sub-pages (epaper, rashifal) that don't pass handlers,
  // we use internal dark mode state
  const [internalDark, setInternalDark] = useState(false);

  useEffect(() => {
    if (!onThemeToggle) {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') { setInternalDark(true); document.documentElement.classList.add('dark'); }
    }
  }, [onThemeToggle]);

  const handleTheme = () => {
    if (onThemeToggle) {
      onThemeToggle();
    } else {
      const next = !internalDark;
      setInternalDark(next);
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
    }
  };

  const isDark = onThemeToggle ? darkMode : internalDark;

  return (
    <header className="bg-white dark:bg-[#161b22] border-b-2 border-orange-500 shadow-sm sticky top-0 z-40">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Mukta:wght@400;600;700;800&display=swap');
        body, * { font-family: 'Mukta', 'Noto Sans Devanagari', sans-serif; }
        .news-serif { font-family: 'Playfair Display', 'Noto Serif Devanagari', serif !important; }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── TOP ROW ── */}
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 gap-2">

          {/* Logo + Name */}
          <Link href="/" onClick={() => onCategoryChange?.('सभी')}
            className="flex items-center gap-2 shrink-0">
            <img
              src="/logo.svg"
              alt="राष्ट्रीय प्रहरी भारत"
              className="h-10 w-auto object-contain shrink-0"
              style={{ maxWidth: '44px' }}
            />
            <div className="min-w-0">
              <p style={{
                fontFamily: "'Playfair Display','Noto Serif Devanagari',serif",
                fontWeight: 900,
                background: 'linear-gradient(to right,#f97316,#ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: 'clamp(12px,2.5vw,18px)',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}>
                राष्ट्रीय प्रहरी भारत
              </p>
              <p className="text-gray-400 hidden sm:block" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                एक सजग प्रहरी • India's Trusted News
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {NAV_LINKS.map(n => (
              <button key={n.cat}
                onClick={() => onCategoryChange?.(n.cat)}
                className={`px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeCategory === n.cat
                    ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                }`}>
                {n.label}
              </button>
            ))}
            <Link href="/epaper"
              className="px-2.5 py-1.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors whitespace-nowrap">
              📰 ई-पेपर
            </Link>
            <Link href="/rashifal"
              className="px-2.5 py-1.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors whitespace-nowrap">
              🔮 राशिफल
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Desktop search */}
            {onSearchChange && (
              <div className="hidden sm:flex items-center relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => onSearchChange(e.target.value)}
                  placeholder="खबर खोजें..."
                  className="w-32 lg:w-44 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-orange-400 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:bg-white dark:focus:bg-gray-700 transition-all placeholder-gray-400 dark:text-white"
                />
                <span className="absolute right-2.5 text-gray-400 text-xs">🔍</span>
              </div>
            )}

            {/* Mobile search toggle */}
            {onSearchChange && (
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="sm:hidden w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-colors">
                🔍
              </button>
            )}

            {/* Dark mode */}
            <button onClick={handleTheme}
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 flex items-center justify-center transition-colors">
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-colors">
              <span className="text-gray-700 dark:text-gray-300 font-bold text-lg leading-none">
                {menuOpen ? '✕' : '☰'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && onSearchChange && (
          <div className="sm:hidden pb-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="खबर खोजें..."
              autoFocus
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-400 dark:text-white"
            />
          </div>
        )}

        {/* ── CATEGORY PILLS (desktop only, homepage only) ── */}
        {onCategoryChange && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            <div className="flex gap-1.5 overflow-x-auto hide-scroll py-1.5">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => onCategoryChange(cat)}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE MENU ── */}
      {menuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#161b22] border-t border-gray-100 dark:border-gray-800 shadow-lg">
          <div className="container mx-auto px-4 py-3">

            {/* Nav grid */}
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {NAV_LINKS.map(n => (
                <button key={n.cat}
                  onClick={() => { onCategoryChange?.(n.cat); setMenuOpen(false); }}
                  className={`text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    activeCategory === n.cat
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 hover:text-orange-600'
                  }`}>
                  {n.label}
                </button>
              ))}
              <Link href="/epaper" onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                📰 ई-पेपर
              </Link>
              <Link href="/rashifal" onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                🔮 राशिफल
              </Link>
            </div>

            {/* Category pills */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
              <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">श्रेणियाँ</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(cat => (
                  <button key={cat}
                    onClick={() => { onCategoryChange?.(cat); setMenuOpen(false); }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      activeCategory === cat
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}