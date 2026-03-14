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
    const result = await neo4jQuery(statement, parameters || {});
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Neo4j query failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
