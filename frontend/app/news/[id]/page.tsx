import { Metadata } from 'next';
import ArticleClient from './ArticleClient';

// ✅ Fix — works on both server and client
const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rashtriya-prahari.vercel.app';
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';

interface Article {
  id: string;
  title_hi: string;
  title_en: string;
  content: string;
  category: string;
  image_url: string;
  pdf_url?: string;
  is_breaking: boolean;
  is_published: boolean;
  created_at: string;
}

async function getArticle(id: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API}/api/v1/news/${id}`, { 
      cache: 'no-store',
    });
    console.log('Status:', res.status, '| API:', API);
    if (!res.ok) {
      const err = await res.text();
      console.error('Error response:', err);
      return null;
    }
    const json = await res.json();
    console.log('Data received:', JSON.stringify(json).slice(0, 100));
    return json.data ?? null;
  } catch (err) {
    console.error('getArticle error:', err);
    return null;
  }
}
// ── Server Component ──────────────────────────────────────────────────────────
export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticle(id);
  return <ArticleClient article={article} />;
}

// ── SEO Metadata (server-side, for WhatsApp/Twitter/Google previews) ──────────

// ── SEO Metadata ──────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) {
    return {
      title: 'लेख नहीं मिला | राष्ट्रीय प्रहरी भारत',
      description: 'यह लेख उपलब्ध नहीं है।',
    };
  }
  

  const img = article.image_url && !article.image_url.toLowerCase().includes('.pdf')
    ? article.image_url : FALLBACK_IMG;

  const description = article.content
    ? article.content.slice(0, 160).replace(/\n/g, ' ')
    : `${article.category} - राष्ट्रीय प्रहरी भारत`;

  return {
    title: `${article.title_hi} | राष्ट्रीय प्रहरी भारत`,
    description,
    openGraph: {
      title: article.title_hi,
      description,
      url: `${SITE_URL}/news/${article.id}`,
      siteName: 'राष्ट्रीय प्रहरी भारत',
      images: [{ url: img, width: 1200, height: 630, alt: article.title_hi }],
      locale: 'hi_IN',
      type: 'article',
      publishedTime: article.created_at,
      section: article.category,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title_hi,
      description,
      images: [img],
    },
    alternates: {
      canonical: `${SITE_URL}/news/${article.id}`,
    },
  };
}



