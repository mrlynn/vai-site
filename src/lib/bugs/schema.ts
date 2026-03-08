import type { Db } from 'mongodb';

export const BUG_STATUS_VALUES = ['new', 'investigating', 'resolved', 'closed', 'wontfix'] as const;
export const BUG_PRIORITY_VALUES = ['low', 'medium', 'high', 'critical'] as const;
export const BUG_SOURCE_VALUES = ['cli', 'desktop-app', 'playground', 'web', 'unknown'] as const;

export type BugStatus = (typeof BUG_STATUS_VALUES)[number];
export type BugPriority = (typeof BUG_PRIORITY_VALUES)[number];

const DEFAULT_PRIORITY: BugPriority = 'medium';

let bugIndexesPromise: Promise<void> | null = null;

type BugContext = {
  country?: string;
  region?: string;
  userAgent?: string | null;
  fingerprint: string;
};

export function normalizeOptionalString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, maxLength);
}

export function normalizeOptionalEmail(value: unknown) {
  const email = normalizeOptionalString(value, 200);
  if (!email) {
    return null;
  }

  return email.toLowerCase();
}

export function normalizeOptionalStringList(value: unknown, maxItems = 10, maxLength = 40) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeOptionalString(item, maxLength))
    .filter((item): item is string => Boolean(item))
    .slice(0, maxItems);
}

export function normalizePriority(value: unknown): BugPriority {
  if (typeof value === 'string' && BUG_PRIORITY_VALUES.includes(value as BugPriority)) {
    return value as BugPriority;
  }

  return DEFAULT_PRIORITY;
}

export function normalizeStatus(value: unknown): BugStatus {
  if (typeof value === 'string' && BUG_STATUS_VALUES.includes(value as BugStatus)) {
    return value as BugStatus;
  }

  return 'new';
}

export function validateBugReportInput(body: Record<string, unknown>) {
  const errors: string[] = [];

  const title = normalizeOptionalString(body.title, 200);
  const description = normalizeOptionalString(body.description, 5000);
  const email = normalizeOptionalEmail(body.email);

  if (!title || title.length < 5) {
    errors.push('Title is required (min 5 characters)');
  }

  if (!description || description.length < 10) {
    errors.push('Description is required (min 10 characters)');
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email must be a valid address');
  }

  return {
    ok: errors.length === 0,
    errors,
    normalized: {
      title,
      description,
      stepsToReproduce: normalizeOptionalString(body.stepsToReproduce, 2000),
      email,
      source: normalizeOptionalString(body.source, 40) || 'unknown',
      currentScreen: normalizeOptionalString(body.currentScreen, 120),
      currentCommand: normalizeOptionalString(body.currentCommand, 200),
      currentUrl: normalizeOptionalString(body.currentUrl, 500),
      sessionId: normalizeOptionalString(body.sessionId, 120),
      userId: normalizeOptionalString(body.userId, 120),
      accountId: normalizeOptionalString(body.accountId, 120),
      appVersion: normalizeOptionalString(body.appVersion, 60),
      cliVersion: normalizeOptionalString(body.cliVersion, 60),
      platform: normalizeOptionalString(body.platform, 80),
      arch: normalizeOptionalString(body.arch, 40),
      nodeVersion: normalizeOptionalString(body.nodeVersion, 40),
      electronVersion: normalizeOptionalString(body.electronVersion, 40),
      errorMessage: normalizeOptionalString(body.errorMessage, 1000),
      errorStack: normalizeOptionalString(body.errorStack, 5000),
      consoleLogs: normalizeOptionalString(body.consoleLogs, 10000),
      screenshot: normalizeOptionalString(body.screenshot, 500000),
      labels: normalizeOptionalStringList(body.labels),
      assignee: normalizeOptionalString(body.assignee, 120),
      priority: normalizePriority(body.priority),
    },
  };
}

export function createBugFingerprint(input: {
  title: string;
  source?: string | null;
  platform?: string | null;
  cliVersion?: string | null;
  appVersion?: string | null;
  errorMessage?: string | null;
}) {
  const fingerprintBase = [
    input.source || 'unknown',
    input.platform || 'unknown',
    input.cliVersion || input.appVersion || 'unknown',
    (input.errorMessage || input.title || 'unknown').toLowerCase().slice(0, 120),
  ].join('|');

  return Buffer.from(fingerprintBase).toString('base64url').slice(0, 80);
}

