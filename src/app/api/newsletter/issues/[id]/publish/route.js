import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getIssuesCollection } from '@/lib/content/issues';
import { sendNewsletterToActiveSubscribers } from '@/lib/newsletter/sender';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function requireAdmin(request) {
  if (!ADMIN_TOKEN) return false;
  const cookie = request.cookies.get('vai_admin_token')?.value;
  return cookie === ADMIN_TOKEN;
}

function composeIssueMarkdown(issue) {
  const lines = [];
  const date =
    issue.publishDate instanceof Date
      ? issue.publishDate.toISOString().slice(0, 10)
      : issue.publishDate || '';

  lines.push(`ISSUE: ${issue.issueNumber}`);
  lines.push(`DATE: ${date}`);
  lines.push(`THEME: ${issue.theme || ''}`);
  lines.push('');
  lines.push('Section 1 — FROM THE FIELD');
  lines.push('');
  lines.push(issue.sections?.s1?.content || '');
  lines.push('');
  lines.push('Section 2 — AI NEWS ROUNDUP');
  lines.push('');
  lines.push(issue.sections?.s2?.content || '');
  lines.push('');
  lines.push('Section 3 — DEVELOPER INTELLIGENCE');
  lines.push('');
  lines.push(issue.sections?.s3?.content || '');
  lines.push('');
  lines.push('Section 4 — VAI PRODUCT TIP');
  lines.push('');
  lines.push(issue.sections?.s4?.content || '');
  lines.push('');
  lines.push("What I'm Reading");
  lines.push('');
  lines.push(issue.sections?.s6?.content || '');
  lines.push('');
  lines.push('Want More?');
  lines.push('');
  lines.push(issue.sections?.s5?.content || '');

  return lines.join('\n');
}

