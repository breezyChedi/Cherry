export const BURSARY_SYSTEM_MESSAGE = `You are a precise data extraction assistant specializing in South African bursary and scholarship information. Always respond with valid JSON matching the provided schema exactly.`;

export const COLLEGE_SYSTEM_MESSAGE = `You are a precise data extraction assistant specializing in South African college and TVET institution information. Always respond with valid JSON matching the provided schema exactly.`;

export const BURSARY_JSON_SCHEMA = `{
  "id": "kebab-case-unique-id",
  "name": "Full bursary name",
  "fundingType": "bursary|scholarship|loan|grant|fellowship",
  "competitiveness": "merit_only|need_only|merit_and_need|open",
  "funder": {
    "name": "Funder display name",
    "legalName": "Full legal entity name",
    "category": "jse_listed|multinational|state_owned|ngo|private_trust|family_foundation|government|professional_body|parastatal|sme",
    "industrySector": "e.g. retail, mining, banking",
    "logoUrl": "/logos/funder_logo.png"
  },
  "eligibility": {
    "academic": {
      "applicantLevels": ["undergrad_y1","undergrad_y2","any_undergrad","any_postgrad","honours","masters","phd"],
      "fundingTargetLevels": ["undergraduate","postgraduate"],
      "minimumAps": null,
      "competitiveAps": null,
      "minAggregate": null,
      "subjectRequirementsTree": null,
      "subjectRequirementsRaw": "Text or null",
      "mathsLiteracyAccepted": null,
      "nbtRequired": null,
      "curriculumStream": null,
      "faculties": ["Engineering","Commerce"],
      "degreeWhitelist": null,
      "institutionTypes": null,
      "institutionWhitelist": null,
      "firstDegreeOnly": false,
      "maxPriorYears": null,
      "supportsExtended": null
    },
    "demographic": {
      "citizenship": ["south_african"],
      "race": null,
      "gender": "any",
      "ageMin": null,
      "ageMax": null,
      "disabilityPreference": false,
      "provinces": null,
      "districts": null,
      "geofenceKm": null,
      "quintileRange": null,
      "feederSchools": null,
      "religiousAffiliation": null,
      "specialFlags": [],
      "sport": null
    },
    "financial": {
      "maxHouseholdIncome": null,
      "thresholdType": "none|hard_cap|sliding_scale|means_test",
      "sassaAutoApprove": false,
      "verificationMethods": [],
      "householdDefinition": null,
      "assetTestEnabled": false,
      "exclusivityClause": false,
      "allowsTopUp": false,
      "parentalIncomeCap": null,
      "financialNeedWeight": null
    }
  },
  "coverageInfo": {
    "items": [
      {
        "item": "tuition|accommodation|meals|books|laptop|transport|stipend|registration|exam_fees",
        "covered": true,
        "amount": null,
        "period": "annual|once_off|monthly",
        "constraint": null,
        "notes": "Description"
      }
    ],
    "disbursementRecipient": "institution_direct|student_direct|mixed",
    "disbursementSchedule": null
  },
  "obligations": {
    "workBack": {
      "required": true,
      "yearsPerStudyYear": null,
      "employerType": "specific_company|any_in_sector|government|none",
      "locationRestriction": null,
      "breachPenalty": null,
      "repaymentInterestBasis": null
    },
    "duringStudies": {
      "vacationWorkRequired": false,
      "vacationWorkWeeksPerYear": null,
      "vacationWorkPaid": null,
      "mentorshipRequired": false,
      "communityServiceHoursPerYear": null,
      "communityServiceDescription": null
    },
    "academic": {
      "maintenanceAverage": null,
      "reportingFrequency": "every_semester|annually|quarterly|on_request",
      "minCreditsPerYear": null,
      "propensityToGraduateLetter": false
    }
  },
  "application": {
    "status": "open|closed|upcoming",
    "cycleYear": 2026,
    "isRecurring": true,
    "openingDate": "YYYY-MM-DD or null",
    "closingDate": "YYYY-MM-DD or null",
    "lateApplicationPolicy": null,
    "officialUrl": "URL (REQUIRED)",
    "portalUrl": "URL or null",
    "contactEmail": "email@funder.co.za",
    "contactPhone": null,
    "isPublicOffering": true,
    "modes": ["online","paper","email"],
    "requiredDocuments": ["Certified ID copy","Academic transcript"],
    "certificationRequired": false,
    "certificationMaxMonths": null,
    "stages": [],
    "referenceLetters": null,
    "turnaroundWeeks": null,
    "outcomeNotification": null
  },
  "renewal": {
    "mechanism": "auto_on_pass|reapply_annually|guaranteed_duration|conditional_review|none",
    "maxTenureYears": null,
    "gracePeriodYears": null,
    "failedModulePolicy": "stop_funding|probation|reduced_funding|repeat_at_own_cost|appeal_allowed",
    "transferableUniversity": false,
    "transferableDegree": false,
    "dropoutRepayment": false
  }
}`;

