import { Storage } from '@google-cloud/storage';

let storage: Storage | null = null;

function getStorage(): Storage {
  if (storage) return storage;

  const keyJson = process.env.GCS_SERVICE_ACCOUNT_KEY;
  if (keyJson) {
    const credentials = JSON.parse(keyJson);
    storage = new Storage({
      credentials,
      projectId: process.env.GCS_PROJECT_ID || 'cherry-backend-485316',
    });
  } else {
    // Fall back to application default credentials
    storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID || 'cherry-backend-485316',
    });
  }

  return storage;
}

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'cherry-app-assets';

export async function uploadToGCS(
  buffer: Buffer,
  destination: string,
  contentType: string
): Promise<string> {
  const bucket = getStorage().bucket(BUCKET_NAME);
  const blob = bucket.file(destination);

  await blob.save(buffer, {
    contentType,
    metadata: { cacheControl: 'public, max-age=31536000' },
  });

  await blob.makePublic();

  return `https://storage.googleapis.com/${BUCKET_NAME}/${destination}`;
}

export async function downloadFromGCS(path: string): Promise<Buffer> {
  const bucket = getStorage().bucket(BUCKET_NAME);
  const [buffer] = await bucket.file(path).download();
  return buffer;
}

export async function uploadJsonToGCS(path: string, data: unknown): Promise<void> {
  const bucket = getStorage().bucket(BUCKET_NAME);
  const blob = bucket.file(path);
  await blob.save(JSON.stringify(data, null, 2), {
    contentType: 'application/json',
    metadata: { cacheControl: 'no-cache' },
  });
  await blob.makePublic();
}
