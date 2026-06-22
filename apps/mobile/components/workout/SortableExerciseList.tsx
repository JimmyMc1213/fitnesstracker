import { SymbolView } from "expo-symbols";
import {
  type ElementRef,
  type ReactNode,
  type RefObject,
  useCallback,
  useRef,
  useState,
} from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import DraggableFlatList, {
  ScaleDecorator,
  ShadowDecorator,
  type RenderItemParams,
} from "react-native-draggable-flatlist";

import { useAppTheme } from "@/hooks/useAppTheme";

const COMPACT_ROW_HEIGHT = 56;
const COMPACT_ROW_GAP = 4;
const DEFAULT_GAP = 12;
const FULL_LAYER_MAX_HEIGHT = 1600;
const EXPAND_MS = 250;
const COLLAPSE_MS = 250;
const TRANSITION_EASING = Easing.bezier(0.25, 0.46, 0.45, 0.94);

export type SortableListContext = {
  isListDragging: boolean;
  isCompactReorder: boolean;
};

export type ExerciseDragHandleProps = {
  isDragging: boolean;
  onLongPress?: () => void;
  disabled?: boolean;
};

type SortableExerciseListProps<T extends { id: string; name: string }> = {
  items: T[];
  onReorder: (next: T[]) => void;
  getDragLabel?: (item: T) => string;
  getDragSubtitle?: (item: T) => string | undefined;
  renderItem: (
    item: T,
    index: number,
    handle: ExerciseDragHandleProps,
    ctx: SortableListContext,
  ) => ReactNode;
  listFooter?: ReactNode;
  listRef?: RefObject<ElementRef<typeof DraggableFlatList<T>> | null>;
  contentContainerStyle?: ViewStyle;
  extraData?: unknown;
  /** Disable list scrolling so the list can live inside a parent ScrollView without VirtualizedList warnings. */
  nestedInScrollView?: boolean;
  onScrollToIndexFailed?: (info: { index: number; averageItemLength: number; highestMeasuredFrameIndex: number }) => void;
};

function dragSubtitleForItem<T extends { id: string; name: string }>(
  item: T,
  getDragSubtitle?: (item: T) => string | undefined,
): string | undefined {
  if (getDragSubtitle) return getDragSubtitle(item);
  const sets = (item as { sets?: unknown[] }).sets;
  if (Array.isArray(sets)) {
    const count = sets.length;
    return `${count} set${count === 1 ? "" : "s"}`;
  }
  return undefined;
}

function itemLabel<T extends { id: string; name: string }>(item: T, getDragLabel?: (item: T) => string): string {
  return getDragLabel ? getDragLabel(item) : item.name;
}

function CompactDragCard({
  label,
  subtitle,
  handle,
  tapSize = 44,
  dimmed = false,
  lifted = false,
}: {
  label: string;
  subtitle?: string;
  handle: ExerciseDragHandleProps;
  tapSize?: number;
  dimmed?: boolean;
  lifted?: boolean;
}) {
  const { colors } = useAppTheme();
  const display = label.trim() || "Exercise";

  return (
    <View
      className="flex-row items-center rounded-2xl border px-3"
      style={{
        height: COMPACT_ROW_HEIGHT,
        borderColor: colors.border,
        backgroundColor: colors.card,
        opacity: dimmed ? 0.6 : 1,
        gap: 8,
        ...(lifted
          ? {
              transform: [{ scale: 1.02 }],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              elevation: 12,
            }
          : null),
      }}
    >
      <ExerciseDragHandle handle={handle} tapSize={tapSize} />
      <Text
        className="min-w-0 flex-1 text-base font-semibold"
        numberOfLines={1}
        style={{ color: colors.textPrimary }}
      >
        {display}
      </Text>
      {subtitle ? (
        <Text className="shrink-0 text-xs font-medium" style={{ color: colors.textTertiary }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function DragPlaceholder() {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        height: COMPACT_ROW_HEIGHT,
        borderRadius: 16,
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: "rgba(255, 255, 255, 0.15)",
        backgroundColor: colors.card,
      }}
    />
  );
}

/** PWA-style stacked full + compact layers with animated max-height crossfade. */
function ExerciseReorderSlot({
  collapseProgress,
  marginBottom,
  full,
  label,
  subtitle,
  handle,
  compactVisible,
}: {
  collapseProgress: SharedValue<number>;
  marginBottom: number;
  full: ReactNode;
  label: string;
  subtitle?: string;
  handle: ExerciseDragHandleProps;
  compactVisible: boolean;
}) {
  const fullLayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(collapseProgress.value, [0, 0.35], [1, 0], Extrapolation.CLAMP),
    maxHeight: interpolate(collapseProgress.value, [0, 1], [FULL_LAYER_MAX_HEIGHT, 0]),
    overflow: "hidden" as const,
  }));

  const compactLayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(collapseProgress.value, [0, 0.35], [0, 1], Extrapolation.CLAMP),
    maxHeight: interpolate(collapseProgress.value, [0, 1], [0, COMPACT_ROW_HEIGHT]),
    overflow: "hidden" as const,
  }));

  return (
    <View style={{ marginBottom, overflow: "hidden" }}>
      <Animated.View style={fullLayerStyle} pointerEvents={compactVisible ? "none" : "auto"}>
        {full}
      </Animated.View>
      <Animated.View style={compactLayerStyle} pointerEvents={compactVisible ? "auto" : "none"}>
        <CompactDragCard
          label={label}
          subtitle={subtitle}
          handle={handle}
          dimmed={compactVisible}
        />
      </Animated.View>
    </View>
  );
}

