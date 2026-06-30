const ACTION_ICON: Record<string, string> = {
  edit: "ph ph-pencil-simple",
  override: "ph ph-crown-simple",
  resolve: "ph ph-flag-checkered",
  delete: "ph ph-trash",
  impersonate: "ph ph-user-circle-gear",
  config: "ph ph-plugs-connected",
};

export function auditIcon(action: string): string {
  return ACTION_ICON[action] ?? "ph ph-dot";
}
