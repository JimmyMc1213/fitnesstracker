import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  href?: string;
  showWordmark?: boolean;
};

const heights = { sm: 26, md: 32, lg: 34 } as const;

export function Logo({ size = "md", href = "/", showWordmark = true }: LogoProps) {
  const height = heights[size];
  const content = (
    <>
      <Image
        src="/assets/newyou-logo.png"
        alt="NewYou AI"
        width={Math.round(height * 1.2)}
        height={height}
        className="h-auto w-auto"
        style={{ height }}
        priority
      />
      {showWordmark ? (
        <span className="text-lg font-extrabold tracking-tight text-ink md:text-[19px]">
          NewYou<span className="text-gold"> AI</span>
        </span>
      ) : null}
    </>
  );

  const className = "inline-flex items-center gap-2.5";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <span className={className}>{content}</span>;
}
