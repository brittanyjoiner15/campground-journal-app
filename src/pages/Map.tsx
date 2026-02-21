import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CampingLoader } from '../components/common/CampingLoader';

export const Map = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to user's profile map
    if (profile?.username) {
      navigate(`/profile/${profile.username}/map`, { replace: true });
    }
  }, [profile, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <CampingLoader message="Loading your map" size="large" />
      </div>
    </div>
  );
};
