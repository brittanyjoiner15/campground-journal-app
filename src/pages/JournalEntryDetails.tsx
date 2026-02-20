import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { journalService } from '../services/journal.service';
import { storageService } from '../services/storage.service';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import { JournalEntryForm } from '../components/journal/JournalEntryForm';
import type { JournalEntry } from '../types/journal';

export const JournalEntryDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadEntry = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await journalService.getJournalEntryById(id);
        setEntry(data);
      } catch (err) {
        console.error('Error loading journal entry:', err);
        setError('Failed to load journal entry');
      } finally {
        setLoading(false);
      }
    };

    loadEntry();
  }, [id]);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!entry?.photos || entry.photos.length <= 1) return;

    const minSwipeDistance = 50;
    const distance = touchStart - touchEnd;

    if (distance > minSwipeDistance) {
      // Swiped left - next photo
      setSelectedPhotoIndex((prev) => (prev + 1) % entry.photos!.length);
    } else if (distance < -minSwipeDistance) {
      // Swiped right - previous photo
      setSelectedPhotoIndex((prev) => (prev - 1 + entry.photos!.length) % entry.photos!.length);
    }
  };

  const handleUpdateEntry = async (data: {
    start_date: string;
    end_date: string;
    notes: string;
    is_favorite: boolean;
    photos?: File[];
  }) => {
    if (!entry || !user) return;

    try {
      // Update the entry
      await journalService.updateJournalEntry(entry.id, {
        start_date: data.start_date,
        end_date: data.end_date,
        notes: data.notes,
        is_favorite: data.is_favorite,
      });

      // Upload new photos if provided
      if (data.photos && data.photos.length > 0) {
        for (const photo of data.photos) {
          try {
            const { path, url } = await storageService.uploadPhoto(
              photo,
              user.id,
              entry.campground_id
            );

            await storageService.savePhotoRecord(
              user.id,
              entry.campground_id,
              entry.id,
              path,
              url
            );
          } catch (err) {
            console.error('Failed to upload photo:', err);
          }
        }
      }

      // Refresh the entry
      const updatedEntry = await journalService.getJournalEntryById(entry.id);
      setEntry(updatedEntry);
      setIsEditing(false);
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-card p-6">
          <p className="text-red-800">{error || 'Journal entry not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-brand-500 hover:text-brand-600 font-medium"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === entry.user_id;

  return (
    <>
      {/* Edit Modal */}
      {isEditing && entry && entry.campground && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <JournalEntryForm
              campground={entry.campground}
              onSubmit={handleUpdateEntry}
              onCancel={() => setIsEditing(false)}
              initialData={{
                start_date: entry.start_date,
                end_date: entry.end_date,
                notes: entry.notes || '',
                is_favorite: entry.is_favorite,
              }}
            />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-brand-500 hover:text-brand-600 font-medium inline-flex items-center transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {isOwner && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-brand-500 text-white font-medium rounded-button hover:bg-brand-600 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        )}
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        {/* Photo Gallery */}
        {entry.photos && entry.photos.length > 0 ? (
          <div className="relative">
            {/* Main Photo */}
            <div
              className="aspect-video bg-sand-100 overflow-hidden touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={entry.photos[selectedPhotoIndex].public_url}
                alt={entry.photos[selectedPhotoIndex].caption || 'Journal photo'}
                className="w-full h-full object-cover select-none"
              />
            </div>

            {/* Photo Navigation */}
            {entry.photos.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedPhotoIndex((prev) => (prev - 1 + entry.photos!.length) % entry.photos!.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                >
                  <svg className="w-6 h-6 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedPhotoIndex((prev) => (prev + 1) % entry.photos!.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                >
                  <svg className="w-6 h-6 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Photo Counter */}
                <div className="absolute bottom-4 right-4 bg-ink/60 backdrop-blur-sm text-white px-3 py-1 rounded-badge text-sm">
                  {selectedPhotoIndex + 1} / {entry.photos.length}
                </div>
              </>
            )}

            {/* Favorite Badge */}
            {entry.is_favorite && (
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-badge shadow-stamp">
                <span className="text-sm font-medium text-brand-500">⭐ Favorite</span>
              </div>
            )}

            {/* Thumbnail Strip */}
            {entry.photos.length > 1 && (
              <div className="absolute bottom-4 left-4 flex gap-2 overflow-x-auto max-w-[calc(100%-120px)]">
                {entry.photos.map((photo, idx) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-button overflow-hidden border-2 transition-all ${
                      idx === selectedPhotoIndex
                        ? 'border-white scale-110'
                        : 'border-white/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo.public_url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video bg-sand-100 flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl mb-2 block">📷</span>
              <p className="text-ink-lighter">No photos for this entry</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Campground Info */}
          <Link
            to={`/campground/${entry.campground?.google_place_id || entry.campground_id}`}
            className="group mb-6 block"
          >
            <div className="flex items-start gap-3 p-4 bg-sand-50 rounded-button border border-sand-200 hover:border-brand-300 transition-colors">
              <span className="text-2xl">🏕️</span>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-display font-semibold text-ink mb-1 group-hover:text-brand-500 transition-colors">
                  {entry.campground?.name || 'Unknown Campground'}
                </h2>
                <p className="text-sm text-ink-light">
                  {entry.campground?.address || 'No address'}
                </p>
              </div>
              <svg className="w-5 h-5 text-ink-lighter group-hover:text-brand-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Date Range */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-ink-lighter mb-2">Visit Dates</h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 bg-pine-50 text-pine-700 text-sm font-medium rounded-badge border border-pine-200">
                📅 {entry.start_date === entry.end_date
                  ? formatDate(entry.start_date, 'MMM d, yyyy')
                  : `${formatDate(entry.start_date, 'MMM d')} - ${formatDate(entry.end_date, 'MMM d, yyyy')}`
                }
              </span>
            </div>
          </div>

          {/* Notes */}
          {entry.notes && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-ink-lighter mb-2">Notes</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-ink-light leading-relaxed whitespace-pre-wrap">{entry.notes}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          {isOwner && (
            <div className="pt-6 border-t border-sand-200">
              <Link
                to="/journal"
                className="text-brand-500 hover:text-brand-600 font-medium text-sm transition-colors"
              >
                View all journal entries →
              </Link>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};
