"use client";

import { useState, useEffect } from "react";

interface Article {
  id: string;
  title_hi: string;
  title_en: string;
  category: string;
  image_url: string;
  created_at: string;
  is_breaking: boolean;
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [newsArticles, setNewsArticles] = useState<Article[]>([]);
  const [breakingNews, setBreakingNews] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ DEFINE API ONCE (GLOBAL INSIDE COMPONENT)
  const API =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://rashtriya-prahari-production.up.railway.app";

  // ✅ FETCH ALL DATA
  useEffect(() => {
    console.log("API:", API);

    // Fetch all news
    fetch(`${API}/api/v1/news`)
      .then((res) => {
        console.log("News URL:", res.url);
        return res.json();
      })
      .then(({ data }) => {
        setNewsArticles(data);
      })
      .catch((err) => {
        console.error("Failed to fetch news:", err);
      });

    // Fetch breaking news
    fetch(`${API}/api/v1/news/breaking`)
      .then((res) => {
        console.log("Breaking URL:", res.url);
        return res.json();
      })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setBreakingNews(
            data.map((n: any) => n.title_hi).join(" • ")
          );
        }
      })
      .catch((err) =>
        console.error("Failed to fetch breaking news:", err)
      )
      .finally(() => setLoading(false));
  }, [API]);

  // ✅ DARK MODE
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("hi-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

      {/* HEADER */}
      <header className="bg-white dark:bg-gray-800 shadow-md border-b-4 border-orange-500">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-600">
            राष्ट्रीय प्रहरी भारत
          </h1>

          <button onClick={toggleTheme}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* BREAKING NEWS */}
      <div className="bg-red-600 text-white p-2 text-sm">
        ⚡ {breakingNews || "लोड हो रहा है..."}
      </div>

      {/* MAIN */}
      <main className="container mx-auto px-4 py-6">

        {loading && <p>Loading...</p>}

        {!loading && newsArticles.length === 0 && (
          <p>No news available</p>
        )}

        {!loading && newsArticles.length > 0 && (
          <div className="grid gap-6">
            {newsArticles.map((article) => (
              <div key={article.id} className="p-4 border rounded">
                <h2 className="font-bold text-lg">
                  {article.title_hi}
                </h2>
                <p className="text-sm text-gray-500">
                  {formatDate(article.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}