import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { SupabaseStorageService } from '../../lib/supabaseStorage';
import { supabase } from '../../lib/supabase';

interface ImageUploadProps {
  onUpload: (imageUrls: string[]) => void;
  onDelete?: (imageUrl: string) => void;
  maxImages?: number;
  existingImages?: string[];
  userId: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  onDelete,
  maxImages = 3,
  existingImages = [],
  userId,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setError('');

    if (existingImages.length + selectedFiles.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate each file
    for (const file of files) {
      try {
        validateFile(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'File validation failed');
        return;
      }
    }

    // Add new files
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const validateFile = (file: File) => {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the URL to prevent memory leaks
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
    setError('');
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image to upload');
      return;
    }

    if (!userId) {
      setError('User authentication required for upload');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError('');

      console.log(`🔄 Starting upload of ${selectedFiles.length} images`);

      // Check Supabase connection
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please log in to upload images');
      }

      // Upload images to Supabase Storage
      const uploadedUrls = await SupabaseStorageService.uploadMultipleImages(selectedFiles, userId);

      console.log('✅ All images uploaded successfully:', uploadedUrls);

      // Combine with existing images
      const allImageUrls = [...existingImages, ...uploadedUrls];
      onUpload(allImageUrls);

      // Clear selected files and previews
      previewUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      setSelectedFiles([]);
      setPreviewUrls([]);
      setUploadProgress(100);

      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 2000);
    } catch (error) {
      console.error('❌ Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      setError(errorMessage);
      
      // If it's an authentication error, suggest re-login
      if (errorMessage.includes('authentication') || errorMessage.includes('log in')) {
        setError('Authentication required. Please refresh the page and log in again.');
      }
    } finally {
      setUploading(false);
    }
  };

  // Cleanup effect to revoke URLs when component unmounts
  React.useEffect(() => {
    return () => {
      previewUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const canAddMore = existingImages.length + selectedFiles.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && !disabled && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors">
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="mb-4">
              <label className="cursor-pointer">
                <span className="text-lg font-medium text-gray-900 hover:text-primary transition-colors">
                  Click to upload images
                </span>
                <input
                  type="file"
                  className="sr-only"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleFileSelect}
                  disabled={uploading || disabled}
                />
              </label>
            </div>
            <p className="text-sm text-gray-500">
              PNG, JPG, WebP up to 5MB each • Maximum {maxImages} images
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {existingImages.length + selectedFiles.length} / {maxImages} images selected
            </p>
          </div>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">
              Selected Images ({selectedFiles.length})
            </h4>
            {!uploading && (
              <button
                onClick={handleUpload}
                disabled={uploading || disabled}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload Images
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-300"
                />
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {(selectedFiles[index].size / 1024 / 1024).toFixed(1)}MB
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Upload className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-blue-700 font-medium">Uploading images...</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-blue-600 text-sm mt-2">
            Please wait while we upload your images to secure storage
          </p>
        </div>
      )}

      {/* Existing Images Display */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Uploaded Images ({existingImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {existingImages.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-300"
                />
                {onDelete && !disabled && (
                  <button
                    type="button"
                    onClick={() => onDelete(url)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Delete image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  Uploaded
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Upload Guidelines:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Maximum {maxImages} images per product</li>
          <li>• Supported formats: JPEG, PNG, WebP</li>
          <li>• Maximum file size: 5MB per image</li>
          <li>• First image will be used as the primary product image</li>
          <li>• Images are stored securely in Supabase Storage</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;