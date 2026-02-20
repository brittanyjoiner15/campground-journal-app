import { useState } from 'react';
import { CampgroundSearch } from '../components/campground/CampgroundSearch';
import { CampgroundCard } from '../components/campground/CampgroundCard';
import type { GooglePlaceResult } from '../types/campground';

export const Search = () => {
  const [results, setResults] = useState<GooglePlaceResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleResultsChange = (newResults: GooglePlaceResult[]) => {
    setResults(newResults);
    setHasSearched(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-ink mb-2 tracking-tight">
          Discover Campgrounds
        </h1>
        <p className="text-ink-light text-base">
          Search thousands of campgrounds and RV parks across the country
        </p>
      </div>

      <CampgroundSearch
        onResultsChange={handleResultsChange}
        onSelectCampground={() => {}}
      />

      <div className="mt-8">
        {hasSearched && (
          <>
            {results.length > 0 ? (
              <>
                <h2 className="text-xl md:text-2xl font-display font-semibold text-ink mb-6">
                  Found {results.length} campground{results.length !== 1 ? 's' : ''}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {results.map((campground) => (
                    <CampgroundCard
                      key={campground.place_id}
                      campground={campground}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-card shadow-soft p-12 text-center max-w-md mx-auto">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-ink-light leading-relaxed">
                  No campgrounds found. Try a different search term or location.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
