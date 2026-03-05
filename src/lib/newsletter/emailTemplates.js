import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT
  ? parseInt(process.env.SMTP_PORT, 10)
  : undefined;
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_APP_PASSWORD;
const fromEmail = process.env.FROM_EMAIL || smtpUser;

let transporter = null;

function getTransporter() {
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !fromEmail) {
    throw new Error('SMTP configuration is incomplete for newsletter email sending');
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  return transporter;
}

export function buildConfirmEmail({ email, confirmUrl, unsubscribeUrl }) {
  const subject = 'Confirm your subscription to the vai newsletter';
  const textLines = [
    'Thanks for subscribing to the vai newsletter!',
    '',
    'Please confirm your email address by clicking the link below:',
    confirmUrl,
    '',
    'If you did not request this, you can safely ignore this email.',
  ];

  if (unsubscribeUrl) {
    textLines.push('', 'To stop receiving these emails, you can unsubscribe here:', unsubscribeUrl);
  }

  const text = textLines.join('\n');

  const htmlParts = [
    '<p>Thanks for subscribing to the <strong>vai</strong> newsletter!</p>',
    '<p>Please confirm your email address by clicking the button below:</p>',
    `<p>
      <a href="${confirmUrl}" style="display:inline-block;padding:10px 16px;border-radius:6px;background:#111827;color:#ffffff;text-decoration:none;font-weight:600;">
        Confirm subscription
      </a>
    </p>`,
    '<p style="font-size:12px;color:#6b7280;">If you did not request this, you can safely ignore this email.</p>',
  ];

  if (unsubscribeUrl) {
    htmlParts.push(
      `<p style="font-size:12px;color:#6b7280;">
        To stop receiving these emails, you can <a href="${unsubscribeUrl}">unsubscribe here</a>.
      </p>`
    );
  }

  const html = htmlParts.join('');

  return { subject, text, html };
}

export function buildWelcomeEmail({ email, unsubscribeUrl }) {
  const subject = 'Welcome to the vai newsletter';
  const textLines = [
    'You are now subscribed to the vai newsletter.',
    '',
    'We’ll occasionally share deep dives on Voyage AI embeddings, MongoDB Atlas Vector Search, and how developers are building with vai.',
  ];

  if (unsubscribeUrl) {
    textLines.push(
      '',
      'You can unsubscribe at any time using the link below:',
      unsubscribeUrl
    );
  } else {
    textLines.push('', 'You can unsubscribe at any time using the link in any email.');
  }

  const text = textLines.join('\n');

  const htmlParts = [
    '<p><strong>Welcome aboard!</strong></p>',
    `<p>
      You are now subscribed to the <strong>vai</strong> newsletter.
      From time to time, we’ll share deep dives on Voyage AI embeddings,
      MongoDB Atlas Vector Search, and how developers are building with vai.
    </p>`,
  ];

  if (unsubscribeUrl) {
    htmlParts.push(
      `<p style="font-size:12px;color:#6b7280;">
        You can unsubscribe at any time using <a href="${unsubscribeUrl}">this link</a>.
      </p>`
    );
  } else {
    htmlParts.push(
      `<p style="font-size:12px;color:#6b7280;">
        You can unsubscribe at any time using the link in any email.
      </p>`
    );
  }

  const html = htmlParts.join('');

  return { subject, text, html };
}

export async function sendNewsletterEmail({ to, subject, html, text }) {
  const transport = getTransporter();

  await transport.sendMail({
    from: fromEmail,
    to,
    subject,
    html,
    text,
  });
}

