"use client";

import { useState, useEffect } from 'react';
import SharedHeader from '@/components/SharedHeader';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const RASHIS = [
  { name: 'मेष', english: 'Aries', symbol: '♈', date: '21 मार्च - 19 अप्रैल' },
  { name: 'वृषभ', english: 'Taurus', symbol: '♉', date: '20 अप्रैल - 20 मई' },
  { name: 'मिथुन', english: 'Gemini', symbol: '♊', date: '21 मई - 20 जून' },
  { name: 'कर्क', english: 'Cancer', symbol: '♋', date: '21 जून - 22 जुलाई' },
  { name: 'सिंह', english: 'Leo', symbol: '♌', date: '23 जुलाई - 22 अगस्त' },
  { name: 'कन्या', english: 'Virgo', symbol: '♍', date: '23 अगस्त - 22 सितंबर' },
  { name: 'तुला', english: 'Libra', symbol: '♎', date: '23 सितंबर - 22 अक्टूबर' },
  { name: 'वृश्चिक', english: 'Scorpio', symbol: '♏', date: '23 अक्टूबर - 21 नवंबर' },
  { name: 'धनु', english: 'Sagittarius', symbol: '♐', date: '22 नवंबर - 21 दिसंबर' },
  { name: 'मकर', english: 'Capricorn', symbol: '♑', date: '22 दिसंबर - 19 जनवरी' },
  { name: 'कुंभ', english: 'Aquarius', symbol: '♒', date: '20 जनवरी - 18 फरवरी' },
  { name: 'मीन', english: 'Pisces', symbol: '♓', date: '19 फरवरी - 20 मार्च' },
];

interface RashifalEntry {
  id: number;
  date: string;
  rashi: string;
  content: string;
  lucky_color?: string;
  lucky_number?: string;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });

export default function RashifalPage() {
  const [selected, setSelected] = useState(RASHIS[0].name);
  const [data, setData] = useState<Record<string, RashifalEntry>>({});
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];
  const todayHi = new Date().toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_KEY) { setLoading(false); return; }
    fetch(`${SUPABASE_URL}/rest/v1/rashifal?date=eq.${today}&order=rashi.asc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    })
      .then(r => r.json())
      .then((rows: RashifalEntry[]) => {
        const map: Record<string, RashifalEntry> = {};
        rows.forEach(r => { map[r.rashi] = r; });
        setData(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [today]);

  const selectedRashi = RASHIS.find(r => r.name === selected)!;
  const selectedData = data[selected];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0e1117]">
      <SharedHeader />

      {/* Breaking-style date bar */}
      <div className="bg-orange-500 text-white py-2 px-4">
        <div className="container mx-auto flex items-center gap-3">
          <span className="bg-white text-orange-600 font-black text-xs px-3 py-0.5 rounded whitespace-nowrap">🔮 राशिफल</span>
          <span className="text-sm font-medium">{todayHi}</span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-6">

          {/* ── Sidebar: Rashi list ── */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm sticky top-20">
              <div className="bg-orange-500 px-4 py-3">
                <h2 className="font-black text-white text-sm">अपनी राशि चुनें</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {RASHIS.map(rashi => (
                  <button key={rashi.name} onClick={() => setSelected(rashi.name)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      selected === rashi.name
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
                    }`}>
                    <span className="text-2xl">{rashi.symbol}</span>
                    <div>
                      <p className={`font-bold text-sm ${selected === rashi.name ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                        {rashi.name}
                      </p>
                      <p className="text-xs text-gray-400">{rashi.english}</p>
                    </div>
                    {data[rashi.name] && (
                      <span className="ml-auto w-2 h-2 bg-green-500 rounded-full shrink-0" title="आज का राशिफल उपलब्ध है" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Main: Selected rashi detail ── */}
          <div className="lg:col-span-3">

            {/* Article-style header */}
            <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-6">
              <div className="border-l-4 border-orange-500 px-6 py-5">
                <div className="flex items-center gap-4">
                  <span className="text-6xl">{selectedRashi.symbol}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-900/20 px-3 py-0.5 rounded-full">
                        राशिफल
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white news-serif">
                      {selectedRashi.name} राशि — आज का भविष्यफल
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      {selectedRashi.english} • {selectedRashi.date} • 📅 {todayHi}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">राशिफल लोड हो रहा है...</p>
              </div>
            ) : selectedData ? (
              <div className="space-y-4">
                {/* Lucky info bar */}
                {(selectedData.lucky_color || selectedData.lucky_number) && (
                  <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-gray-800 px-6 py-4 flex flex-wrap gap-4">
                    {selectedData.lucky_color && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">🎨 शुभ रंग:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{selectedData.lucky_color}</span>
                      </div>
                    )}
                    {selectedData.lucky_number && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">🔢 शुभ अंक:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{selectedData.lucky_number}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Main content — article style */}
                <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="w-1 h-5 bg-orange-500 rounded-full" />
                    <h3 className="font-black text-gray-900 dark:text-white">आज का राशिफल</h3>
                    <span className="text-xs text-gray-400 ml-auto">🗞️ राष्ट्रीय प्रहरी भारत</span>
                  </div>
                  <div className="space-y-4">
                    {selectedData.content.split('\n').filter(p => p.trim()).map((para, i) => (
                      <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">{para}</p>
                    ))}
                  </div>
                </div>

                {/* All rashis quick links */}
                <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                  <h3 className="font-black text-gray-900 dark:text-white mb-4 text-sm">अन्य राशियाँ</h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {RASHIS.map(r => (
                      <button key={r.name} onClick={() => setSelected(r.name)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                          selected === r.name
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                        }`}>
                        <span className="text-xl">{r.symbol}</span>
                        <span className="text-xs font-bold">{r.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                <div className="text-5xl mb-4">🔮</div>
                <h3 className="font-bold text-gray-700 dark:text-gray-300 text-lg mb-2">
                  {selectedRashi.name} राशि का आज का राशिफल जल्द आएगा
                </h3>
                <p className="text-gray-400 text-sm">हमारी टीम प्रतिदिन राशिफल अपडेट करती है।</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white mt-16 border-t-4 border-orange-500 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">© 2026 राष्ट्रीय प्रहरी भारत | सर्वाधिकार सुरक्षित</p>
        </div>
      </footer>
    </div>
  );
}