// app/api/faculties/route.ts

import { NextRequest, NextResponse } from 'next/server';
import driver from '../../lib/neo4j';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const universityId = parseInt(searchParams.get('universityId') || '', 10);

  if (isNaN(universityId)) {
    return NextResponse.json({ error: 'Invalid university ID' }, { status: 400 });
  }

  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (u:University)-[:HAS_FACULTY]->(f:Faculty)
      WHERE id(u) = $universityId
      RETURN f.name AS name
      ORDER BY f.name
      `,
      { universityId }
    );

    const faculties = result.records.map((record) => record.get('name'));

    return NextResponse.json({ faculties });
  } catch (error) {
    console.error('Error fetching faculties:', error);
    return NextResponse.json({ error: 'Error fetching faculties' }, { status: 500 });
  } finally {
    await session.close();
  }
}
