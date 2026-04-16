"use client";

import { useState, useEffect } from 'react';
import SharedHeader from '@/components/SharedHeader';

interface PDF {
  id: string;
  title: string;
  file_url: string;
  created_at: string;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });

export default function EpaperPage() {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<PDF | null>(null);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) { setLoading(false); return; }
    fetch(`${supabaseUrl}/rest/v1/pdfs?order=created_at.desc`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
    })
      .then(r => r.json())
      .then(data => setPdfs(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0e1117]">
      <SharedHeader />

      <div className="bg-orange-500 text-white py-2 px-4">
        <div className="container mx-auto flex items-center gap-3">
          <span className="bg-white text-orange-600 font-black text-xs px-2.5 py-0.5 rounded whitespace-nowrap">📰 ई-पेपर</span>
          <span className="text-xs sm:text-sm font-medium truncate">राष्ट्रीय प्रहरी भारत के डिजिटल संस्करण</span>
        </div>
      </div>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-10 max-w-5xl">

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 sm:py-32 gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">लोड हो रहा है...</p>
          </div>
        )}

        {!loading && pdfs.length === 0 && (
          <div className="text-center py-24 sm:py-32">
            <div className="text-5xl sm:text-6xl mb-4">📂</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-600 dark:text-gray-400">अभी कोई ई-पेपर उपलब्ध नहीं है</h3>
            <p className="text-gray-400 text-sm mt-2">जल्द ही यहाँ ई-पेपर उपलब्ध होंगे।</p>
          </div>
        )}

        {!loading && pdfs.length > 0 && (
          <>
            {/* Latest edition */}
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <div className="w-1 h-6 sm:h-7 bg-orange-500 rounded-full" />
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">नवीनतम संस्करण</h2>
              </div>
              <div className="bg-white dark:bg-[#161b22] rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 sm:p-6 text-white">
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="min-w-0">
                      <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full mb-2 inline-block">नवीनतम</span>
                      <h3 className="text-lg sm:text-2xl font-black mt-1 leading-tight">{pdfs[0].title}</h3>
                      <p className="text-orange-100 text-xs sm:text-sm mt-1">📅 {formatDate(pdfs[0].created_at)}</p>
                    </div>
                    <div className="text-4xl sm:text-6xl shrink-0">📄</div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-5">
                    <button onClick={() => setSelectedPdf(pdfs[0])}
                      className="bg-white text-orange-600 font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl hover:bg-orange-50 transition-colors text-xs sm:text-sm shadow">
                      👁️ अभी पढ़ें
                    </button>
                    <a href={pdfs[0].file_url} target="_blank" rel="noopener noreferrer"
                      className="bg-white/20 hover:bg-white/30 text-white font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-colors text-xs sm:text-sm border border-white/30">
                      ⬇️ डाउनलोड
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Older editions */}
            {pdfs.length > 1 && (
              <div>
                <div className="flex items-center gap-3 mb-4 sm:mb-5">
                  <div className="w-1 h-6 sm:h-7 bg-orange-500 rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">पिछले संस्करण</h2>
                </div>
                {/* 1 col on xs, 2 on sm, 3 on lg */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {pdfs.slice(1).map(pdf => (
                    <div key={pdf.id}
                      className="bg-white dark:bg-[#161b22] rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-xl sm:text-2xl shrink-0">📄</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm line-clamp-2 leading-snug">{pdf.title}</h4>
                          <p className="text-xs text-gray-400 mt-1">📅 {formatDate(pdf.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 sm:mt-4">
                        <button onClick={() => setSelectedPdf(pdf)}
                          className="flex-1 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 font-bold py-1.5 sm:py-2 rounded-xl transition-colors text-xs sm:text-sm">
                          👁️ पढ़ें
                        </button>
                        <a href={pdf.file_url} target="_blank" rel="noopener noreferrer"
                          className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-1.5 sm:py-2 rounded-xl transition-colors text-xs sm:text-sm text-center">
                          ⬇️ डाउनलोड
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-gray-900 text-white mt-12 sm:mt-16 border-t-4 border-orange-500 py-6 sm:py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs sm:text-sm text-gray-500">© 2026 राष्ट्रीय प्रहरी भारत | सर्वाधिकार सुरक्षित</p>
        </div>
      </footer>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900 border-b border-gray-700 shrink-0">
            <h3 className="font-bold text-white text-sm truncate flex-1 mr-3">{selectedPdf.title}</h3>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <a href={selectedPdf.file_url} target="_blank" rel="noopener noreferrer"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors">
                ⬇️ डाउनलोड
              </a>
              <button onClick={() => setSelectedPdf(null)}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-700 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition-colors text-lg">
                ×
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <iframe src={`${selectedPdf.file_url}#toolbar=1&navpanes=1`}
              className="w-full h-full border-0" title={selectedPdf.title} />
          </div>
        </div>
      )}
    </div>
  );
}
