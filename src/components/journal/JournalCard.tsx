import { Link, useNavigate } from 'react-router-dom';
import { formatDate, getInitials, getYouTubeEmbedUrl } from '../../utils/helpers';
import type { JournalEntry } from '../../types/journal';
import type { JournalEntryWithProfile } from '../../types/journal';

interface JournalCardProps {
  entry: JournalEntry | JournalEntryWithProfile;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  showProfile?: boolean;
  showCampground?: boolean;
  isDraft?: boolean;
  onAcceptDraft?: (id: string) => void;
  onRejectDraft?: (id: string) => void;
}

export const JournalCard = ({ entry, onDelete, onEdit, showProfile = false, showCampground = true, isDraft = false, onAcceptDraft, onRejectDraft }: JournalCardProps) => {
  const navigate = useNavigate();
  const entryWithProfile = entry as JournalEntryWithProfile;
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm('Remove this entry from your passport?')) {
      onDelete?.(entry.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    onEdit?.(entry.id);
  };

  return (
    <div className="bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden group">
      <Link to={`/journal-entry/${entry.id}`}>
        {/* Photo Gallery */}
        {entry.photos && entry.photos.length > 0 && (
          <div className="relative h-48 bg-sand-100 overflow-hidden">
            {entry.photos.length === 1 ? (
              <img
                src={entry.photos[0].public_url}
                alt={entry.photos[0].caption || 'Campground photo'}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="grid grid-cols-2 gap-1 h-full">
                {entry.photos.slice(0, 4).map((photo, idx) => (
                  <div key={photo.id} className="relative overflow-hidden">
                    <img
                      src={photo.public_url}
                      alt={photo.caption || `Photo ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {idx === 3 && entry.photos!.length > 4 && (
                      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          +{entry.photos!.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Draft Badge Overlay */}
            {isDraft && (
              <div className="absolute top-3 left-3 bg-pine-500/90 backdrop-blur-sm px-3 py-1 rounded-badge shadow-stamp">
                <span className="text-sm font-medium text-white">📥 Draft</span>
              </div>
            )}

            {/* Shared With Avatar Overlay */}
            {entry.shared_with_profile && (
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <div
                  className={`transition-opacity ${
                    entry.shared_accepted === false ? 'opacity-40' : 'opacity-100'
                  }`}
                  title={
                    entry.shared_accepted === false
                      ? `Shared with @${entry.shared_with_profile.username} (pending)`
                      : entry.shared_accepted === true
                      ? `Shared with @${entry.shared_with_profile.username} (accepted)`
                      : `Shared with @${entry.shared_with_profile.username}`
                  }
                >
                  {entry.shared_with_profile.avatar_url ? (
                    <img
                      src={entry.shared_with_profile.avatar_url}
                      alt={entry.shared_with_profile.username}
                      loading="lazy"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center border-2 border-white shadow-md">
                      <span className="text-sm font-bold text-white">
                        {getInitials(entry.shared_with_profile.full_name || entry.shared_with_profile.username)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Favorite Badge Overlay */}
            {entry.is_favorite && (
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-badge shadow-stamp">
                <span className="text-sm font-medium text-brand-500">⭐ Favorite</span>
              </div>
            )}

            {/* Video Badge */}
            {entry.video_url && (
              <div className="absolute bottom-3 left-3 bg-ink/80 backdrop-blur-sm px-3 py-1 rounded-badge shadow-stamp">
                <span className="text-sm font-medium text-white">🎥 Video</span>
              </div>
            )}
          </div>
        )}

        {/* No photos - show video or placeholder */}
        {(!entry.photos || entry.photos.length === 0) && (
          <div className="relative h-48 bg-sand-100">
            {entry.video_url && (() => {
              const embedUrl = getYouTubeEmbedUrl(entry.video_url);
              if (embedUrl) {
                return (
                  <iframe
                    src={embedUrl}
                    title="Journal entry video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                );
              }
              return null;
            })() || (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-5xl mb-2 block">🏕️</span>
                </div>
              </div>
            )}

            {/* Draft Badge Overlay */}
            {isDraft && (
              <div className="absolute top-3 left-3 bg-pine-500/90 backdrop-blur-sm px-3 py-1 rounded-badge shadow-stamp">
                <span className="text-sm font-medium text-white">📥 Draft</span>
              </div>
            )}

            {/* Favorite Badge Overlay */}
            {entry.is_favorite && (
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-badge shadow-stamp">
                <span className="text-sm font-medium text-brand-500">⭐ Favorite</span>
              </div>
            )}
          </div>
        )}

        <div className="p-5">
          {/* Profile Info */}
          {showProfile && entryWithProfile.profile && (
            <div
              className="flex items-center gap-3 mb-4 group/profile cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/profile/${entryWithProfile.profile.username}`);
              }}
            >
              {entryWithProfile.profile.avatar_url ? (
                <img
                  src={entryWithProfile.profile.avatar_url}
                  alt={entryWithProfile.profile.username}
                  loading="lazy"
                  className="w-10 h-10 rounded-full object-cover border-2 border-sand-200 group-hover/profile:border-brand-500 transition-colors"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center border-2 border-sand-200 group-hover/profile:border-brand-600 transition-colors">
                  <span className="text-sm font-bold text-white">
                    {getInitials(entryWithProfile.profile.full_name || entryWithProfile.profile.username)}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-ink group-hover/profile:text-brand-500 transition-colors">
                  {entryWithProfile.profile.full_name || entryWithProfile.profile.username}
                </p>
                <p className="text-xs text-ink-lighter">
                  @{entryWithProfile.profile.username}
                </p>
              </div>
            </div>
          )}

          {/* Title */}
          {showCampground && (
            <>
              <h3 className="text-lg font-semibold text-ink mb-1 leading-snug">
                {entry.campground?.name || 'Unknown Campground'}
              </h3>

              {/* Location */}
              <p className="text-sm text-ink-lighter mb-3">
                {entry.campground?.address || 'No address'}
              </p>
            </>
          )}

          {/* Visit Date Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-3 py-1 bg-pine-50 text-pine-700 text-xs font-medium rounded-badge border border-pine-200">
              📍 {entry.start_date === entry.end_date
                ? `Visited ${formatDate(entry.start_date, 'MMM d, yyyy')}`
                : `${formatDate(entry.start_date, 'MMM d')} - ${formatDate(entry.end_date, 'MMM d, yyyy')}`
              }
            </span>
          </div>

          {/* Shared From Attribution */}
          {entry.shared_from_profile && (
            <div className="text-xs text-ink-lighter mb-3">
              Shared by{' '}
              <button
                className="text-brand-500 hover:text-brand-600 font-medium transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/profile/${entry.shared_from_profile.username}`);
                }}
              >
                @{entry.shared_from_profile.username}
              </button>
            </div>
          )}

          {/* Shared With Attribution */}
          {entry.shared_with_profile && (
            <div className="text-xs text-ink-lighter mb-3">
              Shared with{' '}
              <button
                className="text-brand-500 hover:text-brand-600 font-medium transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/profile/${entry.shared_with_profile.username}`);
                }}
              >
                @{entry.shared_with_profile.username}
              </button>
              {entry.shared_accepted === false && (
                <span className="text-amber-600 ml-1">(pending)</span>
              )}
              {entry.shared_accepted === true && (
                <span className="text-pine-600 ml-1">✓ accepted</span>
              )}
            </div>
          )}

          {/* Notes Preview */}
          {entry.notes && (
            <p className="text-sm text-ink-light line-clamp-2 leading-relaxed">
              {entry.notes}
            </p>
          )}
        </div>
      </Link>

      {(onDelete || onEdit || (isDraft && onAcceptDraft && onRejectDraft)) && (
        <div className="px-5 py-3 bg-sand-50 border-t border-sand-200 flex justify-end gap-4">
          {isDraft && onAcceptDraft && onRejectDraft ? (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onAcceptDraft(entry.id);
                }}
                className="text-sm text-pine-600 hover:text-pine-700 font-medium transition-colors"
              >
                Accept
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (confirm('Reject this draft? This cannot be undone.')) {
                    onRejectDraft(entry.id);
                  }
                }}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                Reject
              </button>
            </>
          ) : (
            <>
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="text-sm text-pine-600 hover:text-pine-700 font-medium transition-colors"
                >
                  Edit Entry
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
                >
                  Remove Entry
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
