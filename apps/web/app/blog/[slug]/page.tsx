import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogProse } from "../../../components/blog/BlogProse";
import { LegalFooter } from "../../../components/marketing/MarketingFooter";
import { LegalNav } from "../../../components/marketing/MarketingNav";
import { formatBlogDate, getAllPosts, getPostBySlug } from "../../../lib/blog";
import { blogPostingJsonLd } from "../../../lib/blog/jsonLd";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = blogPostingJsonLd({
    slug: post.slug,
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt,
    readingTimeMinutes: post.readingTimeMinutes,
  });

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LegalNav />
      <header className="border-b border-sand bg-white">
        <div className="mx-auto max-w-[820px] px-7 pb-12 pt-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[14px] font-bold text-stone hover:text-ink"
          >
            <span aria-hidden>←</span> All posts
          </Link>
          <div className="mt-6 text-[13px] font-extrabold uppercase tracking-[0.08em] text-gold">Blog</div>
          <h1 className="mt-3 text-[clamp(34px,5vw,52px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink">
            {post.title}
          </h1>
          <p className="mt-4 max-w-[640px] text-[17px] font-medium leading-relaxed text-ink-secondary">
            {post.description}
          </p>
          <p className="mt-3.5 text-sm font-semibold text-stone">
            {formatBlogDate(post.publishedAt)} · {post.readingTimeMinutes} min read
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-[820px] px-7 pb-20 pt-14">
        <BlogProse>{post.content}</BlogProse>
      </main>
      <LegalFooter />
    </div>
  );
}
