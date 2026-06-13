import { SymbolView } from "expo-symbols";
import { type ElementRef, type ReactNode, type RefObject } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
  type RenderItemParams,
} from "react-native-draggable-flatlist";

import { useAppTheme } from "@/hooks/useAppTheme";

export type SortableListContext = {
  isListDragging: boolean;
};

export type ExerciseDragHandleProps = {
  isDragging: boolean;
  onLongPress?: () => void;
  disabled?: boolean;
};

type SortableExerciseListProps<T extends { id: string; name: string }> = {
  items: T[];
  onReorder: (next: T[]) => void;
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
  estimatedItemSize?: number;
  onScrollToIndexFailed?: (info: { index: number; averageItemLength: number; highestMeasuredFrameIndex: number }) => void;
};

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
  renderItem,
  listFooter,
  listRef,
  contentContainerStyle,
  extraData,
  estimatedItemSize = 420,
  onScrollToIndexFailed,
}: SortableExerciseListProps<T>) {
  const canReorder = items.length >= 2;

  return (
    <DraggableFlatList
      ref={listRef}
      testID="workout-exercise-list"
      data={items}
      extraData={extraData}
      keyExtractor={(item) => item.id}
      onDragEnd={({ data }) => onReorder(data as T[])}
      activationDistance={canReorder ? 10 : 9999}
      containerStyle={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 24, gap: 12, ...contentContainerStyle }}
      keyboardShouldPersistTaps="handled"
      getItemLayout={(_data, index) => ({
        length: estimatedItemSize,
        offset: estimatedItemSize * index,
        index,
      })}
      onScrollToIndexFailed={onScrollToIndexFailed}
      ListFooterComponent={listFooter ? () => <>{listFooter}</> : undefined}
      renderItem={({ item, drag, isActive, getIndex }: RenderItemParams<T>) => {
        const index = getIndex() ?? 0;
        const handle: ExerciseDragHandleProps = {
          isDragging: isActive,
          onLongPress: canReorder ? drag : undefined,
          disabled: !canReorder,
        };
        const ctx: SortableListContext = { isListDragging: isActive };

        return (
          <ScaleDecorator activeScale={1.02}>
            <View
              testID={`workout-exercise-${item.id}`}
              style={{ opacity: isActive ? 0.92 : 1 }}
            >
              {renderItem(item, index, handle, ctx)}
            </View>
          </ScaleDecorator>
        );
      }}
    />
  );
}
