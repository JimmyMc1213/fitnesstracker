import type { Metadata } from "next";
import Link from "next/link";

import { LegalFooter } from "../../components/marketing/MarketingFooter";
import { LegalNav } from "../../components/marketing/MarketingNav";
import { formatBlogDate, getAllPosts } from "../../lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides on Future You, goal setting, and privacy — from the NewYou AI team.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-white">
      <LegalNav />
      <header className="border-b border-sand bg-white">
        <div className="mx-auto max-w-[820px] px-7 pb-12 pt-16">
          <div className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-gold">Blog</div>
          <h1 className="mt-3 text-[clamp(34px,5vw,52px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink">
            Train smarter. See clearer.
          </h1>
          <p className="mt-4 max-w-[560px] text-[17px] font-medium leading-relaxed text-ink-secondary">
            Plain-language guides on Future You, picking your goal, and how we handle your photos — no
            fluff, no bro-science.
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-[820px] px-7 pb-20 pt-14">
        <ul className="divide-y divide-sand border-y border-sand">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block py-8 transition-colors hover:bg-gold-wash/40"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-[22px] font-extrabold tracking-tight text-ink group-hover:text-gold">
                    {post.title}
                  </h2>
                  <span className="shrink-0 text-[13px] font-semibold text-stone">
                    {formatBlogDate(post.publishedAt)}
                  </span>
                </div>
                <p className="mt-2 max-w-[640px] text-[15px] font-medium leading-relaxed text-ink-secondary">
                  {post.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-bold text-gold">
                  Read post
                  <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <LegalFooter />
    </div>
  );
}
