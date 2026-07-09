/**
 * Admin paths that staff users must not access (UI + middleware).
 * Keep in sync with nav item `url` values in nav-items.ts.
 */
export const STAFF_RESTRICTED_ADMIN_PATHS = [
  '/admin/categories',
  '/admin/tags',
  '/admin/users',
] as const;

export type StaffRestrictedAdminPath =
  (typeof STAFF_RESTRICTED_ADMIN_PATHS)[number];

export function isStaffRestrictedAdminPath(pathname: string): boolean {
  return STAFF_RESTRICTED_ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
