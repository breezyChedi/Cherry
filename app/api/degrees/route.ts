// app/api/degrees/route.ts
// app/api/degrees/route.ts

import { NextRequest, NextResponse } from 'next/server';
import driver from '../../lib/neo4j';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const facultyId = parseInt(searchParams.get('facultyId') || '', 10);

  if (isNaN(facultyId)) {
    return NextResponse.json({ error: 'Invalid faculty ID' }, { status: 400 });
  }

  const session = driver.session();

  try {
    console.log("api degrees fetched")
    const result = await session.run(
      `
      MATCH (f:Faculty)-[:HAS_DEGREE]->(d:Degree)
      MATCH (f:Faculty)-[:USES_PC]->(pc:PointCalculation)
      WHERE id(f) = $facultyId
      OPTIONAL MATCH (d)-[sr:SUBJECT_REQUIREMENT]->(s:Subject)
      OPTIONAL MATCH (d)-[pr:POINT_REQUIREMENT]->(pc:PointCalculation)
      RETURN d,
             collect({
               minPoints: sr.minPoints,
               orSubject: sr.orSubject,
               subject: s.name
             }) AS subjectRequirements,
             pr.minPoints AS pointRequirement,
             pc.name as pointCalculation
      ORDER BY d.name
      `,
      { facultyId }
    );

    const degrees = result.records.map((record) => {
      const pointCalculation = record.get('pointCalculation') || 'APS';

      const degreeNode = record.get('d');
      const subjectRequirementsRaw = record.get('subjectRequirements') as {
        minPoints: any; // Initially as any
        orSubject: string | null;
        subject: string;
      }[];
      
      // Process subjectRequirements to convert minPoints from Integer to number
      const processedSubjectRequirements = subjectRequirementsRaw.map((req) => ({
        ...req,
        minPoints:
          req.minPoints !== null &&
          req.minPoints !== undefined &&
          typeof req.minPoints.toNumber === 'function'
            ? req.minPoints.toNumber()
            : req.minPoints,
      }));

      const pointRequirementRaw = record.get('pointRequirement') as any;
      
      // Convert pointRequirementRaw to number if it exists
      const pointRequirement =
        pointRequirementRaw !== null &&
        pointRequirementRaw !== undefined &&
        typeof pointRequirementRaw.toNumber === 'function'
          ? pointRequirementRaw.toNumber()
          : null;
        
     // console.log("pR:", pointRequirementRaw, pointRequirement);
      //console.log("Subject Requirements:", processedSubjectRequirements);

      return {
        id: degreeNode.identity.toNumber(),
        name: degreeNode.properties.name,
        description: degreeNode.properties.description,
        subjectRequirements: processedSubjectRequirements, // Correctly assign processed requirements
        pointRequirement,
        pointCalculation,
        // Include other properties as needed
      };
    });

    return NextResponse.json({ degrees });
  } catch (error) {
    console.error('Error fetching degrees:', error);
    return NextResponse.json({ error: 'Error fetching degrees' }, { status: 500 });
  } finally {
    await session.close();
  }
}
