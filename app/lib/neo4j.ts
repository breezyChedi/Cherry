// lib/neo4j.ts
import neo4j from 'neo4j-driver';

const uri = process.env.NEO4J_URI as string;
const user = process.env.NEO4J_USERNAME as string;
const password = process.env.NEO4J_PASSWORD as string;

if (!uri || !user || !password) {
  throw new Error('Missing Neo4j connection details in environment variables.');
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

export default driver;
