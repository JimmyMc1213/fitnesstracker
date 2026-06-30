"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { PAGE_META } from "../lib/nav";

function metaFor(pathname: string): { title: string; sub: string } {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  if (pathname.startsWith("/users/")) return { title: "User detail", sub: "Full app-state reconstruction" };
  // longest-prefix match
  const match = Object.keys(PAGE_META)
    .filter((p) => p !== "/" && pathname.startsWith(p))
    .sort((a, b) => b.length - a.length)[0];
  return match ? PAGE_META[match] : { title: "", sub: "" };
}

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { title, sub } = metaFor(pathname);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/users?q=${encodeURIComponent(q)}` : "/users");
  }

  return (
    <div className="top">
      <div>
        <div className="ttl">{title}</div>
        <div className="tsub">{sub}</div>
      </div>
      <form className="tsearch" onSubmit={onSearch}>
        <i className="ph ph-magnifying-glass" />
        <input
          placeholder="Search users, jobs, foods…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
      <button className="tbtn ghost" onClick={() => startTransition(() => router.refresh())} disabled={pending}>
        <i className="ph ph-arrows-clockwise" />
        {pending ? "Syncing…" : "Sync"}
      </button>
    </div>
  );
}
