import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';
import type { JournalEntry } from '../../types/journal';

interface JournalCardProps {
  entry: JournalEntry;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export const JournalCard = ({ entry, onDelete, onEdit }: JournalCardProps) => {
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
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="grid grid-cols-2 gap-1 h-full">
                {entry.photos.slice(0, 4).map((photo, idx) => (
                  <div key={photo.id} className="relative overflow-hidden">
                    <img
                      src={photo.public_url}
                      alt={photo.caption || `Photo ${idx + 1}`}
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

            {/* Favorite Badge Overlay */}
            {entry.is_favorite && (
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-badge shadow-stamp">
                <span className="text-sm font-medium text-brand-500">⭐ Favorite</span>
              </div>
            )}
          </div>
        )}

        <div className="p-5">
          {/* Title */}
          <h3 className="text-lg font-semibold text-ink mb-1 leading-snug">
            {entry.campground?.name || 'Unknown Campground'}
          </h3>

          {/* Location */}
          <p className="text-sm text-ink-lighter mb-3">
            {entry.campground?.address || 'No address'}
          </p>

          {/* Visit Date Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-3 py-1 bg-pine-50 text-pine-700 text-xs font-medium rounded-badge border border-pine-200">
              📍 {entry.start_date === entry.end_date
                ? `Visited ${formatDate(entry.start_date, 'MMM d, yyyy')}`
                : `${formatDate(entry.start_date, 'MMM d')} - ${formatDate(entry.end_date, 'MMM d, yyyy')}`
              }
            </span>
          </div>

          {/* Notes Preview */}
          {entry.notes && (
            <p className="text-sm text-ink-light line-clamp-2 leading-relaxed">
              {entry.notes}
            </p>
          )}
        </div>
      </Link>

      {(onDelete || onEdit) && (
        <div className="px-5 py-3 bg-sand-50 border-t border-sand-200 flex justify-end gap-4">
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
        </div>
      )}
    </div>
  );
};
