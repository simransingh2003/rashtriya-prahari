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
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                रा
              </div>
              <h3 className="text-2xl font-black mb-3 bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent news-serif">
                  राष्ट्रीय प्रहरी भारत
                </h3>
         
            </div>

            <PushNotificationButton />
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">श्रेणियाँ</h3>
            <ul className="space-y-2">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <Link
                    href={`/category/${encodeURIComponent(cat)}`}
                    className="text-gray-400 hover:text-orange-400 text-sm transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer pages */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">जानकारी</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.map(link => (
                <li key={link.slug}>
                  <Link
                    href={`/page/${link.slug}`}
                    className="text-gray-400 hover:text-orange-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">जुड़ें</h3>
            <div className="space-y-3">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-blue-400 text-sm transition-colors">
                <span className="w-7 h-7 bg-gray-800 rounded-lg flex items-center justify-center text-base">𝕏</span>
                Twitter / X
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-blue-500 text-sm transition-colors">
                <span className="w-7 h-7 bg-gray-800 rounded-lg flex items-center justify-center">f</span>
                Facebook
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm transition-colors">
                <span className="w-7 h-7 bg-gray-800 rounded-lg flex items-center justify-center text-xs">▶</span>
                YouTube
              </a>
              <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-green-400 text-sm transition-colors">
                <span className="w-7 h-7 bg-gray-800 rounded-lg flex items-center justify-center text-xs">💬</span>
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} राष्ट्रीय प्रहरी भारत। सर्वाधिकार सुरक्षित।
          </p>
          <div className="flex items-center gap-4">
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