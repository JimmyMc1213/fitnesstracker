const LINEAR_API_URL = "https://api.linear.app/graphql";

/** Applied to every issue filed via the Future You image report button. */
export const FUTURE_YOU_REPORT_LINEAR_LABEL = "future-you-report";

type LinearIssueResult = {
  issueId: string;
  issueUrl: string;
  issueIdentifier: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  not_accurate: "fy-not-accurate",
  offensive: "fy-offensive",
  unrealistic: "fy-unrealistic",
  other: "fy-other",
};

const CATEGORY_TITLES: Record<string, string> = {
  not_accurate: "Doesn't look like me",
  offensive: "Offensive or inappropriate",
  unrealistic: "Looks unrealistic",
  other: "Something else",
};

const CONTEXT_TITLES: Record<string, string> = {
  home: "Future You tab",
  onboarding_success: "Onboarding success",
};

function linearLabelsForReport(category: string): string[] {
  const categoryLabel = CATEGORY_LABELS[category] ?? "fy-other";
  return [FUTURE_YOU_REPORT_LINEAR_LABEL, "user-report", categoryLabel];
}

function issueTitle(category: string, message: string | undefined): string {
  const reason = CATEGORY_TITLES[category] ?? category;
  if (message) {
    const snippet = message.length > 60 ? `${message.slice(0, 57)}…` : message;
    return `[Future You] ${reason}: ${snippet}`;
  }
  return `[Future You] ${reason}`;
}

function issueDescription(input: {
  category: string;
  context: string;
  message?: string;
  reportId: string;
  userId: string;
  jobId?: string;
}): string {
  const lines = [
    "Submitted from the **Future You image report** button (preview quality feedback).",
    "",
    `**Reason:** ${CATEGORY_TITLES[input.category] ?? input.category}`,
    `**Screen:** ${CONTEXT_TITLES[input.context] ?? input.context}`,
    `**Report ID:** ${input.reportId}`,
    `**User ID:** ${input.userId}`,
  ];

  if (input.jobId) lines.push(`**Generation job ID:** ${input.jobId}`);

  lines.push("", "## Details", input.message?.trim() || "_No additional details provided._");

  return lines.join("\n");
}

async function linearGraphql<T>(
  apiKey: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(LINEAR_API_URL, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Linear API HTTP ${response.status}${text ? `: ${text.slice(0, 200)}` : ""}`);
  }

  const payload = await response.json() as {
    data?: T;
    errors?: Array<{ message?: string }>;
  };

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((err) => err.message ?? "Unknown Linear error").join("; "));
  }

  if (!payload.data) {
    throw new Error("Linear API returned no data.");
  }

  return payload.data;
}

async function fetchTeamLabelIds(
  apiKey: string,
  teamId: string,
  labelNames: string[],
): Promise<string[]> {
  const data = await linearGraphql<{
    team: { labels: { nodes: Array<{ id: string; name: string }> } } | null;
  }>(
    apiKey,
    `query TeamLabels($teamId: String!) {
      team(id: $teamId) {
        labels {
          nodes { id name }
        }
      }
    }`,
    { teamId },
  );

  const nodes = data.team?.labels.nodes ?? [];
  const byName = new Map(nodes.map((label) => [label.name.toLowerCase(), label.id]));
  const ids: string[] = [];

  for (const name of labelNames) {
    const id = byName.get(name.toLowerCase());
    if (id) ids.push(id);
  }

  return ids;
}

const LABEL_COLORS: Record<string, string> = {
  [FUTURE_YOU_REPORT_LINEAR_LABEL]: "#7B61FF",
  "user-report": "#5e6ad2",
  "fy-not-accurate": "#f2994a",
  "fy-offensive": "#eb5757",
  "fy-unrealistic": "#bb87fc",
  "fy-other": "#828282",
};

async function ensureTeamLabel(
  apiKey: string,
  teamId: string,
  name: string,
): Promise<string | null> {
  const data = await linearGraphql<{
    issueLabelCreate: {
      success: boolean;
      issueLabel: { id: string } | null;
    };
  }>(
    apiKey,
    `mutation IssueLabelCreate($input: IssueLabelCreateInput!) {
      issueLabelCreate(input: $input) {
        success
        issueLabel { id }
      }
    }`,
    {
      input: {
        teamId,
        name,
        color: LABEL_COLORS[name] ?? "#5e6ad2",
      },
    },
  );

  if (!data.issueLabelCreate.success || !data.issueLabelCreate.issueLabel) {
    return null;
  }

  return data.issueLabelCreate.issueLabel.id;
}

async function resolveTeamLabelIds(
  apiKey: string,
  teamId: string,
  labelNames: string[],
): Promise<string[]> {
  const ids: string[] = [];

  for (const name of labelNames) {
    const existing = await fetchTeamLabelIds(apiKey, teamId, [name]);
    if (existing.length) {
      ids.push(existing[0]!);
      continue;
    }

    const created = await ensureTeamLabel(apiKey, teamId, name);
    if (created) ids.push(created);
  }

  return ids;
}

export async function createLinearIssueForFutureYouReport(input: {
  apiKey: string;
  teamId: string;
  category: string;
  context: string;
  message?: string;
  reportId: string;
  userId: string;
  jobId?: string;
}): Promise<LinearIssueResult> {
  const labelNames = linearLabelsForReport(input.category);
  const labelIds = await resolveTeamLabelIds(input.apiKey, input.teamId, labelNames);

  const data = await linearGraphql<{
    issueCreate: {
      success: boolean;
      issue: { id: string; url: string; identifier: string } | null;
    };
  }>(
    input.apiKey,
    `mutation IssueCreate($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { id url identifier }
      }
    }`,
    {
      input: {
        teamId: input.teamId,
        title: issueTitle(input.category, input.message),
        description: issueDescription(input),
        labelIds: labelIds.length ? labelIds : undefined,
      },
    },
  );

  if (!data.issueCreate.success || !data.issueCreate.issue) {
    throw new Error("Linear did not create the issue.");
  }

  return {
    issueId: data.issueCreate.issue.id,
    issueUrl: data.issueCreate.issue.url,
    issueIdentifier: data.issueCreate.issue.identifier,
  };
}
