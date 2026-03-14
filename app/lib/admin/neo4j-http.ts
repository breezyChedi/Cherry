const NEO4J_URL = process.env.NEO4J_URL || 'https://1172d0e4.databases.neo4j.io/db/neo4j/query/v2';
const NEO4J_USERNAME = process.env.NEO4J_USERNAME || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || '';

export async function neo4jQuery(statement: string, parameters: Record<string, unknown> = {}) {
  const short = statement.trim().replace(/\s+/g, ' ').slice(0, 120);
  console.log(`[NEO4J] Query: ${short}...`);
  console.log(`[NEO4J] Params keys: [${Object.keys(parameters).join(', ')}]`);
  const start = Date.now();

  const auth = Buffer.from(`${NEO4J_USERNAME}:${NEO4J_PASSWORD}`).toString('base64');

  const res = await fetch(NEO4J_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ statement, parameters }),
    cache: 'no-store',
  });

  const elapsed = Date.now() - start;

  if (!res.ok) {
    const text = await res.text();
    console.error(`[NEO4J] ERROR ${res.status} after ${elapsed}ms: ${text.slice(0, 300)}`);
    throw new Error(`Neo4j HTTP error ${res.status}: ${text}`);
  }

  const json = await res.json();
  const rowCount = json?.data?.values?.length || 0;
  console.log(`[NEO4J] OK ${elapsed}ms — ${rowCount} row(s)`);
  return json;
}

// Parse Neo4j HTTP API response into a simple array of row objects
export function parseNeo4jResponse(response: { data?: { fields?: string[]; values?: unknown[][] } }): Record<string, unknown>[] {
  const fields = response?.data?.fields || [];
  const values = response?.data?.values || [];

  const rows = values.map((row: unknown[]) => {
    const obj: Record<string, unknown> = {};
    fields.forEach((field: string, i: number) => {
      const val = row[i];
      if (val && typeof val === 'object' && 'properties' in (val as Record<string, unknown>)) {
        obj[field] = (val as { properties: unknown }).properties;
      } else {
        obj[field] = val;
      }
    });
    return obj;
  });

  console.log(`[NEO4J] Parsed ${rows.length} row(s), fields: [${fields.join(', ')}]`);
  return rows;
}
