import { createContext, useContext, type ReactNode } from "react";

const FutureYouGenerationPillContext = createContext<ReactNode>(null);

export function FutureYouGenerationPillProvider({
  children,
  pill,
}: {
  children: ReactNode;
  pill: ReactNode;
}) {
  return (
    <FutureYouGenerationPillContext.Provider value={pill}>{children}</FutureYouGenerationPillContext.Provider>
  );
}

export function useFutureYouGenerationPillSlot(): ReactNode {
  return useContext(FutureYouGenerationPillContext);
}

/** Renders the generation pill when provided by onboarding flow context. */
export function FutureYouGenerationPillSlot({ className }: { className?: string }) {
  const pill = useFutureYouGenerationPillSlot();
  if (!pill) return null;
  return <div className={className ? `future-you-generation-pill-slot ${className}` : "future-you-generation-pill-slot"}>{pill}</div>;
}
