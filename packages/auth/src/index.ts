export { AuthSessionProvider } from './components/AuthSessionProvider';
export { AuthGate, AuthPanel } from './components/AuthGate';
export { CentralAuthGate, CentralAuthRedirect } from './components/CentralAuthRedirect';
export { PlatformAdminConsole } from './components/PlatformAdminConsole';
export { createAuthOptions } from './lib/auth-options';
export { isAuthStoreConfigured } from './lib/users';
export {
  PLATFORM_AUTH_PATH,
  buildPlatformAuthUrl,
  getPlatformAuthOrigin,
  isPlatformAdminEmail,
  sanitizeReturnTo,
} from './lib/platform-auth-url';
export {
  getSessionTokenCookieName,
  getAuthCookieDomain,
  useSecureAuthCookies,
} from './lib/session-cookie';
export {
  isPlatformAdmin,
  getAppRoleForEmail,
  getRolesForEmail,
  upsertBlogSubscriber,
  ensureRolesSchema,
} from './lib/roles';
export type { CreateAuthOptionsInput } from './lib/auth-options';
export type { AuthAppId, CentralUser } from './types/user';
export type { UserAppRole, AppSlug } from './lib/roles';
