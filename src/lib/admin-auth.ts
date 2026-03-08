export const ADMIN_SESSION_COOKIE = 'vai_admin_token';

export function isAdminAuthConfigured() {
  return Boolean(process.env.ADMIN_TOKEN);
}

export function isValidAdminSession(token: string | null | undefined) {
  if (!token) {
    return false;
  }

  const expectedToken = process.env.ADMIN_TOKEN;
  if (!expectedToken) {
    return false;
  }

  return token === expectedToken;
}
