import { type ReactNode } from "react";

import { SwipeToDelete } from "@/components/SwipeToDelete";

type Props = {
  children: ReactNode;
  onRemove: () => void;
  deleteLabel: string;
  disabled?: boolean;
  testID?: string;
  resetKey?: string | number;
};

export function SwipeableWorkoutSetRow({
  children,
  onRemove,
  deleteLabel,
  disabled,
  testID,
  resetKey,
}: Props) {
  return (
    <SwipeToDelete
      deleteLabel={deleteLabel}
      onDelete={onRemove}
      disabled={disabled}
      testID={testID}
      borderRadius={8}
      animateCommitDelete
      resetKey={resetKey}
    >
      {children}
    </SwipeToDelete>
  );
}
