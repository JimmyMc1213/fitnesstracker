import type { BlogPostMeta } from "./types";

const SITE_URL = "https://newyouai.app";

export function blogPostingJsonLd(post: BlogPostMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Organization",
      name: "NewYou AI",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "NewYou AI",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/assets/newyou-logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    url: `${SITE_URL}/blog/${post.slug}`,
  };
}
