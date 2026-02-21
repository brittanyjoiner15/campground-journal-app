import { format, parseISO } from 'date-fns';

export const formatDate = (dateString: string, formatString: string = 'MMM d, yyyy'): string => {
  try {
    return format(parseISO(dateString), formatString);
  } catch {
    return dateString;
  }
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getStoragePath = (userId: string, campgroundId: string, filename: string): string => {
  const timestamp = Date.now();
  return `${userId}/${campgroundId}/${timestamp}-${filename}`;
};

/**
 * Convert a YouTube URL to an embeddable format
 * Supports:
 * - youtube.com/watch?v=VIDEO_ID
 * - youtu.be/VIDEO_ID
 * - youtube.com/embed/VIDEO_ID (already embed format)
 */
export const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  try {
    const urlObj = new URL(url);

    // Already an embed URL
    if (urlObj.pathname.includes('/embed/')) {
      return url;
    }

    // Extract video ID from different YouTube URL formats
    let videoId: string | null = null;

    // youtu.be/VIDEO_ID
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    }
    // youtube.com/watch?v=VIDEO_ID
    else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v');
    }

    if (videoId) {
      // Extract timestamp if present (t=123 or start=123)
      const timeParam = urlObj.searchParams.get('t') || urlObj.searchParams.get('start');
      const timeQuery = timeParam ? `?start=${timeParam.replace('s', '')}` : '';
      return `https://www.youtube.com/embed/${videoId}${timeQuery}`;
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Check if a URL is a valid video URL (YouTube or direct video)
 */
export const isValidVideoUrl = (url: string): boolean => {
  if (!url) return false;

  try {
    const urlObj = new URL(url);

    // Check for YouTube
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname === 'youtu.be') {
      return true;
    }

    // Check for Vimeo
    if (urlObj.hostname.includes('vimeo.com')) {
      return true;
    }

    // Check for direct video files
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};
