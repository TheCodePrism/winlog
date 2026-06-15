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
    throw new Error('Failed to download backup file');
  }

  return response.text();
}

/**
 * Uploads (creates or updates) the backup file using multipart upload
 */
export async function uploadBackup(accessToken: string, jsonData: string): Promise<void> {
  const existingFile = await getLatestBackup(accessToken);
  const isUpdate = !!existingFile;

  const metadata = {
    name: BACKUP_FILE_NAME,
    mimeType: 'application/json',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
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
      'Content-Type': `multipart/related; boundary=${boundary}`,
      'Content-Length': multipartRequestBody.length.toString(),
    },
    body: multipartRequestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Drive upload error:', errorText);
    throw new Error('Failed to upload backup to Google Drive');
  }
}
