import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CampingLoader } from '../common/CampingLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Optimistic: if we have a user (even if still validating), show content
  // Only block if loading AND no user (truly unknown state)
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <CampingLoader message="Checking your camping pass" size="large" />
      </div>
    );
  }

  // If loading finished and still no user, redirect
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  // If we have a user (even if still validating in background), show content!
  return <>{children}</>;
};
