import { SymbolView } from "expo-symbols";
import {
  type ElementRef,
  type ReactNode,
  type RefObject,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { LayoutAnimation, Platform, Text, UIManager, View, type ViewStyle } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import DraggableFlatList, {
  NestableDraggableFlatList,
  ScaleDecorator,
  ShadowDecorator,
  type RenderItemParams,
} from "react-native-draggable-flatlist";

import { useAppTheme } from "@/hooks/useAppTheme";
import { WORKOUT_ACCENT } from "@/lib/workoutUiTokens";

const COMPACT_ROW_HEIGHT = 56;
const COMPACT_ROW_GAP = 4;
const DEFAULT_GAP = 12;
// Collapse on press-in must finish well before the long-press fires the drag, so
// the library only ever measures the settled uniform 56px rows.
const ENTER_MS = 130;
const EXPAND_MS = 220;
const TRANSITION_EASING = Easing.bezier(0.25, 0.46, 0.45, 0.94);
const LONG_PRESS_MS = 150;

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Animates the row-height change (full <-> 56px compact) when reorder mode
 * toggles. The committed heights stay real, so `react-native-draggable-flatlist`
 * always measures the true cell sizes -- LayoutAnimation only smooths the visual.
 */
function heightAnim(duration: number) {
  return {
    duration,
    create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    update: { type: LayoutAnimation.Types.easeInEaseOut },
    delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  } as const;
}

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
  listHeader?: ReactNode;
  listRef?: RefObject<ElementRef<typeof DraggableFlatList<T>> | null>;
  contentContainerStyle?: ViewStyle;
  extraData?: unknown;
  /** Disable list scrolling so the list can live inside a parent ScrollView without VirtualizedList warnings. */
  nestedInScrollView?: boolean;
  /** Live scroll offset from the underlying draggable list (used to keep focused fields above the keypad). */
  onScrollOffsetChange?: (scrollOffset: number) => void;
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

const ABSOLUTE_LAYER: ViewStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
};

/**
 * Stacked full + compact layers.
 *
 * The outer row commits a real JS-side height (auto when expanded, a fixed 56px
 * while reordering) so `react-native-draggable-flatlist` always measures the
 * true, uniform cell heights -- the library's happy path. The height change is
 * smoothed by `LayoutAnimation` (configured by the parent on the reorder toggle),
 * and the two content layers crossfade by opacity, which never touches layout.
 */
