import Image from "next/image";

import { LockIcon } from "./icons";

type FutureYouPhoneProps = {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  /** Desktop hero swap animation; disabled on mobile to avoid glitches. */
  animate?: boolean;
  /** Nudge phones lower on mobile so the pair fits the hero without clipping. */
  compactLayout?: boolean;
};

export function FutureYouPhone({
  className = "",
  style,
  onClick,
  animate = true,
  compactLayout = false,
}: FutureYouPhoneProps) {
  return (
    <div
      className={`absolute left-1/2 ${compactLayout ? "top-[48%]" : "top-1/2"} ${onClick ? "cursor-pointer" : ""} ${
        animate
          ? "transition-[transform,filter] duration-[600ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          : ""
      } ${className}`}
      style={style}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <PhoneSideButtons variant="dark" />
      <div className="relative w-[270px] rounded-[56px] bg-phone-dark-rail p-1">
        <div className="rounded-[52px] bg-[#050505] p-2.5">
          <div className="relative h-[546px] overflow-hidden rounded-[43px] bg-[#0F0E0A]">
            <div className="absolute left-1/2 top-3 z-20 flex h-[30px] w-[92px] -translate-x-1/2 items-center justify-end rounded-2xl bg-black pr-2.5">
              <div className="h-[7px] w-[7px] rounded-full bg-[radial-gradient(circle_at_35%_35%,#3a3a48,#0a0a0c)]" />
            </div>
            <div className="flex items-center justify-between px-[22px] pb-1 pt-4 text-white">
              <span className="text-[13.5px] font-extrabold tracking-tight">9:41</span>
              <BatteryIcon />
            </div>
            <div className="flex h-[calc(100%-56px)] flex-col px-[18px] pb-[18px] pt-1.5 text-white">
              <div className="mt-2 text-center text-[27px] font-extrabold tracking-tight text-gold-light">
                Future You
              </div>
              <div className="mt-0.5 text-center text-sm font-semibold text-[#8A8780]">You in 3 months</div>
              <div className="relative mt-3.5 min-h-0 flex-1 overflow-hidden rounded-[18px] border border-gold-light/50 bg-[#3a342c]">
                <Image
                  src="/assets/futureyou-welcome-preview.png"
                  alt=""
                  fill
                  className="scale-110 object-cover object-center blur-[11px]"
                  sizes="270px"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[52%] to-[rgba(20,18,12,0.62)]" />
                <div className="absolute left-[11px] top-[11px] inline-flex items-center gap-1 rounded-full bg-[rgba(20,18,12,0.6)] px-2 py-1 pl-2 text-[11px] font-bold text-white backdrop-blur-sm">
                  <LockIcon className="h-[11px] w-[11px]" />
                  Locked
                </div>
              </div>
              <div className="mt-3.5 text-center text-[17px] font-extrabold tracking-tight text-gold-light">
                Goal · Lose weight
              </div>
              <div className="mb-0.5 mt-0.5 text-center text-[15px] font-bold">-10 lb</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlanPhone({
  className = "",
  style,
  onClick,
  animate = true,
  compactLayout = false,
}: FutureYouPhoneProps) {
  return (
    <div
      className={`absolute left-1/2 ${compactLayout ? "top-[48%]" : "top-1/2"} ${onClick ? "cursor-pointer" : ""} ${
        animate
          ? "transition-[transform,filter] duration-[600ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          : ""
      } ${className}`}
      style={style}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <PhoneSideButtons variant="titanium" />
      <div className="relative w-[258px] rounded-[54px] bg-phone-titanium-rail p-1">
        <div className="rounded-[50px] bg-[#050505] p-[9px]">
          <div className="relative h-[520px] overflow-hidden rounded-[42px] bg-white">
            <div className="absolute left-[115px] top-[7px] z-20 flex h-6 w-[73px] -translate-x-1/2 items-center justify-end rounded-[15px] bg-black pr-[9px]">
              <div className="h-1.5 w-1.5 rounded-full bg-[radial-gradient(circle_at_35%_35%,#3a3a48,#0a0a0c)]" />
            </div>
            <Image
              src="/images/plan-screenshot.png"
              alt="New You AI training plan"
              fill
              className="object-fill"
              sizes="258px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneSideButtons({ variant }: { variant: "dark" | "titanium" }) {
  const leftGrad =
    variant === "dark"
      ? "bg-gradient-to-r from-[#101010] to-[#48484a]"
      : "bg-gradient-to-r from-[#15140f] to-[#3f3c34]";
  const rightGrad =
    variant === "dark"
      ? "bg-gradient-to-l from-[#101010] to-[#48484a]"
      : "bg-gradient-to-l from-[#15140f] to-[#3f3c34]";

  return (
    <>
      <div className={`absolute -left-[3px] top-[118px] h-[25px] w-[3.5px] rounded-l ${leftGrad}`} />
      <div className={`absolute -left-[3px] top-[155px] h-[50px] w-[3.5px] rounded-l ${leftGrad}`} />
      <div className={`absolute -left-[3px] top-[215px] h-[50px] w-[3.5px] rounded-l ${leftGrad}`} />
      <div className={`absolute -right-[3px] top-[168px] h-20 w-[3.5px] rounded-r ${rightGrad}`} />
    </>
  );
}

function BatteryIcon() {
  return (
    <span className="inline-flex items-center gap-[1.5px]">
      <span className="relative block h-[11px] w-[22px] rounded border-[1.2px] border-current p-[1.4px] opacity-90">
        <span className="block h-full w-[78%] rounded-sm bg-current" />
      </span>
      <span className="block h-1 w-[1.5px] rounded-r bg-current opacity-55" />
    </span>
  );
}
