import { UserRole } from '@/lib/enums/user-role.enum';
import type { User } from '@/lib/interfaces/user';

const COMMENT_ALLOWED_ROLES: ReadonlyArray<UserRole> = [
  UserRole.MEMBER,
  UserRole.STAFF,
  UserRole.ADMIN,
];

/**
 * Whether the user may post or edit blog comments (UI + client guards).
 * Backend must enforce the same rules.
 */
export function canWriteBlogComments(user: User | null | undefined): boolean {
  if (!user) return false;
  if (!user.verified) return false;
  if (!COMMENT_ALLOWED_ROLES.includes(user.role)) return false;
  return true;
}
