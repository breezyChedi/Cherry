import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/admin/auth';
import { uploadToGCS, downloadFromGCS, uploadJsonToGCS } from '@/app/lib/admin/gcs';

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const slug = formData.get('slug') as string;
    const label = formData.get('label') as string;
    const campus = formData.get('campus') as string | null;
    const nodeId = formData.get('nodeId') as string;
    const institutionName = formData.get('institutionName') as string;

    if (!file || !slug || !label || !nodeId) {
      return NextResponse.json({ error: 'Missing file, slug, label, or nodeId' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const sharp = (await import('sharp')).default;
    const processed = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Upload photo
    const filename = `${slug}_${Date.now()}.jpg`;
    const destination = `campus_photos/${slug}/${filename}`;
    const url = await uploadToGCS(processed, destination, 'image/jpeg');

    // Update manifest
    let manifest: Record<string, unknown> = {};
    try {
      const manifestBuffer = await downloadFromGCS('campus_photos/campus_photos_index.json');
      manifest = JSON.parse(manifestBuffer.toString());
    } catch {
      manifest = { version: '1.0', lastUpdated: '', baseUrl: 'https://storage.googleapis.com/cherry-app-assets/campus_photos', institutions: {} };
    }

    const institutions = (manifest.institutions || {}) as Record<string, unknown>;
    const existing = (institutions[nodeId] || { slug, name: institutionName, photos: [] }) as {
      slug: string; name: string; photos: { id: string; url: string; label: string; campus?: string }[]
    };

    const photoId = `${slug}-photo-${existing.photos.length + 1}`;
    const photoEntry = { id: photoId, url, label, ...(campus ? { campus } : {}) };
    existing.photos.push(photoEntry);
    institutions[nodeId] = existing;

    manifest.institutions = institutions;
    manifest.lastUpdated = new Date().toISOString();

    await uploadJsonToGCS('campus_photos/campus_photos_index.json', manifest);

    return NextResponse.json({ success: true, photo: photoEntry });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
