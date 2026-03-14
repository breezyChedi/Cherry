const NEO4J_URL = process.env.NEO4J_URL || 'https://1172d0e4.databases.neo4j.io/db/neo4j/query/v2';
const NEO4J_USERNAME = process.env.NEO4J_USERNAME || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || '';

export async function neo4jQuery(statement: string, parameters: Record<string, unknown> = {}) {
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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Neo4j HTTP error ${res.status}: ${text}`);
  }

  return res.json();
}

// Parse Neo4j HTTP API response into a simple array of row objects
export function parseNeo4jResponse(response: { data?: { fields?: string[]; values?: unknown[][] } }): Record<string, unknown>[] {
  const fields = response?.data?.fields || [];
  const values = response?.data?.values || [];

  return values.map((row: unknown[]) => {
    const obj: Record<string, unknown> = {};
    fields.forEach((field: string, i: number) => {
      const val = row[i];
      // If it's a Neo4j node, extract properties
      if (val && typeof val === 'object' && 'properties' in (val as Record<string, unknown>)) {
        obj[field] = (val as { properties: unknown }).properties;
      } else {
        obj[field] = val;
      }
    });
    return obj;
  });
}
