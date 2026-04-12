"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const RASHIS = [
  { name: 'मेष', english: 'Aries', symbol: '♈', date: '21 मार्च - 19 अप्रैल', color: 'from-red-500 to-orange-500',
    lucky: { color: 'लाल', number: '9', day: 'मंगलवार' },
    today: 'आज का दिन आपके लिए शुभ है। कार्यक्षेत्र में नई सफलता मिलेगी। परिवार के साथ समय बिताएं। स्वास्थ्य का ध्यान रखें। आर्थिक स्थिति मजबूत रहेगी।',
    career: 'कार्यक्षेत्र में उन्नति के अवसर मिलेंगे।',
    love: 'प्रेम संबंधों में मधुरता रहेगी।',
    health: 'स्वास्थ्य सामान्य रहेगा, व्यायाम करें।' },
  { name: 'वृषभ', english: 'Taurus', symbol: '♉', date: '20 अप्रैल - 20 मई', color: 'from-green-500 to-emerald-500',
    lucky: { color: 'हरा', number: '6', day: 'शुक्रवार' },
    today: 'आज धन लाभ के योग हैं। व्यापार में सफलता मिलेगी। नए निवेश के बारे में सोचें। प्रियजनों का साथ मिलेगा।',
    career: 'व्यापारिक निर्णय सोच-समझकर लें।',
    love: 'साथी के साथ विशेष समय बिताएं।',
    health: 'खान-पान पर ध्यान दें।' },
  { name: 'मिथुन', english: 'Gemini', symbol: '♊', date: '21 मई - 20 जून', color: 'from-yellow-500 to-amber-500',
    lucky: { color: 'पीला', number: '5', day: 'बुधवार' },
    today: 'बुद्धि और विवेक से काम लें। यात्रा के योग हैं। मित्रों से सहायता मिलेगी। नई योजनाएं बनाएं।',
    career: 'नई परियोजनाओं में सफलता मिलेगी।',
    love: 'संवाद से रिश्ते मजबूत होंगे।',
    health: 'मानसिक शांति बनाए रखें।' },
  { name: 'कर्क', english: 'Cancer', symbol: '♋', date: '21 जून - 22 जुलाई', color: 'from-blue-400 to-cyan-500',
    lucky: { color: 'सफेद', number: '2', day: 'सोमवार' },
    today: 'घर-परिवार में सुख-शांति रहेगी। माता का आशीर्वाद मिलेगा। भावनात्मक संतुलन बनाए रखें।',
    career: 'धैर्य से काम लें, सफलता मिलेगी।',
    love: 'परिवार के प्रति समर्पण रहेगा।',
    health: 'पेट संबंधी समस्याओं पर ध्यान दें।' },
  { name: 'सिंह', english: 'Leo', symbol: '♌', date: '23 जुलाई - 22 अगस्त', color: 'from-orange-500 to-yellow-500',
    lucky: { color: 'सुनहरा', number: '1', day: 'रविवार' },
    today: 'आत्मविश्वास से भरपूर दिन है। नेतृत्व के अवसर मिलेंगे। सामाजिक प्रतिष्ठा बढ़ेगी।',
    career: 'वरिष्ठों का समर्थन मिलेगा।',
    love: 'रोमांटिक पल आएंगे।',
    health: 'ऊर्जावान रहेंगे, खेलकूद करें।' },
  { name: 'कन्या', english: 'Virgo', symbol: '♍', date: '23 अगस्त - 22 सितंबर', color: 'from-emerald-500 to-teal-500',
    lucky: { color: 'भूरा', number: '5', day: 'बुधवार' },
    today: 'विश्लेषणात्मक सोच काम आएगी। स्वास्थ्य सेवा में रुचि बढ़ेगी। कार्य में परिपूर्णता लाएं।',
    career: 'विस्तार पर ध्यान देने से सफलता मिलेगी।',
    love: 'व्यावहारिक दृष्टिकोण रखें।',
    health: 'नियमित दिनचर्या बनाए रखें।' },
  { name: 'तुला', english: 'Libra', symbol: '♎', date: '23 सितंबर - 22 अक्टूबर', color: 'from-pink-500 to-rose-500',
    lucky: { color: 'गुलाबी', number: '6', day: 'शुक्रवार' },
    today: 'संतुलन और न्याय से काम लें। साझेदारी में लाभ होगा। कला और सौंदर्य में रुचि बढ़ेगी।',
    career: 'साझेदारी व्यवसाय में सफलता।',
    love: 'प्रेम में संतुलन बनाए रखें।',
    health: 'गुर्दे का ध्यान रखें।' },
  { name: 'वृश्चिक', english: 'Scorpio', symbol: '♏', date: '23 अक्टूबर - 21 नवंबर', color: 'from-purple-600 to-indigo-600',
    lucky: { color: 'गहरा लाल', number: '8', day: 'मंगलवार' },
    today: 'गहन सोच से समस्याओं का समाधान होगा। गुप्त जानकारी सामने आ सकती है। परिवर्तन शुभ रहेगा।',
    career: 'शोध और जांच में सफलता।',
    love: 'गहरे भावनात्मक संबंध बनेंगे।',
    health: 'तनाव से बचें।' },
  { name: 'धनु', english: 'Sagittarius', symbol: '♐', date: '22 नवंबर - 21 दिसंबर', color: 'from-blue-600 to-purple-600',
    lucky: { color: 'नीला', number: '3', day: 'गुरुवार' },
    today: 'आशावादी दृष्टिकोण रखें। यात्रा और शिक्षा में सफलता। दार्शनिक विचारों में रुचि बढ़ेगी।',
    career: 'उच्च शिक्षा और विदेश में अवसर।',
    love: 'स्वतंत्रता का सम्मान करें।',
    health: 'जांघ और कूल्हे का ध्यान रखें।' },
  { name: 'मकर', english: 'Capricorn', symbol: '♑', date: '22 दिसंबर - 19 जनवरी', color: 'from-gray-600 to-slate-600',
    lucky: { color: 'काला', number: '8', day: 'शनिवार' },
    today: 'मेहनत और अनुशासन से सफलता मिलेगी। दीर्घकालिक योजनाएं बनाएं। धैर्य रखें।',
    career: 'कठिन परिश्रम रंग लाएगा।',
    love: 'जिम्मेदारी से रिश्ते निभाएं।',
    health: 'हड्डियों का ध्यान रखें।' },
  { name: 'कुंभ', english: 'Aquarius', symbol: '♒', date: '20 जनवरी - 18 फरवरी', color: 'from-cyan-500 to-blue-500',
    lucky: { color: 'आसमानी', number: '4', day: 'शनिवार' },
    today: 'नवाचार और प्रौद्योगिकी में रुचि बढ़ेगी। मानवीय कार्यों में भाग लें। मित्रता में लाभ।',
    career: 'तकनीकी क्षेत्र में उन्नति।',
    love: 'मित्रता से प्रेम में बदलाव।',
    health: 'टखने का ध्यान रखें।' },
  { name: 'मीन', english: 'Pisces', symbol: '♓', date: '19 फरवरी - 20 मार्च', color: 'from-teal-500 to-green-500',
    lucky: { color: 'समुद्री हरा', number: '7', day: 'गुरुवार' },
    today: 'आध्यात्मिकता और कल्पना शक्ति बढ़ेगी। सहानुभूति से दूसरों की मदद करें। सपने साकार होंगे।',
    career: 'रचनात्मक क्षेत्र में सफलता।',
    love: 'भावनात्मक गहराई में प्रेम पनपेगा।',
    health: 'पैरों का ध्यान रखें।' },
];

