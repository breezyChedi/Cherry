// app/components/UniversitiesPageContent.tsx

'use client';

import React, { useState } from 'react';
import UniversitiesList from './UniversitiesList';
import { UniversityWithFaculties } from '../types';
import { Checkbox, FormControlLabel } from '@mui/material';

interface UniversitiesPageContentProps {
  universities: UniversityWithFaculties[];
}

const UniversitiesPageContent: React.FC<UniversitiesPageContentProps> = ({ universities }) => {
  const [filterByEligibility, setFilterByEligibility] = useState<boolean>(false);

  return (
    <div>
      
      <h1 style={{ fontFamily: 'Arial' }}>Universities and Degrees</h1>
      <FormControlLabel
        control={
          <Checkbox
            checked={filterByEligibility}
            onChange={(e) => setFilterByEligibility(e.target.checked)}
            color="primary"
          />
        }
        label="Filter by Eligibility"
      />
      <UniversitiesList universities={universities} filterByEligibility={filterByEligibility} />
    </div>
  );
};

export default UniversitiesPageContent;
