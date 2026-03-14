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
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const sharp = (await import('sharp')).default;
    const processed = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const safeName = filename.replace(/\.[^.]+$/, '.jpg');
    const destination = `campus_heroes/${safeName}`;
    const url = await uploadToGCS(processed, destination, 'image/jpeg');

    return NextResponse.json({ url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
