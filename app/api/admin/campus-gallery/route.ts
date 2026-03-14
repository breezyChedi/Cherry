import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/admin/auth';
import { downloadFromGCS } from '@/app/lib/admin/gcs';

const MANIFEST_PATH = 'campus_photos/campus_photos_index.json';

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const nodeId = req.nextUrl.searchParams.get('nodeId');
  if (!nodeId) {
    return NextResponse.json({ error: 'nodeId required' }, { status: 400 });
  }

  try {
    console.log(`[API /campus-gallery] GET — looking up nodeId="${nodeId}"`);
    const text = await downloadFromGCS(MANIFEST_PATH);
    const manifest = JSON.parse(text);

    const allKeys = Object.keys(manifest.institutions || {});
    console.log(`[API /campus-gallery] Manifest has ${allKeys.length} institution(s), keys sample: [${allKeys.slice(0, 5).join(', ')}]`);

    const entry = manifest?.institutions?.[nodeId];
    if (entry) {
      console.log(`[API /campus-gallery] Found ${entry.photos?.length || 0} photo(s) for nodeId="${nodeId}" (name="${entry.name}")`);
      return NextResponse.json({ photos: entry.photos || [], name: entry.name });
    }

    console.log(`[API /campus-gallery] No entry for nodeId="${nodeId}". Checking if nodeId exists in any form...`);
    // Debug: check if there's a key that contains this nodeId or vice versa
    const partialMatch = allKeys.find(k => k.includes(nodeId) || nodeId.includes(k));
    if (partialMatch) {
      console.log(`[API /campus-gallery] Partial match found: key="${partialMatch}"`);
    }

    return NextResponse.json({ photos: [], availableKeys: allKeys.slice(0, 20) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to load manifest';
    console.error(`[API /campus-gallery] ERROR: ${msg}`);
    return NextResponse.json({ photos: [], error: msg });
  }
}
