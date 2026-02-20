export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  SEARCH: '/search',
  CAMPGROUND_DETAIL: '/campground/:id',
  MY_JOURNAL: '/journal',
  PROFILE: '/profile/:username',
  PROFILE_EDIT: '/profile/edit',
} as const;

export const STORAGE_BUCKETS = {
  CAMPGROUND_PHOTOS: 'campground-photos',
  AVATARS: 'avatars',
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
