import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/admin/auth';
import { neo4jQuery, parseNeo4jResponse } from '@/app/lib/admin/neo4j-http';

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get('type');
  console.log(`[API /rows/names] GET — type=${type}`);
  const start = Date.now();

  if (type === 'institutions') {
    const result = await neo4jQuery('MATCH (u:University) RETURN u.name AS name ORDER BY u.name');
    const names = parseNeo4jResponse(result).map(r => r.name as string).filter(Boolean);
    console.log(`[API /rows/names] GET OK — ${names.length} institution names in ${Date.now() - start}ms`);
    return NextResponse.json(names);
  }

  if (type === 'bursaries') {
    const result = await neo4jQuery('MATCH (b:Bursary) RETURN b.name AS name ORDER BY b.name');
    const names = parseNeo4jResponse(result).map(r => r.name as string).filter(Boolean);
    console.log(`[API /rows/names] GET OK — ${names.length} bursary names in ${Date.now() - start}ms`);
    return NextResponse.json(names);
  }

  return NextResponse.json({ error: 'type parameter required: institutions or bursaries' }, { status: 400 });
}
