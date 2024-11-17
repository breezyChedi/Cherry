// components/UniversitiesList.tsx
"use client";

import React, { useState } from 'react';
import UniversityCard from './UniversityCard';
import FacultySpinner from './FacultySpinner';
import { UniversityWithFaculties } from '../types';

interface UniversitiesListProps {
  universities: UniversityWithFaculties[];
}

const UniversitiesList: React.FC<UniversitiesListProps> = ({ universities }) => {
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityWithFaculties | null>(null);

  const handleSelectUniversity = (university: UniversityWithFaculties) => {
    setSelectedUniversity(university);
  };

  return (
    <div>
      <div style={{ display: 'flex', overflowX: 'auto', padding: '16px' }}>
        {universities.map((university) => (
          <UniversityCard
            key={university.id}
            university={university}
            isSelected={selectedUniversity?.id === university.id}
            onSelect={handleSelectUniversity}
          />
        ))}
      </div>
      {selectedUniversity && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <FacultySpinner faculties={selectedUniversity.faculties} />
        </div>
      )}
    </div>
  );
};

export default UniversitiesList;

