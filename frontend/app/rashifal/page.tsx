"use client";

import { useState, useEffect, useCallback } from 'react';
import SharedHeader from '@/components/SharedHeader';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const RASHIS = [
  { name: 'मेष',      english: 'Aries',        symbol: '♈', date: '21 मार्च - 19 अप्रैल' },
  { name: 'वृषभ',    english: 'Taurus',       symbol: '♉', date: '20 अप्रैल - 20 मई' },
  { name: 'मिथुन',   english: 'Gemini',       symbol: '♊', date: '21 मई - 20 जून' },
  { name: 'कर्क',    english: 'Cancer',       symbol: '♋', date: '21 जून - 22 जुलाई' },
  { name: 'सिंह',    english: 'Leo',          symbol: '♌', date: '23 जुलाई - 22 अगस्त' },
  { name: 'कन्या',   english: 'Virgo',        symbol: '♍', date: '23 अगस्त - 22 सितंबर' },
  { name: 'तुला',    english: 'Libra',        symbol: '♎', date: '23 सितंबर - 22 अक्टूबर' },
  { name: 'वृश्चिक', english: 'Scorpio',      symbol: '♏', date: '23 अक्टूबर - 21 नवंबर' },
  { name: 'धनु',     english: 'Sagittarius',  symbol: '♐', date: '22 नवंबर - 21 दिसंबर' },
  { name: 'मकर',     english: 'Capricorn',    symbol: '♑', date: '22 दिसंबर - 19 जनवरी' },
  { name: 'कुंभ',    english: 'Aquarius',     symbol: '♒', date: '20 जनवरी - 18 फरवरी' },
  { name: 'मीन',     english: 'Pisces',       symbol: '♓', date: '19 फरवरी - 20 मार्च' },
];

interface RashifalEntry {
  id?: number;
  date: string;
  rashi: string;
  content: string;
  lucky_color?: string;
  lucky_number?: string;
  lucky_direction?: string;
}

interface GeneratedRashifal {
  content: string;
  lucky_color: string;
  lucky_number: string;
  lucky_direction: string;
}

const todayHi = new Date().toLocaleDateString('hi-IN', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

async function fetchFromSupabase(date: string): Promise<Record<string, RashifalEntry>> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return {};
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/rashifal?date=eq.${date}&order=rashi.asc`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const rows: RashifalEntry[] = await res.json();
  const map: Record<string, RashifalEntry> = {};
  rows.forEach(r => { map[r.rashi] = r; });
  return map;
}

async function saveToSupabase(entry: RashifalEntry): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  await fetch(`${SUPABASE_URL}/rest/v1/rashifal`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(entry),
  });
}

async function generateRashifal(rashiName: string, rashiEnglish: string, date: string): Promise<GeneratedRashifal> {
  const dateHindi = new Date(date).toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const [year, month, day] = date.split('-');
  const prompt = `आज की तारीख है ${dateHindi} (${day}/${month}/${year})।
${rashiName} राशि (${rashiEnglish}) के लिए आज का विस्तृत राशिफल हिंदी में लिखें।
नीचे दिए गए JSON format में उत्तर दें — केवल JSON:
{"content":"3-4 अनुच्छेदों में विस्तृत राशिफल।","lucky_color":"शुभ रंग","lucky_number":"1-9","lucky_direction":"शुभ दिशा"}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514', max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json();
  const text = data.content?.map((c: { type: string; text?: string }) => c.text || '').join('') ?? '';
  return JSON.parse(text.replace(/```json|```/g, '').trim()) as GeneratedRashifal;
}