export function buildBursaryPrompt(funderName: string, bursaryName: string, content: string, tags: string[] = ['general']): string {
  const tagInstructions: Record<string, string> = {
    eligibility: `ELIGIBILITY EXTRACTION:
- Extract citizenship requirements precisely (default ["south_african"] if not mentioned)
- Age limits: extract exact min/max if stated
- Gender: use "any" unless specifically restricted
- Province restrictions: list specific provinces if mentioned
- Academic requirements: APS scores, subject requirements, minimum aggregate
- Financial means test: household income caps, SASSA auto-approve
- applicantLevels MUST NOT be empty — infer from context`,
    coverage: `COVERAGE EXTRACTION:
- NEVER leave coverageInfo.items empty — at minimum include tuition
- Extract exact amounts in ZAR (integers, no "R" prefix)
- Specify period: annual, once_off, or monthly
- Include ALL covered items: tuition, accommodation, meals, books, laptop, transport, stipend, registration, exam_fees
- Note disbursement method: institution_direct, student_direct, or mixed`,
    obligations: `OBLIGATIONS EXTRACTION:
- Work-back: extract exact years-per-study-year ratio
- Employer type: specific_company, any_in_sector, government, none
- For corporate bursaries, use null (unknown) not false for work-back if not stated
- Vacation work: weeks per year, paid/unpaid
- Academic maintenance: minimum average percentage
- Community service hours if mentioned`,
    application: `APPLICATION EXTRACTION:
- Status: "open" if currently accepting, "closed" if deadline passed, "upcoming" if not yet open
- Dates MUST be YYYY-MM-DD format
- officialUrl is REQUIRED — extract the application URL
- List ALL required documents mentioned
- Application modes: online, paper, email
- Extract selection stages if described`,
    renewal: `RENEWAL EXTRACTION:
- Mechanism: auto_on_pass, reapply_annually, guaranteed_duration, conditional_review, none
- Max tenure in years
- Failed module policy: exact policy if stated
- Transferability between universities/degrees`,
    general: `GENERAL EXTRACTION:
- Funder legal name (may differ from display name)
- Category: jse_listed, multinational, state_owned, ngo, private_trust, family_foundation, government, professional_body, parastatal, sme
- Industry sector (retail, mining, banking, etc.)
- Whether the bursary is recurring (annual)
- fundingTargetLevels MUST be array, NEVER string "both". Valid: ["undergraduate"], ["postgraduate"], or ["undergraduate","postgraduate"]`,
  };

  const additionalInstructions = tags
    .filter(t => tagInstructions[t])
    .map(t => tagInstructions[t])
    .join('\n\n');

  return `TASK: Extract structured bursary/scholarship information from the provided web page content.

FUNDER: ${funderName}
BURSARY NAME: ${bursaryName}

You are extracting data for a South African educational app that helps matric students find bursaries and funding. The data must be precise, complete, and follow the exact JSON schema below.

OUTPUT FORMAT (JSON):
${BURSARY_JSON_SCHEMA}

CRITICAL RULES:
1. Extract ONLY what is present in the provided text — do NOT invent information
2. For fields not found in the text, use null — do NOT guess
3. Use the CANONICAL CODES listed in the schema for all coded fields
4. Dates must be in YYYY-MM-DD format
5. Monetary amounts must be integers in ZAR (e.g. 350000, not "R350,000")
6. The "id" must be kebab-case: funder-field-year (e.g. "shoprite-agri-sciences-2026")
7. officialUrl is REQUIRED
8. Be precise about eligibility
9. If multiple distinct bursaries exist, wrap them: { "bursaries": [...] }
10. Work-back obligations: extract exact terms
11. Required documents: extract the full list if mentioned
12. Application status: "open" if currently accepting, "closed" if deadline passed, "upcoming" if not yet open

SOUTH AFRICAN DEFAULTS:
- Citizenship: default to ["south_african"] if not mentioned
- Coverage: NEVER leave coverageInfo.items empty — at minimum include tuition
- applicantLevels: NEVER leave empty — infer from context
- Work-back for corporate bursaries: use null (unknown) not false
- fundingTargetLevels: MUST be array, NEVER string "both"

${additionalInstructions}

--- BEGIN WEB PAGE CONTENT ---
${content}
--- END WEB PAGE CONTENT ---`;
}

