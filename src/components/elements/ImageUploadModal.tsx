import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useRef, useState } from 'react';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageUrl: string) => void;
  currentImage?: string;
  title?: string;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentImage,
  title = 'Add image'
}) => {
  const [imageUrl, setImageUrl] = useState<string>(currentImage || '');
  const [urlInput, setUrlInput] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(currentImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((file: File) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.match(/^image\/(png|jpg|jpeg|svg|gif)$/)) {
      alert('Please select a valid image file (PNG, JPG, SVG, or GIF)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Read file and convert to base64 or object URL for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewImage(result);
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, [handleFileChange]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput) {
      setPreviewImage(urlInput);
      setImageUrl(urlInput);
    }
  };

  const handleSave = () => {
    if (imageUrl) {
      onSave(imageUrl);
      onClose();
    }
  };

  const handleRemove = () => {
    setPreviewImage('');
    setImageUrl('');
    onSave('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Preview and crop your image below. If there are any issues with your image content, we'll let you know after you hit submit.{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Learn more
            </a>{' '}
            about acceptable content.
          </p>

          {/* Preview/Upload Area */}
          {previewImage ? (
            <div className="mb-6">
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-w-full max-h-[400px] object-contain rounded-lg"
                />
              </div>
              <button
                onClick={handleRemove}
                className="mt-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
              >
                Remove image
              </button>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="space-y-4">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Drag and drop an image here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Browse images
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/gif"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Use PNG, JPG, SVG or GIF. (max. 5MB, 2500x2500px)
                </p>
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:underline inline-flex items-center"
                >
                  See our image guide
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          )}

          {/* URL Import */}
          <div className="mt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Import from URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste your image URL"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
                <button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Load
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!imageUrl}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
