"use client";

import Link from 'next/link';

const CATEGORIES = ['राजनीति', 'खेल', 'मनोरंजन', 'तकनीक', 'व्यापार', 'स्वास्थ्य', 'करियर', 'अंतर्राष्ट्रीय'];

interface FooterProps {
  onCategoryChange?: (cat: string) => void;
}

export default function Footer({ onCategoryChange }: FooterProps) {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white border-t-4 border-orange-500 mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.svg" alt="logo"
                className="h-12 w-auto object-contain"
                style={{ maxWidth: '52px' }} />
              <div>
                <p className="font-black text-white text-base leading-tight">राष्ट्रीय प्रहरी</p>
                <p className="text-orange-400 font-bold text-sm">भारत न्यूज़</p>
                <p className="text-gray-500 text-xs">एक सजग प्रहरी</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-xs">
              भारत का विश्वसनीय डिजिटल समाचार मंच। सत्य, निष्पक्ष और तेज़ खबरें — हर पल, हर जगह।
            </p>
            <div className="flex gap-2">
              {[
                { icon: '📘', label: 'Facebook', href: '#' },
                { icon: '📷', label: 'Instagram', href: '#' },
                { icon: '🐦', label: 'Twitter', href: '#' },
                { icon: '▶️', label: 'YouTube', href: '#' },
              ].map(s => (
                <a key={s.label} href={s.href} title={s.label}
                  className="w-9 h-9 bg-gray-800 hover:bg-orange-500 rounded-xl flex items-center justify-center transition-colors">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider border-b border-gray-800 pb-2">
              त्वरित लिंक
            </h4>
            <div className="space-y-2.5">
              {[
                { href: '/pages/about', label: 'हमारे बारे में' },
                { href: '/pages/contact', label: 'संपर्क करें' },
                { href: '/pages/advertise', label: 'विज्ञापन' },
                { href: '/pages/careers', label: 'करियर' },
                { href: '/pages/privacy', label: 'गोपनीयता नीति' },
                { href: '/pages/terms', label: 'नियम और शर्तें' },
                { href: '/pages/disclaimer', label: 'अस्वीकरण' },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="block text-gray-400 hover:text-orange-400 transition-colors text-sm">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider border-b border-gray-800 pb-2">
              श्रेणियाँ
            </h4>
            <div className="space-y-2.5">
              {CATEGORIES.map(cat => (
                <button key={cat}
                  onClick={() => onCategoryChange?.(cat)}
                  className="block text-gray-400 hover:text-orange-400 transition-colors text-sm text-left w-full">
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* More */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider border-b border-gray-800 pb-2">
              और अधिक
            </h4>
            <div className="space-y-2.5 mb-6">
              <Link href="/epaper"
                className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors text-sm">
                📰 ई-पेपर
              </Link>
              <Link href="/rashifal"
                className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors text-sm">
                🔮 राशिफल
              </Link>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 text-white">
              <p className="font-black text-sm mb-1">📱 ऐप आ रहा है!</p>
              <p className="text-orange-100 text-xs leading-relaxed">
                Play Store पर जल्द उपलब्ध होगा।
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            © 2026 राष्ट्रीय प्रहरी भारत न्यूज़ | सर्वाधिकार सुरक्षित | Made with ❤️ in India
          </p>
          <div className="flex items-center gap-4">
            <Link href="/pages/privacy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Privacy</Link>
            <Link href="/pages/terms" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Terms</Link>
            <Link href="/pages/disclaimer" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}