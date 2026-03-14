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
    const filename = (formData.get('filename') as string) || 'hero.jpg';

    if (!file) {
      console.warn(`[API /upload/hero] POST — no file provided`);
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 4.5 * 1024 * 1024) {
      console.warn(`[API /upload/hero] POST — file too large: ${file.size} bytes`);
      return NextResponse.json({ error: 'File too large (max 4.5MB)' }, { status: 400 });
    }

    console.log(`[API /upload/hero] POST — received file="${file.name}", size=${file.size} bytes, target="${filename}"`);
    const start = Date.now();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[API /upload/hero] POST — processing with sharp (resize 1200px, JPEG q80)`);
    const sharp = (await import('sharp')).default;
    const processed = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    console.log(`[API /upload/hero] POST — processed ${buffer.length} → ${processed.length} bytes`);

    const safeName = filename.replace(/\.(png|webp|jpeg|jpg)$/i, '.jpg');
    const destination = `campus_heroes/${safeName}`;
    const url = await uploadToGCS(processed, destination, 'image/jpeg');

    console.log(`[API /upload/hero] POST OK — uploaded to "${destination}" in ${Date.now() - start}ms`);
    // Hero images store the FULL URL in Neo4j (not relative path)
    return NextResponse.json({ url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    console.error(`[API /upload/hero] POST ERROR: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
