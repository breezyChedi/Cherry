import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/admin/auth';
import { neo4jQuery, parseNeo4jResponse } from '@/app/lib/admin/neo4j-http';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  // Get institution
  const instResult = await neo4jQuery(`
    MATCH (u:University { name: $name })
    RETURN u, id(u) AS nodeId
  `, { name: decodedName });

  const instRows = parseNeo4jResponse(instResult);
  if (instRows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Get departments and qualifications
  const deptResult = await neo4jQuery(`
    MATCH (u:University { name: $name })-[:HAS_FACULTY]->(f:Faculty)
    OPTIONAL MATCH (f)-[:HAS_DEGREE]->(d:Degree)
    RETURN f.name AS department, collect(properties(d)) AS qualifications
    ORDER BY f.name
  `, { name: decodedName });

  const departments = parseNeo4jResponse(deptResult).map((row: Record<string, unknown>) => ({
    name: row.department,
    qualifications: (row.qualifications as unknown[]) || [],
  }));

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

  // Cascading delete: degrees → faculties → university
  await neo4jQuery(`
    MATCH (u:University { name: $name })-[:HAS_FACULTY]->(f)-[:HAS_DEGREE]->(d:Degree)
    DETACH DELETE d
  `, { name: decodedName });

  await neo4jQuery(`
    MATCH (u:University { name: $name })-[:HAS_FACULTY]->(f:Faculty)
    DETACH DELETE f
  `, { name: decodedName });

  await neo4jQuery(`
    MATCH (u:University { name: $name })
    DETACH DELETE u
  `, { name: decodedName });

  return NextResponse.json({ success: true });
}
