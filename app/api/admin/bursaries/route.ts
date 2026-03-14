import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/admin/auth';
import { neo4jQuery, parseNeo4jResponse } from '@/app/lib/admin/neo4j-http';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await neo4jQuery(`
    MATCH (b:Bursary)
    RETURN b.id AS id, b.name AS name, b.funderName AS funder,
           b.funderLogoUrl AS logoUrl, b.applicationStatus AS status,
           b.closingDate AS closingDate, b.funderCategory AS category,
           b.fundingType AS fundingType
    ORDER BY b.name
  `);

  return NextResponse.json(parseNeo4jResponse(result));
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Build scalar props from nested JSON
    const funder = typeof data.funder === 'string' ? JSON.parse(data.funder) : data.funder || {};
    const eligibility = typeof data.eligibility === 'string' ? JSON.parse(data.eligibility) : data.eligibility || {};
    const application = typeof data.application === 'string' ? JSON.parse(data.application) : data.application || {};
    const coverageInfo = typeof data.coverageInfo === 'string' ? JSON.parse(data.coverageInfo) : data.coverageInfo || {};
    const obligations = typeof data.obligations === 'string' ? JSON.parse(data.obligations) : data.obligations || {};
    const renewal = typeof data.renewal === 'string' ? JSON.parse(data.renewal) : data.renewal || {};

    const params = {
      id: data.id,
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

    const result = await neo4jQuery(`
      MERGE (b:Bursary { id: $id })
      ON CREATE SET
        b.name = $name, b.fundingType = $fundingType, b.competitiveness = $competitiveness,
        b.funderName = $funderName, b.funderLogoUrl = $funderLogoUrl, b.funderCategory = $funderCategory,
        b.applicationStatus = $applicationStatus, b.closingDate = $closingDate, b.fields = $fields,
        b.funderJson = $funderJson, b.eligibilityJson = $eligibilityJson, b.coverageJson = $coverageJson,
        b.obligationsJson = $obligationsJson, b.applicationJson = $applicationJson, b.renewalJson = $renewalJson
      ON MATCH SET
        b.name = $name, b.fundingType = $fundingType, b.competitiveness = $competitiveness,
        b.funderName = $funderName, b.funderLogoUrl = $funderLogoUrl, b.funderCategory = $funderCategory,
        b.applicationStatus = $applicationStatus, b.closingDate = $closingDate, b.fields = $fields,
        b.funderJson = $funderJson, b.eligibilityJson = $eligibilityJson, b.coverageJson = $coverageJson,
        b.obligationsJson = $obligationsJson, b.applicationJson = $applicationJson, b.renewalJson = $renewalJson
      RETURN b.id AS id
    `, params);

    return NextResponse.json({ success: true, data: parseNeo4jResponse(result) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Save failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
