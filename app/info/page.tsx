'use client'

import React from 'react';

const NBTPage: React.FC = () => {

  const handleNBTClick = () => {
    window.location.href = 'https://nbtests.uct.ac.za/tests/register'; // Replace with your URL
  };

  return (
    <div className="p-6 bg-gray-50" style={{ fontFamily: 'Arial',alignItems: 'center', marginBottom: '80px', display: 'flex' ,flexDirection:'column'}} >
      {/* NBT Section Card */}
      <div
        style={{
          width: '90%',
          padding: '24px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#fff',
          marginBottom: '24px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
      >
        <div className="flex flex-col items-center mb-4">
          <img
            src="/NBT-logo.png"
            alt="NBT Logo"
            style={{ width: '120px', height: '120px', marginBottom: '16px' }}
          />
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'Arial' }}>National Benchmark Tests Project</h1>
        </div>
        <p style={{ color: '#555', marginBottom: '16px', fontFamily: 'Arial' }}>
          The National Benchmark Test is a test used for first-year applicants to assess their quantitative literacy and mathematics proficiency at an entry-level. The NBTs are conducted by the Centre for Educational Testing for Access and Placement (CETAP) on behalf of Universities South Africa (USAF). NBT assess the relationship between high education entry-level proficiencies and school-level exit outcomes.
        </p>
        <p style={{ color: '#555', fontFamily: 'Arial' }}>There are 3 tests that candidates write:</p>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '16px' }}>
            <div style={{display:'flex'}}>
          <div style={{ backgroundColor: '#57b9d8', color: '#FFFFFF', width: '50px',height: '50px', borderRadius: '50%', alignItems:'center', display:'flex', justifyContent: 'center' , fontWeight: 'bold', flexShrink: 0}}>AL</div>
          <p>&nbsp;Academic Literacy</p>
          </div>
          
          
          <div style={{display:'flex'}}>
          <div style={{ backgroundColor: '#57b9d8', color: '#FFFFFF', width: '50px',height: '50px', borderRadius: '50%', alignItems:'center', display:'flex', justifyContent: 'center' , fontWeight: 'bold', flexShrink: 0}}>QL</div>
          <p>&nbsp;Quantitative Literacy</p>
          </div>

          <div style={{display:'flex'}}>
          <div style={{ backgroundColor: '#57b9d8', color: '#FFFFFF', width: '50px',height: '50px', borderRadius: '50%', alignItems:'center', display:'flex', justifyContent: 'center' , fontWeight: 'bold', flexShrink: 0}}>MAT</div>
          <p>&nbsp;Mathematics</p>
         </div>
       
        </div>
      </div>

      {/* Grid of Test Cards */}
      <div className="grid-container" style={{ width: '90%', margin: '0 auto'}}>
        
   
        
        {/* Academic Literacy Test Card */}
        <div
        className="grid-item"
          style={{
            cursor: 'pointer',
            minWidth: '200px',
            padding: '16px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'Arial' }}>The Academic Literacy Test (AL)</h2>
          <p style={{ color: '#555', fontFamily: 'Arial' }}>
            The Academic Literacy Test is a 3-hour exam in which students will be tested on their capacity to engage successfully with the demands of academic study in the medium of instructions provided.
          </p>
        </div>

        {/* Quantitative Literacy Test Card */}
        <div
        className="grid-item"
          style={{

            cursor: 'pointer',
            minWidth: '200px',
            padding: '16px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'Arial' }}>The Quantitative Literacy Test (QL)</h2>
          <p style={{ color: '#555', fontFamily: 'Arial' }}>
            The Quantitative Literacy Test is a 3-hour exam in which students will be tested on their ability to manage situations and solve problems in real contexts relevant to higher education study.
          </p>
          <p style={{ color: '#555', marginTop: '8px' }}>
            The basic quantitative information may be presented verbally, graphically, in tabular or symbolic form.
          </p>
        </div>

        {/* Mathematics Test Card */}
        <div
        className="grid-item"
          style={{
            cursor: 'pointer',
            minWidth: '200px',
            padding: '16px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'Arial' }}>The Mathematics Test (ML)</h2>
          <p style={{ color: '#555', fontFamily: 'Arial' }}>
            The Mathematics Test is a 3-hour exam in which students are tested on their ability to relate to mathematical concepts formally regarded as part of the secondary school curriculum.
          </p>
        </div>
      </div>
      <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%', // Ensure the button container spans the screen width
        padding: '16px',
        boxSizing: 'border-box', // Include padding in width calculation
      }}
    >
      <button
        style={{
          width: '100%', // Make the button span the full width of the container
          maxWidth: '400px', // Optional: Limit the width for better readability
          padding: '12px 16px',
          backgroundColor: '#F3D4F5', // Light pink background
          color: '#000', // Black text color
          border: '1px solid #000', // Border color matches text
          borderRadius: '16px', // Rounded corners
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Subtle shadow
        }}
        onClick={handleNBTClick} // Action on click
      >
        Book an NBT Test
      </button>
    </div>

      <style>
        {`
          .grid-container {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
          }

          @media (min-width: 768px) {
            .grid-container {
              grid-template-columns: repeat(3, 1fr);
            }
          }
        `}
      </style>
    </div>
    
  );
};

export default NBTPage;

