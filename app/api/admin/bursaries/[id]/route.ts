import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/admin/auth';
import { neo4jQuery, parseNeo4jResponse } from '@/app/lib/admin/neo4j-http';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  console.log(`[API /bursaries/${id}] GET — fetching bursary`);

  const result = await neo4jQuery('MATCH (b:Bursary { id: $id }) RETURN b', { id });
  const rows = parseNeo4jResponse(result);

  if (rows.length === 0) {
    console.warn(`[API /bursaries/${id}] GET — NOT FOUND`);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  console.log(`[API /bursaries/${id}] GET OK`);
  return NextResponse.json(rows[0].b || rows[0]);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const data = await req.json();
  console.log(`[API /bursaries/${id}] PUT — updating bursary name="${data.name}"`);
  const start = Date.now();

  const funder = typeof data.funder === 'string' ? JSON.parse(data.funder) : data.funder || {};
  const eligibility = typeof data.eligibility === 'string' ? JSON.parse(data.eligibility) : data.eligibility || {};
  const application = typeof data.application === 'string' ? JSON.parse(data.application) : data.application || {};
  const coverageInfo = typeof data.coverageInfo === 'string' ? JSON.parse(data.coverageInfo) : data.coverageInfo || {};
  const obligations = typeof data.obligations === 'string' ? JSON.parse(data.obligations) : data.obligations || {};
  const renewal = typeof data.renewal === 'string' ? JSON.parse(data.renewal) : data.renewal || {};

  const queryParams = {
    id,
    name: data.name,
    fundingType: data.fundingType || null,
    competitiveness: data.competitiveness || null,
    funderName: funder.name || null,
    funderLogoUrl: funder.logoUrl || null,
    funderCategory: funder.category || null,
    applicationStatus: application.status || null,
    closingDate: application.closingDate || null,
    fields: eligibility.academic?.faculties || [],
    funderJson: JSON.stringify(funder),
    eligibilityJson: JSON.stringify(eligibility),
    coverageJson: JSON.stringify(coverageInfo),
    obligationsJson: JSON.stringify(obligations),
    applicationJson: JSON.stringify(application),
    renewalJson: JSON.stringify(renewal),
  };

  await neo4jQuery(`
    MATCH (b:Bursary { id: $id })
    SET b.name = $name, b.fundingType = $fundingType, b.competitiveness = $competitiveness,
        b.funderName = $funderName, b.funderLogoUrl = $funderLogoUrl, b.funderCategory = $funderCategory,
        b.applicationStatus = $applicationStatus, b.closingDate = $closingDate, b.fields = $fields,
        b.funderJson = $funderJson, b.eligibilityJson = $eligibilityJson, b.coverageJson = $coverageJson,
        b.obligationsJson = $obligationsJson, b.applicationJson = $applicationJson, b.renewalJson = $renewalJson
    RETURN b.id AS id
  `, queryParams);

  console.log(`[API /bursaries/${id}] PUT OK in ${Date.now() - start}ms`);
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  console.log(`[API /bursaries/${id}] DELETE — removing bursary`);

  const result = await neo4jQuery('MATCH (b:Bursary { id: $id }) DETACH DELETE b RETURN count(b) AS deleted', { id });
  const rows = parseNeo4jResponse(result);
  const deleted = rows[0]?.deleted || 0;

  console.log(`[API /bursaries/${id}] DELETE OK — ${deleted} node(s) deleted`);
  return NextResponse.json({ success: true, deleted });
}