export function ExerciseDragHandle({
  handle,
  tapSize = 44,
}: {
  handle: ExerciseDragHandleProps;
  tapSize?: number;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      testID="workout-exercise-drag-handle"
      accessibilityRole="button"
      accessibilityLabel="Reorder exercise"
      disabled={handle.disabled}
      onLongPress={handle.onLongPress}
      delayLongPress={150}
      hitSlop={8}
      style={{
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
        width: tapSize,
        height: tapSize,
        opacity: handle.disabled ? 0.35 : 1,
      }}
    >
      <SymbolView
        name="line.3.horizontal"
        tintColor={handle.isDragging ? colors.accent : colors.textTertiary}
        size={18}
      />
    </Pressable>
  );
}

export function SortableExerciseList<T extends { id: string; name: string }>({
  items,
  onReorder,
  getDragLabel,
  getDragSubtitle,
  renderItem,
  listFooter,
  listRef,
  contentContainerStyle,
  extraData,
  nestedInScrollView = false,
  onScrollToIndexFailed,
}: SortableExerciseListProps<T>) {
  const canReorder = items.length >= 2;
  const [reorderActive, setReorderActive] = useState(false);
  const collapseProgress = useSharedValue(0);
  const isDraggingCellRef = useRef(false);

  const normalGap = typeof contentContainerStyle?.gap === "number" ? contentContainerStyle.gap : DEFAULT_GAP;
  const listGap = reorderActive ? COMPACT_ROW_GAP : normalGap;

  const finishExpand = useCallback(() => {
    setReorderActive(false);
    isDraggingCellRef.current = false;
  }, []);

  const startReorderDrag = useCallback(
    (dragFn: () => void) => {
      if (!canReorder) return;
      if (reorderActive) {
        dragFn();
        return;
      }
      setReorderActive(true);
      collapseProgress.value = withTiming(
        1,
        { duration: COLLAPSE_MS, easing: TRANSITION_EASING },
        (finished) => {
          if (finished) {
            runOnJS(dragFn)();
          }
        },
      );
    },
    [canReorder, collapseProgress, reorderActive],
  );

  const ctx: SortableListContext = {
    isListDragging: reorderActive,
    isCompactReorder: reorderActive,
  };

  return (
    <DraggableFlatList
      ref={listRef}
      testID="workout-exercise-list"
      data={items}
      extraData={[extraData, reorderActive]}
      keyExtractor={(item) => item.id}
      activationDistance={canReorder ? 8 : 9999}
      dragItemOverflow
      onDragBegin={() => {
        if (!canReorder) return;
        isDraggingCellRef.current = true;
      }}
      onDragEnd={({ data }) => {
        onReorder(data as T[]);
        isDraggingCellRef.current = false;
        collapseProgress.value = withTiming(
          0,
          { duration: EXPAND_MS, easing: TRANSITION_EASING },
          (finished) => {
            if (finished) {
              runOnJS(finishExpand)();
            }
          },
        );
      }}
      scrollEnabled={!nestedInScrollView}
      nestedScrollEnabled={nestedInScrollView}
      containerStyle={nestedInScrollView ? undefined : { flex: 1 }}
      contentContainerStyle={{
        paddingBottom: 24,
        ...contentContainerStyle,
        gap: listGap,
        ...(reorderActive ? { paddingBottom: 24 } : null),
      }}
      keyboardShouldPersistTaps="handled"
      onScrollToIndexFailed={onScrollToIndexFailed}
      ListFooterComponent={listFooter && !reorderActive ? () => <>{listFooter}</> : undefined}
      {...(reorderActive
        ? {
            initialNumToRender: items.length,
            renderPlaceholder: () => <DragPlaceholder />,
          }
        : null)}
      renderItem={({ item, drag, isActive, getIndex }: RenderItemParams<T>) => {
        const index = getIndex() ?? 0;
        const label = itemLabel(item, getDragLabel);
        const subtitle = dragSubtitleForItem(item, getDragSubtitle);
        const marginBottom = index < items.length - 1 ? listGap : 0;

        const handle: ExerciseDragHandleProps = {
          isDragging: isActive,
          onLongPress: canReorder
            ? reorderActive
              ? drag
              : () => startReorderDrag(drag)
            : undefined,
          disabled: !canReorder,
        };

        const full = (
          <View testID={`workout-exercise-${item.id}`}>
            {renderItem(item, index, handle, ctx)}
          </View>
        );

        if (!canReorder) {
          return <View style={{ marginBottom }}>{full}</View>;
        }

        if (isActive && reorderActive && isDraggingCellRef.current) {
          return (
            <ShadowDecorator elevation={10} opacity={0.3} radius={14}>
              <ScaleDecorator activeScale={1}>
                <View style={{ height: COMPACT_ROW_HEIGHT, marginBottom }}>
                  <CompactDragCard label={label} subtitle={subtitle} handle={handle} lifted />
                </View>
              </ScaleDecorator>
            </ShadowDecorator>
          );
        }

        return (
          <ExerciseReorderSlot
            collapseProgress={collapseProgress}
            marginBottom={marginBottom}
            full={full}
            label={label}
            subtitle={subtitle}
            handle={handle}
            compactVisible={reorderActive}
          />
        );
      }}
    />
  );
}
