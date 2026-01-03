import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Resource } from '../../types';

interface UpdatePayload {
  link?: {
    original_url?: string;
    title?: string;
    description?: string;
  };
  resource: {
    sort_order?: number;
    color?: string;
  };
}

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource;
  onUpdate: (resourceId: number, payload: UpdatePayload) => Promise<Resource>;
}

const EditLinkModal: React.FC<EditLinkModalProps> = ({
  isOpen,
  onClose,
  resource,
  onUpdate,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Form state
  const [linkTitle, setLinkTitle] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [linkColor, setLinkColor] = useState('#3b82f6');
  
  const [error, setError] = useState('');

  // Initialize form with existing resource values
  useEffect(() => {
    if (isOpen && resource) {
      setLinkTitle(resource.linkable.title || '');
      setLinkDescription(resource.linkable.description || '');
      setLinkColor(resource.color || '#3b82f6');
      setError('');
    }
  }, [isOpen, resource]);

  const handleUpdateLink = async () => {
    if (!linkTitle.trim()) {
      setError('Link title is required');
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      await onUpdate(resource.id, {
        link: {
          original_url: resource.linkable.original_url,
          title: linkTitle,
          description: linkDescription,
        },
        resource: {
          color: linkColor,
        }
      });

      onClose();
    } catch (err) {
      console.error('Error updating link:', err);
      setError(err instanceof Error ? err.message : 'Failed to update link');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Link
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Destination URL (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Destination URL
                </label>
                <input
                  type="text"
                  value={resource.linkable.original_url}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  URL cannot be changed. Create a new link if you need a different URL.
                </p>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="edit-link-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-link-title"
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Enter link title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="edit-link-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <input
                  id="edit-link-description"
                  type="text"
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  placeholder="Enter link description"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label htmlFor="edit-link-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Button Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="edit-link-color"
                    type="color"
                    value={linkColor}
                    onChange={(e) => setLinkColor(e.target.value)}
                    className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={linkColor}
                    onChange={(e) => setLinkColor(e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateLink}
              disabled={isUpdating || !linkTitle.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Link'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLinkModal;
