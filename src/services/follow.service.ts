import { supabase } from './supabase';
import type { Follow, FollowStats } from '../types/follow';

export const followService = {
  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    const { data, error } = await supabase
      .from('follows')
      .insert([{
        follower_id: followerId,
        following_id: followingId,
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Already following this user');
      }
      throw error;
    }

    return data as Follow;
  },

  async unfollowUser(followerId: string, followingId: string) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
  },

  async isFollowing(followerId: string, followingId: string) {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async getFollowStats(userId: string): Promise<FollowStats> {
    const { count: followerCount, error: followerError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (followerError) throw followerError;

    const { count: followingCount, error: followingError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (followingError) throw followingError;

    return {
      followerCount: followerCount || 0,
      followingCount: followingCount || 0,
    };
  },
};
