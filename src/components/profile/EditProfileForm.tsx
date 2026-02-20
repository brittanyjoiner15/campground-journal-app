import { useState, useRef } from 'react';
import type { Profile } from '../../types/user';
import { getInitials } from '../../utils/helpers';

interface EditProfileFormProps {
  profile: Profile;
  onSubmit: (data: {
    full_name: string;
    bio: string;
    website: string;
    avatar?: File;
  }) => Promise<void>;
  onCancel: () => void;
}

export const EditProfileForm = ({ profile, onSubmit, onCancel }: EditProfileFormProps) => {
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are allowed');
      return;
    }

    setAvatarFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit({
        full_name: fullName,
        bio,
        website,
        avatar: avatarFile || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-card shadow-card p-6 md:p-8 max-h-[90vh] overflow-y-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-ink mb-2">
            Edit Profile
          </h2>
          <p className="text-sm text-ink-light">
            Update your profile information
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-ink-lighter hover:text-ink transition-colors"
          type="button"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-button bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium text-ink mb-3">
            Profile Picture
          </label>
          <div className="flex items-center gap-4">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-20 h-20 rounded-full object-cover border-4 border-sand-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center border-4 border-brand-200">
                <span className="text-2xl font-bold text-white">
                  {getInitials(profile.full_name || profile.username)}
                </span>
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-sand-100 text-ink font-medium rounded-button hover:bg-sand-200 transition-colors border border-sand-300"
              >
                Choose Image
              </button>
              <p className="text-xs text-ink-lighter mt-1">
                JPG, PNG or WebP. Max 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-ink mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-4 py-3 border border-sand-300 text-ink rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-ink mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell us about yourself and your camping adventures..."
            maxLength={500}
            className="w-full px-4 py-3 border border-sand-300 placeholder-ink-lighter text-ink rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors resize-none"
          />
          <p className="text-xs text-ink-lighter mt-1">
            {bio.length}/500 characters
          </p>
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-ink mb-2">
            Website or Social Link
          </label>
          <input
            type="url"
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com or https://instagram.com/username"
            className="w-full px-4 py-3 border border-sand-300 text-ink rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-brand-500 text-white font-medium rounded-button hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md active:scale-98"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-white text-ink font-medium rounded-button border-2 border-sand-300 hover:border-brand-300 hover:bg-sand-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sand-300 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
