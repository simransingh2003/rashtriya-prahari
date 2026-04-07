import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

const API = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rashtriya-prahari.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: { id: string; created_at: string }[] = [];

  try {
    const res = await fetch(`${API}/api/v1/news`);
    const { data } = await res.json();
    articles = data || [];
  } catch {
    articles = [];
  }

  const articlePages = articles.map((a) => ({
    url: `${SITE_URL}/news/${a.id}`,
    lastModified: new Date(a.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    ...articlePages,
  ];
}