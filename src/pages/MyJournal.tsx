import { useState } from 'react';
import { useJournal } from '../hooks/useJournal';
import { JournalCard } from '../components/journal/JournalCard';
import { JournalEntryForm } from '../components/journal/JournalEntryForm';
import { storageService } from '../services/storage.service';
import { journalService } from '../services/journal.service';
import { useAuth } from '../context/AuthContext';
import type { JournalEntry } from '../types/journal';
import type { Profile } from '../types/user';

export const MyJournal = () => {
  const { user } = useAuth();
  const { entries, loading, error, deleteEntry, updateEntry, refresh } = useJournal();
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');

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
    shareWithUser?: Profile | null;
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

      // Share with friend if selected
      if (data.shareWithUser) {
        try {
          console.log('Sharing entry with:', data.shareWithUser.username);
          await journalService.shareJournalEntry(
            editingEntry.id,
            data.shareWithUser.id,
            user.id
          );
          console.log('Share successful!');
        } catch (shareError) {
          console.error('Error sharing:', shareError);
          alert(`Failed to share: ${shareError instanceof Error ? shareError.message : 'Unknown error'}`);
        }
      }

      // Refresh entries to get updated data with photos
      await refresh();
      setEditingEntry(null);
    } catch (err) {
      throw err;
    }
  };

  const handleAcceptDraft = async (entryId: string) => {
    if (!user) return;
    try {
      await journalService.acceptDraft(entryId, user.id);
      await refresh();
    } catch (err) {
      console.error('Error accepting draft:', err);
    }
  };

  const handleRejectDraft = async (entryId: string) => {
    if (!user) return;
    if (!confirm('Permanently delete this draft? This cannot be undone.')) return;
    try {
      await journalService.rejectDraft(entryId, user.id);
      await refresh();
    } catch (err) {
      console.error('Error rejecting draft:', err);
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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-sand-200 mb-6">
        <button
          onClick={() => setActiveTab('published')}
          className={`px-6 py-3 font-medium relative transition-colors ${
            activeTab === 'published' ? 'text-brand-500' : 'text-ink-lighter hover:text-ink'
          }`}
        >
          Published ({entries.filter(e => e.status === 'published').length})
          {activeTab === 'published' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('drafts')}
          className={`px-6 py-3 font-medium relative transition-colors ${
            activeTab === 'drafts' ? 'text-brand-500' : 'text-ink-lighter hover:text-ink'
          }`}
        >
          Drafts ({entries.filter(e => e.status === 'draft').length})
          {activeTab === 'drafts' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />
          )}
        </button>
      </div>

      {(() => {
        const publishedEntries = entries.filter(e => e.status === 'published');
        const draftEntries = entries.filter(e => e.status === 'draft');
        const displayedEntries = activeTab === 'published' ? publishedEntries : draftEntries;

        if (displayedEntries.length === 0) {
          return (
            <div className="bg-white rounded-card shadow-soft p-12 text-center max-w-md mx-auto">
              <div className="text-6xl mb-4">{activeTab === 'published' ? '🏕️' : '📥'}</div>
              <h3 className="text-xl font-display font-semibold text-ink mb-2">
                {activeTab === 'published' ? 'Your adventure awaits' : 'No drafts yet'}
              </h3>
              <p className="text-base text-ink-light mb-6 leading-relaxed">
                {activeTab === 'published'
                  ? 'Start logging your campground visits and build your own travel passport.'
                  : 'When friends share journal entries with you, they will appear here.'}
              </p>
              {activeTab === 'published' && (
                <a
                  href="/search"
                  className="inline-block px-6 py-3 bg-brand-500 text-white font-medium rounded-button hover:bg-brand-600 transition-colors"
                >
                  Find a Campground
                </a>
              )}
            </div>
          );
        }

        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedEntries.map((entry) => (
              <JournalCard
                key={entry.id}
                entry={entry}
                onDelete={deleteEntry}
                onEdit={handleEdit}
                isDraft={entry.status === 'draft'}
                onAcceptDraft={handleAcceptDraft}
                onRejectDraft={handleRejectDraft}
              />
            ))}
          </div>
        );
      })()}
      </div>
    </>
  );
};
