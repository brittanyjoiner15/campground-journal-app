import { useState } from 'react';
import { googleMapsService } from '../../services/googleMaps.service';
import type { GooglePlaceResult } from '../../types/campground';

interface CampgroundSearchProps {
  onResultsChange: (results: GooglePlaceResult[]) => void;
  onSelectCampground: (campground: GooglePlaceResult) => void;
}

export const CampgroundSearch = ({ onResultsChange, onSelectCampground }: CampgroundSearchProps) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const results = await googleMapsService.searchCampgrounds(query);
      onResultsChange(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      onResultsChange([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-card shadow-card p-6 md:p-8">
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-ink mb-3">
            Where do you want to go?
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Yosemite, California campgrounds, RV parks near me..."
              className="flex-1 px-4 py-3 border border-sand-300 placeholder-ink-lighter text-ink rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-brand-500 text-white font-medium rounded-button hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md active:scale-98"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-button bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
};
