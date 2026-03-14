import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/admin/auth';
import { uploadToGCS, downloadFromGCS, uploadJsonToGCS, PUBLIC_BASE } from '@/app/lib/admin/gcs';
import { neo4jQuery, parseNeo4jResponse } from '@/app/lib/admin/neo4j-http';

const MANIFEST_PATH = 'campus_photos/campus_photos_index.json';

type PhotoEntry = { id: string; url: string; label: string; campus?: string };
type InstitutionEntry = { slug: string; name: string; photos: PhotoEntry[] };
type Manifest = {
  version: string;
  lastUpdated: string;
  baseUrl: string;
  institutions: Record<string, InstitutionEntry>;
};

async function loadManifest(): Promise<Manifest> {
  try {
    const text = await downloadFromGCS(MANIFEST_PATH);
    const parsed = JSON.parse(text);
    console.log(`[API /upload/campus-photo] Manifest loaded — ${Object.keys(parsed.institutions || {}).length} institution(s)`);
    return parsed;
  } catch {
    console.log(`[API /upload/campus-photo] No existing manifest, creating new`);
    return {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      baseUrl: `${PUBLIC_BASE}/campus_photos`,
      institutions: {},
    };
  }
}

async function saveManifest(manifest: Manifest): Promise<void> {
  manifest.lastUpdated = new Date().toISOString();
  await uploadJsonToGCS(MANIFEST_PATH, manifest);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const institutionName = formData.get('institutionName') as string;
    const slug = formData.get('slug') as string;
    const label = formData.get('label') as string;
    const campus = formData.get('campus') as string | null;

    if (!file || !institutionName || !slug || !label) {
      console.warn(`[API /upload/campus-photo] POST — missing required fields`);
      return NextResponse.json({ error: 'file, institutionName, slug, and label required' }, { status: 400 });
    }

    if (file.size > 4.5 * 1024 * 1024) {
      console.warn(`[API /upload/campus-photo] POST — file too large: ${file.size} bytes`);
      return NextResponse.json({ error: 'File too large (max 4.5MB)' }, { status: 400 });
    }

    console.log(`[API /upload/campus-photo] POST — file="${file.name}", size=${file.size}, slug="${slug}", label="${label}", institution="${institutionName}"`);
    const start = Date.now();

    // --- Step 1: Process image ---
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[API /upload/campus-photo] POST — processing with sharp (resize 1200px, JPEG q80)`);
    const sharp = (await import('sharp')).default;
    const processed = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    console.log(`[API /upload/campus-photo] POST — processed ${buffer.length} → ${processed.length} bytes`);

    // --- Step 2: Upload image to GCS ---
    const photoFilename = `${slug}_${Date.now()}.jpg`;
    const gcsPath = `campus_photos/${slug}/${photoFilename}`;
    const photoUrl = await uploadToGCS(processed, gcsPath, 'image/jpeg');
    console.log(`[API /upload/campus-photo] POST — photo uploaded to "${gcsPath}"`);

    // --- Step 3: Query Neo4j for the node ID ---
    console.log(`[API /upload/campus-photo] POST — querying Neo4j for nodeId of "${institutionName}"`);
    const neo4jResult = await neo4jQuery(
      'MATCH (u:University { name: $name }) RETURN id(u) AS nodeId',
      { name: institutionName }
    );
    const rows = parseNeo4jResponse(neo4jResult);
    if (rows.length === 0) {
      console.error(`[API /upload/campus-photo] POST — institution "${institutionName}" not found in Neo4j`);
      return NextResponse.json({ error: `Institution "${institutionName}" not found in Neo4j` }, { status: 404 });
    }
    const nodeId = String(rows[0].nodeId);
    console.log(`[API /upload/campus-photo] POST — nodeId=${nodeId}`);

    // --- Step 4: Download current manifest ---
    const manifest = await loadManifest();

    // --- Step 5: Add photo to manifest ---
    if (!manifest.institutions[nodeId]) {
      manifest.institutions[nodeId] = { slug, name: institutionName, photos: [] };
    }

    const photos = manifest.institutions[nodeId].photos;
    const photoEntry: PhotoEntry = {
      id: `${slug}-photo-${photos.length + 1}`,
      url: photoUrl,
      label,
      ...(campus ? { campus } : {}),
    };
    photos.push(photoEntry);

    // --- Step 6: Re-upload manifest ---
    await saveManifest(manifest);
    console.log(`[API /upload/campus-photo] POST OK — "${photoEntry.id}" added, total ${photos.length} photo(s) in ${Date.now() - start}ms`);

    return NextResponse.json({ photoUrl, photoEntry, manifestUpdated: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    console.error(`[API /upload/campus-photo] POST ERROR: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { institutionName, photoId } = await req.json();
    if (!institutionName || !photoId) {
      return NextResponse.json({ error: 'institutionName and photoId required' }, { status: 400 });
    }

    console.log(`[API /upload/campus-photo] DELETE — removing photo "${photoId}" from "${institutionName}"`);
    const start = Date.now();

    // Look up nodeId
    const neo4jResult = await neo4jQuery(
      'MATCH (u:University { name: $name }) RETURN id(u) AS nodeId',
      { name: institutionName }
    );
    const rows = parseNeo4jResponse(neo4jResult);
    if (rows.length === 0) {
      return NextResponse.json({ error: `Institution "${institutionName}" not found` }, { status: 404 });
    }
    const nodeId = String(rows[0].nodeId);

    const manifest = await loadManifest();
    const entry = manifest.institutions[nodeId];
    if (!entry) {
      return NextResponse.json({ error: 'No gallery entry for this institution' }, { status: 404 });
    }

    const before = entry.photos.length;
    entry.photos = entry.photos.filter(p => p.id !== photoId);
    const removed = before - entry.photos.length;

    if (removed === 0) {
      return NextResponse.json({ error: `Photo "${photoId}" not found in manifest` }, { status: 404 });
    }

    await saveManifest(manifest);
    console.log(`[API /upload/campus-photo] DELETE OK — removed "${photoId}", ${entry.photos.length} photo(s) remaining in ${Date.now() - start}ms`);

    return NextResponse.json({ success: true, remaining: entry.photos.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    console.error(`[API /upload/campus-photo] DELETE ERROR: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
