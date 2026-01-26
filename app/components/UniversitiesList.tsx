'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import UniversityCard from './UniversityCard';
import FacultySpinner from './FacultySpinner';
import { UniversityWithFaculties } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UniversitiesListProps {
  universities: UniversityWithFaculties[];
  filterByEligibility: boolean;
}

const UniversitiesList: React.FC<UniversitiesListProps> = ({ universities, filterByEligibility }) => {
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityWithFaculties | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const handleSelectUniversity = (university: UniversityWithFaculties) => {
    setSelectedUniversity(university);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div>
      {/* Universities Carousel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative mb-8"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-10"
          >
            <ChevronLeft className="text-pink-500" size={24} />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex-1 flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {universities.map((university, idx) => (
              <motion.div
                key={university.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
              >
                <UniversityCard
                  university={university}
                  isSelected={selectedUniversity?.id === university.id}
                  onSelect={handleSelectUniversity}
                />
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => scroll('right')}
            className="hidden md:flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-10"
          >
            <ChevronRight className="text-pink-500" size={24} />
          </button>
        </div>
      </motion.div>

      {/* Faculty Spinner */}
      {selectedUniversity && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FacultySpinner faculties={selectedUniversity.faculties} filterByEligibility={filterByEligibility} />
        </motion.div>
      )}
    </div>
  );
};

export default UniversitiesList;
