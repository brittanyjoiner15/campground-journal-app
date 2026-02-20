import { useState, useRef } from 'react';
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '../../utils/constants';

interface ImageUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  existingPhotos?: Array<{ id: string; url: string; caption?: string }>;
  onRemoveExisting?: (photoId: string) => void;
}

export const ImageUpload = ({
  onFilesSelected,
  maxFiles = 5,
  existingPhotos = [],
  onRemoveExisting,
}: ImageUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError('');

    // Validate number of files
    const totalFiles = selectedFiles.length + existingPhotos.length + files.length;
    if (totalFiles > maxFiles) {
      setError(`Maximum ${maxFiles} photos allowed`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    for (const file of files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} is too large. Max size is 5MB`);
        continue;
      }

      // Check file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError(`${file.name} is not a valid image type. Only JPG, PNG, and WebP are allowed`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Create previews
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

    const updatedFiles = [...selectedFiles, ...validFiles];
    const updatedPreviews = [...previews, ...newPreviews];

    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onFilesSelected(updatedFiles);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveNew = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previews[index]);

    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onFilesSelected(newFiles);
  };

  const totalPhotos = selectedFiles.length + existingPhotos.length;
  const canAddMore = totalPhotos < maxFiles;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink mb-3">
          Photos <span className="text-ink-lighter font-normal">(optional)</span>
        </label>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-button">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Existing Photos */}
        {existingPhotos.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-ink-light mb-3">Existing photos:</p>
            <div className="grid grid-cols-3 gap-3">
              {existingPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Campground photo'}
                    className="w-full h-24 object-cover rounded-button border border-sand-200"
                  />
                  {onRemoveExisting && (
                    <button
                      type="button"
                      onClick={() => onRemoveExisting(photo.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                      title="Remove photo"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Photo Previews */}
        {previews.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-ink-light mb-3">New photos to upload:</p>
            <div className="grid grid-cols-3 gap-3">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-button border border-sand-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNew(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                    title="Remove photo"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {canAddMore && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="inline-flex items-center px-4 py-3 border-2 border-sand-300 rounded-button text-sm font-medium text-ink bg-white hover:bg-sand-50 hover:border-brand-300 cursor-pointer transition-colors"
            >
              <svg className="w-5 h-5 mr-2 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Photos ({totalPhotos}/{maxFiles})
            </label>
            <p className="mt-2 text-xs text-ink-lighter leading-relaxed">
              JPG, PNG, or WebP. Max 5MB per photo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
