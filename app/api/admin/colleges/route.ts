import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/admin/auth';
import { neo4jQuery, parseNeo4jResponse } from '@/app/lib/admin/neo4j-http';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log(`[API /colleges] GET — listing all institutions`);
  const start = Date.now();

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

  const rows = parseNeo4jResponse(result);
  console.log(`[API /colleges] GET OK — ${rows.length} institutions in ${Date.now() - start}ms`);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const inst = data.institution || data;
    console.log(`[API /colleges] POST — creating/updating institution name="${inst.name}", isCollege=${inst.isCollege !== false}`);
    const start = Date.now();

    // Upsert institution node
    const instParams = {
      name: inst.name,
      shortName: inst.shortName || null,
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

    console.log(`[API /colleges] POST — MERGE institution node`);
    await neo4jQuery(`
      MERGE (u:University { name: $name })
      SET u.isCollege = $isCollege, u.shortName = $shortName, u.location = $location,
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
      console.log(`[API /colleges] POST — clearing existing faculties/degrees for "${inst.name}"`);
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
      console.log(`[API /colleges] POST — creating ${departments.length} department(s)`);
      for (const dept of departments) {
        await neo4jQuery(`
          MATCH (u:University { name: $uniName })
          CREATE (u)-[:HAS_FACULTY]->(f:Faculty { name: $deptName })
          RETURN f
        `, { uniName: inst.name, deptName: dept.name });

        const quals = dept.qualifications || [];
        if (quals.length > 0) {
          console.log(`[API /colleges] POST — creating ${quals.length} qualification(s) for dept="${dept.name}"`);
        }
        for (const qual of quals) {
          await neo4jQuery(`
            MATCH (u:University { name: $uniName })-[:HAS_FACULTY]->(f:Faculty { name: $deptName })
            CREATE (f)-[:HAS_DEGREE]->(d:Degree {
              id: $id, name: $qName, shortName: $shortName, code: $code, description: $description,
              level: $level, qualificationType: $qualificationType,
              nqfLevel: $nqfLevel, creditValue: $creditValue, outcomeType: $outcomeType,
              awardTitle: $awardTitle, certifiedBy: $certifiedBy, isUnitStandardBased: $isUnitStandardBased,
              durationJson: $durationJson, studyModes: $studyModes,
              campuses: $campuses, admissionJson: $admissionJson, feesJson: $feesJson,
              careerOpportunities: $careerOpportunities, skills: $skills, industries: $industries,
              focalAreas: $focalAreas, schedulingJson: $schedulingJson, structureJson: $structureJson
            })
            RETURN d
          `, {
            uniName: inst.name,
            deptName: dept.name,
            id: qual.id || '',
            qName: qual.name || '',
            shortName: qual.shortName || null,
            code: qual.code || null,
            description: qual.description || null,
            level: qual.level || '',
            qualificationType: qual.qualificationType || '',
            nqfLevel: qual.nqfLevel ?? null,
            creditValue: qual.creditValue ?? null,
            outcomeType: qual.outcomeType || null,
            awardTitle: qual.awardTitle || null,
            certifiedBy: qual.certifiedBy || null,
            isUnitStandardBased: qual.isUnitStandardBased ?? false,
            durationJson: JSON.stringify(qual.duration || {}),
            studyModes: qual.studyModes || [],
            campuses: qual.campuses || [],
            admissionJson: JSON.stringify(qual.admission || {}),
            feesJson: JSON.stringify(qual.fees || []),
            careerOpportunities: qual.careerOpportunities || [],
            skills: qual.skills || [],
            industries: qual.industries || [],
            focalAreas: qual.focalAreas || [],
            schedulingJson: JSON.stringify(qual.scheduling || {}),
            structureJson: JSON.stringify(qual.structure || {}),
          });
        }
      }
    }

    console.log(`[API /colleges] POST OK — "${inst.name}" saved in ${Date.now() - start}ms`);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Save failed';
    console.error(`[API /colleges] POST ERROR: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
