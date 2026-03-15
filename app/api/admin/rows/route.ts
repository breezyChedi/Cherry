import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/admin/auth';
import { uploadJsonToGCS } from '@/app/lib/admin/gcs';

const CONFIG_URL = 'https://storage.googleapis.com/cherry-app-assets/explore/explore_categories.json';
const CONFIG_PATH = 'explore/explore_categories.json';

interface Row {
  id: string;
  label: string;
  sortOrder: number;
  institutions?: string[];
  bursaries?: string[];
}

interface ExploreConfig {
  version: string;
  lastUpdated: string;
  categories: Row[];
  bursaryCategories: Row[];
}

function emptyConfig(): ExploreConfig {
  return {
    version: '3.0',
    lastUpdated: new Date().toISOString(),
    categories: [],
    bursaryCategories: [],
  };
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[API /rows] GET — loading explore config from GCS');
  const start = Date.now();

  try {
    const res = await fetch(`${CONFIG_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) {
      console.warn(`[API /rows] GET — GCS fetch returned ${res.status}, returning empty config`);
      return NextResponse.json(emptyConfig());
    }
    const config: ExploreConfig = await res.json();

    // Strip "all" rows — those are hardcoded in the app
    config.categories = (config.categories || []).filter(r => r.id !== 'all');
    config.bursaryCategories = (config.bursaryCategories || []).filter(r => r.id !== 'all');

    console.log(`[API /rows] GET OK — ${config.categories.length} institution rows, ${config.bursaryCategories.length} bursary rows in ${Date.now() - start}ms`);
    return NextResponse.json(config);
  } catch (err) {
    console.error(`[API /rows] GET ERROR: ${err instanceof Error ? err.message : err}`);
    return NextResponse.json(emptyConfig());
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const config: ExploreConfig = await req.json();
    console.log('[API /rows] PUT — saving explore config');
    const start = Date.now();

    // Validate
    const errors: string[] = [];

    if (!Array.isArray(config.categories)) errors.push('categories must be an array');
    if (!Array.isArray(config.bursaryCategories)) errors.push('bursaryCategories must be an array');
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join('; ') }, { status: 400 });
    }

    const validateRows = (rows: Row[], type: string) => {
      const ids = new Set<string>();
      rows.forEach((row, i) => {
        if (!row.label || !row.label.trim()) {
          errors.push(`${type} row ${i + 1}: label is required`);
        }
        if (!row.id || !row.id.trim()) {
          errors.push(`${type} row ${i + 1}: id is required`);
        }
        if (row.id === 'all') {
          errors.push(`${type} row ${i + 1}: id "all" is reserved`);
        }
        if (ids.has(row.id)) {
          errors.push(`${type}: duplicate id "${row.id}"`);
        }
        ids.add(row.id);

        const names = type === 'Institution' ? (row.institutions || []) : (row.bursaries || []);
        const nameSet = new Set<string>();
        for (const name of names) {
          const lower = name.toLowerCase();
          if (nameSet.has(lower)) {
            errors.push(`${type} row "${row.label}": duplicate name "${name}"`);
          }
          nameSet.add(lower);
        }
      });
    };

    validateRows(config.categories, 'Institution');
    validateRows(config.bursaryCategories, 'Bursary');

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join('; ') }, { status: 400 });
    }

    // Re-assign sortOrder from array position
    config.categories.forEach((row, i) => { row.sortOrder = i + 1; });
    config.bursaryCategories.forEach((row, i) => { row.sortOrder = i + 1; });

    // Update metadata
    config.version = config.version || '3.0';
    config.lastUpdated = new Date().toISOString();

    await uploadJsonToGCS(CONFIG_PATH, config);

    console.log(`[API /rows] PUT OK — saved ${config.categories.length} institution rows, ${config.bursaryCategories.length} bursary rows in ${Date.now() - start}ms`);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Save failed';
    console.error(`[API /rows] PUT ERROR: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
