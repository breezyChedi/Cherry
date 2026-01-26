// app/components/UniversityCard.tsx
"use client";

import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import Image from 'next/image';

interface University {
  id: number;
  name: string;
  location: string;
  logoUrl: string;
  appUrl: string;
  // Add other properties as needed
}

interface UniversityCardProps {
  university: University;
  isSelected: boolean;
  onSelect: (university: University) => void;
}

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
    <div 
      style={{ 
        display: 'flex',
        alignItems: 'center', 
        justifyContent: 'center',
        flexGrow: 1,
        height: '120px', // Fixed height for logo container
        position: 'relative',
      }}
    >
      <Image
        src={university.logoUrl}
        alt={`${university.name} Logo`}
        width={100}
        height={100}
        style={{ 
          maxWidth: '100px', 
          maxHeight: '100px', 
          objectFit: 'contain', // Maintains aspect ratio
        }}
      />
    </div>
    
    <div style={{ marginTop: "auto" }}>
      <div style={{ marginBottom: "8px", textAlign: "center" }}>
        <h2 style={{ fontFamily: 'Arial', margin: '8px 0' }}>{university.name}</h2>
        <p style={{ 
          fontFamily: 'Arial',
          margin: '0', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <FaMapMarkerAlt style={{ marginRight: '8px' }} />
          {university.location}
        </p>
      </div>

      {/* Button to open appUrl */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevents triggering the onClick for the card
          window.open(university.appUrl, "_blank");
        }}
        style={{
          marginTop: "16px",
          padding: "8px 16px",
          backgroundColor: "#e300f3",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Application
      </button>
    </div>
  </div>
);

export default UniversityCard;

