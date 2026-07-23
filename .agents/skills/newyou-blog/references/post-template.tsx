import Link from "next/link";

import type { BlogPostMeta } from "../../lib/blog/types";

export const meta: BlogPostMeta = {
  slug: "your-slug-here",
  title: "Your title here (no em dashes)",
  description: "150-160 char meta description for search and social previews.",
  publishedAt: "YYYY-MM-DD",
  readingTimeMinutes: 6,
};

export function Content() {
  return (
    <>
      {/* Front-load: direct answer in first paragraph (AEO) */}
      <p>
        Replace with a 40-60 word direct answer to the search query. No em dashes.
      </p>

      <h2>First section</h2>
      <p>Body copy. Use commas, colons, or periods instead of em dashes.</p>

      <h2>Second section</h2>
      <ul>
        <li>Bullet when listing is clearer than prose</li>
      </ul>

      {/* Internal links: at least one other blog post or /privacy / /support */}
      <p>
        Related: <Link href="/blog/what-is-future-you">What is Future You?</Link>
      </p>
    </>
  );
}
