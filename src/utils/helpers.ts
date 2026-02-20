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
