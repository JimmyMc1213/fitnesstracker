import type { ReactNode } from "react";

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingTimeMinutes: number;
};

export type BlogPost = BlogPostMeta & {
  content: ReactNode;
};