function ExerciseReorderSlot({
  collapseProgress,
  reorderActive,
  marginBottom,
  full,
  label,
  subtitle,
  handle,
}: {
  collapseProgress: SharedValue<number>;
  reorderActive: boolean;
  marginBottom: number;
  full: ReactNode;
  label: string;
  subtitle?: string;
  handle: ExerciseDragHandleProps;
}) {
  const fullLayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(collapseProgress.value, [0, 0.4], [1, 0], Extrapolation.CLAMP),
  }));

  const compactLayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(collapseProgress.value, [0.3, 1], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View
      style={[
        { marginBottom, overflow: "hidden" },
        reorderActive ? { height: COMPACT_ROW_HEIGHT } : null,
      ]}
    >
      <Animated.View
        style={[reorderActive ? ABSOLUTE_LAYER : null, fullLayerStyle]}
        pointerEvents={reorderActive ? "none" : "auto"}
      >
        {full}
      </Animated.View>
      <Animated.View
        style={[ABSOLUTE_LAYER, compactLayerStyle]}
        pointerEvents={reorderActive ? "auto" : "none"}
      >
        <CompactDragCard label={label} subtitle={subtitle} handle={handle} dimmed={reorderActive} />
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
      delayLongPress={LONG_PRESS_MS}
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
        tintColor={handle.isDragging ? WORKOUT_ACCENT : colors.textTertiary}
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
  listHeader,
  listRef,
  contentContainerStyle,
  extraData,
  nestedInScrollView = false,
  onScrollOffsetChange,
  onScrollToIndexFailed,
}: SortableExerciseListProps<T>) {
  const canReorder = items.length >= 2;
  const [reorderActive, setReorderActive] = useState(false);
  const collapseProgress = useSharedValue(0);
  const isDraggingCellRef = useRef(false);
  const reorderActiveRef = useRef(false);

  reorderActiveRef.current = reorderActive;

  const normalGap = typeof contentContainerStyle?.gap === "number" ? contentContainerStyle.gap : DEFAULT_GAP;
  const listGap = reorderActive ? COMPACT_ROW_GAP : normalGap;

  // Phase 1: a long-press anywhere on a grip collapses the whole list into a
  // stable, uniform 56px compact mode. No drag happens here, so the upward
  // reflow of the collapse can't yank the held row out from under the finger.
  const enterReorder = useCallback(() => {
    if (!canReorder || reorderActiveRef.current) return;
    LayoutAnimation.configureNext(heightAnim(ENTER_MS));
    setReorderActive(true);
    collapseProgress.value = withTiming(1, { duration: ENTER_MS, easing: TRANSITION_EASING });
  }, [canReorder, collapseProgress]);

  const exitReorder = useCallback(() => {
    isDraggingCellRef.current = false;
    if (!reorderActiveRef.current) return;
    LayoutAnimation.configureNext(heightAnim(EXPAND_MS));
    setReorderActive(false);
    collapseProgress.value = withTiming(0, { duration: EXPAND_MS, easing: TRANSITION_EASING });
  }, [collapseProgress]);

  // Phase 2: once compact (rows are uniform and stationary), a long-press on any
  // row starts the library drag with no mid-gesture reflow -> every row drags
  // identically, including the ones further down the list.
  const onGripLongPress = useCallback(
    (dragFn: () => void) => {
      if (reorderActiveRef.current) {
        dragFn();
      } else {
        enterReorder();
      }
    },
    [enterReorder],
  );

  const ctx: SortableListContext = {
    isListDragging: reorderActive,
    isCompactReorder: reorderActive,
  };

  const listExtraData = useMemo(() => [extraData, reorderActive], [extraData, reorderActive]);

  const ListComponent = nestedInScrollView ? NestableDraggableFlatList : DraggableFlatList;

  return (
    <View style={nestedInScrollView ? undefined : { flex: 1 }}>
    <ListComponent
      ref={listRef}
      testID="workout-exercise-list"
      data={items}
      extraData={listExtraData}
      keyExtractor={(item) => item.id}
      activationDistance={canReorder ? 8 : 9999}
      dragItemOverflow
      onDragBegin={() => {
        if (!canReorder) return;
        isDraggingCellRef.current = true;
      }}
      onDragEnd={({ data }) => {
        isDraggingCellRef.current = false;
        onReorder(data as T[]);
        // Stay in compact reorder mode so several rows can be arranged in a row;
        // the "Done" button expands back to full cards.
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
      onScrollOffsetChange={onScrollOffsetChange}
      onScrollToIndexFailed={onScrollToIndexFailed}
      ListHeaderComponent={listHeader ? () => <>{listHeader}</> : undefined}
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
          onLongPress: canReorder ? () => onGripLongPress(drag) : undefined,
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
            reorderActive={reorderActive}
            marginBottom={marginBottom}
            full={full}
            label={label}
            subtitle={subtitle}
            handle={handle}
          />
        );
      }}
    />
      {reorderActive ? <ReorderDoneButton onPress={exitReorder} /> : null}
    </View>
  );
}

function ReorderDoneButton({ onPress }: { onPress: () => void }) {
  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", left: 0, right: 0, bottom: 16, alignItems: "center" }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Done reordering"
        onPress={onPress}
        hitSlop={8}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 18,
          height: 44,
          borderRadius: 22,
          backgroundColor: WORKOUT_ACCENT,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <SymbolView name="checkmark" tintColor="#fff" size={15} />
        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Done</Text>
      </Pressable>
    </View>
  );
}
