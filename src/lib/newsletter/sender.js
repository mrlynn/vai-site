import { getSubscribersCollection } from '@/lib/newsletter/subscribers';
import { logNewsletterEvent } from '@/lib/newsletter/events';
import { generateUnsubscribeToken } from '@/lib/newsletter/tokens';
import { sendNewsletterEmail } from '@/lib/newsletter/emailTemplates';
import { getGlobalSettings } from '@/lib/settings';

function getBaseUrl() {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;
  if (process.env.NEXT_PUBLIC_APP_BASE_URL) return process.env.NEXT_PUBLIC_APP_BASE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return 'http://localhost:3000';
}

export async function sendNewsletterToActiveSubscribers({
  subject,
  htmlBody,
  textBody,
  dryRun = false,
  limit,
}) {
  const subscribers = await getSubscribersCollection();

  const query = { status: 'active' };
  const cursor = subscribers.find(query, {
    projection: { email: 1, source: 1 },
  });

  if (typeof limit === 'number' && limit > 0) {
    cursor.limit(limit);
  }

  const baseUrl = getBaseUrl();
  const settings = await getGlobalSettings();
  const footerBio =
    settings.footerBio && typeof settings.footerBio === 'string'
      ? settings.footerBio.trim()
      : '';

  let sent = 0;
  const errors = [];

  // Simple sequential sending is fine for small lists; for larger volumes,
  // this should be moved to a background job with batching.
  // eslint-disable-next-line no-await-in-loop
  for await (const doc of cursor) {
    const email = doc.email;
    const source = doc.source || 'broadcast';

    try {
      const unsubscribeToken = await generateUnsubscribeToken({ email, source });
      const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(
        unsubscribeToken
      )}`;

      const textLines = [];
      if (textBody) {
        textLines.push(textBody.trim());
      }
      if (footerBio && !textLines.join('\n').includes(footerBio)) {
        textLines.push('', '---', footerBio);
      }
      textLines.push(
        '',
        '---',
        'To stop receiving these emails, you can unsubscribe here:',
        unsubscribeUrl
      );
      const finalText = textLines.join('\n');

      const topUnsubHtml = `
        <div style="font-size:11px;color:#6b7280;margin:0 0 12px 0;text-align:right;">
          <a href="${unsubscribeUrl}" style="color:#2563eb;text-decoration:underline;">Unsubscribe</a>
        </div>
      `;

      let finalHtml = '';
      if (htmlBody) {
        const bodyIndex = htmlBody.indexOf('<body');
        if (bodyIndex !== -1) {
          const openEnd = htmlBody.indexOf('>', bodyIndex);
          if (openEnd !== -1) {
            finalHtml =
              htmlBody.slice(0, openEnd + 1) +
              topUnsubHtml +
              htmlBody.slice(openEnd + 1);
          } else {
            finalHtml = topUnsubHtml + htmlBody;
          }
        } else {
          finalHtml = topUnsubHtml + htmlBody;
        }
      } else if (textBody) {
        // Simple text-to-HTML conversion so plaintext issues render in HTML clients.
        const escaped = textBody
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        const htmlFromText = escaped.replace(/\n/g, '<br />');
        finalHtml += `${topUnsubHtml}<div style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;font-size:14px;line-height:1.6;color:#0f172a;">${htmlFromText}</div>`;
      }
      if (footerBio) {
        const escapedFooter = footerBio
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br />');
        finalHtml += `
        <hr style="margin-top:24px;margin-bottom:16px;border:none;border-top:1px solid #e5e7eb;" />
        <div style="font-size:12px;color:#4b5563;margin-top:8px;">${escapedFooter}</div>`;
      }
      finalHtml += `
        <hr style="margin-top:24px;margin-bottom:16px;border:none;border-top:1px solid #e5e7eb;" />
        <p style="font-size:12px;color:#6b7280;">
          You are receiving this email because you subscribed to the vai newsletter.
          You can <a href="${unsubscribeUrl}">unsubscribe here</a>.
        </p>
      `;

      if (!dryRun) {
        await sendNewsletterEmail({
          to: email,
          subject,
          html: finalHtml,
          text: finalText,
        });

        await logNewsletterEvent({
          email,
          type: 'sent',
          source,
        });
      }

      sent += 1;
    } catch (err) {
      // Capture but do not stop the whole run.
      // eslint-disable-next-line no-console
      console.error('Newsletter send error for', email, err);
      errors.push({ email, message: String(err) });
    }
  }

  return {
    sent,
    errors,
    dryRun,
  };
}

