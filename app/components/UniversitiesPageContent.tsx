'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import UniversitiesList from './UniversitiesList';
import { UniversityWithFaculties } from '../types';
import { Filter } from 'lucide-react';

interface UniversitiesPageContentProps {
  universities: UniversityWithFaculties[];
}

const UniversitiesPageContent: React.FC<UniversitiesPageContentProps> = ({ universities }) => {
  const [filterByEligibility, setFilterByEligibility] = useState<boolean>(false);

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #fddeff 0%, #ffe4f5 100%)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black text-pink-600 mb-3">Explore Universities</h1>
          <p className="text-gray-600 text-lg">Find the perfect university and course for your future</p>
        </motion.div>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={filterByEligibility}
                onChange={(e) => setFilterByEligibility(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-[#FF1493] peer-checked:to-[#FF69B4] transition-all"></div>
              <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6 shadow-md"></div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-pink-500" size={20} />
              <span className="font-semibold text-gray-800">Filter by Eligibility</span>
            </div>
            <span className="text-sm text-gray-500 ml-2">
              {filterByEligibility ? 'Showing only courses you qualify for' : 'Showing all courses'}
            </span>
          </label>
        </motion.div>

        {/* Universities List */}
        <UniversitiesList universities={universities} filterByEligibility={filterByEligibility} />
      </div>
    </div>
  );
};

export default UniversitiesPageContent;
