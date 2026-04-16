import Link from "next/link";
import PushNotificationButton from "./PushNotificationButton";

const FOOTER_LINKS = [
  { slug: "about",      label: "हमारे बारे में" },
  { slug: "contact",    label: "संपर्क करें" },
  { slug: "privacy",    label: "गोपनीयता नीति" },
  { slug: "terms",      label: "नियम और शर्तें" },
  { slug: "disclaimer", label: "अस्वीकरण" },
];

const CATEGORIES = ["राजनीति", "खेल", "मनोरंजन", "तकनीक", "व्यापार", "स्वास्थ्य", "करियर", "अंतर्राष्ट्रीय"];

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">

          {/* Brand — full width on xs, half on sm */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shrink-0">
                रा
              </div>
              <h3 className="text-lg sm:text-xl font-black bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent news-serif leading-tight">
                राष्ट्रीय प्रहरी भारत
              </h3>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm mb-4 leading-relaxed">
              भारत की विश्वसनीय हिंदी समाचार सेवा
            </p>
            <PushNotificationButton />
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-white mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">श्रेणियाँ</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <Link
                    href={`/category/${encodeURIComponent(cat)}`}
                    className="text-gray-400 hover:text-orange-400 text-xs sm:text-sm transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer pages */}
          <div>
            <h3 className="font-bold text-white mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">जानकारी</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {FOOTER_LINKS.map(link => (
                <li key={link.slug}>
                  <Link
                    href={`/page/${link.slug}`}
                    className="text-gray-400 hover:text-orange-400 text-xs sm:text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold text-white mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">जुड़ें</h3>
            <div className="space-y-2.5 sm:space-y-3">
              {[
                { href: "https://twitter.com", icon: "𝕏", label: "Twitter / X", color: "hover:text-blue-400" },
                { href: "https://facebook.com", icon: "f", label: "Facebook", color: "hover:text-blue-500" },
                { href: "https://youtube.com", icon: "▶", label: "YouTube", color: "hover:text-red-400" },
                { href: "https://whatsapp.com", icon: "💬", label: "WhatsApp", color: "hover:text-green-400" },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className={`flex items-center gap-2 text-gray-400 ${s.color} text-xs sm:text-sm transition-colors`}>
                  <span className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-800 rounded-lg flex items-center justify-center text-xs shrink-0">
                    {s.icon}
                  </span>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 sm:mt-10 pt-5 sm:pt-6 flex flex-col gap-3">
          <p className="text-gray-500 text-xs sm:text-sm text-center md:text-left">
            © {new Date().getFullYear()} राष्ट्रीय प्रहरी भारत। सर्वाधिकार सुरक्षित।
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
            {FOOTER_LINKS.map(link => (
              <Link key={link.slug} href={`/page/${link.slug}`}
                className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
