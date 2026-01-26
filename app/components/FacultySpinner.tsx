'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Faculty, Degree } from '../types';
import DegreeGrid from './DegreeGrid';
import { GraduationCap, Loader } from 'lucide-react';

interface FacultySpinnerProps {
  faculties: Faculty[];
  filterByEligibility: boolean;
}

const FacultySpinner: React.FC<FacultySpinnerProps> = ({ faculties, filterByEligibility }) => {
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [loadingDegrees, setLoadingDegrees] = useState(false);

  const handleFacultyChange = async (facultyId: number) => {
    setSelectedFacultyId(facultyId);

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

  const selectedFaculty = faculties.find((faculty) => faculty.id === selectedFacultyId);

  return (
    <div>
      {/* Faculty Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      >
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <GraduationCap className="text-pink-500" size={20} />
          Select Faculty
        </label>
        <select
          value={selectedFacultyId || ''}
          onChange={(e) => handleFacultyChange(Number(e.target.value))}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors bg-white text-gray-800"
        >
          <option value="" disabled>
            Choose a faculty...
          </option>
          {faculties.map((faculty) => (
            <option key={faculty.id} value={faculty.id}>
              {faculty.name}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Loading State */}
      {loadingDegrees && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <Loader className="w-12 h-12 text-pink-600 animate-spin mb-4" />
          <p className="text-gray-600 font-semibold">Loading degrees...</p>
        </motion.div>
      )}

      {/* Degrees Grid */}
      {!loadingDegrees && degrees.length > 0 && (
        <DegreeGrid degrees={degrees} filterByEligibility={filterByEligibility} faculty={selectedFaculty?.name} />
      )}
    </div>
  );
};

export default FacultySpinner;
