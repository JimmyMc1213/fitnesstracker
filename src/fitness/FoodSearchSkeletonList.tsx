import { Skeleton } from "@/components/ui/skeleton";

const foodListCardStyle = {
  padding: "4px 14px",
  marginBottom: 16,
  overflow: "hidden" as const,
};

const foodRowStyle = {
  display: "flex",
  alignItems: "center" as const,
  gap: 12,
  padding: "12px 0",
  borderBottom: "1px solid var(--divider-subtle)",
  width: "100%",
};

type FoodSearchSkeletonListProps = {
  /** Card-wrapped rows (main search tab) vs flat list (meal ingredient search). */
  variant?: "card" | "plain";
  rows?: number;
};

function FoodSearchRowSkeleton({ isLast }: { isLast: boolean }) {
  return (
    <div
      style={{
        ...foodRowStyle,
        borderBottom: isLast ? "none" : foodRowStyle.borderBottom,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <Skeleton style={{ height: 15, width: "68%", borderRadius: 6 }} />
        <Skeleton style={{ height: 12, width: "42%", marginTop: 8, borderRadius: 4 }} />
      </div>
      <Skeleton style={{ width: 10, height: 18, borderRadius: 4, flexShrink: 0 }} />
    </div>
  );
}

export function FoodSearchSkeletonList({ variant = "card", rows = 4 }: FoodSearchSkeletonListProps) {
  const rowItems = Array.from({ length: rows }, (_, idx) => (
    <FoodSearchRowSkeleton key={idx} isLast={idx === rows - 1} />
  ));

  return (
    <div role="status" aria-label="Searching foods" aria-busy="true">
      <Skeleton
        style={{
          height: 11,
          width: 88,
          marginBottom: 10,
          borderRadius: 4,
        }}
      />
      {variant === "card" ? (
        <div className="card" style={foodListCardStyle}>
          {rowItems}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>{rowItems}</div>
      )}
    </div>
  );
}
