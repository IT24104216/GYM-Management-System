import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { ROUTES } from '@/shared/utils/constants';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';

/**
 * Wraps a group of routes with authentication + optional role-based access control.
 *
 * @param {{ allowedRoles?: string[] }} props
 */
function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // While rehydrating from localStorage, show a spinner to avoid a flash redirect
  if (isLoading) return <LoadingSpinner />;

  // Not authenticated → redirect to login, storing the attempted path
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  // Authenticated but wrong role → redirect to 403 page
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
