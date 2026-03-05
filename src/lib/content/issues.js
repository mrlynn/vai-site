import connectDB from '@/lib/mongodb';

const ISSUES_COLLECTION = 'newsletter_issues';
const TIPS_COLLECTION = 'newsletter_vai_tips';
const PROMPTS_COLLECTION = 'newsletter_prompt_versions';

export async function getIssuesCollection() {
  const db = await connectDB();
  return db.collection(ISSUES_COLLECTION);
}

export async function getTipsCollection() {
  const db = await connectDB();
  return db.collection(TIPS_COLLECTION);
}

export async function getPromptVersionsCollection() {
  const db = await connectDB();
  return db.collection(PROMPTS_COLLECTION);
}

/** Get a single published issue by issue number (for public pages). Returns null if not found or not published. */
export async function getPublishedIssueByNumber(issueNumber) {
  const col = await getIssuesCollection();
  const num = Number(issueNumber);
  if (!Number.isFinite(num)) return null;
  const issue = await col.findOne({ issueNumber: num, status: 'published' });
  return issue;
}

/** Get list of published issues for the public index (issueNumber, theme, publishDate, updatedAt). */
export async function getPublishedIssuesList() {
  const col = await getIssuesCollection();
  const list = await col
    .find({ status: 'published' })
    .project({ issueNumber: 1, theme: 1, publishDate: 1, updatedAt: 1 })
    .sort({ issueNumber: -1 })
    .toArray();
  return list;
}

