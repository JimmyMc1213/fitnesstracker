"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV } from "../lib/nav";

export type Badges = { users: string; futureYou: string; issues: string };

export function Sidebar({
  badges,
  account,
}: {
  badges: Badges;
  account: { name: string; role: string };
}) {
  const pathname = usePathname();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const badgeFor = (key?: "users" | "futureYou" | "issues") => (key ? badges[key] : undefined);

  const initials = account.name.slice(0, 2).toUpperCase();

  return (
    <aside className="sb">
      <div className="brand">
        <div className="blogo">N</div>
        <div>
          <div className="bname">New You AI</div>
          <div className="bsub">Admin</div>
        </div>
      </div>

      {NAV.map((group) => (
        <div className="navgrp" key={group.label}>
          <div className="navlab">{group.label}</div>
          {group.items.map((item) => {
            const badge = badgeFor(item.badgeKey);
            return (
              <Link key={item.href} href={item.href} className={isActive(item.href) ? "navitem on" : "navitem"}>
                <i className={item.icon} />
                {item.label}
                {badge ? <span className="nbadge">{badge}</span> : null}
              </Link>
            );
          })}
        </div>
      ))}

      <div className="sbfoot">
        <div className="acct">
          <div className="aav">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="aname">{account.name}</div>
            <div className="arole">{account.role}</div>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="navitem" style={{ width: "auto", padding: 8 }} title="Sign out">
              <i className="ph ph-sign-out" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
