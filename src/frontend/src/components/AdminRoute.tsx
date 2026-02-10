import { ReactNode } from 'react';
import { useIsCallerAdmin } from '../hooks/useCurrentUser';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AccessDeniedScreen from './AccessDeniedScreen';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return <AccessDeniedScreen message="Please log in to access the admin dashboard." />;
  }

  if (isLoading) {
    return (
      <div className="container-custom py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen message="You don't have permission to access this page." />;
  }

  return <>{children}</>;
}
