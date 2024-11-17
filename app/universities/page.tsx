// app/universities/page.tsx

import React from 'react';
import neo4j from 'neo4j-driver';
import driver from '../lib/neo4j';
import UniversityCard from '../components/UniversityCard';
import UniversitiesList from '../components/UniversitiesList';
import { UniversityWithFaculties, Faculty } from '../types';


interface University {
  id: number;
  name: string;
  location: string;
  // Add other properties as needed
}

// app/universities/page.tsx

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
        const facultiesNodes = record.get('faculties') as neo4j.Node[];
  
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
          faculties, // Attach the faculties to the university
        };
      });
  
      // Render the page with the fetched data
      return (
        <div>
          <h1>Universities</h1>
          <UniversitiesList universities={universities} />
        </div>
      );
    } catch (error) {
      console.error('Error fetching universities and faculties:', error);
      return <div>Error loading universities.</div>;
    } finally {
      await session.close();
    }
  };
  
  export default UniversitiesPage;
  