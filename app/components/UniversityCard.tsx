'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, ExternalLink } from 'lucide-react';

interface University {
  id: number;
  name: string;
  location: string;
  logoUrl: string;
  appUrl: string;
}

interface UniversityCardProps {
  university: University;
  isSelected: boolean;
  onSelect: (university: University) => void;
}

const UniversityCard: React.FC<UniversityCardProps> = ({ university, isSelected, onSelect }) => {
  return (
    <motion.div
      onClick={() => onSelect(university)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={`min-w-[240px] cursor-pointer rounded-2xl p-6 transition-all duration-300 flex flex-col ${
        isSelected
          ? 'bg-gradient-to-br from-pink-50 to-white border-2 border-pink-500 shadow-xl'
          : 'bg-white border-2 border-gray-200 shadow-lg hover:border-pink-300'
      }`}
    >
      {/* Logo Container */}
      <div className="flex items-center justify-center h-28 mb-4">
        <div className="relative w-24 h-24">
          <Image
            src={university.logoUrl}
            alt={`${university.name} Logo`}
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* University Info */}
      <div className="flex-1">
        <h3 className="font-bold text-gray-800 text-center mb-2 line-clamp-2">
          {university.name}
        </h3>
        <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-4">
          <MapPin size={16} className="text-pink-500" />
          <span>{university.location}</span>
        </div>
      </div>

      {/* Application Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          window.open(university.appUrl, '_blank');
        }}
        className="w-full bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white font-semibold py-2 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        <ExternalLink size={16} />
        Application
      </button>
    </motion.div>
  );
};

export default UniversityCard;
