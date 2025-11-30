import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import { deleteAvatarApi, getCurrentUserApi, updateAvatarApi } from '../../apis/authentication';
import { User } from '../../types';
import { invalidateUserCache } from '../../utils/userCache';
import { Button } from '../elements/button';
import { Heading, Subheading } from '../elements/heading';

export const ProfileSection = () => {
  const [cookies] = useCookies(['token']);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUser = useCallback(async () => {
    if (!cookies.token) {
      setLoading(false);
      return;
    }
    
    // Always fetch fresh data on profile page for accuracy
    setLoading(true);
    const [response, error] = await getCurrentUserApi(cookies.token);
    if (!error && response) {
      const data = await response.json();
      setUser(data.user);
    }
    setLoading(false);
  }, [cookies.token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    setSuccess('');
    setUploading(true);

    const [, uploadError] = await updateAvatarApi(cookies.token, file);
    
    setUploading(false);

    if (uploadError) {
      setError(uploadError);
    } else {
      setSuccess('Avatar updated successfully!');
      invalidateUserCache(); // Clear cache so MainLayout refetches
      fetchUser(); // Refresh user data
      setTimeout(() => setSuccess(''), 3000);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('Are you sure you want to remove your avatar?')) return;

    setError('');
    setSuccess('');
    setDeleting(true);

    const [, deleteError] = await deleteAvatarApi(cookies.token);
    
    setDeleting(false);

    if (deleteError) {
      setError(deleteError);
    } else {
      setSuccess('Avatar removed successfully!');
      invalidateUserCache(); // Clear cache so MainLayout refetches
      fetchUser(); // Refresh user data
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl">
      <Heading>Profile</Heading>
      <div className="mt-6 bg-white dark:bg-zinc-900 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <Subheading>Avatar</Subheading>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Upload a profile picture to personalize your account.
          </p>

          <div className="mt-6 flex items-center gap-6">
            {/* Avatar Preview */}
            <div className="relative">
              {loading ? (
                <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse ring-4 ring-gray-100 dark:ring-gray-800" />
              ) : user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Profile avatar"
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-800"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-3xl ring-4 ring-gray-100 dark:ring-gray-800">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || uploading || deleting}
                >
                  <PhotoIcon className="h-5 w-5 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
                
                {user?.avatar_url && (
                  <Button
                    type="button"
                    color="red"
                    onClick={handleDeleteAvatar}
                    disabled={loading || uploading || deleting}
                  >
                    <TrashIcon className="h-5 w-5 mr-2" />
                    {deleting ? 'Removing...' : 'Remove'}
                  </Button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG, GIF or WEBP. Max size 5MB.
              </p>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mt-4 rounded-md bg-red-50 dark:bg-red-900/10 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
          {success && (
            <div className="mt-4 rounded-md bg-green-50 dark:bg-green-900/10 p-4">
              <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="mt-6 bg-white dark:bg-zinc-900 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <Subheading>Account Information</Subheading>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 capitalize">{user.role}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 capitalize">{user.plan.name}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};
