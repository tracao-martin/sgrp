export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Returns the local login page URL.
 * Optional returnPath parameter for redirect after login.
 */
export const getLoginUrl = (returnPath?: string): string => {
  if (returnPath) {
    return `/login?redirect=${encodeURIComponent(returnPath)}`;
  }
  return "/login";
};
