import { useUser } from '@/modules/guest/auth/hooks/use-user';

import { AdminSkeleton } from './admin-skeleton';
import { AccessDenied } from './access-denied';

import { UserRole } from '@/lib/enums/user-role.enum';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * AdminGuard component
 *
 * Provides professional security logic on the client-side:
 * 1. Shows skeleton while fetching user data.
 * 2. Validates user existence and ADMIN role.
 * 3. Shows "Access Denied" if unauthorized.
 * 4. Renders children only if fully authorized.
 */
export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, isLoading, isFetching, isAuthHydrated, isAuthenticated } =
    useUser();

  // 1. Loading state (including hydration and initial fetch)
  if (!isAuthHydrated || (isLoading && !user)) {
    return <AdminSkeleton />;
  }

  // 2. Not authenticated
  if (!isAuthenticated && !isFetching) {
    return <AccessDenied />;
  }

  // 3. Authenticated but not an admin or staff
  if (user && user.role !== UserRole.ADMIN && user.role !== UserRole.STAFF) {
    return <AccessDenied />;
  }

  // 4. Authorized - Render content
  return <>{children}</>;
};
