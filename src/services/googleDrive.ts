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
 * Uploads (creates or updates) the backup file.
 * Uses multipart/related as required by the Drive API.
 * Content-Length is intentionally omitted — the browser sets it automatically.
 */
export async function uploadBackup(accessToken: string, jsonData: string): Promise<void> {
  const existingFile = await getLatestBackup(accessToken);
  const isUpdate = !!existingFile;

  const metadata = {
    name: BACKUP_FILE_NAME,
    mimeType: 'application/json',
  };

  const boundary = `winlog_boundary_${Date.now()}`;
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  // multipart/related body: metadata part first, then file content part
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    jsonData +
    closeDelimiter;

  const url = isUpdate
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

  const method = isUpdate ? 'PATCH' : 'POST';

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      // multipart/related is what Drive API expects — NOT multipart/form-data
      'Content-Type': `multipart/related; boundary=${boundary}`,
      // Do NOT set Content-Length — browsers forbid it and will set it automatically
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Drive upload error:', errorText);
    throw new Error('Failed to upload backup to Google Drive');
  }
}

