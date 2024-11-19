// components/FacultySpinner.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Faculty, Degree } from '../types';
import DegreeGrid from './DegreeGrid';
import { CircularProgress, FormControl, InputLabel, Select, MenuItem,SelectChangeEvent } from '@mui/material';

interface FacultySpinnerProps {
  faculties: Faculty[];
  filterByEligibility: boolean; // Ignored for now as per user's instruction
}

const FacultySpinner: React.FC<FacultySpinnerProps> = ({ faculties, filterByEligibility }) => {
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [loadingDegrees, setLoadingDegrees] = useState(false);

  const handleFacultyChange = async (event: SelectChangeEvent<number>) => {
    const facultyId = Number(event.target.value);
    setSelectedFacultyId(facultyId);

    // Fetch degrees for the selected faculty
    setLoadingDegrees(true);
    try {
      const response = await fetch(`/api/degrees?facultyId=${facultyId}`);
      const data = await response.json();
      if (response.ok) {
        setDegrees(data.degrees);
      } else {
        console.error('Error fetching degrees:', data.error);
        setDegrees([]);
      }
    } catch (error) {
      console.error('Error fetching degrees:', error);
      setDegrees([]);
    } finally {
      setLoadingDegrees(false);
    }
  };

  return (
    <div>
      <FormControl fullWidth variant="outlined">
        <InputLabel id="faculty-select-label">Select Faculty</InputLabel>
        <Select
          labelId="faculty-select-label"
          value={selectedFacultyId || ''}
          onChange={handleFacultyChange}
          label="Select Faculty"
        >
          <MenuItem value="" disabled>
            Select Faculty
          </MenuItem>
          {faculties.map((faculty) => (
            <MenuItem key={faculty.id} value={faculty.id}>
              {faculty.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loadingDegrees && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <CircularProgress />
        </div>
      )}

      {!loadingDegrees && degrees.length > 0 && (
        <DegreeGrid degrees={degrees} filterByEligibility={false}/>
      )}
    </div>
  );
};

export default FacultySpinner;