export function buildCollegePrompt(collegeName: string, content: string): string {
  return `TASK: Extract structured college/TVET institution information from the provided web page content.

COLLEGE: ${collegeName}

You are extracting data for a South African educational app. The data must be precise and follow the exact JSON schema below.

OUTPUT FORMAT (JSON):
{
  "institution": {
    "name": "Full official name",
    "shortName": "Abbreviation",
    "type": "public_tvet|cet_college|private_college|private_hei|flight_school|culinary_school|film_school|agricultural_college|nursing_college|maritime_academy|beauty_academy|it_bootcamp|security_training|theological_college|music_academy|sports_academy|ecd_college|short_course_provider|other",
    "publicOrPrivate": "public|private",
    "logoUrl": "/logos/filename.png",
    "websiteUrl": "URL",
    "description": "1-2 sentence description",
    "generalEmail": "email",
    "admissionsEmail": "email",
    "generalPhone": "phone",
    "registrations": [{"body":"DHET","registrationNumber":null,"type":"government_registration"}],
    "campuses": [{"name":"Campus Name","city":"City","province":"Province"}],
    "nsfasEligible": true,
    "receivesGovernmentSubsidy": true,
    "facilities": ["Library","Computer Labs"],
    "studentSupport": ["Career Guidance"],
    "accommodationAvailable": false,
    "industryPartnerships": ["Company1"]
  },
  "departments": [
    {
      "name": "Department Name",
      "qualifications": [
        {
          "id": "kebab-case-id",
          "name": "Qualification Name",
          "level": "NCV Level 2-4|NATED N1-N3|NATED N4-N6|Occupational Certificate|Skills Programme|Learnership|Apprenticeship|Short Course|Higher Certificate|Advanced Certificate|Diploma|Trade Test|Other",
          "qualificationType": "ncv|nated|occupational_certificate|learnership|apprenticeship|skills_programme|short_course|higher_certificate|advanced_certificate|diploma|trade_test|sector_license|international_certification|other",
          "nqfLevel": 4,
          "duration": {"value":3,"unit":"years"},
          "studyModes": ["full_time"],
          "campuses": ["Campus Name"],
          "admission": {
            "minQualification": "none|abet_level_4|grade_9_getc|grade_10|grade_11|grade_12_any|nsc_higher_cert|nsc_diploma|nsc_bachelor|senior_cert_old|ncv_level_2|ncv_level_3|ncv_level_4|n3_certificate|n6_certificate|nqf_level_2|nqf_level_3|nqf_level_4|nqf_level_5|prior_diploma|prior_degree|other",
            "minQualificationDisplay": "Grade 9 / GETC",
            "additionalRequirements": [],
            "rplAccepted": false
          },
          "fees": [{"item":"tuition","amount":15000,"period":"annual"}],
          "careerOpportunities": ["Career1"],
          "skills": ["Skill1"],
          "industries": ["Industry1"]
        }
      ]
    }
  ]
}

SOUTH AFRICAN TVET ADMISSION STANDARDS:
  NCV: NCV Level 2 → grade_9_getc, NCV Level 3 → ncv_level_2, NCV Level 4 → ncv_level_3
  NATED Engineering: N1 → grade_9_getc, N2 → nqf_level_2, N3 → nqf_level_3, N4 → grade_12_any, N5 → nqf_level_4, N6 → nqf_level_5
  NATED Business: N4 → grade_12_any, N5 → nqf_level_4, N6 → nqf_level_5

CRITICAL RULES:
1. Extract ONLY what is in the text — do NOT invent
2. NCV L2-L4 should be ONE entry, NATED N4-N6 should be ONE entry
3. Fees as integer ZAR
4. Use kebab-case IDs: college-qualification-type

--- BEGIN CONTENT ---
${content}
--- END CONTENT ---`;
}

export function buildMergePrompt(funderName: string, bursaryName: string, partials: string[]): string {
  return `TASK: Merge the following partial extractions into ONE complete bursary JSON.

FUNDER: ${funderName}
BURSARY NAME: ${bursaryName}

MERGE RULES:
1. Combine all information — do not drop any data
2. If the same field appears in multiple partials, prefer non-null values
3. For lists, merge unique items
4. The final JSON must follow the exact schema structure

OUTPUT FORMAT:
${BURSARY_JSON_SCHEMA}

--- PARTIAL EXTRACTIONS ---
${partials.join('\n\n---\n\n')}

Output the merged JSON:`;
}
