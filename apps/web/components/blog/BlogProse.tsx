import type { ReactNode } from "react";

type BlogProseProps = {
  children: ReactNode;
};

export function BlogProse({ children }: BlogProseProps) {
  return (
    <article className="blog-prose space-y-5 text-base font-medium leading-relaxed text-ink-secondary [&_a]:font-bold [&_a]:text-gold [&_h2]:mb-1 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-ink [&_h2:first-child]:mt-0 [&_li]:leading-relaxed [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_p]:leading-relaxed [&_strong]:font-extrabold [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
      {children}
    </article>
  );
}
