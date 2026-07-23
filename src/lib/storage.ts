import { put, del } from '@vercel/blob';

/**
 * Uploads a file to Vercel Blob as a private asset.
 */
export async function uploadPrivateMedia(file: File, filename: string) {
  // Using a timestamp to prevent filename collisions
  const uniqueFilename = `media/${Date.now()}-${filename}`;
  
  const blob = await put(uniqueFilename, file, {
    access: 'private', // Ensures the file cannot be accessed publicly
  });

  return blob;
}

/**
 * Deletes a file from Vercel Blob using its URL.
 */
export async function deletePrivateMedia(url: string) {
  await del(url);
}