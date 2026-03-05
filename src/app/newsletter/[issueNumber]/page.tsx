import { notFound } from 'next/navigation';
import { getPublishedIssueByNumber } from '@/lib/content/issues';
import { IssueView } from './IssueView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ issueNumber: string }>;
}) {
  const { issueNumber } = await params;
  const issue = await getPublishedIssueByNumber(issueNumber);
  if (!issue) return { title: 'Issue not found' };
  const title = `Vector Log #${issue.issueNumber}${issue.theme ? ` — ${issue.theme}` : ''}`;
  const dateStr = issue.publishDate
    ? new Date(issue.publishDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';
  return {
    title: `${title} | Vector Log`,
    description: dateStr
      ? `Vector Log issue #${issue.issueNumber}, ${dateStr}. ${issue.theme || 'Notes from building AI systems in the field.'}`
      : `Vector Log issue #${issue.issueNumber}. ${issue.theme || 'Notes from building AI systems in the field.'}`,
    openGraph: {
      title,
      description: issue.theme || `Vector Log issue #${issue.issueNumber}`,
      type: 'article',
      publishedTime: issue.publishDate
        ? new Date(issue.publishDate).toISOString()
        : undefined,
    },
  };
}

export default async function NewsletterIssuePage({
  params,
}: {
  params: Promise<{ issueNumber: string }>;
}) {
  const { issueNumber } = await params;
  const issue = await getPublishedIssueByNumber(issueNumber);
  if (!issue) notFound();

  const serialized = {
    issueNumber: issue.issueNumber,
    theme: issue.theme || '',
    publishDate: issue.publishDate
      ? new Date(issue.publishDate).toISOString().slice(0, 10)
      : '',
    sections: issue.sections || {},
  };

  return <IssueView issue={serialized} />;
}
