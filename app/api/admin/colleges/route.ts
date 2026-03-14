import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/admin/auth';
import { neo4jQuery, parseNeo4jResponse } from '@/app/lib/admin/neo4j-http';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await neo4jQuery(`
    MATCH (u:University)
    OPTIONAL MATCH (u)-[:HAS_FACULTY]->(f:Faculty)
    OPTIONAL MATCH (f)-[:HAS_DEGREE]->(d:Degree)
    WITH u, count(DISTINCT f) AS facCount, count(DISTINCT d) AS degCount
    RETURN id(u) AS nodeId, u.name AS name, u.isCollege AS isCollege,
           u.logoUrl AS logoUrl, u.campusImageUrl AS campusImageUrl,
           u.institutionType AS institutionType, u.publicOrPrivate AS publicOrPrivate,
           facCount, degCount
    ORDER BY u.name
  `);

  return NextResponse.json(parseNeo4jResponse(result));
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const inst = data.institution || data;

    // Upsert institution node
    const instParams = {
      name: inst.name,
      isCollege: inst.isCollege !== false,
      location: inst.location || 'South Africa',
      logoUrl: inst.logoUrl || null,
      campusImageUrl: inst.campusImageUrl || null,
      websiteUrl: inst.websiteUrl || null,
      description: inst.description || null,
      ranking: inst.ranking || 1000,
      applicationDeadline: inst.applicationDeadline || null,
      fundingWebsiteUrl: inst.fundingWebsiteUrl || null,
      institutionType: inst.type || inst.institutionType || null,
      publicOrPrivate: inst.publicOrPrivate || null,
      generalEmail: inst.generalEmail || null,
      admissionsEmail: inst.admissionsEmail || null,
      generalPhone: inst.generalPhone || null,
      nsfasEligible: inst.nsfasEligible ?? null,
      receivesGovernmentSubsidy: inst.receivesGovernmentSubsidy ?? null,
      accommodationAvailable: inst.accommodationAvailable ?? null,
      passRate: inst.passRate || null,
      facilities: inst.facilities || [],
      studentSupport: inst.studentSupport || [],
      industryPartnerships: inst.industryPartnerships || [],
      registrationsJson: JSON.stringify(inst.registrations || []),
      campusesJson: JSON.stringify(inst.campuses || []),
    };

    await neo4jQuery(`
      MERGE (u:University { name: $name })
      SET u.isCollege = $isCollege, u.location = $location,
          u.logoUrl = $logoUrl, u.campusImageUrl = $campusImageUrl,
          u.websiteUrl = $websiteUrl, u.description = $description,
          u.ranking = $ranking, u.applicationDeadline = $applicationDeadline,
          u.fundingWebsiteUrl = $fundingWebsiteUrl,
          u.institutionType = $institutionType, u.publicOrPrivate = $publicOrPrivate,
          u.generalEmail = $generalEmail, u.admissionsEmail = $admissionsEmail,
          u.generalPhone = $generalPhone, u.nsfasEligible = $nsfasEligible,
          u.receivesGovernmentSubsidy = $receivesGovernmentSubsidy,
          u.accommodationAvailable = $accommodationAvailable,
          u.passRate = $passRate, u.facilities = $facilities,
          u.studentSupport = $studentSupport, u.industryPartnerships = $industryPartnerships,
          u.registrationsJson = $registrationsJson, u.campusesJson = $campusesJson
      RETURN id(u) AS uid
    `, instParams);

    // Handle departments and qualifications
    const departments = data.departments || [];
    if (departments.length > 0) {
      // Clear existing faculties/degrees first
      await neo4jQuery(`
        MATCH (u:University { name: $name })-[:HAS_FACULTY]->(f:Faculty)-[:HAS_DEGREE]->(d:Degree)
        DETACH DELETE d
      `, { name: inst.name });
      await neo4jQuery(`
        MATCH (u:University { name: $name })-[:HAS_FACULTY]->(f:Faculty)
        DETACH DELETE f
      `, { name: inst.name });

      // Create new departments and qualifications
      for (const dept of departments) {
        await neo4jQuery(`
          MATCH (u:University { name: $uniName })
          CREATE (u)-[:HAS_FACULTY]->(f:Faculty { name: $deptName })
          RETURN f
        `, { uniName: inst.name, deptName: dept.name });

        for (const qual of (dept.qualifications || [])) {
          await neo4jQuery(`
            MATCH (u:University { name: $uniName })-[:HAS_FACULTY]->(f:Faculty { name: $deptName })
            CREATE (f)-[:HAS_DEGREE]->(d:Degree {
              id: $id, name: $qName, level: $level, qualificationType: $qualificationType,
              nqfLevel: $nqfLevel, durationJson: $durationJson, studyModes: $studyModes,
              campuses: $campuses, admissionJson: $admissionJson, feesJson: $feesJson,
              careerOpportunities: $careerOpportunities, skills: $skills, industries: $industries
            })
            RETURN d
          `, {
            uniName: inst.name,
            deptName: dept.name,
            id: qual.id || '',
            qName: qual.name || '',
            level: qual.level || '',
            qualificationType: qual.qualificationType || '',
            nqfLevel: qual.nqfLevel ?? null,
            durationJson: JSON.stringify(qual.duration || {}),
            studyModes: qual.studyModes || [],
            campuses: qual.campuses || [],
            admissionJson: JSON.stringify(qual.admission || {}),
            feesJson: JSON.stringify(qual.fees || []),
            careerOpportunities: qual.careerOpportunities || [],
            skills: qual.skills || [],
            industries: qual.industries || [],
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Save failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
