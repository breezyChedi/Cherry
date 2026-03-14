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
    const existingNodeId = data.nodeId ? String(data.nodeId) : null;
    console.log(`[API /colleges] POST — saving institution name="${inst.name}", nodeId=${existingNodeId}, isCollege=${inst.isCollege !== false}`);
    const start = Date.now();

    // Build SET properties
    const instParams = {
      name: inst.name,
      shortName: inst.shortName || null,
      isCollege: inst.isCollege === true ? true : null,
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

    const setClause = `SET u.name = $name, u.isCollege = $isCollege, u.shortName = $shortName, u.location = $location,
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
          u.registrationsJson = $registrationsJson, u.campusesJson = $campusesJson`;

    if (existingNodeId) {
      // UPDATE existing node by internal ID — allows name changes
      console.log(`[API /colleges] POST — updating existing node id=${existingNodeId}`);
      const updateResult = await neo4jQuery(
        `MATCH (u:University) WHERE id(u) = $nodeId ${setClause} RETURN id(u) AS uid`,
        { ...instParams, nodeId: parseInt(existingNodeId) }
      );
      const updateRows = parseNeo4jResponse(updateResult);
      if (updateRows.length === 0) {
        return NextResponse.json({ error: `Node ${existingNodeId} not found` }, { status: 404 });
      }
    } else {
      // CREATE new institution via MERGE
      console.log(`[API /colleges] POST — creating new institution node`);
      await neo4jQuery(
        `MERGE (u:University { name: $name }) ${setClause} RETURN id(u) AS uid`,
        instParams
      );
    }

    // Handle departments and qualifications — only if explicitly provided
    const departments = data.departments;
    if (Array.isArray(departments)) {
      const uniNodeId = existingNodeId ? parseInt(existingNodeId) : null;

      // Build degree SET clause (reused for both update and create)
      const degreeSetClause = `SET d.id = $id, d.name = $qName, d.shortName = $shortName, d.code = $code,
        d.description = $description, d.level = $level, d.qualificationType = $qualificationType,
        d.nqfLevel = $nqfLevel, d.creditValue = $creditValue, d.outcomeType = $outcomeType,
        d.awardTitle = $awardTitle, d.certifiedBy = $certifiedBy, d.isUnitStandardBased = $isUnitStandardBased,
        d.durationJson = $durationJson, d.studyModes = $studyModes, d.campuses = $campuses,
        d.admissionJson = $admissionJson, d.feesJson = $feesJson,
        d.careerOpportunities = $careerOpportunities, d.skills = $skills, d.industries = $industries,
        d.focalAreas = $focalAreas, d.schedulingJson = $schedulingJson, d.structureJson = $structureJson`;

      const qualParams = (qual: Record<string, unknown>) => ({
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

      // Collect all incoming department/degree node IDs to know what to keep
      const incomingFacultyIds = new Set<number>();
      const incomingDegreeIds = new Set<number>();
      for (const dept of departments) {
        if (dept.nodeId) incomingFacultyIds.add(Number(dept.nodeId));
        for (const q of (dept.qualifications || [])) {
          if (q._nodeId) incomingDegreeIds.add(Number(q._nodeId));
        }
      }

      console.log(`[API /colleges] POST — processing ${departments.length} department(s)`);

      for (const dept of departments) {
        const deptNodeId = dept.nodeId ? Number(dept.nodeId) : null;

        if (deptNodeId) {
          // UPDATE existing faculty by node ID
          await neo4jQuery(
            `MATCH (f:Faculty) WHERE id(f) = $fId SET f.name = $deptName RETURN f`,
            { fId: deptNodeId, deptName: dept.name }
          );
        } else if (uniNodeId) {
          // CREATE new faculty on existing university
          const createResult = await neo4jQuery(
            `MATCH (u:University) WHERE id(u) = $uId CREATE (u)-[:HAS_FACULTY]->(f:Faculty { name: $deptName }) RETURN id(f) AS fId`,
            { uId: uniNodeId, deptName: dept.name }
          );
          const rows = parseNeo4jResponse(createResult);
          dept.nodeId = rows[0]?.fId;
        } else {
          // CREATE new faculty on new university (matched by name)
          await neo4jQuery(
            `MATCH (u:University { name: $uniName }) CREATE (u)-[:HAS_FACULTY]->(f:Faculty { name: $deptName }) RETURN f`,
            { uniName: inst.name, deptName: dept.name }
          );
        }

        const currentDeptNodeId = dept.nodeId ? Number(dept.nodeId) : deptNodeId;
        const quals = dept.qualifications || [];
        if (quals.length > 0) {
          console.log(`[API /colleges] POST — processing ${quals.length} qualification(s) for dept="${dept.name}"`);
        }

        for (const qual of quals) {
          const degNodeId = qual._nodeId ? Number(qual._nodeId) : null;

          if (degNodeId) {
            // UPDATE existing degree by node ID
            await neo4jQuery(
              `MATCH (d:Degree) WHERE id(d) = $dId ${degreeSetClause} RETURN d`,
              { dId: degNodeId, ...qualParams(qual) }
            );
          } else if (currentDeptNodeId) {
            // CREATE new degree on existing faculty
            await neo4jQuery(
              `MATCH (f:Faculty) WHERE id(f) = $fId CREATE (f)-[:HAS_DEGREE]->(d:Degree) ${degreeSetClause} RETURN d`,
              { fId: currentDeptNodeId, ...qualParams(qual) }
            );
          }
        }
      }

      // Delete faculties/degrees that were removed in the UI
      if (uniNodeId) {
        // Delete degrees that are no longer in the payload
        if (incomingDegreeIds.size > 0) {
          await neo4jQuery(
            `MATCH (u:University)-[:HAS_FACULTY]->(:Faculty)-[:HAS_DEGREE]->(d:Degree)
             WHERE id(u) = $uId AND NOT id(d) IN $keepIds
             DETACH DELETE d`,
            { uId: uniNodeId, keepIds: Array.from(incomingDegreeIds) }
          );
        }
        // Delete faculties that are no longer in the payload
        if (incomingFacultyIds.size > 0) {
          await neo4jQuery(
            `MATCH (u:University)-[:HAS_FACULTY]->(f:Faculty)
             WHERE id(u) = $uId AND NOT id(f) IN $keepIds
             OPTIONAL MATCH (f)-[:HAS_DEGREE]->(d:Degree) DETACH DELETE d
             WITH f DETACH DELETE f`,
            { uId: uniNodeId, keepIds: Array.from(incomingFacultyIds) }
          );
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
