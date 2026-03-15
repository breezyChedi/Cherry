import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/admin/auth';
import { uploadToGCS } from '@/app/lib/admin/gcs';

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const filename = (formData.get('filename') as string) || 'logo.png';

    if (!file) {
      console.warn(`[API /upload/logo] POST — no file provided`);
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 4.5 * 1024 * 1024) {
      console.warn(`[API /upload/logo] POST — file too large: ${file.size} bytes`);
      return NextResponse.json({ error: 'File too large (max 4.5MB)' }, { status: 400 });
    }

    console.log(`[API /upload/logo] POST — received file="${file.name}", size=${file.size} bytes, target="${filename}"`);
    const start = Date.now();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process: resize to max 400px wide, convert to PNG
    console.log(`[API /upload/logo] POST — processing with sharp (resize 400px, PNG q90)`);
    const sharp = (await import('sharp')).default;
    const processed = await sharp(buffer)
      .resize({ width: 400, withoutEnlargement: true })
      .png({ quality: 90 })
      .toBuffer();

    console.log(`[API /upload/logo] POST — processed ${buffer.length} → ${processed.length} bytes`);

    // Force .png extension since we converted
    const safeName = filename.replace(/\.(jpg|jpeg|webp|svg|png)$/i, '.png');
    const destination = `logos/${safeName}`;
    const url = await uploadToGCS(processed, destination, 'image/png', 'no-cache');

    console.log(`[API /upload/logo] POST OK — uploaded to "${destination}" in ${Date.now() - start}ms`);
    return NextResponse.json({
      url,                          // Full GCS URL — for preview in the admin panel
      logoPath: `/logos/${safeName}`, // Relative path — THIS goes into Neo4j
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    console.error(`[API /upload/logo] POST ERROR: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
