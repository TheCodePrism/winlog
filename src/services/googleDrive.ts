const BACKUP_FILE_NAME = 'winlog-backup.json';

interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

/**
 * Searches the user's Drive for the backup file
 */
export async function getLatestBackup(accessToken: string): Promise<DriveFile | null> {
  const query = encodeURIComponent(`name = '${BACKUP_FILE_NAME}' and trashed = false`);
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error('Drive list error:', err);
    throw new Error('Failed to search for backup file');
  }

  const data = await response.json();
  const files = data.files || [];
  return files.length > 0 ? files[0] : null;
}

/**
 * Downloads the backup file content
 */
export async function downloadBackup(accessToken: string, fileId: string): Promise<string> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error('Drive download error:', err);
    throw new Error('Failed to download backup file');
  }

  return response.text();
}

/**
 * Uploads (creates or updates) the backup file using multipart upload via FormData/Blob.
 * This approach avoids manually managing Content-Length which browsers block.
 */
export async function uploadBackup(accessToken: string, jsonData: string): Promise<void> {
  const existingFile = await getLatestBackup(accessToken);
  const isUpdate = !!existingFile;

  // Build the multipart form using Blob to avoid Content-Length issues
  const metadata = {
    name: BACKUP_FILE_NAME,
    mimeType: 'application/json',
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append(
    'file',
    new Blob([jsonData], { type: 'application/json' })
  );

  const url = isUpdate
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

  const method = isUpdate ? 'PATCH' : 'POST';

  const response = await fetch(url, {
    method,
    headers: {
      // Do NOT set Content-Type here — the browser sets it automatically with the correct boundary for FormData
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Drive upload error:', errorText);
    throw new Error('Failed to upload backup to Google Drive');
  }
}
