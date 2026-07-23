import type { BlogPost, BlogPostMeta } from "./types";
import * as cutVsBulk from "../../content/blog/cut-vs-bulk-vs-maintain";
import * as howWeHandlePhotos from "../../content/blog/how-we-handle-your-photos";
import * as whatIsFutureYou from "../../content/blog/what-is-future-you";

const posts: BlogPost[] = [
  {
    ...whatIsFutureYou.meta,
    content: <whatIsFutureYou.Content />,
  },
  {
    ...howWeHandlePhotos.meta,
    content: <howWeHandlePhotos.Content />,
  },
  {
    ...cutVsBulk.meta,
    content: <cutVsBulk.Content />,
  },
];

const postsBySlug = new Map(posts.map((post) => [post.slug, post]));

export function getAllPosts(): BlogPostMeta[] {
  return [...posts]
    .map(({ slug, title, description, publishedAt, readingTimeMinutes }) => ({
      slug,
      title,
      description,
      publishedAt,
      readingTimeMinutes,
    }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return postsBySlug.get(slug);
}

export function formatBlogDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
