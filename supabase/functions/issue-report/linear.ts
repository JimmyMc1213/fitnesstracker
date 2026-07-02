const LINEAR_API_URL = "https://api.linear.app/graphql";

type LinearIssueResult = {
  issueId: string;
  issueUrl: string;
  issueIdentifier: string;
};

function linearLabelsForCategory(category: string): string[] {
  if (category === "email-change") {
    return ["user-report", "email-change"];
  }

  const categoryLabel =
    category === "bug" ? "Bug"
    : category === "feature" ? "Feature"
    : "other";
  return ["user-report", categoryLabel];
}

function issueTitle(category: string, message: string | undefined): string {
  const prefix =
    category === "bug" ? "Bug report"
    : category === "feature" ? "Feature request"
    : category === "email-change" ? "Email change request"
    : "User report";
  if (message) {
    const snippet = message.length > 80 ? `${message.slice(0, 77)}…` : message;
    return `[App] ${prefix}: ${snippet}`;
  }
  return `[App] ${prefix}`;
}

function issueDescription(input: {
  category: string;
  message?: string;
  reportId: string;
  userId: string;
  appVersion?: string;
  platform?: string;
  deviceModel?: string;
}): string {
  const source =
    input.category === "email-change"
      ? "Submitted from the app (Settings → You → Email)."
      : "Submitted from the mobile app (Settings → Report a problem).";

  const lines = [
    source,
    "",
    `**Category:** ${input.category}`,
    `**Report ID:** ${input.reportId}`,
    `**User ID:** ${input.userId}`,
  ];

  if (input.appVersion) lines.push(`**App version:** ${input.appVersion}`);
  if (input.platform) lines.push(`**Platform:** ${input.platform}`);
  if (input.deviceModel) lines.push(`**Device:** ${input.deviceModel}`);

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

export async function createLinearIssueForReport(input: {
  apiKey: string;
  teamId: string;
  category: string;
  message?: string;
  reportId: string;
  userId: string;
  appVersion?: string;
  platform?: string;
  deviceModel?: string;
}): Promise<LinearIssueResult> {
  const labelNames = linearLabelsForCategory(input.category);
  const labelIds = await fetchTeamLabelIds(input.apiKey, input.teamId, labelNames);

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
