import { API_URL } from './config';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Ask the backend for a presigned S3 PUT url for a given content type.
 * Returns { key, upload_url, public_url, content_type }.
 */
export const presignUpload = async (jwtToken, contentType) => {
  const response = await fetch(`${API_URL}/api/v1/uploads/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: jwtToken },
    body: JSON.stringify({ content_type: contentType }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Could not prepare the upload');
  }
  return data;
};

/**
 * Upload a File directly to S3 via a presigned PUT url and return its public url.
 * Validates type and size client-side first.
 */
export const uploadImageToS3 = async (jwtToken, file) => {
  if (!ACCEPTED.includes(file.type)) {
    throw new Error('Please use a JPG, PNG, GIF, or WebP image.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Image must be under 5MB.');
  }

  const { key, upload_url, public_url } = await presignUpload(jwtToken, file.type);

  const put = await fetch(upload_url, {
    method: 'PUT',
    // Only the signed headers may be sent (Content-Type + host). Public read is
    // granted by the bucket policy on the uploads/ prefix, not a per-object ACL.
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!put.ok) {
    throw new Error('Upload to storage failed');
  }
  // key is needed by the generate endpoint (server reads the object from S3);
  // url is the durable public reference used in the final design.
  return { key, url: public_url };
};
