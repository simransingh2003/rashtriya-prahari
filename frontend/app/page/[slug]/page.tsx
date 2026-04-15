export const dynamic = 'force-dynamic';
export const revalidate = 0;


import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const SLUG_LABELS: Record<string, string> = {
  about: "हमारे बारे में",
  contact: "संपर्क करें",
  privacy: "गोपनीयता नीति",
  terms: "नियम और शर्तें",
  disclaimer: "अस्वीकरण",
};

async function getPage(slug: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data } = await supabase
    .from("footer_pages")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const label = SLUG_LABELS[params.slug] || params.slug;
  return {
    title: `${label} | राष्ट्रीय प्रहरी भारत`,
  };
}

export default async function FooterPage({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug);
  if (!page) notFound();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">रा</div>
            <span className="font-bold text-white">राष्ट्रीय प्रहरी भारत</span>
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-gray-400 text-sm">{page.title}</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">{page.title}</h1>
        {page.updated_at && (
          <p className="text-gray-500 text-sm mb-8" suppressHydrationWarning>
             अंतिम अपडेट: {new Date(page.updated_at).toLocaleDateString("hi-IN", { day: "numeric", month: "long", year: "numeric" })}
             </p>

        )}
        <div
          className="prose prose-invert prose-orange max-w-none text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: page.content || "<p>सामग्री जल्द आएगी।</p>" }}
        />
      </div>

      {/* Back link */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <Link href="/" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors">
          ← होमपेज पर वापस जाएं
        </Link>
      </div>
    </div>
  );
}