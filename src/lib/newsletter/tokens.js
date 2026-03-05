import { SignJWT, jwtVerify } from 'jose';

const TOKEN_EXPIRY_HOURS = 48;
const UNSUB_TOKEN_EXPIRY_DAYS = 30;

function getTokenSecret() {
  const secret = process.env.NEWSLETTER_TOKEN_SECRET;
  if (!secret) {
    throw new Error('NEWSLETTER_TOKEN_SECRET is not set');
  }
  return new TextEncoder().encode(secret);
}

export async function generateConfirmToken({ email, source = 'footer' }) {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    email,
    type: 'confirm',
    source,
    issuedAt: now,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(`${TOKEN_EXPIRY_HOURS}h`)
    .sign(getTokenSecret());
}

export async function verifyConfirmToken(token) {
  try {
    const { payload } = await jwtVerify(token, getTokenSecret(), {
      algorithms: ['HS256'],
    });

    if (payload.type !== 'confirm' || typeof payload.email !== 'string') {
      return { ok: false, reason: 'invalid' };
    }

    return {
      ok: true,
      email: payload.email,
      source: typeof payload.source === 'string' ? payload.source : undefined,
    };
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ERR_JWT_EXPIRED') {
      return { ok: false, reason: 'expired' };
    }
    return { ok: false, reason: 'invalid' };
  }
}

export async function generateUnsubscribeToken({ email, source = 'footer' }) {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    email,
    type: 'unsubscribe',
    source,
    issuedAt: now,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(`${UNSUB_TOKEN_EXPIRY_DAYS}d`)
    .sign(getTokenSecret());
}

export async function verifyUnsubscribeToken(token) {
  try {
    const { payload } = await jwtVerify(token, getTokenSecret(), {
      algorithms: ['HS256'],
    });

    if (payload.type !== 'unsubscribe' || typeof payload.email !== 'string') {
      return { ok: false, reason: 'invalid' };
    }

    return {
      ok: true,
      email: payload.email,
      source: typeof payload.source === 'string' ? payload.source : undefined,
    };
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ERR_JWT_EXPIRED') {
      return { ok: false, reason: 'expired' };
    }
    return { ok: false, reason: 'invalid' };
  }
}


