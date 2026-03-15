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
    console.log(`[GCS] Initialized with service account key`);
  } else {
    storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID || 'cherry-backend-485316',
    });
    console.log(`[GCS] Initialized with application default credentials (no key)`);
  }

  return storage;
}

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'cherry-app-assets';
const PUBLIC_BASE = `https://storage.googleapis.com/${BUCKET_NAME}`;

export async function uploadToGCS(
  buffer: Buffer,
  destination: string,
  contentType: string,
  cacheControl: string = 'public, max-age=3600'
): Promise<string> {
  console.log(`[GCS] Uploading ${buffer.length} bytes → ${destination} (${contentType})`);
  const start = Date.now();

  const bucket = getStorage().bucket(BUCKET_NAME);
  const blob = bucket.file(destination);

  await blob.save(buffer, {
    contentType,
    resumable: false,
    metadata: { cacheControl },
  });

  await blob.makePublic();

  const url = `${PUBLIC_BASE}/${destination}`;
  console.log(`[GCS] Upload OK ${Date.now() - start}ms — ${url}`);
  return url;
}

export async function downloadFromGCS(path: string): Promise<string> {
  console.log(`[GCS] Downloading ${path}`);
  const start = Date.now();

  const bucket = getStorage().bucket(BUCKET_NAME);
  const [buffer] = await bucket.file(path).download();

  console.log(`[GCS] Downloaded ${buffer.length} bytes in ${Date.now() - start}ms`);
  return buffer.toString('utf-8');
}

export async function uploadJsonToGCS(path: string, data: unknown): Promise<void> {
  const jsonStr = JSON.stringify(data, null, 2);
  console.log(`[GCS] Uploading JSON → ${path} (${jsonStr.length} chars)`);
  const start = Date.now();

  const bucket = getStorage().bucket(BUCKET_NAME);
  const blob = bucket.file(path);
  await blob.save(jsonStr, {
    contentType: 'application/json',
    resumable: false,
    metadata: { cacheControl: 'no-cache' },
  });
  await blob.makePublic();

  console.log(`[GCS] JSON upload OK ${Date.now() - start}ms`);
}

export { PUBLIC_BASE, BUCKET_NAME };
