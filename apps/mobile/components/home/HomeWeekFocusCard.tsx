import { startOfWeekMonday } from "@newyouai/core";
import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import type { WeekFocusCommitment } from "@newyouai/types";

type Props = {
  commitments: WeekFocusCommitment[];
  weekStartKey: string;
  dateKey: string;
  weekNumber: number;
};

export function activeWeekFocusCommitments(
  commitments: WeekFocusCommitment[],
  weekStartKey: string | null,
  dateKey: string,
): WeekFocusCommitment[] {
  if (!weekStartKey || commitments.length === 0) return [];
  const currentWeekStart = startOfWeekMonday(dateKey);
  if (currentWeekStart !== weekStartKey) return [];
  return commitments;
}

export function HomeWeekFocusCard({ commitments, weekNumber }: Props) {
  const { colors } = useAppTheme();

  if (commitments.length === 0) return null;

  return (
    <View
      testID="home-week-focus"
      className="mt-[18px] rounded-xl border p-4"
      style={{ borderColor: "rgba(96,165,250,0.18)", backgroundColor: colors.card }}
    >
      <Text
        className="mb-2.5 text-[10px] font-bold uppercase tracking-widest"
        style={{ color: colors.textTertiary }}
      >
        Week {weekNumber} focus
      </Text>
      <View style={{ gap: 8 }}>
        {commitments.map((item) => (
          <View
            key={item.id}
            className="rounded-xl border px-3.5 py-3"
            style={{ borderColor: "rgba(96,165,250,0.16)", backgroundColor: colors.backgroundSecondary }}
          >
            <Text className="text-sm font-bold tracking-tight" style={{ color: colors.textPrimary }}>
              {item.title}
            </Text>
            {item.subtitle ? (
              <Text className="mt-1 text-xs font-medium leading-[1.45]" style={{ color: colors.textSecondary }}>
                {item.subtitle}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}
