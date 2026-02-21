import { useState } from 'react';
import type { Campground } from '../../types/campground';
import type { Photo } from '../../types/journal';
import type { Profile } from '../../types/user';
import { ImageUpload } from '../common/ImageUpload';
import { UserSearchSelector } from './UserSearchSelector';
import { getInitials } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

interface JournalEntryFormProps {
  campground: Campground;
  onSubmit: (data: {
    start_date: string;
    end_date: string;
    notes: string;
    video_url: string;
    is_favorite: boolean;
    photos?: File[];
    photosToDelete?: string[];
    shareWithUser?: Profile | null;
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: { start_date: string; end_date: string; notes: string; video_url?: string; is_favorite: boolean };
  existingPhotos?: Photo[];
}

export const JournalEntryForm = ({
  campground,
  onSubmit,
  onCancel,
  initialData,
  existingPhotos = [],
}: JournalEntryFormProps) => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(
    initialData?.start_date || today
  );
  const [endDate, setEndDate] = useState(
    initialData?.end_date || today
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url || '');
  const [isFavorite, setIsFavorite] = useState(initialData?.is_favorite || false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);
  const [shareWithUser, setShareWithUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate date range
    if (endDate < startDate) {
      setError('End date must be after or same as start date');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        start_date: startDate,
        end_date: endDate,
        notes,
        video_url: videoUrl,
        is_favorite: isFavorite,
        photos: photos.length > 0 ? photos : undefined,
        photosToDelete: photosToDelete.length > 0 ? photosToDelete : undefined,
        shareWithUser,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
      setLoading(false);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotosToDelete([...photosToDelete, photoId]);
  };

  return (
    <div className="bg-white rounded-card shadow-card p-6 md:p-8 max-h-[90vh] overflow-y-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-ink mb-2">
            {initialData ? 'Edit Journal Entry' : 'Log Your Visit'}
          </h2>
          <p className="text-sm text-ink-light">
            Add this campground to your travel passport
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-ink-lighter hover:text-ink transition-colors"
          type="button"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-6 p-4 bg-sand-50 rounded-button border border-sand-200">
        <div className="flex items-start gap-2">
          <span className="text-2xl">🏕️</span>
          <div>
            <p className="font-semibold text-ink">{campground.name}</p>
            <p className="text-sm text-ink-light">{campground.address}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-button bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-ink mb-2">
              Check-in Date
            </label>
            <input
              type="date"
              id="start_date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-4 py-3 border border-sand-300 text-ink rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-ink mb-2">
              Check-out Date
            </label>
            <input
              type="date"
              id="end_date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              min={startDate}
              className="w-full px-4 py-3 border border-sand-300 text-ink rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-ink mb-2">
            Notes <span className="text-ink-lighter font-normal">(optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="How was your stay? Any tips for future visitors?"
            className="w-full px-4 py-3 border border-sand-300 placeholder-ink-lighter text-ink rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors resize-none"
          />
        </div>

        <div>
          <label htmlFor="video_url" className="block text-sm font-medium text-ink mb-2">
            Video URL <span className="text-ink-lighter font-normal">(optional)</span>
          </label>
          <input
            type="url"
            id="video_url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-4 py-3 border border-sand-300 placeholder-ink-lighter text-ink rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
          <p className="text-xs text-ink-lighter mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Paste a YouTube link from your camping trip
          </p>
        </div>

        {/* Existing Photos */}
        {existingPhotos.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Existing Photos
            </label>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {existingPhotos
                .filter(photo => !photosToDelete.includes(photo.id))
                .map(photo => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.public_url}
                      alt={photo.caption || 'Photo'}
                      className="w-full h-24 object-cover rounded-button border border-sand-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Delete photo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        <ImageUpload
          onFilesSelected={setPhotos}
          maxFiles={5}
        />

        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            Share with friend <span className="text-ink-lighter font-normal">(optional)</span>
          </label>

          {shareWithUser ? (
            <div className="flex items-center justify-between p-3 bg-brand-50 rounded-button border border-brand-200">
              <div className="flex items-center gap-3">
                {shareWithUser.avatar_url ? (
                  <img
                    src={shareWithUser.avatar_url}
                    alt={shareWithUser.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-sand-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center border-2 border-brand-200">
                    <span className="text-sm font-bold text-white">
                      {getInitials(shareWithUser.full_name || shareWithUser.username)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-ink">
                    {shareWithUser.full_name || shareWithUser.username}
                  </div>
                  <div className="text-xs text-ink-lighter">@{shareWithUser.username}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShareWithUser(null)}
                className="text-ink-lighter hover:text-ink transition-colors"
                title="Remove"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <UserSearchSelector
              onSelect={setShareWithUser}
              excludeUserId={user?.id}
            />
          )}

          <p className="text-xs text-ink-lighter mt-2">Your friend will receive this as a draft</p>
        </div>

        <div className="flex items-center gap-3 p-4 bg-brand-50 rounded-button border border-brand-200">
          <input
            type="checkbox"
            id="is_favorite"
            checked={isFavorite}
            onChange={(e) => setIsFavorite(e.target.checked)}
            className="h-5 w-5 text-brand-500 focus:ring-brand-500 border-sand-300 rounded"
          />
          <label htmlFor="is_favorite" className="block text-sm font-medium text-ink cursor-pointer">
            Mark as favorite ⭐
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-brand-500 text-white font-medium rounded-button hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md active:scale-98"
          >
            {loading ? 'Saving...' : initialData ? 'Update Entry' : 'Save to Journal'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-white text-ink font-medium rounded-button border-2 border-sand-300 hover:border-brand-300 hover:bg-sand-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sand-300 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
