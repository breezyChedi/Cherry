// app/components/UniversityCard.tsx
"use client";

import React from 'react';

interface University {
  id: number;
  name: string;
  location: string;
  logoUrl: string;
  // Add other properties as needed
}

interface UniversityCardProps {
  university: University;
  isSelected: boolean;
  onSelect: (university: University) => void;
}

/*
const UniversityCard: React.FC<UniversityCardProps> = ({ university, isSelected, onSelect }) => (
  <div
    onClick={() => onSelect(university)}
    style={{
      cursor: 'pointer',
      minWidth: isSelected ? '220px' : '200px',
      minHeight: isSelected ? '280px' : '260px',
      marginRight: '16px',
      padding: '16px',
      border: isSelected ? '2px solid #0070f3' : '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: isSelected ? '#e6f7ff' : '#fff',
      textAlign: 'center',
      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
      transition: 'all 0.2s ease-in-out',
    }}
  >
    <img
      src={university.logoUrl}
      alt={`${university.name} Logo`}
      style={{ width: '100px', height: 'auto', marginBottom: '8px' }}
    />
    <h2>{university.name}</h2>
    <p>{university.location}</p>
  </div>
);

export default UniversityCard;
*/


const UniversityCard: React.FC<UniversityCardProps> = ({ university, isSelected, onSelect }) => (
  <div
    onClick={() => onSelect(university)}
    style={{
      cursor: 'pointer',
      minWidth: isSelected ? '220px' : '200px',
      minHeight: isSelected ? '280px' : '260px',
      marginRight: '16px',
      padding: '16px',
      border: isSelected ? '2px solid #0070f3' : '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: isSelected ? '#e6f7ff' : '#fff',
      textAlign: 'center',
      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
      transition: 'all 0.2s ease-in-out',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between', // Ensures elements are distributed with space between
    }}
  >
    <div>
      <img
        src={university.logoUrl}
        alt={`${university.name} Logo`}
        style={{ width: '100px', height: 'auto', marginBottom: '8px' }}
      />
    </div>
    <div>
      <h2 style={{ margin: '8px 0' }}>{university.name}</h2>
      <p style={{ margin: '0' }}>{university.location}</p>
    </div>
  </div>
);

export default UniversityCard;