export default function RashifalPage() {
  const [selected, setSelected] = useState(RASHIS[0].name);
  const [data, setData] = useState<Record<string, RashifalEntry>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  // Mobile: show rashi picker sheet
  const [showPicker, setShowPicker] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchFromSupabase(today).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [today]);

  const ensureRashifal = useCallback(async (rashiName: string) => {
    if (data[rashiName] || generating) return;
    const rashi = RASHIS.find(r => r.name === rashiName)!;
    setGenerating(true);
    try {
      const generated = await generateRashifal(rashiName, rashi.english, today);
      const entry: RashifalEntry = { date: today, rashi: rashiName, ...generated };
      saveToSupabase(entry).catch(console.error);
      setData(prev => ({ ...prev, [rashiName]: entry }));
    } catch (err) { console.error(err); }
    finally { setGenerating(false); }
  }, [data, generating, today]);

  useEffect(() => {
    if (!loading) ensureRashifal(selected);
  }, [selected, loading, ensureRashifal]);

  const selectedRashi = RASHIS.find(r => r.name === selected)!;
  const selectedData = data[selected];
  const isReady = !loading && !generating;

  const handleSelect = (name: string) => {
    setSelected(name);
    setShowPicker(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0e1117]">
      <SharedHeader />

      <div className="bg-orange-500 text-white py-2 px-4">
        <div className="container mx-auto flex items-center gap-3">
          <span className="bg-white text-orange-600 font-black text-xs px-2.5 py-0.5 rounded whitespace-nowrap">🔮 राशिफल</span>
          <span className="text-xs sm:text-sm font-medium truncate">{todayHi}</span>
        </div>
      </div>

      {/* Mobile: rashi selector bar */}
      <div className="lg:hidden bg-white dark:bg-[#161b22] border-b border-gray-100 dark:border-gray-800 px-3 py-2.5">
        <button onClick={() => setShowPicker(true)}
          className="w-full flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedRashi.symbol}</span>
            <div className="text-left">
              <p className="font-bold text-orange-600 dark:text-orange-400 text-sm">{selectedRashi.name}</p>
              <p className="text-xs text-gray-400">{selectedRashi.english}</p>
            </div>
          </div>
          <span className="text-gray-400 text-sm">▼ बदलें</span>
        </button>
      </div>

      {/* Mobile bottom sheet picker */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden" onClick={() => setShowPicker(false)}>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-t-2xl shadow-2xl max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#1a1a1a]">
              <h3 className="font-black text-gray-900 dark:text-white">अपनी राशि चुनें</h3>
              <button onClick={() => setShowPicker(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="grid grid-cols-3 gap-2 p-4">
              {RASHIS.map(rashi => (
                <button key={rashi.name} onClick={() => handleSelect(rashi.name)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors relative ${
                    selected === rashi.name ? 'bg-orange-500 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                  <span className="text-2xl">{rashi.symbol}</span>
                  <span className="text-xs font-bold">{rashi.name}</span>
                  {data[rashi.name] && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-green-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">

          {/* Sidebar — desktop only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm sticky top-20">
              <div className="bg-orange-500 px-4 py-3">
                <h2 className="font-black text-white text-sm">अपनी राशि चुनें</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {RASHIS.map(rashi => (
                  <button key={rashi.name} onClick={() => setSelected(rashi.name)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      selected === rashi.name
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
                    }`}>
                    <span className="text-xl">{rashi.symbol}</span>
                    <div>
                      <p className={`font-bold text-sm ${selected === rashi.name ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                        {rashi.name}
                      </p>
                      <p className="text-xs text-gray-400">{rashi.english}</p>
                    </div>
                    {data[rashi.name] && (
                      <span className="ml-auto w-2 h-2 bg-green-500 rounded-full shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">

            {/* Header card */}
            <div className="bg-white dark:bg-[#161b22] rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-4 sm:mb-6">
              <div className="border-l-4 border-orange-500 px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-4xl sm:text-6xl">{selectedRashi.symbol}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-900/20 px-2.5 py-0.5 rounded-full">
                      राशिफल
                    </span>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1 news-serif leading-tight">
                      {selectedRashi.name} राशि — आज का भविष्यफल
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1 truncate">
                      {selectedRashi.english} • {selectedRashi.date}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading */}
            {(loading || generating) && (
              <div className="bg-white dark:bg-[#161b22] rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 p-10 sm:p-12 text-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                  {generating ? '🔮 राशिफल तैयार हो रहा है...' : 'राशिफल लोड हो रहा है...'}
                </p>
              </div>
            )}

            {/* Content */}
            {isReady && selectedData && (
              <div className="space-y-3 sm:space-y-4">
                {/* Lucky bar */}
                <div className="bg-white dark:bg-[#161b22] rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap gap-3 sm:gap-6">
                  {selectedData.lucky_color && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">🎨 शुभ रंग:</span>
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{selectedData.lucky_color}</span>
                    </div>
                  )}
                  {selectedData.lucky_number && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">🔢 शुभ अंक:</span>
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{selectedData.lucky_number}</span>
                    </div>
                  )}
                  {selectedData.lucky_direction && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">🧭 शुभ दिशा:</span>
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{selectedData.lucky_direction}</span>
                    </div>
                  )}
                </div>

                {/* Article body */}
                <div className="bg-white dark:bg-[#161b22] rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="w-1 h-4 sm:h-5 bg-orange-500 rounded-full" />
                    <h3 className="font-black text-gray-900 dark:text-white text-sm sm:text-base">आज का राशिफल</h3>
                    <span className="text-xs text-gray-400 ml-auto hidden sm:block">🗞️ राष्ट्रीय प्रहरी भारत</span>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {selectedData.content.split('\n').filter(p => p.trim()).map((para, i) => (
                      <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{para}</p>
                    ))}
                  </div>
                </div>

                {/* Quick switcher */}
                <div className="bg-white dark:bg-[#161b22] rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
                  <h3 className="font-black text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm">अन्य राशियाँ</h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
                    {RASHIS.map(r => (
                      <button key={r.name} onClick={() => setSelected(r.name)}
                        className={`flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 rounded-xl transition-colors ${
                          selected === r.name
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                        }`}>
                        <span className="text-lg sm:text-xl">{r.symbol}</span>
                        <span className="text-xs font-bold leading-tight">{r.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Fallback */}
            {isReady && !selectedData && (
              <div className="bg-white dark:bg-[#161b22] rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 p-10 sm:p-12 text-center">
                <div className="text-4xl sm:text-5xl mb-4">🔮</div>
                <h3 className="font-bold text-gray-700 dark:text-gray-300 text-base sm:text-lg mb-2">
                  {selectedRashi.name} राशि का राशिफल उपलब्ध नहीं
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-4">कृपया पुनः प्रयास करें।</p>
                <button onClick={() => ensureRashifal(selected)}
                  className="bg-orange-500 text-white px-5 sm:px-6 py-2 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors">
                  पुनः प्रयास करें
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white mt-12 sm:mt-16 border-t-4 border-orange-500 py-6 sm:py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs sm:text-sm text-gray-500">© 2026 राष्ट्रीय प्रहरी भारत | सर्वाधिकार सुरक्षित</p>
        </div>
      </footer>
    </div>
  );
}
