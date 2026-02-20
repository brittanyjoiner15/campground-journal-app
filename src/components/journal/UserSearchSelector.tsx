import { useState, useEffect, useRef } from 'react';
import { userService } from '../../services/user.service';
import { getInitials } from '../../utils/helpers';
import type { Profile } from '../../types/user';

interface UserSearchSelectorProps {
  onSelect: (user: Profile) => void;
  excludeUserId?: string;
}

export const UserSearchSelector = ({ onSelect, excludeUserId }: UserSearchSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setTimeout(() => setShowDropdown(false), 200);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await userService.searchUsers(searchQuery);
        // Filter out excluded user
        const filteredResults = excludeUserId
          ? results.filter(user => user.id !== excludeUserId)
          : results;
        setSearchResults(filteredResults);
        setShowDropdown(true);
      } catch (err) {
        console.error('Error searching users:', err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, excludeUserId]);

  const handleUserClick = (user: Profile) => {
    setSearchQuery('');
    setShowDropdown(false);
    onSelect(user);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by username..."
          className="w-full pl-10 pr-4 py-2 border border-sand-200 rounded-button focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-lighter"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-sand-200 rounded-card shadow-card max-h-80 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-ink-lighter">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-ink-lighter">No users found</div>
          ) : (
            <div className="py-2">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sand-50 transition-colors text-left"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-sand-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center border-2 border-brand-200">
                      <span className="text-sm font-bold text-white">
                        {getInitials(user.full_name || user.username)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink truncate">
                      {user.full_name || user.username}
                    </div>
                    <div className="text-xs text-ink-lighter truncate">@{user.username}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
