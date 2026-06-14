import {
  CheckCircleIcon,
  ClipboardDocumentIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  PencilIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import React, { useCallback, useState } from "react";
import { useCookies } from "react-cookie";
import { publishPage, unpublishPage } from "../apis/publish.js";
import { Page } from "../types";
import { isPagePublished, hasUnpublishedChanges as computeUnpublishedChanges } from "../utils/pageStatus";

interface PublishComponentProps {
  page: Page;
  onStatusChange?: (updatedPage: Page) => void;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  lastSaveTime?: Date | null;
}

const PublishComponent: React.FC<PublishComponentProps> = ({
  page,
  onStatusChange,
  isSaving = false,
  hasUnsavedChanges = false,
  lastSaveTime = null,
}) => {
  const [cookies] = useCookies(["token"]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Publish state comes from the shared helper so the editor, dashboard badge
  // and "View live" link all agree (see src/utils/pageStatus.ts).
  const isPublished = isPagePublished(page);
  const publishedUrl = page.published_url;
  const lastPublishedAt = page.published_at;

  // Check if there are unpublished changes (live page edited since last publish)
  const hasUnpublishedChanges = computeUnpublishedChanges(page);

  const handlePublish = useCallback(async () => {
    if (isLoading || !page.lookup_code) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const { token } = cookies;
      if (!token) {
        setError("No authentication token");
        return;
      }

      const response = await publishPage(cookies.token, page.lookup_code);
      if (response.success && response.data && onStatusChange) {
        onStatusChange(response.data);
        setSuccess("Page published successfully!");
      } else if (response.error) {
        setError(response.error);
      }
    } catch (error) {
      console.error("Error publishing page:", error);
      setError("Failed to publish page. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, page.lookup_code, cookies, onStatusChange]);

  const handleUnpublish = useCallback(async () => {
    if (isLoading || !page.published_lookup_code) return;

    if (
      !confirm(
        "Are you sure you want to unpublish this page? It will no longer be accessible via the public URL.",
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const { token } = cookies;
      if (!token) {
        setError("No authentication token");
        return;
      }

      const response = await unpublishPage(
        cookies.token,
        page.published_lookup_code,
      );
      if (response.success && response.data && onStatusChange) {
        onStatusChange(response.data);
        setSuccess("Page unpublished successfully!");
      } else if (response.error) {
        setError(response.error);
      }
    } catch (error) {
      console.error("Error unpublishing page:", error);
      setError("Failed to unpublish page. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, page.published_lookup_code, cookies, onStatusChange]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Publishing Status
          </h3>
          <div className="flex items-center gap-2">
            {/* Auto-save status indicator - shown first on the left */}
            {isSaving && (
              <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </span>
            )}
            {!isSaving && hasUnsavedChanges && (
              <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Auto-save
              </span>
            )}
            {!isSaving && !hasUnsavedChanges && lastSaveTime && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircleIcon className="w-3 h-3 mr-1" />
                Saved
              </span>
            )}

            {/* Draft/Published status - shown second on the right */}
            {isPublished ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircleIcon className="w-3 h-3 mr-1" />
                Published
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <PencilIcon className="w-3 h-3 mr-1" />
                Draft
              </span>
            )}
          </div>

          {lastPublishedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Last published: {new Date(lastPublishedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {/* Show "Publish changes" button if unpublished OR if there are unpublished modifications */}
          {(!isPublished || hasUnpublishedChanges) && (
            <>
              {/* Desktop button */}
              <button
                onClick={handlePublish}
                disabled={isLoading}
                className="hidden sm:flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                <GlobeAltIcon className="w-4 h-4 mr-2" />
                {isPublished ? "Publish changes" : "Publish"}
              </button>

              {/* Mobile button */}
              <button
                onClick={handlePublish}
                disabled={isLoading}
                className="sm:hidden flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={isPublished ? "Publish changes" : "Publish"}
              >
                <GlobeAltIcon className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Unpublish button - only show if page is published */}
          {isPublished && (
            <>
              {/* Desktop unpublish button */}
              <button
                onClick={handleUnpublish}
                disabled={isLoading}
                className="hidden sm:flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                <XCircleIcon className="w-4 h-4 mr-2" />
                Unpublish
              </button>

              {/* Mobile unpublish button */}
              <button
                onClick={handleUnpublish}
                disabled={isLoading}
                className="sm:hidden flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Unpublish"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notification Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          {success}
        </div>
      )}

      {/* Published URL */}
      {isPublished && publishedUrl && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Your page is live at:</p>
          <div className="flex items-center gap-2">
            <a
              href={publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline break-all flex-1"
            >
              {publishedUrl}
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(publishedUrl);
                setSuccess("URL copied to clipboard!");
                setTimeout(() => setSuccess(""), 3000);
              }}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              title="Copy URL"
            >
              <ClipboardDocumentIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Publish Info */}
      {(!isPublished || hasUnpublishedChanges) && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Ready to publish?</p>
              <p>
                Publishing will make your page publicly accessible. You can
                unpublish it at any time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishComponent;
