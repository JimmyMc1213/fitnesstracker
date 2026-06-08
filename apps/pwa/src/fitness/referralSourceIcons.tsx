import type { ComponentType, ReactNode, SVGProps } from "react";

import type { ReferralSource } from "./referralSource";

import appStoreIconSrc from "../assets/brand-icons/appstore.png";
import FacebookIcon from "../assets/brand-icons/facebook.svg";
import GoogleIcon from "../assets/brand-icons/google.svg";
import InstagramIcon from "../assets/brand-icons/instagram.svg";
import RedditIcon from "../assets/brand-icons/reddit.svg";
import TikTokIcon from "../assets/brand-icons/tiktok.svg";
import XIcon from "../assets/brand-icons/x.svg";
import YouTubeIcon from "../assets/brand-icons/youtube.svg";

type BrandIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

function brandIcon(component: unknown): BrandIconComponent {
  return component as BrandIconComponent;
}

const BRAND_ICONS: Partial<Record<ReferralSource, BrandIconComponent>> = {
  instagram: brandIcon(InstagramIcon),
  tiktok: brandIcon(TikTokIcon),
  youtube: brandIcon(YouTubeIcon),
  reddit: brandIcon(RedditIcon),
  google: brandIcon(GoogleIcon),
  facebook: brandIcon(FacebookIcon),
  x: brandIcon(XIcon),
};

const BRAND_ICON_IMAGES: Partial<Record<ReferralSource, string>> = {
  app_store: appStoreIconSrc,
};

const EMOJI_ICONS: Partial<Record<ReferralSource, string>> = {
  friend: "👥",
  other: "💬",
};

function BrandIcon({ Icon }: { Icon: BrandIconComponent }) {
  return <Icon width={32} height={32} aria-hidden className="referral-source-brand-icon" />;
}

function BrandImageIcon({ src }: { src: string }) {
  return <img src={src} width={32} height={32} alt="" aria-hidden className="referral-source-brand-icon" />;
}

function EmojiIcon({ emoji }: { emoji: string }) {
  return (
    <span className="referral-source-emoji-icon" aria-hidden>
      {emoji}
    </span>
  );
}

export function referralSourceIcon(source: ReferralSource): ReactNode {
  const imageSrc = BRAND_ICON_IMAGES[source];
  if (imageSrc) return <BrandImageIcon src={imageSrc} />;

  const Brand = BRAND_ICONS[source];
  if (Brand) return <BrandIcon Icon={Brand} />;

  const emoji = EMOJI_ICONS[source];
  if (emoji) return <EmojiIcon emoji={emoji} />;

  return null;
}
