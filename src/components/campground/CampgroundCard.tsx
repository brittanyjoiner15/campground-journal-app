import { Link } from 'react-router-dom';
import type { GooglePlaceResult } from '../../types/campground';

interface CampgroundCardProps {
  campground: GooglePlaceResult;
}

export const CampgroundCard = ({ campground }: CampgroundCardProps) => {
  return (
    <Link
      to={`/campground/${campground.place_id}`}
      className="block bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-200 p-5 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-ink mb-2 leading-snug group-hover:text-brand-500 transition-colors">
            {campground.name}
          </h3>
          <p className="text-sm text-ink-lighter mb-3 leading-relaxed">
            {campground.formatted_address}
          </p>
          {campground.rating && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 rounded-badge border border-brand-200">
              <span className="text-brand-500">⭐</span>
              <span className="text-sm font-medium text-brand-700">
                {campground.rating}
              </span>
              <span className="text-xs text-brand-600">
                Google
              </span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 pt-1">
          <svg
            className="w-5 h-5 text-ink-lighter group-hover:text-brand-500 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
};