function markdownToHtmlSection(markdown) {
  if (!markdown) return '';
  let html = markdown.replace(/\r\n/g, '\n');

  // Strip AI section delimiter lines (e.g. === SECTION 6: WHAT I'M READING ===) so they never appear in email
  const sectionDelimiter = /^\s*===\s*(SECTION\s+\d+:.*|END OF ISSUE)\s*={2,3}\s*$/im;
  html = html
    .split('\n')
    .filter((line) => !sectionDelimiter.test(line.trim()))
    .join('\n');

  // Images: ![alt](url)
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_m, alt, url) =>
      `<figure style="margin:16px 0;"><img src="${url}" alt="${alt}" style="max-width:100%;border-radius:4px;" />${
        alt ? `<figcaption style="font-size:12px;color:#6b7280;margin-top:4px;">${alt}</figcaption>` : ''
      }</figure>`,
  );

  // Links: [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, text, url) =>
      `<a href="${url}" style="color:#2563eb;text-decoration:underline;">${text}</a>`,
  );

  // Code fences ``` ```
  html = html.replace(/```([\s\S]*?)```/g, (_m, code) => {
    const safe = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre style="background:#020617;color:#e5e7eb;padding:12px 14px;border-radius:4px;font-size:12px;overflow-x:auto;"><code>${safe}</code></pre>`;
  });

  // Inline markdown: bold and italic (run on paragraph/blockquote/list text)
  function inlineToHtml(text) {
    if (!text || typeof text !== 'string') return text;
    let out = text;
    // Bold: **...** then __...__ (do before single * and _)
    out = out.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/__([^_]+?)__/g, '<strong>$1</strong>');
    // Italic: *...* then _..._
    out = out.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
    out = out.replace(/_([^_]+?)_/g, '<em>$1</em>');
    return out;
  }

  const lines = html.split('\n');
  const blocks = [];
  let buffer = [];
  let blockquoteBuffer = [];

  function flushParagraph() {
    if (!buffer.length) return;
    const text = buffer.join(' ').trim();
    if (text) {
      blocks.push(
        `<p style="margin:0 0 12px 0;color:#0f172a;line-height:1.6;">${inlineToHtml(text)}</p>`,
      );
    }
    buffer = [];
  }

  function flushBlockquote() {
    if (!blockquoteBuffer.length) return;
    const content = blockquoteBuffer
      .map((l) => l.replace(/^>\s?/, '').trim())
      .join(' ');
    if (content) {
      blocks.push(
        `<blockquote style="margin:12px 0;padding:10px 14px;border-left:4px solid #94a3b8;background:#f1f5f9;color:#0f172a;font-style:italic;">${inlineToHtml(content)}</blockquote>`,
      );
    }
    blockquoteBuffer = [];
  }

  let inList = false;
  let inOrderedList = false;
  const closeList = () => {
    if (inList) {
      blocks.push('</ul>');
      inList = false;
    }
    if (inOrderedList) {
      blocks.push('</ol>');
      inOrderedList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      flushParagraph();
      flushBlockquote();
      closeList();
      continue;
    }

    // Blockquote: lines starting with >
    if (/^>\s?/.test(line)) {
      flushParagraph();
      closeList();
      blockquoteBuffer.push(line);
      continue;
    }
    if (blockquoteBuffer.length) {
      flushBlockquote();
    }

    if (/^#\s+/.test(line)) {
      flushParagraph();
      closeList();
      const text = line.replace(/^#\s+/, '').trim();
      blocks.push(
        `<h1 style="margin:24px 0 10px 0;font-size:20px;color:#0f172a;">${inlineToHtml(text)}</h1>`,
      );
      continue;
    }

    if (/^###\s+/.test(line)) {
      flushParagraph();
      closeList();
      const text = line.replace(/^###\s+/, '').trim();
      blocks.push(
        `<h3 style="margin:20px 0 6px 0;font-size:16px;color:#0f172a;">${inlineToHtml(text)}</h3>`,
      );
      continue;
    }
    if (/^##\s+/.test(line)) {
      flushParagraph();
      closeList();
      const text = line.replace(/^##\s+/, '').trim();
      blocks.push(
        `<h2 style="margin:22px 0 8px 0;font-size:18px;color:#0f172a;">${inlineToHtml(text)}</h2>`,
      );
      continue;
    }

    if (/^-\s+/.test(line)) {
      flushParagraph();
      if (inOrderedList) {
        blocks.push('</ol>');
        inOrderedList = false;
      }
      if (!inList) {
        blocks.push(
          '<ul style="margin:0 0 12px 18px;padding:0;color:#0f172a;line-height:1.6;">',
        );
        inList = true;
      }
      const text = line.replace(/^-\s+/, '').trim();
      blocks.push(`<li style="margin-bottom:4px;">${inlineToHtml(text)}</li>`);
      continue;
    }

    // Ordered list: 1. 2. etc.
    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      if (inList) {
        blocks.push('</ul>');
        inList = false;
      }
      if (!inOrderedList) {
        blocks.push(
          '<ol style="margin:0 0 12px 18px;padding:0;color:#0f172a;line-height:1.6;list-style-position:outside;">',
        );
        inOrderedList = true;
      }
      const text = line.replace(/^\d+\.\s+/, '').trim();
      blocks.push(`<li style="margin-bottom:4px;">${inlineToHtml(text)}</li>`);
      continue;
    }

    buffer.push(line.trim());
  }

  flushBlockquote();

  flushParagraph();
  flushBlockquote();
  closeList();

  return blocks.join('\n');
}

function getBaseUrl() {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;
  if (process.env.NEXT_PUBLIC_APP_BASE_URL) return process.env.NEXT_PUBLIC_APP_BASE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return 'http://localhost:3000';
}

function renderIssueHtml(issue) {
  const date =
    issue.publishDate instanceof Date
      ? issue.publishDate.toISOString().slice(0, 10)
      : issue.publishDate || '';

  const title = `Vector Log #${issue.issueNumber}${issue.theme ? ` — ${issue.theme}` : ''}`;
  const baseUrl = getBaseUrl();
  const viewOnWebUrl = `${baseUrl}/newsletter/${issue.issueNumber}`;

  const sectionEnabled = (section) =>
    !section || section.enabled !== false ? true : false;

  const s1 =
    sectionEnabled(issue.sections?.s1) &&
    markdownToHtmlSection(issue.sections?.s1?.content || '');
  const s2 =
    sectionEnabled(issue.sections?.s2) &&
    markdownToHtmlSection(issue.sections?.s2?.content || '');
  const s3 =
    sectionEnabled(issue.sections?.s3) &&
    markdownToHtmlSection(issue.sections?.s3?.content || '');
  const s4 =
    sectionEnabled(issue.sections?.s4) &&
    markdownToHtmlSection(issue.sections?.s4?.content || '');
  const s5 =
    sectionEnabled(issue.sections?.s5) &&
    markdownToHtmlSection(issue.sections?.s5?.content || '');
  const s6 =
    sectionEnabled(issue.sections?.s6) &&
    markdownToHtmlSection(issue.sections?.s6?.content || '');

  return `
<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0b1120;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:720px;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:20px 24px 8px 24px;border-bottom:1px solid #e5e7eb;">
                <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                  <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">
                    VECTOR LOG
                  </div>
                  <div style="font-size:20px;font-weight:700;color:#0f172a;margin-bottom:2px;">
                    ${title}
                  </div>
                  <div style="font-size:12px;color:#6b7280;">
                    ${date}
                  </div>
                  <div style="font-size:12px;margin-top:8px;">
                    <a href="${viewOnWebUrl}" style="color:#2563eb;text-decoration:underline;">View this issue on the web</a>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px 8px 24px;">
                <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;color:#0f172a;">
                  ${
                    s1
                      ? `<h2 style="margin:0 0 10px 0;font-size:16px;color:#0f172a;text-transform:uppercase;letter-spacing:0.08em;">From the Field</h2>${s1}`
                      : ''
                  }

                  ${
                    s2
                      ? `<h2 style="margin:20px 0 10px 0;font-size:16px;color:#0f172a;text-transform:uppercase;letter-spacing:0.08em;">AI News Roundup</h2>${s2}`
                      : ''
                  }

                  ${
                    s3
                      ? `<h2 style="margin:20px 0 10px 0;font-size:16px;color:#0f172a;text-transform:uppercase;letter-spacing:0.08em;">Developer Intelligence</h2>${s3}`
                      : ''
                  }

                  ${
                    s4
                      ? `<h2 style="margin:20px 0 10px 0;font-size:16px;color:#0f172a;text-transform:uppercase;letter-spacing:0.08em;">VAI Product Tip</h2>${s4}`
                      : ''
                  }

                  ${
                    s6
                      ? `<h2 style="margin:20px 0 10px 0;font-size:16px;color:#0f172a;text-transform:uppercase;letter-spacing:0.08em;">What I'm Reading</h2>${s6}`
                      : ''
                  }

                  ${
                    s5
                      ? `<h2 style="margin:20px 0 10px 0;font-size:16px;color:#0f172a;text-transform:uppercase;letter-spacing:0.08em;">Want More?</h2>${s5}`
                      : ''
                  }
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

export async function POST(request, context) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const dryRun = !!body.dryRun;

    const col = await getIssuesCollection();
    const asObjectId = ObjectId.isValid(id) ? new ObjectId(id) : null;
    const asNumber = Number.isFinite(Number(id)) ? Number(id) : null;
    const query =
      asObjectId && asNumber !== null
        ? { $or: [{ _id: asObjectId }, { issueNumber: asNumber }] }
        : asObjectId
          ? { _id: asObjectId }
          : asNumber !== null
            ? { issueNumber: asNumber }
            : { issueNumber: -1 };
    const issue = await col.findOne(query);
    if (!issue) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const subject =
      typeof body.subject === 'string' && body.subject.trim().length
        ? body.subject.trim()
        : `Vector Log #${issue.issueNumber}${issue.theme ? ` — ${issue.theme}` : ''}`;

    const textBody = composeIssueMarkdown(issue);
    const htmlBody = renderIssueHtml(issue);

    const result = await sendNewsletterToActiveSubscribers({
      subject,
      textBody,
      htmlBody,
      dryRun,
    });

    if (!dryRun) {
      const now = new Date();
      await col.updateOne(query, {
        $set: { status: 'published', publishedAt: now, updatedAt: now },
      });
    }

    return NextResponse.json({ ok: true, ...result, subject });
  } catch (error) {
    console.error('Issue publish error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

