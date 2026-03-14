import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/admin/auth';
import { neo4jQuery } from '@/app/lib/admin/neo4j-http';

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { statement, parameters } = await req.json();
    if (!statement) {
      return NextResponse.json({ error: 'Missing statement' }, { status: 400 });
    }
    console.log(`[API /admin/neo4j] Proxy query: ${statement.trim().replace(/\s+/g, ' ').slice(0, 100)}...`);
    const result = await neo4jQuery(statement, parameters || {});
    console.log(`[API /admin/neo4j] Query completed OK`);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Neo4j query failed';
    console.error(`[API /admin/neo4j] ERROR: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
