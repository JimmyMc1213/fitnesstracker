export type AdminUserRow = {
  id: string;
  email: string;
  createdAt: string | null;
  goal: string | null;
  plan: string;
  status: string;
  lastSyncMs: number | null;
  country: string | null;
};

export type AdminUserDetail = AdminUserRow & {
  payload: Record<string, unknown>;
  updatedAtMs: number;
  subscription: {
    entitlement: string | null;
    isActive: boolean;
    productId: string | null;
    store: string | null;
    expiresAt: string | null;
  } | null;
};

export type FutureYouJob = {
  id: string;
  userId: string;
  userEmail: string;
  motivationId: string;
  status: string;
  durationLabel: string;
  createdAt: string | null;
  error: string | null;
  sourcePhotoPath: string | null;
  resultPhotoPath: string | null;
  revisedPrompt: string | null;
};

export type FutureYouReport = {
  id: string;
  userId: string;
  userEmail: string;
  jobId: string | null;
  category: string;
  context: string;
  message: string | null;
  status: string;
  createdAt: string | null;
  sourceUrl: string | null;
  resultUrl: string | null;
  linearUrl: string | null;
};

export type CommunityFood = {
  barcode: string;
  name: string;
  brand: string | null;
  servingLabel: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
  submittedBy: string | null;
  createdAt: string | null;
};

export type IssueReport = {
  id: string;
  userId: string;
  category: string;
  message: string | null;
  platform: string | null;
  appVersion: string | null;
  deviceModel: string | null;
  status: string;
  linearId: string | null;
  linearUrl: string | null;
  createdAt: string | null;
};

export type AuditEntry = {
  id: string;
  action: string;
  adminEmail: string;
  targetType: string | null;
  targetId: string | null;
  detail: string | null;
  createdAt: string;
};

export type DashboardData = {
  kpis: {
    totalUsers: number;
    activeSubscriptions: number;
    newSignups7d: number;
    openReports: number;
  };
  signups: number[];
  jobBars: { label: string; count: number; color: string }[];
  conversion: { pct: number; trials: number; paid: number };
  recentAudit: AuditEntry[];
};

export type Demoable<T> = { data: T; demo: boolean };
