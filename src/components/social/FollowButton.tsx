import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { followService } from '../../services/follow.service';

interface FollowButtonProps {
  userId: string;
  onFollowChange?: () => void;
}

export const FollowButton = ({ userId, onFollowChange }: FollowButtonProps) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const following = await followService.isFollowing(user.id, userId);
        setIsFollowing(following);
      } catch (err) {
        console.error('Error checking follow status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkFollowStatus();
  }, [user, userId]);

  const handleFollowToggle = async () => {
    if (!user || actionLoading) return;

    setActionLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollowUser(user.id, userId);
        setIsFollowing(false);
      } else {
        await followService.followUser(user.id, userId);
        setIsFollowing(true);
      }
      onFollowChange?.();
    } catch (err) {
      console.error('Error toggling follow:', err);
      alert(err instanceof Error ? err.message : 'Failed to update follow status');
    } finally {
      setActionLoading(false);
    }
  };

  if (!user || user.id === userId) {
    return null;
  }

  if (loading) {
    return (
      <button
        disabled
        className="px-6 py-2 bg-sand-200 text-sand-500 rounded-button font-medium cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={actionLoading}
      className={`px-6 py-2 rounded-button font-medium transition-colors ${
        isFollowing
          ? 'bg-sand-200 text-ink hover:bg-sand-300'
          : 'bg-brand-500 text-white hover:bg-brand-600'
      } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {actionLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};
