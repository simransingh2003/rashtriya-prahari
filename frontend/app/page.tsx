
import ThemeToggle from './ThemeToggle';
"use client";


export default function Home() {
  const newsArticles = [
    {
      id: 1,
      title_hi: "प्रधानमंत्री ने नई शिक्षा नीति की घोषणा की",
      title_en: "Prime Minister Announces New Education Policy",
      category: "राजनीति",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
      date: "13 मार्च 2026",
      isBreaking: true
    },
    {
      id: 2,
      title_hi: "भारतीय क्रिकेट टीम ने जीता विश्व कप",
      title_en: "Indian Cricket Team Wins World Cup",
      category: "खेल",
      image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
      date: "12 मार्च 2026",
      isBreaking: false
    },
    {
      id: 3,
      title_hi: "तकनीकी क्षेत्र में नए रोजगार के अवसर",
      title_en: "New Job Opportunities in Tech Sector",
      category: "करियर",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80",
      date: "11 मार्च 2026",
      isBreaking: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors" >
      {/* Header */}
<header className="bg-gradient-to-r from-orange-500 via-white to-green-500 dark:from-orange-600 dark:via-gray-800 dark:to-green-600 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-4xl">📰</div>
              <div>
                <h1 className="text-3xl font-bold text-orange-600">
                  राष्ट्रीय प्रहरी भारत
                </h1>
                <p className="text-sm text-gray-600">एक राष्ट्र पहली</p>
              </div>
            </div>
            <nav className="hidden md:flex gap-6">
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 font-medium">मुख्य पृष्ठ</a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 font-medium">राजनीति</a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 font-medium">खेल</a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 font-medium">मनोरंजन</a>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Breaking News Ticker */}
      <div className="bg-red-600 text-white py-2 overflow-hidden">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <span className="font-bold whitespace-nowrap">⚡ ब्रेकिंग न्यूज़:</span>
          <div className="animate-scroll whitespace-nowrap">
            प्रधानमंत्री ने नई शिक्षा नीति की घोषणा की • भारतीय अर्थव्यवस्था में तेजी • नई तकनीक से बदलेगा शिक्षा का भविष्य
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main News Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 border-b-4 border-orange-500 pb-2 inline-block">
              ताज़ा खबरें
            </h2>
            
            {/* Featured Article */}
            {newsArticles[0] && (
              <div className="relative mb-8 rounded-xl overflow-hidden shadow-lg group">
                <img 
                  src={newsArticles[0].image} 
                  alt={newsArticles[0].title_hi}
                  className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 p-6 text-white">
                  {newsArticles[0].isBreaking && (
                    <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block">
                      ब्रेकिंग न्यूज़
                    </span>
                  )}
                  <h3 className="text-3xl font-bold mb-2">{newsArticles[0].title_hi}</h3>
                  <p className="text-sm text-gray-300">{newsArticles[0].date} • {newsArticles[0].category}</p>
                </div>
              </div>
            )}

            {/* News Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {newsArticles.slice(1).map((article) => (
                <div key={article.id} className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <img 
                    src={article.image} 
                    alt={article.title_hi}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-5">
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      {article.category}
                    </span>
                    <h3 className="font-bold text-lg mt-2 mb-2 line-clamp-2">
                      {article.title_hi}
                    </h3>
                    <p className="text-sm text-gray-500">{article.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
              <h3 className="text-xl font-bold mb-4 border-b-2 border-orange-500 pb-2">
                ट्रेंडिंग
              </h3>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3 items-start border-b pb-3 last:border-0">
                    <span className="text-2xl font-bold text-orange-500">{i}</span>
                    <div>
                      <p className="text-sm font-medium hover:text-orange-600 cursor-pointer">
                        महत्वपूर्ण खबर का शीर्षक यहाँ दिखाई देगा
                      </p>
                      <span className="text-xs text-gray-500">2 घंटे पहले</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold mb-4">📱 ऐप डाउनलोड करें</h3>
              <p className="text-sm mb-4">तेज़ खबरें और ऑफलाइन पढ़ने के लिए हमारा मोबाइल ऐप डाउनलोड करें!</p>
              <button className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 text-orange-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors w-full">
                अभी डाउनलोड करें
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
            राष्ट्रीय प्रहरी भारत
          </h3>
          <p className="text-gray-400 text-sm">भारत का विश्वसनीय समाचार स्रोत</p>
          <div className="mt-4 text-sm text-gray-500">
            © 2026 Rashtriya Prahari Bharat. All rights reserved.
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </div>
  );
}