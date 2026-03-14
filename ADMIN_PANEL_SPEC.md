# Cherry Admin Panel — Complete Technical Specification

> This document contains EVERYTHING an agent needs to build the Cherry Admin Panel
> from scratch. It covers the full data model, all credentials, every API pattern,
> the LLM extraction pipeline, image management, and Neo4j schema. No prior
> knowledge of the Cherry app is required.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture & Hosting](#2-architecture--hosting)
3. [Credentials & API Keys](#3-credentials--api-keys)
4. [Neo4j Database](#4-neo4j-database)
5. [College/Institution Data Model](#5-collegeinstitution-data-model)
6. [Bursary Data Model](#6-bursary-data-model)
7. [Image Management System](#7-image-management-system)
8. [LLM Extraction Pipeline](#8-llm-extraction-pipeline)
   - 8.1 Pipeline Overview
   - 8.2 Bursary Extraction Prompt
   - 8.3 Merge Prompt (multi-page)
   - 8.4 Admin Panel Chat Flow
   - 8.5 College Extraction
   - 8.6 Web Scraping (URL → Text Extraction)
   - 8.7 JSON Parsing from LLM Responses
   - 8.8 College-Specific Extraction Details (TVET admission standards)
   - 8.9 Multi-Bursary Extraction
   - 8.10 Known Issues & Temporal Problems
9. [Admin Panel Feature Requirements](#9-admin-panel-feature-requirements)
10. [API Route Design](#10-api-route-design)

---

## 1. System Overview

Cherry is a **React Native mobile app** that helps South African matric students
find universities, colleges (TVET/private), bursaries, and funding opportunities.

The data lives in:
- **Neo4j Aura** — graph database holding all institutions, degrees, and bursaries
- **Google Cloud Storage (GCS)** — all images (logos, hero photos, campus gallery photos)
- **React Native app bundle** — locally bundled logos and hero photos for instant loading

The admin panel will be a **Next.js web app** hosted on **Vercel** (Pro plan),
providing a UI to manage all of the above without touching code or running scripts.

---

## 2. Architecture & Hosting

### Current Architecture (no admin panel)
```
Python scripts (local) ──> Neo4j Aura (cloud DB)
Python scripts (local) ──> GCS (image storage)
React Native app ──> Neo4j Aura (reads data)
React Native app ──> GCS (loads images)
```

### Target Architecture (with admin panel)
```
Admin Panel (Next.js on Vercel)
  ├── /api/neo4j/*        ──> Neo4j Aura HTTP API (read/write)
  ├── /api/upload/*       ──> GCS (image upload)
  ├── /api/scrape         ──> Fetch URL + Readability (text extraction)
  ├── /api/parse/*        ──> OpenAI API (LLM extraction)
  └── /admin/*            ──> Admin UI pages

React Native app (unchanged)
  ├── reads from Neo4j Aura
  └── loads images from GCS
```

### Vercel Considerations
- **Vercel Pro plan** ($20/mo) — 60-second serverless function timeout
- LLM extraction calls can take 15-30 seconds — well within Pro limits
- Use **API Routes** (`/api/*`) as the backend — no separate server needed
- Store all credentials as **Vercel Environment Variables**
- Use `@google-cloud/storage` npm package for GCS access
- Use `sharp` npm package for image processing (resize, format conversion)
- Use `openai` npm package for LLM calls
- Use `@mozilla/readability` + `linkedom` for URL scraping (text extraction from web pages)

---

## 3. Credentials & API Keys

### Neo4j Aura (Cloud Graph Database)
```
URL:      (see .env NEO4J_URL)
Username: (see .env NEO4J_USERNAME)
Password: (see .env NEO4J_PASSWORD)
Auth:     HTTP Basic Auth (base64 of "neo4j:PASSWORD")
```

The Neo4j HTTP API accepts POST requests with JSON body:
```json
{
  "statement": "MATCH (n) RETURN n LIMIT 10",
  "parameters": {}
}
```

Response format:
```json
{
  "data": {
    "fields": ["n"],
    "values": [
      [{ "elementId": "...", "properties": {...} }]
    ]
  }
}
```

### OpenAI API
```
API Key:  (see .env OPENAI_API_KEY)
Model:    (see .env OPENAI_MODEL)
Pricing:  $2.50/1M input tokens, $15.00/1M output tokens
```

Generation config for extraction:
```json
{
  "max_completion_tokens": 16384,
  "temperature": 0.15,
  "top_p": 0.9,
  "response_format": { "type": "json_object" }
}
```

System message used for bursary extraction:
```
You are a precise data extraction assistant specializing in South African
bursary and scholarship information. Always respond with valid JSON matching
the provided schema exactly.
```

### Anthropic API (backup provider, not primary)
```
API Key:  (see .env ANTHROPIC_API_KEY)
Model:    claude-haiku-4-5
Pricing:  $1.00/1M input, $5.00/1M output
```

### Google Cloud Storage
```
Project ID: cherry-backend-485316
Bucket:     cherry-app-assets
Auth:       Application Default Credentials (service account key as env var)
```

For Vercel, store the GCS service account JSON key as a Vercel env var
(`GCS_SERVICE_ACCOUNT_KEY`), then parse it at runtime:
```typescript
const credentials = JSON.parse(process.env.GCS_SERVICE_ACCOUNT_KEY!);
const storage = new Storage({ credentials, projectId: 'cherry-backend-485316' });
```

All uploaded files must be made public:
```typescript
await blob.makePublic();
```

---

## 4. Neo4j Database

### Node Labels & Relationships

```
(:University) -[:HAS_FACULTY]-> (:Faculty) -[:HAS_DEGREE]-> (:Degree)
(:Bursary)  // standalone nodes, no relationships
```

Universities and colleges share the same `:University` label.
Colleges are distinguished by `u.isCollege = true`.

### Key Queries

**List all institutions:**
```cypher
MATCH (u:University)
RETURN id(u) AS id, u.name AS name, u.isCollege AS isCollege,
       u.logoUrl AS logoUrl, u.campusImageUrl AS campusImageUrl
ORDER BY u.name
```

**List all colleges only:**
```cypher
MATCH (u:University) WHERE u.isCollege = true
RETURN id(u) AS id, u.name AS name, u.logoUrl, u.campusImageUrl,
       u.institutionType, u.publicOrPrivate
ORDER BY u.name
```

**Get college with departments and qualifications:**
```cypher
MATCH (u:University { name: $name })-[:HAS_FACULTY]->(f:Faculty)-[:HAS_DEGREE]->(d:Degree)
RETURN u, f.name AS department, collect(d) AS qualifications
```

**List all bursaries:**
```cypher
MATCH (b:Bursary)
RETURN b.id AS id, b.name AS name, b.funderName AS funder,
       b.funderLogoUrl AS logoUrl, b.applicationStatus AS status,
       b.closingDate AS closingDate, b.funderCategory AS category
ORDER BY b.name
```

**Get single bursary (full data):**
```cypher
MATCH (b:Bursary { id: $id })
RETURN b
```
All complex sub-objects are stored as JSON strings: `b.funderJson`,
`b.eligibilityJson`, `b.coverageJson`, `b.obligationsJson`,
`b.applicationJson`, `b.renewalJson`. Parse them on the client:
```typescript
const funder = JSON.parse(bursary.funderJson);
const eligibility = JSON.parse(bursary.eligibilityJson);
```

**Create/Update bursary:**
```cypher
MERGE (b:Bursary { id: $id })
ON CREATE SET
  b.name = $name,
  b.fundingType = $fundingType,
  b.competitiveness = $competitiveness,
  b.funderName = $funderName,
  b.funderLogoUrl = $funderLogoUrl,
  b.funderCategory = $funderCategory,
  b.applicationStatus = $applicationStatus,
  b.closingDate = $closingDate,
  b.fields = $fields,
  b.funderJson = $funderJson,
  b.eligibilityJson = $eligibilityJson,
  b.coverageJson = $coverageJson,
  b.obligationsJson = $obligationsJson,
  b.applicationJson = $applicationJson,
  b.renewalJson = $renewalJson
ON MATCH SET
  b.name = $name,
  b.fundingType = $fundingType,
  b.competitiveness = $competitiveness,
  b.funderName = $funderName,
  b.funderLogoUrl = $funderLogoUrl,
  b.funderCategory = $funderCategory,
  b.applicationStatus = $applicationStatus,
  b.closingDate = $closingDate,
  b.fields = $fields,
  b.funderJson = $funderJson,
  b.eligibilityJson = $eligibilityJson,
  b.coverageJson = $coverageJson,
  b.obligationsJson = $obligationsJson,
  b.applicationJson = $applicationJson,
  b.renewalJson = $renewalJson
RETURN b.id AS id
```

**Delete bursary:**
```cypher
MATCH (b:Bursary { id: $id }) DETACH DELETE b RETURN count(b) AS deleted
```

**Create/Update college institution:**
```cypher
MERGE (u:University { name: $name })
ON CREATE SET
  u.isCollege = true,
  u.location = $location,
  u.logoUrl = $logoUrl,
  u.appUrl = $appUrl,
  u.campusImageUrl = $campusImageUrl,
  u.websiteUrl = $websiteUrl,
  u.description = $description,
  u.ranking = $ranking,
  u.applicationDeadline = $applicationDeadline,
  u.fundingWebsiteUrl = $fundingWebsiteUrl,
  u.phone = $phone,
  u.institutionType = $institutionType,
  u.publicOrPrivate = $publicOrPrivate,
  u.generalEmail = $generalEmail,
  u.admissionsEmail = $admissionsEmail,
  u.generalPhone = $generalPhone,
  u.nsfasEligible = $nsfasEligible,
  u.receivesGovernmentSubsidy = $receivesGovernmentSubsidy,
  u.accommodationAvailable = $accommodationAvailable,
  u.passRate = $passRate,
  u.facilities = $facilities,
  u.studentSupport = $studentSupport,
  u.industryPartnerships = $industryPartnerships,
  u.registrationsJson = $registrationsJson,
  u.campusesJson = $campusesJson
ON MATCH SET
  u.isCollege = true,
  u.location = COALESCE($location, u.location),
  u.logoUrl = COALESCE($logoUrl, u.logoUrl),
  u.campusImageUrl = COALESCE($campusImageUrl, u.campusImageUrl),
  u.websiteUrl = COALESCE($websiteUrl, u.websiteUrl),
  u.description = COALESCE($description, u.description),
  ...
RETURN id(u) AS uid
```

**Delete college (cascading):**
```cypher
// 1. Delete degrees
MATCH (u:University { name: $name })-[:HAS_FACULTY]->(f)-[:HAS_DEGREE]->(d:Degree)
DETACH DELETE d

// 2. Delete faculties
MATCH (u:University { name: $name })-[:HAS_FACULTY]->(f:Faculty)
DETACH DELETE f

// 3. Delete university node
MATCH (u:University { name: $name, isCollege: true })
DETACH DELETE u
```

**Update a single property:**
```cypher
MATCH (u:University { name: $name })
SET u.logoUrl = $logoUrl
RETURN id(u) AS uid
```

---

## 5. College/Institution Data Model

### University Node Properties (Neo4j)

| Property | Type | Description |
|---|---|---|
| name | string | Full official name (MERGE key) |
| isCollege | boolean | `true` for colleges/TVETs, absent for universities |
| location | string | "South Africa" |
| logoUrl | string | `/logos/filename.png` format — resolved by app |
| campusImageUrl | string | Full GCS URL for hero image |
| websiteUrl | string | Main website URL |
| description | string | 1-2 sentence description |
| ranking | int | Sort order (1000 = default) |
| applicationDeadline | string | Deadline text |
| fundingWebsiteUrl | string | Financial aid page URL |
| institutionType | string | `public_tvet`, `private_college`, `culinary_school`, etc. |
| publicOrPrivate | string | `public` or `private` |
| generalEmail | string | Contact email |
| admissionsEmail | string | Admissions email |
| generalPhone | string | Phone number |
| nsfasEligible | boolean | Whether NSFAS funding applies |
| receivesGovernmentSubsidy | boolean | Govt-subsidised |
| accommodationAvailable | boolean | On-campus housing |
| passRate | string/null | Pass rate if known |
| facilities | list[string] | ["Library", "Computer Labs"] |
| studentSupport | list[string] | ["Career Guidance"] |
| industryPartnerships | list[string] | Partner company names |
| registrationsJson | string (JSON) | Serialized array of registration bodies |
| campusesJson | string (JSON) | Serialized array of campus objects |

### College JSON File Structure (input format)

This is the JSON format the LLM produces and that gets loaded into Neo4j:

```json
{
  "institution": {
    "name": "Central Johannesburg TVET College",
    "shortName": "CJC",
    "type": "public_tvet",
    "publicOrPrivate": "public",
    "logoUrl": "/logos/cjc_logo.jpg",
    "websiteUrl": "https://cjc.edu.za",
    "description": "A public TVET college in Johannesburg...",
    "generalEmail": "info@cjc.edu.za",
    "admissionsEmail": "admissions@cjc.edu.za",
    "generalPhone": "(011) 351-6000",
    "registrations": [
      { "body": "DHET", "registrationNumber": null, "type": "government_registration" }
    ],
    "campuses": [
      { "name": "Parktown Campus", "city": "Johannesburg", "province": "Gauteng" }
    ],
    "nsfasEligible": true,
    "receivesGovernmentSubsidy": true,
    "facilities": ["Library", "Computer Labs", "Workshops"],
    "studentSupport": ["Student Support Services", "Career Guidance"],
    "accommodationAvailable": false,
    "industryPartnerships": ["Siemens", "Toyota"]
  },
  "departments": [
    {
      "name": "Engineering Studies",
      "qualifications": [
        {
          "id": "cjc-electrical-engineering-nated",
          "name": "Electrical Engineering N1-N6",
          "level": "NATED N1-N3",
          "qualificationType": "nated",
          "nqfLevel": 4,
          "duration": { "value": 3, "unit": "years" },
          "studyModes": ["full_time"],
          "campuses": ["Parktown Campus"],
          "admission": {
            "minQualification": "grade_9_getc",
            "minQualificationDisplay": "Grade 9 / GETC",
            "additionalRequirements": [],
            "rplAccepted": false
          },
          "fees": [
            { "item": "tuition", "amount": 15000, "period": "annual" }
          ],
          "careerOpportunities": ["Electrician", "Electrical Technician"],
          "skills": ["Circuit Design", "Electrical Wiring"],
          "industries": ["Construction", "Manufacturing"]
        }
      ]
    }
  ]
}
```

### Institution Type Enum Values
```
public_tvet | cet_college | private_college | private_hei | flight_school |
culinary_school | film_school | agricultural_college | nursing_college |
maritime_academy | beauty_academy | it_bootcamp | security_training |
theological_college | music_academy | sports_academy | ecd_college |
short_course_provider | other
```

### Qualification Level Enum Values
```
NCV Level 2-4 | NATED N1-N3 | NATED N4-N6 | Occupational Certificate |
Skills Programme | Learnership | Apprenticeship | Short Course |
Higher Certificate | Advanced Certificate | Diploma | Trade Test | Other
```

### Qualification Type Enum Values
```
ncv | nated | occupational_certificate | learnership | apprenticeship |
skills_programme | short_course | higher_certificate | advanced_certificate |
diploma | trade_test | sector_license | international_certification | other
```

### Admission minQualification Codes
```
none | abet_level_4 | grade_9_getc | grade_10 | grade_11 | grade_12_any |
nsc_higher_cert | nsc_diploma | nsc_bachelor | senior_cert_old |
ncv_level_2 | ncv_level_3 | ncv_level_4 | n3_certificate | n6_certificate |
nqf_level_2 | nqf_level_3 | nqf_level_4 | nqf_level_5 |
prior_diploma | prior_degree | other
```

---

## 6. Bursary Data Model

### Bursary Node Properties (Neo4j)

| Property | Type | Source | Description |
|---|---|---|---|
| id | string | `data.id` | Kebab-case unique ID (MERGE key) |
| name | string | `data.name` | Full bursary name |
| fundingType | string | `data.fundingType` | bursary/scholarship/loan/grant/fellowship |
| competitiveness | string | `data.competitiveness` | merit_only/need_only/merit_and_need/open |
| funderName | string | `data.funder.name` | Funder display name |
| funderLogoUrl | string | `data.funder.logoUrl` | `/logos/funder_logo.png` |
| funderCategory | string | `data.funder.category` | jse_listed/multinational/state_owned/etc. |
| applicationStatus | string | `data.application.status` | open/closed/upcoming |
| closingDate | string | `data.application.closingDate` | YYYY-MM-DD |
| fields | list[string] | `data.eligibility.academic.faculties` | Eligible fields |
| funderJson | string (JSON) | `data.funder` | Full funder object |
| eligibilityJson | string (JSON) | `data.eligibility` | Full eligibility object |
| coverageJson | string (JSON) | `data.coverageInfo` | Full coverage object |
| obligationsJson | string (JSON) | `data.obligations` | Full obligations object |
| applicationJson | string (JSON) | `data.application` | Full application object |
| renewalJson | string (JSON) | `data.renewal` | Full renewal object |

### Complete Bursary JSON Schema

This is the EXACT JSON structure the LLM must produce. It is also what gets
stored (partially as scalar properties, partially as JSON strings) in Neo4j.

```json
{
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
      "applicantLevels": ["undergrad_y1", "undergrad_y2", "any_undergrad", "any_postgrad", "honours", "masters", "phd"],
      "fundingTargetLevels": ["undergraduate", "postgraduate"],
      "minimumAps": null,
      "competitiveAps": null,
      "minAggregate": null,
      "subjectRequirementsTree": null,
      "subjectRequirementsRaw": "Text or null",
      "mathsLiteracyAccepted": null,
      "nbtRequired": null,
      "curriculumStream": null,
      "faculties": ["Engineering", "Commerce"],
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
    "modes": ["online", "paper", "email"],
    "requiredDocuments": ["Certified ID copy", "Academic transcript"],
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
}
```

### South African Bursary Defaults

These defaults MUST be included in the LLM prompt. They ensure the LLM doesn't
leave critical fields empty:

```
CITIZENSHIP:
  - Default to ["south_african"] if not mentioned
  - Only leave empty if explicitly "open to all nationalities"

COVERAGE:
  - NEVER leave coverageInfo.items empty for a bursary
  - At minimum include tuition

APPLICANT LEVELS:
  - NEVER leave applicantLevels empty — infer from context

WORK-BACK:
  - For corporate bursaries, use null (unknown) not false

fundingTargetLevels:
  - MUST be array, NEVER string "both"
  - Valid: ["undergraduate"], ["postgraduate"], or ["undergraduate", "postgraduate"]
```

---

## 7. Image Management System

### 7.1 Logos

**Storage:** `gs://cherry-app-assets/logos/{filename}.png`
**Neo4j property:** `logoUrl = "/logos/filename.png"` (for both colleges and bursary funders)
**Bursary:** `funderLogoUrl = "/logos/funder_logo.png"`

**How the app resolves logos (`logoSource.ts`):**
1. Check bundled `logoMap` for exact match → use `require()` (instant, no network)
2. If starts with `http` → use as-is (direct cloud URL)
3. If starts with `/logos/` → construct `https://storage.googleapis.com/cherry-app-assets/logos/{filename}`
4. Otherwise → fallback cherry icon

**File naming convention:** `{short_code}_logo.png`
Examples: `uct_logo.png`, `cjc_logo.jpg`, `absa_logo.png`, `shoprite_logo.jpg`

**Upload target:** `gs://cherry-app-assets/logos/{filename}`
**Content types:** PNG preferred, JPG accepted. No SVGs (React Native can't render them).
**After upload:** Set `logoUrl` on the Neo4j node to `/logos/{filename}`.

### 7.2 Hero Images (Campus Banner)

**Storage:** `gs://cherry-app-assets/campus_heroes/{filename}.jpg`
**Neo4j property:** `campusImageUrl` — full GCS URL for new institutions, legacy backslash path for old ones

**How the app resolves hero images (`campusImageSource.ts`):**
1. Check bundled `campusImageMap` for legacy backslash path → use `require()`
2. If starts with `http` → use as-is
3. If legacy path not in map → construct cloud URL from filename
4. Otherwise → null (placeholder shown)

**For new institutions:** Set `campusImageUrl` to the full GCS URL:
`https://storage.googleapis.com/cherry-app-assets/campus_heroes/{filename}.jpg`

**File naming convention:** `{institution_name_snake_case}.jpg`
Examples: `university_of_cape_town.jpg`, `the_beauty_academy.jpg`

**Upload target:** `gs://cherry-app-assets/campus_heroes/{filename}.jpg`
**Image specs:** JPEG, max 1200px wide, quality 80.

### 7.3 Campus Gallery Photos

**Storage:** `gs://cherry-app-assets/campus_photos/{slug}/{photo_filename}.jpg`
**NOT stored in Neo4j** — uses a separate cloud manifest file.

**Manifest:** `gs://cherry-app-assets/campus_photos/campus_photos_index.json`

The app fetches this manifest once, caches it in memory, and uses the Neo4j
node ID to look up photos for each institution.

**Manifest structure:**
```json
{
  "version": "1.0",
  "lastUpdated": "2026-03-14T15:30:00+02:00",
  "baseUrl": "https://storage.googleapis.com/cherry-app-assets/campus_photos",
  "institutions": {
    "211": {
      "slug": "central-johannesburg-tvet-college",
      "name": "Central Johannesburg TVET College",
      "photos": [
        {
          "id": "central-johannesburg-tvet-college-photo-1",
          "url": "https://storage.googleapis.com/cherry-app-assets/campus_photos/central-johannesburg-tvet-college/cjc_campus_1.jpg",
          "label": "Parktown Campus",
          "campus": "Parktown"
        }
      ]
    }
  }
}
```

**Key:** The institution key is the **Neo4j node ID** (from `id(u)`). This is
an integer assigned by Neo4j, queried via `MATCH (u:University { name: $name }) RETURN id(u)`.

**Photo object fields:**
- `id` — unique string: `{slug}-photo-{n}`
- `url` — full GCS URL
- `label` — human-readable description (e.g. "Krugersdorp Campus", NOT "Campus View 1")
- `campus` (optional) — campus name for filtering, must match `Degree.campuses[]`

**Upload flow for new campus photos:**
1. Upload image to `gs://cherry-app-assets/campus_photos/{slug}/{filename}.jpg`
2. Query Neo4j for the institution's node ID: `MATCH (u:University { name: $name }) RETURN id(u)`
3. Fetch current `campus_photos_index.json` from GCS
4. Add/update the entry under `institutions[nodeId]`
5. Upload updated manifest to GCS (same path, overwrite)

**Image specs:** JPEG, max 1200px wide, quality 80.

### 7.4 Image Processing Requirements

The admin panel must handle:
- **SVG → PNG conversion** (React Native doesn't support SVGs natively)
- **WebP → PNG/JPEG conversion** (many websites serve WebP)
- **Resize** to max 1200px wide (for hero/campus), maintain aspect ratio
- **JPEG compression** at quality 80

Use the `sharp` npm package — it handles all of the above in Node.js/Vercel serverless:
```typescript
import sharp from 'sharp';

// Resize and convert to JPEG
const buffer = await sharp(inputBuffer)
  .resize({ width: 1200, withoutEnlargement: true })
  .jpeg({ quality: 80 })
  .toBuffer();

// SVG to PNG
const pngBuffer = await sharp(svgBuffer).png().resize({ width: 800 }).toBuffer();
```

---

## 8. LLM Extraction Pipeline

### 8.1 Pipeline Overview

The LLM extraction pipeline converts unstructured text (from websites or
admin-pasted content) into structured JSON that matches the schemas above.

**Flow (two input paths):**
```
Path A (paste):
  Admin pastes text ──> Build prompt (schema + instructions + text) ──> OpenAI API
  ──> Parse JSON from response ──> Admin reviews/edits ──> Save to Neo4j

Path B (URL scrape):
  Admin enters URL ──> /api/scrape (Readability + linkedom) ──> clean text
  ──> Build prompt (schema + instructions + text) ──> OpenAI API
  ──> Parse JSON from response ──> Admin reviews/edits ──> Save to Neo4j
```

Both paths converge at the prompt-building step. The paste path is more reliable
(works for JS-heavy and blocked sites). The URL path is faster for accessible sites.

### 8.2 Bursary Extraction Prompt

The prompt has 4 components assembled together:

1. **Header** — identifies the funder and bursary name
2. **Schema** — the full JSON schema (section 6 above)
3. **Additional instructions** — tag-specific extraction rules
4. **Content** — the pasted/scraped text

**Full prompt template:**
```
TASK: Extract structured bursary/scholarship information from the provided web page content.

FUNDER: {funder_name}
BURSARY NAME: {bursary_name}
CONTENT TAGS: {content_tags}

You are extracting data for a South African educational app that helps matric
students find bursaries and funding. The data must be precise, complete, and
follow the exact JSON schema below.

OUTPUT FORMAT (JSON):
{BURSARY_JSON_SCHEMA}

CRITICAL RULES:
1. Extract ONLY what is present in the provided text — do NOT invent information
2. For fields not found in the text, use null — do NOT guess
3. Use the CANONICAL CODES listed in the schema for all coded fields
4. Dates must be in YYYY-MM-DD format
5. Monetary amounts must be integers in ZAR (e.g. 350000, not "R350,000")
6. The "id" must be kebab-case: funder-field-year (e.g. "shoprite-agri-sciences-2026")
7. officialUrl is REQUIRED
8. Be precise about eligibility
9. If multiple distinct bursaries exist, extract them as SEPARATE JSON objects
10. Work-back obligations: extract exact terms
11. Required documents: extract the full list if mentioned
12. Application status: "open" if currently accepting, "closed" if deadline passed, "upcoming" if not yet open

{additional_instructions per content tag}

--- BEGIN WEB PAGE CONTENT ---
{content}
--- END WEB PAGE CONTENT ---
```

**Content tags and their additional instructions:**
- `eligibility` — detailed rules for citizenship, age, gender, academic requirements
- `coverage` — what the bursary covers (tuition, accommodation, etc.)
- `obligations` — work-back, vacation work, academic maintenance
- `application` — dates, URLs, required documents, process
- `renewal` — renewal mechanism, tenure, failed module policy
- `general` — funder details, industry sector, recurring status

### 8.3 Merge Prompt (for multi-page extraction)

When a bursary's info spans multiple pages, partial extractions are merged:

```
TASK: Merge the following partial extractions into ONE complete bursary JSON.

FUNDER: {funder_name}
BURSARY NAME: {bursary_name}

MERGE RULES:
1. Combine all information — do not drop any data
2. If the same field appears in multiple partials, prefer non-null values
3. For lists, merge unique items
4. The final JSON must follow the exact schema structure

OUTPUT FORMAT:
{BURSARY_JSON_SCHEMA}

--- PARTIAL EXTRACTIONS ---
{partial_json_1}
{partial_json_2}
...

Output the merged JSON:
```

### 8.4 Admin Panel Chat Flow

For the admin panel's chat input, the flow is simplified:

1. Admin selects: "New Bursary" or "New College"
2. Admin enters: funder name, bursary name
3. Admin pastes: text from website (copied from browser)
4. API route builds prompt using the schema + instructions above
5. API route calls OpenAI with `response_format: { type: "json_object" }`
6. Response JSON is displayed in a structured editor
7. Admin reviews, edits any incorrect fields
8. Admin clicks "Save" → Cypher MERGE into Neo4j

### 8.5 College Extraction

College extraction uses the same flow but with the college schema (section 5).
The college schema includes the full `institution` + `departments[]` with
`qualifications[]` structure.

The college-specific LLM system message:
```
You are a precise data extraction assistant specializing in South African
college and TVET institution information. Always respond with valid JSON
matching the provided schema exactly.
```

### 8.6 Web Scraping (URL → Text Extraction)

The Python pipeline uses **trafilatura** to fetch a URL, strip navigation, footers,
ads, scripts, and boilerplate, then return clean article text. The admin panel
needs this same capability so admins can provide a URL instead of manually
copy-pasting text.

**Purpose:** Enable the flow: Admin enters URL → API route fetches page →
extracts clean text → feeds to LLM with schema prompt → returns structured JSON.

**TypeScript equivalent of trafilatura:**

| Package | Role |
|---|---|
| `@mozilla/readability` | Mozilla's Readability algorithm (same engine as Firefox Reader View). Strips navbars, footers, ads, scripts, and extracts the main article/content body. |
| `linkedom` | Lightweight DOM parser for Node.js (no browser required). Creates a DOM from raw HTML so Readability can process it. Much lighter than jsdom and works well in serverless. |

Install:
```bash
npm install @mozilla/readability linkedom
```

**Usage (in a Vercel API route):**
```typescript
import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';

async function extractTextFromUrl(url: string): Promise<{
  text: string;
  title: string | null;
}> {
  // 1. Fetch the raw HTML
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(15000), // 15s timeout
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }

  const html = await response.text();

  // 2. Parse HTML into a DOM using linkedom
  const { document } = parseHTML(html);

  // 3. Run Readability to extract clean content
  const reader = new Readability(document);
  const article = reader.parse();

  if (!article || !article.textContent || article.textContent.trim().length < 50) {
    throw new Error(`Could not extract meaningful content from ${url}`);
  }

  return {
    text: article.textContent.trim(),
    title: article.title || null,
  };
}
```

**Why these packages?**
- `@mozilla/readability` is the **exact algorithm** Firefox uses for Reader View — battle-tested on millions of websites
- `linkedom` is ~10x lighter than `jsdom`, runs in Vercel serverless without issues
- Together they replicate what `trafilatura` does in Python: intelligent content extraction that removes chrome/boilerplate
- No Puppeteer or headless browser needed — pure HTML parsing

**Limitations & fallback:**
- JavaScript-rendered pages (SPAs) won't work — the fetch only gets the initial HTML
- Some sites block server-side requests (403/captcha) — admin should paste text manually in these cases
- For JS-heavy or blocked pages, the admin panel should support **both** URL scraping AND paste input
- The paste-and-parse flow is always more reliable than scraping (no IP blocks, no timeouts, no JS rendering issues)

### 8.7 JSON Parsing from LLM Responses

The LLM sometimes returns JSON wrapped in markdown code blocks or with trailing
text. The admin panel must handle this robustly:

```typescript
function extractJsonFromResponse(text: string): any | null {
  const trimmed = text.trim();

  // 1. Try direct parse
  try {
    return JSON.parse(trimmed);
  } catch {}

  // 2. Try extracting from ```json ... ``` code blocks
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch {}
  }

  // 3. Find outermost { ... } or [ ... ] with brace matching
  for (const [startChar, endChar] of [['{', '}'], ['[', ']']]) {
    const startIdx = trimmed.indexOf(startChar);
    if (startIdx === -1) continue;

    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = startIdx; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === startChar) depth++;
      else if (ch === endChar) {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(trimmed.slice(startIdx, i + 1));
          } catch { break; }
        }
      }
    }
  }

  return null;
}
```

This mirrors the Python `extract_json_from_response()` in `extractor.py` and
handles all three common LLM response formats: pure JSON, code-block-wrapped, and
JSON with surrounding prose.

### 8.8 College-Specific Extraction Details

The college extraction prompt includes **SA TVET admission standards** — national
standards set by DHET that apply to ALL public TVET colleges. These must be
embedded in the prompt so the LLM uses them when the website doesn't explicitly
state admission requirements (many don't):

```
SOUTH AFRICAN TVET ADMISSION STANDARDS:
  NCV (National Certificate Vocational):
    NCV Level 2 entry → minQualification: grade_9_getc
    NCV Level 3 entry → minQualification: ncv_level_2
    NCV Level 4 entry → minQualification: ncv_level_3

  NATED Engineering (N1-N6):
    N1 entry → minQualification: grade_9_getc
    N2 entry → minQualification: nqf_level_2
    N3 entry → minQualification: nqf_level_3
    N4 entry → minQualification: grade_12_any (alternative: n3_certificate)
    N5 entry → minQualification: nqf_level_4
    N6 entry → minQualification: nqf_level_5

  NATED Business/Services (N4-N6):
    N4 entry → minQualification: grade_12_any (alternative: ncv_level_4)
    N5 entry → minQualification: nqf_level_4
    N6 entry → minQualification: nqf_level_5
```

**Content-tag-specific instructions** are appended to the prompt based on what
type of page is being scraped. These tags and their rules must be included:

**College content tags:**
- `programmes` — extract every qualification, group under departments, NCV spans L2-L4 as ONE entry, NATED N4-N6 as ONE entry
- `admission` — TVET colleges use different entry requirements than universities (Grade 9/GETC for NCV, not APS scores)
- `fees` — extract as integer ZAR, specify period (annual/per_trimester), note NSFAS eligibility
- `contact` — map programmes to specific campuses, extract physical addresses
- `general` — DHET/UMALUSI registration, facilities, accommodation, industry partnerships
- `single_programme` — when the page describes ONE specific qualification (not a listing page)

**Bursary content tags:**
- `eligibility` — citizenship, age, gender, province, race, academic requirements, financial means
- `coverage` — tuition, accommodation, books, laptop, stipend, disbursement method
- `obligations` — work-back terms (years, employer, penalty), vacation work, community service
- `application` — opening/closing dates, URL, required documents, modes, stages
- `renewal` — mechanism, tenure, failed module policy, transferability
- `general` — funder legal name, JSE listing status, industry sector, recurring status

### 8.9 Multi-Bursary Extraction

Some funders offer multiple distinct bursaries on one page (e.g. Shoprite has
separate bursaries for Accounting, Agricultural Sciences, Supply Chain, and Retail
Management). The prompt must handle this:

```
OUTPUT FORMAT (JSON array):
{
  "bursaries": [
    <Each object follows the full bursary schema>
  ]
}

CRITICAL:
- Each distinct bursary gets its OWN JSON object with a UNIQUE id
- Shared info (funder details, general eligibility) should be duplicated across all
- Different closing dates, different fields, different coverage = SEPARATE bursaries
- If only ONE bursary exists, the array should have exactly one element
```

The admin panel should detect whether the LLM returns a single object or a
`{ "bursaries": [...] }` wrapper and handle both cases.

### 8.10 Known Issues & Temporal Problems

**Application status temporal bug:** The LLM reads the CURRENT state of a bursary
website. If a bursary is recurring and the current cycle has closed, the LLM will
report `status: "closed"` even when you're creating the entry for the NEXT cycle
(e.g. 2027). The admin panel must:
1. Let admins override the status independently of LLM extraction
2. Display a warning if extracted status seems wrong (e.g. status "closed" but
   closingDate is in the future)
3. For upcoming cycle bursaries, default to `status: "upcoming"` and let admins
   set the correct cycle year

**Dual property consistency:** Bursary nodes store data in TWO places:
- Scalar properties (`b.applicationStatus`, `b.closingDate`, `b.funderName`, etc.)
- Serialized JSON strings (`b.applicationJson`, `b.eligibilityJson`, etc.)

When updating a bursary, BOTH must be updated. If you change `applicationStatus`,
you must also parse `applicationJson`, update its `.status` field, and re-serialize it.
The save function must handle this automatically:

```typescript
// When saving bursary data to Neo4j, ensure consistency:
const applicationObj = typeof data.application === 'string'
  ? JSON.parse(data.application) : data.application;

// Scalar properties for quick queries
const scalarProps = {
  applicationStatus: applicationObj.status,
  closingDate: applicationObj.closingDate,
  funderName: data.funder?.name,
  funderLogoUrl: data.funder?.logoUrl,
  funderCategory: data.funder?.category,
  fields: data.eligibility?.academic?.faculties,
};

// Serialized JSON for full data
const jsonProps = {
  funderJson: JSON.stringify(data.funder),
  eligibilityJson: JSON.stringify(data.eligibility),
  coverageJson: JSON.stringify(data.coverageInfo),
  obligationsJson: JSON.stringify(data.obligations),
  applicationJson: JSON.stringify(data.application),
  renewalJson: JSON.stringify(data.renewal),
};
```

**Blocked websites (403):** Some bursary websites block automated requests.
The admin panel should detect fetch failures and prompt the admin to paste text
manually instead. The Sasol mainstream bursary site is a known example of this.

---

## 9. Admin Panel Feature Requirements

### 9.1 Authentication

Simple admin auth — options (pick one):
- Vercel password protection (Pro plan feature)
- Environment variable password check (simplest)
- NextAuth.js with Google OAuth (if multi-user needed)

### 9.2 Bursary Management

**List View:**
- Table of all bursaries with: name, funder, status (open/closed/upcoming), closing date, logo
- Filter by status, search by name
- Click to edit

**Edit View:**
- Structured form with ALL bursary fields organized by section:
  - General (name, id, fundingType, competitiveness)
  - Funder (name, legalName, category, industrySector, logoUrl)
  - Eligibility > Academic (applicantLevels, fundingTargetLevels, faculties, APS, subjects)
  - Eligibility > Demographic (citizenship, race, gender, age, provinces)
  - Eligibility > Financial (householdIncome, meansTest)
  - Coverage (items with amount/period/notes)
  - Obligations > Work-back (required, years, employer)
  - Obligations > During Studies (vacation work, mentorship)
  - Obligations > Academic (maintenance average, reporting)
  - Application (status, dates, URL, documents, modes)
  - Renewal (mechanism, tenure, failedModulePolicy)
- Each coded field uses a dropdown with the canonical values
- Array fields (applicantLevels, faculties, requiredDocuments) use tag-style inputs
- Save button → updates Neo4j
- Delete button → removes from Neo4j

**LLM Chat Input (two modes):**

*Mode 1 — Paste:*
- Text area for pasting bursary page content (copied from browser)
- Fields for: funder name, bursary name
- "Extract" button → calls OpenAI → populates the edit form
- Admin reviews and edits before saving

*Mode 2 — URL:*
- URL input field
- Fields for: funder name, bursary name
- "Scrape & Extract" button → calls `/api/scrape` → shows extracted text preview
  → admin confirms → calls OpenAI → populates the edit form
- If scrape fails (403/timeout), show error and suggest switching to paste mode
- Admin reviews and edits before saving

**Logo Upload:**
- File input accepting PNG/JPG
- Preview thumbnail
- Upload to GCS → set `funderLogoUrl` on the bursary node

### 9.3 College Management

**List View:**
- Table: name, type, public/private, logo, campus count, qualification count
- Filter by institutionType
- Click to edit

**Edit View:**
- Institution details form (all fields from section 5)
- Departments section:
  - Expandable accordion per department
  - Each shows qualifications within it
  - Add/remove departments
  - Add/remove qualifications (full qualification form)
- Save → MERGE into Neo4j (auto-clears old faculties/degrees, re-creates)
- Delete → cascading delete (degrees → faculties → university node)

**Image Management (per college):**
- **Logo:** Upload PNG/JPG → GCS, set `u.logoUrl`
- **Hero Image:** Upload JPG → GCS, set `u.campusImageUrl`
- **Campus Gallery:** Upload multiple JPGs → GCS, update `campus_photos_index.json`
  - Each photo needs: file, label (descriptive!), optional campus name
  - Must query Neo4j for node ID to key the manifest entry

### 9.4 Dashboard

- Count of: institutions (universities vs colleges), bursaries (open/closed/upcoming)
- Quick actions: add bursary, add college
- Recent changes log (if feasible)

---

## 10. API Route Design

### `/api/neo4j` — Generic Neo4j Query Proxy

```typescript
// POST /api/neo4j
// Body: { statement: string, parameters?: object }
// Returns: Neo4j response JSON

export async function POST(req: Request) {
  const { statement, parameters } = await req.json();
  const auth = Buffer.from('neo4j:PASSWORD').toString('base64');

  const res = await fetch('https://1172d0e4.databases.neo4j.io/db/neo4j/query/v2', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ statement, parameters: parameters ?? {} }),
  });

  return Response.json(await res.json());
}
```

### `/api/upload/logo` — Logo Upload

```typescript
// POST /api/upload/logo
// Body: FormData with 'file' and 'filename'
// Returns: { url: string, logoPath: string }

// 1. Process image with sharp (resize, convert to PNG if needed)
// 2. Upload to gs://cherry-app-assets/logos/{filename}
// 3. Return { url: "https://storage.../logos/file.png", logoPath: "/logos/file.png" }
```

### `/api/upload/hero` — Hero Image Upload

```typescript
// POST /api/upload/hero
// Body: FormData with 'file' and 'filename'
// 1. Process: resize to max 1200px, JPEG quality 80
// 2. Upload to gs://cherry-app-assets/campus_heroes/{filename}.jpg
// 3. Return full URL
```

### `/api/upload/campus-photo` — Campus Gallery Photo Upload

```typescript
// POST /api/upload/campus-photo
// Body: FormData with 'file', 'slug', 'label', 'campus' (optional)
// 1. Process image
// 2. Upload to gs://cherry-app-assets/campus_photos/{slug}/{filename}.jpg
// 3. Fetch current campus_photos_index.json from GCS
// 4. Add photo entry
// 5. Re-upload updated index
// 6. Return updated entry
```

### `/api/scrape` — URL Text Extraction

```typescript
// POST /api/scrape
// Body: { url: string }
// Returns: { text: string, title: string | null }
//
// Uses @mozilla/readability + linkedom to fetch a URL and extract clean text.
// This is the TypeScript equivalent of the Python trafilatura pipeline.
//
// Flow: fetch HTML → parse DOM with linkedom → run Readability → return clean text
// The returned text can then be sent to /api/parse/bursary or /api/parse/college
//
// Error cases:
//   - 403/blocked → return { error: "blocked", message: "..." } (admin should paste instead)
//   - Timeout → return { error: "timeout", message: "..." }
//   - No content extracted → return { error: "empty", message: "..." }
```

### `/api/parse/bursary` — LLM Bursary Extraction

```typescript
// POST /api/parse/bursary
// Body: { funderName: string, bursaryName: string, content: string, tags?: string[] }
// 1. Build prompt using BURSARY_JSON_SCHEMA + content
// 2. Call OpenAI with response_format: json_object
// 3. Parse response
// 4. Return structured JSON (not yet saved — admin reviews first)
```

### `/api/parse/college` — LLM College Extraction

```typescript
// POST /api/parse/college
// Body: { collegeName: string, content: string }
// 1. Build prompt using COLLEGE_JSON_SCHEMA + content
// 2. Call OpenAI
// 3. Return structured JSON for admin review
```

### `/api/bursaries` — Bursary CRUD

```typescript
// GET  /api/bursaries           — List all bursaries
// GET  /api/bursaries/[id]      — Get single bursary
// POST /api/bursaries           — Create bursary (body = full bursary JSON)
// PUT  /api/bursaries/[id]      — Update bursary
// DELETE /api/bursaries/[id]    — Delete bursary
```

### `/api/colleges` — College CRUD

```typescript
// GET  /api/colleges            — List all colleges
// GET  /api/colleges/[name]     — Get college with departments
// POST /api/colleges            — Create college (body = full college JSON)
// PUT  /api/colleges/[name]     — Update college
// DELETE /api/colleges/[name]   — Delete college (cascading)
```

---

## Appendix A: Current Data Inventory

### Colleges in Neo4j (isCollege = true)
| Name | Node ID | Type |
|---|---|---|
| The Beauty Academy | 208 | beauty_academy |
| Central Johannesburg TVET College | 211 | public_tvet |
| South West Gauteng TVET College | 609 | public_tvet |
| Western TVET College | 1187 | public_tvet |
| Qualitas Training Centre | 1257 | private_college |
| Ekurhuleni West TVET College | 1315 | public_tvet |
| Chefs Training and Innovation Academy | 1463 | culinary_school |
| Institute of Culinary Arts | 1467 | culinary_school |

### Bursaries in Neo4j
| Name | ID | Funder | Status |
|---|---|---|---|
| Absa Fellowship Programme | absa-fellowship-2027 | Absa | upcoming |
| AfriSam Zeekoewater Engineering | afrisam-zeekoewater-2026 | AfriSam | closed |
| ARM Bright Sparks Bursary | arm-bright-sparks-2027 | ARM | upcoming |
| Armscor External Bursary Scheme | armscor-external-bursary-2026 | Armscor | closed |
| CSIR-Sasol Foundation STEM | csir-sasol-foundation-stem-2027 | CSIR | upcoming |
| Investec Tertiary Bursary | investec-tertiary-bursary-2027 | Investec | upcoming |
| Nedbank External Bursary | nedbank-external-bursary-2027 | Nedbank | upcoming |
| SANA Horticulture Bursary | sana-horticulture-bursary-2026 | SANA | open |
| SASCP Crop Production | sascp-crop-production-bursary-2026 | SASCP | open |
| Shoprite: Accounting (CA) | shoprite-accounting-ca-2026 | Shoprite | open |
| Shoprite: Agricultural Sciences | shoprite-agri-sciences-2026 | Shoprite | open |
| Shoprite: Retail Business Mgmt | shoprite-retail-business-management-2026 | Shoprite | open |
| Shoprite: Supply Chain | shoprite-supply-chain-logistics-2026 | Shoprite | open |
| Standard Bank Group Bursary | standard-bank-group-bursary-2027 | Standard Bank | upcoming |

### GCS Bucket Structure
```
gs://cherry-app-assets/
  logos/
    uct_logo.png
    absa_logo.png
    beauty_academy_logo.png
    ... (48 total)
  campus_heroes/
    university_of_cape_town.jpg
    the_beauty_academy.jpg
    ... (32 total)
  campus_photos/
    campus_photos_index.json
    university-of-cape-town/
      campus-1.jpg
      campus-2.jpg
    central-johannesburg-tvet-college/
      cjc_campus_1.jpg
      cjc_campus_2.jpg
    ... (32 institutions, ~100 photos total)
```

---

## Appendix B: Vercel Environment Variables Needed

```env
# All secrets are in .env file (gitignored) — copy to Vercel env vars
# See .env for: NEO4J_URL, NEO4J_USERNAME, NEO4J_PASSWORD,
# OPENAI_API_KEY, OPENAI_MODEL, ANTHROPIC_API_KEY,
# GCS_PROJECT_ID, GCS_BUCKET_NAME, GCS_SERVICE_ACCOUNT_KEY,
# ADMIN_PASSWORD
```

---

## Appendix C: Key Differences Between Universities and Colleges

| Aspect | Universities | Colleges |
|---|---|---|
| Node label | `:University` | `:University` (same!) |
| Distinguisher | `isCollege` absent or false | `isCollege = true` |
| Degree structure | `:Faculty` → `:Degree` | Same graph structure |
| Qualification types | degrees, diplomas | NCV, NATED, learnerships, skills programmes |
| Admission | APS-based, NSC pass types | Grade 9 GETC, NCV levels, etc. |
| NSFAS | All eligible | Public TVETs yes, private no |
| Data source | Prospectus PDFs (existing pipeline) | Web scraping pipeline (new) |

The admin panel should handle BOTH seamlessly — the same `:University` CRUD
works for both. Just add an `isCollege` toggle in the UI.

---

## Appendix D: NPM Dependencies

```json
{
  "dependencies": {
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "openai": "^4.x",
    "@google-cloud/storage": "^7.x",
    "sharp": "^0.33.x",
    "@mozilla/readability": "^0.5.x",
    "linkedom": "^0.16.x"
  }
}
```

| Package | Purpose |
|---|---|
| `next` | Framework — SSR, API routes, file-based routing |
| `openai` | LLM calls for structured data extraction |
| `@google-cloud/storage` | Upload images to GCS bucket |
| `sharp` | Image processing: resize, SVG→PNG, WebP→JPG, compression |
| `@mozilla/readability` | Extract clean text from HTML (strip nav/footer/ads) |
| `linkedom` | Lightweight DOM parser for Readability (no browser needed) |

---

## Appendix E: Complete Admin Panel Input/Output Flow

This end-to-end flow shows how all pieces connect for the most common operation:
adding a new bursary from a URL.

```
1. Admin opens admin panel → /admin/bursaries/new
2. Admin enters:
   - Funder name: "FNB"
   - Bursary name: "FNB Fund Bursary"
   - URL: https://www.fnb.co.za/bursary
3. Admin clicks "Scrape & Extract"
4. Frontend calls POST /api/scrape { url: "https://www.fnb.co.za/bursary" }
5. API route:
   a. fetch(url) → get raw HTML
   b. parseHTML(html) via linkedom → DOM
   c. new Readability(document).parse() → clean text
   d. Return { text: "FNB is proud to offer...", title: "FNB Fund Bursary" }
6. Frontend shows extracted text preview, admin confirms it looks right
7. Frontend calls POST /api/parse/bursary {
     funderName: "FNB",
     bursaryName: "FNB Fund Bursary",
     content: "<extracted text>",
     tags: ["eligibility", "coverage", "application", "general"]
   }
8. API route:
   a. Build prompt: BURSARY_BASE_PROMPT with schema + additional instructions + content
   b. Call OpenAI: model=gpt-5.4, temperature=0.15, response_format=json_object
   c. Parse JSON from response (handle code blocks, brace matching)
   d. Return structured bursary JSON
9. Frontend populates structured edit form with extracted data
10. Admin reviews every field, fixes any LLM mistakes:
    - Overrides applicationStatus if wrong (temporal bug)
    - Sets correct cycleYear
    - Fixes funderLogoUrl to match existing logo in GCS
    - Corrects any missing eligibility details
11. Admin clicks "Save"
12. Frontend calls POST /api/bursaries with the full bursary JSON
13. API route:
    a. Generate scalar props + serialized JSON props
    b. Run MERGE Cypher query against Neo4j
    c. Return { id: "fnb-fund-bursary-2027", success: true }
14. Admin sees success confirmation, bursary appears in list view
15. Mobile app queries Neo4j on next load → sees the new bursary
```

This same pattern applies to colleges — just swap the schema, prompt, and
CRUD endpoint. The URL scraping step is optional; the admin can paste text
directly if the website is JS-heavy or blocks automated requests.
