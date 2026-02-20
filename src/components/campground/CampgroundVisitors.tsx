import { Link } from 'react-router-dom';
import type { Profile } from '../../types/user';
import { getInitials } from '../../utils/helpers';

interface CampgroundVisitorsProps {
  visitors: Profile[];
}

export const CampgroundVisitors = ({ visitors }: CampgroundVisitorsProps) => {
  if (visitors.length === 0) {
    return null;
  }

  const displayedVisitors = visitors.slice(0, 8);
  const remainingCount = visitors.length - 8;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {displayedVisitors.map((visitor) => (
        <Link
          key={visitor.id}
          to={`/profile/${visitor.username}`}
          className="group relative"
          title={visitor.full_name || visitor.username}
        >
          {visitor.avatar_url ? (
            <img
              src={visitor.avatar_url}
              alt={visitor.username}
              className="w-9 h-9 rounded-full object-cover border-2 border-sand-200 group-hover:border-brand-500 transition-all group-hover:scale-110"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center border-2 border-sand-200 group-hover:border-brand-600 transition-all group-hover:scale-110">
              <span className="text-xs font-bold text-white">
                {getInitials(visitor.full_name || visitor.username)}
              </span>
            </div>
          )}
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-ink text-white text-xs rounded-button whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {visitor.full_name || visitor.username}
          </div>
        </Link>
      ))}
      {remainingCount > 0 && (
        <div className="w-9 h-9 rounded-full bg-sand-200 flex items-center justify-center border-2 border-sand-300">
          <span className="text-xs font-semibold text-ink-light">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
};
