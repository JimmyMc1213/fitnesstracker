export type NutritionLogToastPayload = {
  itemId: string;
  dateKey: string;
};

let pending: NutritionLogToastPayload | null = null;

export function queueNutritionLogToast(payload: NutritionLogToastPayload): void {
  pending = payload;
}

export function takeNutritionLogToast(): NutritionLogToastPayload | null {
  const next = pending;
  pending = null;
  return next;
}