export default function RashifalPage() {
  const [selected, setSelected] = useState<typeof RASHIS[0] | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const today = new Date().toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

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

  return (
    <div className={darkMode ? 'dark' : ''}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Mukta:wght@400;600;700;800&display=swap');
        body, * { font-family: 'Mukta', 'Noto Sans Devanagari', sans-serif; }
        .news-serif { font-family: 'Playfair Display', 'Noto Serif Devanagari', serif !important; }
      `}</style>

      <div className="min-h-screen bg-gray-50 dark:bg-[#0e1117]">

        {/* Header */}
        <header className="bg-white dark:bg-[#161b22] border-b-2 border-orange-500 shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="logo" className="w-9 h-9 rounded-xl"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              <span className="font-black text-lg bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent news-serif">
                राष्ट्रीय प्रहरी भारत
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <button onClick={toggleTheme}
                className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 flex items-center justify-center transition-colors">
                {darkMode ? '☀️' : '🌙'}
              </button>
              <Link href="/" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
                ← मुख्य पृष्ठ
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white py-12 px-4">
          <div className="container mx-auto text-center">
            <div className="text-6xl mb-4">🔮</div>
            <h1 className="text-3xl md:text-5xl font-black mb-3 news-serif">आज का राशिफल</h1>
            <p className="text-purple-200 text-lg">{today}</p>
          </div>
        </div>

        <main className="container mx-auto px-4 py-10 max-w-6xl">

          {/* Rashi Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
            {RASHIS.map(rashi => (
              <button key={rashi.name} onClick={() => setSelected(rashi)}
                className={`relative rounded-2xl p-4 text-white text-center cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br ${rashi.color} ${selected?.name === rashi.name ? 'ring-4 ring-white ring-offset-2 scale-105' : ''}`}>
                <div className="text-4xl mb-2">{rashi.symbol}</div>
                <h3 className="font-black text-lg">{rashi.name}</h3>
                <p className="text-white/80 text-xs mt-1">{rashi.english}</p>
                <p className="text-white/60 text-xs mt-0.5">{rashi.date}</p>
              </button>
            ))}
          </div>

          {/* Selected Rashi Detail */}
          {selected && (
            <div className="bg-white dark:bg-[#161b22] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              {/* Header */}
              <div className={`bg-gradient-to-r ${selected.color} p-8 text-white`}>
                <div className="flex items-center gap-6">
                  <div className="text-8xl">{selected.symbol}</div>
                  <div>
                    <h2 className="text-4xl font-black news-serif">{selected.name} राशि</h2>
                    <p className="text-white/80 text-lg mt-1">{selected.english} • {selected.date}</p>
                    <div className="flex gap-4 mt-3">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">🎨 शुभ रंग: {selected.lucky.color}</span>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">🔢 शुभ अंक: {selected.lucky.number}</span>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">📅 शुभ दिन: {selected.lucky.day}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Today's horoscope */}
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 mb-6">
                  <h3 className="font-black text-purple-700 dark:text-purple-400 text-lg mb-3 flex items-center gap-2">
                    🔮 आज का भविष्यफल
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{selected.today}</p>
                </div>

                {/* Cards */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
                    <h4 className="font-black text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">💼 करियर</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{selected.career}</p>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-2xl p-5">
                    <h4 className="font-black text-pink-700 dark:text-pink-400 mb-2 flex items-center gap-2">❤️ प्रेम</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{selected.love}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5">
                    <h4 className="font-black text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">🌿 स्वास्थ्य</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{selected.health}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!selected && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-4">👆</div>
              <p className="text-lg font-semibold">अपनी राशि चुनें</p>
              <p className="text-sm mt-1">ऊपर दी गई राशियों में से अपनी राशि पर क्लिक करें</p>
            </div>
          )}
        </main>

        <footer className="bg-gray-900 text-white mt-16 border-t-4 border-orange-500 py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-gray-500">© 2026 राष्ट्रीय प्रहरी भारत | सर्वाधिकार सुरक्षित</p>
          </div>
        </footer>
      </div>
    </div>
  );
}