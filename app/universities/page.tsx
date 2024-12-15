// app/universities/page.tsx

import React from 'react';
import {Node} from 'neo4j-driver';
import driver from '../lib/neo4j';
import UniversitiesPageContent from '../components/UniversitiesPageContent';
import { UniversityWithFaculties, Faculty } from '../types';

const UniversitiesPage = async () => {
  const session = driver.session();

  try {
    // Execute the Cypher query
    const result = await session.run(
      `
      MATCH (u:University)-[:HAS_FACULTY]->(f:Faculty)
      RETURN u, collect(f) AS faculties
      ORDER BY u.ranking
      `
    );

    // Process the results
    const universities: UniversityWithFaculties[] = result.records.map((record) => {
      const universityNode = record.get('u');
      const facultiesNodes = record.get('faculties') as Node[];

      // Map faculties to a list of Faculty objects
      const faculties: Faculty[] = facultiesNodes.map((facultyNode) => ({
        id: facultyNode.identity.toNumber(),
        name: facultyNode.properties.name,
        // Include other faculty properties if needed
      }));

      return {
        id: universityNode.identity.toNumber(),
        name: universityNode.properties.name,
        location: universityNode.properties.location,
        logoUrl: universityNode.properties.logoUrl,
        appUrl: universityNode.properties.appUrl,
        faculties, // Attach the faculties to the university
      };
    });
    console.log("universities\n",universities)
    // Render the page with the fetched data
    return <UniversitiesPageContent universities={universities} />;
  } catch (error) {
    console.error('Error fetching universities and faculties:', error);
    
    return <div>Error loading universities.</div>;
  } finally {
    await session.close();
  }
};

export default UniversitiesPage;
