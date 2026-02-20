import { useState } from 'react';
import { useJournal } from '../hooks/useJournal';
import { JournalCard } from '../components/journal/JournalCard';
import { JournalEntryForm } from '../components/journal/JournalEntryForm';
import { storageService } from '../services/storage.service';
import { useAuth } from '../context/AuthContext';
import type { JournalEntry } from '../types/journal';

export const MyJournal = () => {
  const { user } = useAuth();
  const { entries, loading, error, deleteEntry, updateEntry, refresh } = useJournal();
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const handleEdit = (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      setEditingEntry(entry);
    }
  };

  const handleUpdateEntry = async (data: {
    start_date: string;
    end_date: string;
    notes: string;
    is_favorite: boolean;
    photos?: File[];
    photosToDelete?: string[];
  }) => {
    if (!editingEntry || !user) return;

    try {
      // Update the entry
      await updateEntry(editingEntry.id, {
        start_date: data.start_date,
        end_date: data.end_date,
        notes: data.notes,
        is_favorite: data.is_favorite,
      });

      // Delete photos if requested
      if (data.photosToDelete && data.photosToDelete.length > 0) {
        for (const photoId of data.photosToDelete) {
          const photo = editingEntry.photos?.find(p => p.id === photoId);
          if (photo) {
            try {
              await storageService.deletePhoto(photo.storage_path);
              await storageService.deletePhotoRecord(photoId);
            } catch (err) {
              console.error('Failed to delete photo:', err);
            }
          }
        }
      }

      // Upload new photos if provided
      if (data.photos && data.photos.length > 0) {
        for (const photo of data.photos) {
          try {
            const { path, url } = await storageService.uploadPhoto(
              photo,
              user.id,
              editingEntry.campground_id
            );

            await storageService.savePhotoRecord(
              user.id,
              editingEntry.campground_id,
              editingEntry.id,
              path,
              url
            );
          } catch (err) {
            console.error('Failed to upload photo:', err);
          }
        }
      }

      // Refresh entries to get updated data with photos
      await refresh();
      setEditingEntry(null);
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Edit Modal */}
      {editingEntry && editingEntry.campground && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <JournalEntryForm
              campground={editingEntry.campground}
              onSubmit={handleUpdateEntry}
              onCancel={() => setEditingEntry(null)}
              initialData={{
                start_date: editingEntry.start_date,
                end_date: editingEntry.end_date,
                notes: editingEntry.notes || '',
                is_favorite: editingEntry.is_favorite,
              }}
              existingPhotos={editingEntry.photos}
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-ink mb-2 tracking-tight">My Travel Journal</h1>
        <p className="text-ink-light text-base">
          {entries.length} {entries.length === 1 ? 'campground' : 'campgrounds'} in your passport
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-card shadow-soft p-12 text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">🏕️</div>
          <h3 className="text-xl font-display font-semibold text-ink mb-2">
            Your adventure awaits
          </h3>
          <p className="text-base text-ink-light mb-6 leading-relaxed">
            Start logging your campground visits and build your own travel passport.
          </p>
          <a
            href="/search"
            className="inline-block px-6 py-3 bg-brand-500 text-white font-medium rounded-button hover:bg-brand-600 transition-colors"
          >
            Find a Campground
          </a>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <JournalCard key={entry.id} entry={entry} onDelete={deleteEntry} onEdit={handleEdit} />
          ))}
        </div>
      )}
      </div>
    </>
  );
};
