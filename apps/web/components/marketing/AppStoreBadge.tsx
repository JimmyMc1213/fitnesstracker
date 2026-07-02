import Link from "next/link";

import { APP_STORE_URL, COMING_SOON } from "../../lib/site";
import { AppleIcon } from "./icons";

type AppStoreBadgeProps = {
  variant?: "dark" | "light";
  className?: string;
};

export function AppStoreBadge({ variant = "dark", className = "" }: AppStoreBadgeProps) {
  if (COMING_SOON) {
    const bg = variant === "dark" ? "bg-ink text-white" : "bg-white text-ink";
    return (
      <span
        className={`inline-flex items-center gap-2.5 rounded-[14px] px-6 py-4 text-base font-bold ${bg} ${className}`}
      >
        Coming soon to the App Store
      </span>
    );
  }

  const bg =
    variant === "dark"
      ? "bg-ink text-white shadow-[0_10px_26px_rgba(23,21,14,0.18)]"
      : "bg-white text-ink";

  return (
    <a
      href={APP_STORE_URL}
      className={`inline-flex items-center gap-3 rounded-[14px] px-5 py-3.5 md:px-6 md:py-3.5 ${bg} ${className}`}
    >
      <AppleIcon className="h-[26px] w-[22px]" />
      <span className="text-left leading-tight">
        <span className="block text-[11px] font-medium opacity-85">Download on the</span>
        <span className="block text-[19px] font-bold tracking-tight">App Store</span>
      </span>
    </a>
  );
}

type AppStorePillProps = {
  size?: "default" | "lg";
  label?: string;
};

export function AppStorePill({ size = "default", label = "Get the app" }: AppStorePillProps) {
  const className =
    size === "lg"
      ? "inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-4 text-base font-bold text-white"
      : "inline-flex items-center gap-2 rounded-full bg-ink px-[18px] py-[11px] text-sm font-bold text-white";
  const iconClass = size === "lg" ? "h-5 w-[16px]" : "h-4 w-[13px]";

  if (COMING_SOON) {
    return (
      <Link href="#download" className={className}>
        <AppleIcon className={iconClass} />
        {label}
      </Link>
    );
  }

  return (
    <a href={APP_STORE_URL} className={className}>
      <AppleIcon className={iconClass} />
      {label}
    </a>
  );
}