export function buildBugDocument(
  body: Record<string, unknown>,
  context: BugContext
) {
  const validation = validateBugReportInput(body);
  if (!validation.ok || !validation.normalized.title || !validation.normalized.description) {
    throw new Error(validation.errors[0] || 'Invalid bug report payload');
  }

  const bugId = `bug_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date();

  const doc = {
    bugId,
    title: validation.normalized.title,
    description: validation.normalized.description,
    stepsToReproduce: validation.normalized.stepsToReproduce,
    email: validation.normalized.email,
    source: validation.normalized.source,
    currentScreen: validation.normalized.currentScreen,
    currentCommand: validation.normalized.currentCommand,
    currentUrl: validation.normalized.currentUrl,
    sessionId: validation.normalized.sessionId,
    userId: validation.normalized.userId,
    accountId: validation.normalized.accountId,
    appVersion: validation.normalized.appVersion,
    cliVersion: validation.normalized.cliVersion,
    platform: validation.normalized.platform,
    arch: validation.normalized.arch,
    nodeVersion: validation.normalized.nodeVersion,
    electronVersion: validation.normalized.electronVersion,
    errorMessage: validation.normalized.errorMessage,
    errorStack: validation.normalized.errorStack,
    consoleLogs: validation.normalized.consoleLogs,
    screenshot: validation.normalized.screenshot,
    status: 'new' as BugStatus,
    priority: validation.normalized.priority,
    severity: normalizeOptionalString(body.severity, 40),
    labels: validation.normalized.labels,
    assignee: validation.normalized.assignee,
    resolution: null as string | null,
    githubIssueUrl: null as string | null,
    githubIssueNumber: null as number | null,
    fingerprint: context.fingerprint,
    createdAt,
    updatedAt: createdAt,
    lastActivityAt: createdAt,
    statusHistory: [
      {
        status: 'new' as BugStatus,
        changedAt: createdAt,
        note: 'Bug report created',
      },
    ],
    country: context.country,
    region: context.region,
    userAgent: context.userAgent,
  };

  return { doc, bugId, createdAt };
}

export function createBugGithubIssueUrl(bug: Record<string, unknown>) {
  const title = encodeURIComponent(`[Bug] ${String(bug.title || 'Bug report')}`);
  const body = encodeURIComponent(`## Description
${String(bug.description || '')}

## Steps to Reproduce
${String(bug.stepsToReproduce || 'Not provided')}

## Environment
- **Source:** ${String(bug.source || 'unknown')}
- **App Version:** ${String(bug.appVersion || 'N/A')}
- **CLI Version:** ${String(bug.cliVersion || 'N/A')}
- **Platform:** ${String(bug.platform || 'N/A')}
- **Arch:** ${String(bug.arch || 'N/A')}
- **Current Screen:** ${String(bug.currentScreen || 'N/A')}
- **Current Command:** ${String(bug.currentCommand || 'N/A')}
- **Session ID:** ${String(bug.sessionId || 'N/A')}

## Error Details
${bug.errorMessage ? `\`\`\`\n${String(bug.errorMessage)}\n\`\`\`` : 'No error message'}

---
*Bug ID: ${String(bug.bugId || 'unknown')}*
`);

  return `https://github.com/mrlynn/voyageai-cli/issues/new?title=${title}&body=${body}&labels=bug`;
}

export function getPersistedBugFields(doc: Record<string, unknown>) {
  return Object.entries(doc)
    .filter(([, value]) => value !== null && value !== undefined && !(Array.isArray(value) && value.length === 0))
    .map(([key]) => key)
    .sort();
}

export function buildBugQuery(searchParams: URLSearchParams) {
  const query: Record<string, unknown> = {};
  const status = searchParams.get('status');
  const source = searchParams.get('source');
  const platform = searchParams.get('platform');
  const priority = searchParams.get('priority');
  const version = searchParams.get('version');
  const search = normalizeOptionalString(searchParams.get('search'), 120);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (status && status !== 'all') {
    query.status = status;
  }

  if (source && source !== 'all') {
    query.source = source;
  }

  if (platform && platform !== 'all') {
    query.platform = platform;
  }

  if (priority && priority !== 'all') {
    query.priority = priority;
  }

  if (version && version !== 'all') {
    query.$or = [{ appVersion: version }, { cliVersion: version }];
  }

  if (search) {
    query.$text = { $search: search };
  }

  if (from || to) {
    query.createdAt = {};

    if (from) {
      query.createdAt = { ...(query.createdAt as Record<string, Date>), $gte: new Date(from) };
    }

    if (to) {
      query.createdAt = { ...(query.createdAt as Record<string, Date>), $lte: new Date(to) };
    }
  }

  return query;
}

export async function ensureBugIndexes(db: Db) {
  if (!bugIndexesPromise) {
    bugIndexesPromise = (async () => {
      await db.collection('bugs').createIndexes([
        { key: { bugId: 1 }, unique: true, name: 'bugId_unique' },
        { key: { status: 1, createdAt: -1 }, name: 'status_createdAt' },
        { key: { priority: 1, createdAt: -1 }, name: 'priority_createdAt' },
        { key: { source: 1, createdAt: -1 }, name: 'source_createdAt' },
        { key: { platform: 1, createdAt: -1 }, name: 'platform_createdAt' },
        { key: { appVersion: 1, createdAt: -1 }, name: 'appVersion_createdAt' },
        { key: { cliVersion: 1, createdAt: -1 }, name: 'cliVersion_createdAt' },
        { key: { fingerprint: 1, createdAt: -1 }, name: 'fingerprint_createdAt' },
        { key: { title: 'text', description: 'text', errorMessage: 'text', email: 'text' }, name: 'bug_text_search' },
      ]);
    })().catch((error) => {
      bugIndexesPromise = null;
      throw error;
    });
  }

  await bugIndexesPromise;
}
