import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/admin/auth';
import { neo4jQuery, parseNeo4jResponse } from '@/app/lib/admin/neo4j-http';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  console.log(`[API /colleges/${decodedName}] GET — fetching institution`);
  const start = Date.now();

  // Get institution
  const instResult = await neo4jQuery(`
    MATCH (u:University { name: $name })
    RETURN u, id(u) AS nodeId
  `, { name: decodedName });

  const instRows = parseNeo4jResponse(instResult);
  if (instRows.length === 0) {
    console.warn(`[API /colleges/${decodedName}] GET — NOT FOUND`);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Get departments and qualifications with node IDs
  const deptResult = await neo4jQuery(`
    MATCH (u:University { name: $name })-[:HAS_FACULTY]->(f:Faculty)
    OPTIONAL MATCH (f)-[:HAS_DEGREE]->(d:Degree)
    RETURN id(f) AS facultyNodeId, f.name AS department,
           collect({ nodeId: id(d), props: properties(d) }) AS qualifications
    ORDER BY f.name
  `, { name: decodedName });

  const departments = parseNeo4jResponse(deptResult).map((row: Record<string, unknown>) => ({
    nodeId: row.facultyNodeId,
    name: row.department,
    qualifications: ((row.qualifications as { nodeId: number; props: Record<string, unknown> }[]) || [])
      .filter(q => q.props)
      .map(q => ({ ...q.props, _nodeId: q.nodeId })),
  }));

  console.log(`[API /colleges/${decodedName}] GET OK — ${departments.length} department(s) in ${Date.now() - start}ms`);
  return NextResponse.json({
    institution: instRows[0].u || instRows[0],
    nodeId: instRows[0].nodeId,
    departments,
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  console.log(`[API /colleges/${decodedName}] DELETE — cascading delete`);
  const start = Date.now();

  // Cascading delete: degrees → faculties → university
  console.log(`[API /colleges/${decodedName}] DELETE — removing degrees`);
  await neo4jQuery(`
    MATCH (u:University { name: $name })-[:HAS_FACULTY]->(f)-[:HAS_DEGREE]->(d:Degree)
    DETACH DELETE d
  `, { name: decodedName });

  console.log(`[API /colleges/${decodedName}] DELETE — removing faculties`);
  await neo4jQuery(`
    MATCH (u:University { name: $name })-[:HAS_FACULTY]->(f:Faculty)
    DETACH DELETE f
  `, { name: decodedName });

  console.log(`[API /colleges/${decodedName}] DELETE — removing university node`);
  await neo4jQuery(`
    MATCH (u:University { name: $name })
    DETACH DELETE u
  `, { name: decodedName });

  console.log(`[API /colleges/${decodedName}] DELETE OK in ${Date.now() - start}ms`);
  return NextResponse.json({ success: true });
}
