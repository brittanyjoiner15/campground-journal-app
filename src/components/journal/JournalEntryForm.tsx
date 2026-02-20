import { useState } from 'react';
import type { Campground } from '../../types/campground';
import { ImageUpload } from '../common/ImageUpload';

interface JournalEntryFormProps {
  campground: Campground;
  onSubmit: (data: {
    start_date: string;
    end_date: string;
    notes: string;
    is_favorite: boolean;
    photos?: File[];
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: { start_date: string; end_date: string; notes: string; is_favorite: boolean };
}

export const JournalEntryForm = ({
  campground,
  onSubmit,
  onCancel,
  initialData,
}: JournalEntryFormProps) => {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(
    initialData?.start_date || today
  );
  const [endDate, setEndDate] = useState(
    initialData?.end_date || today
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isFavorite, setIsFavorite] = useState(initialData?.is_favorite || false);
  const [photos, setPhotos] = useState<File[]>([]);
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
        is_favorite: isFavorite,
        photos: photos.length > 0 ? photos : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
      setLoading(false);
    }
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

        <ImageUpload
          onFilesSelected={setPhotos}
          maxFiles={5}
        />

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
