import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Optimistic: if we have a user (even if still validating), show content
  // Only block if loading AND no user (truly unknown state)
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
