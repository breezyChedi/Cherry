import React from 'react';

const NBTPage: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50" style={{ fontFamily: 'Arial',alignItems: 'center', marginBottom: '80px' }} >
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
          <div style={{ backgroundColor: '#57b9d8', color: '#FFFFFF', width: '50px',height: '50px', borderRadius: '50%', alignItems:'center', display:'flex', justifyContent: 'center' , fontWeight: 'bold'}}>AL</div>
          <p>&nbsp;Academic Literacy</p>
          </div>
          
          
          <div style={{display:'flex'}}>
          <div style={{ backgroundColor: '#57b9d8', color: '#FFFFFF', width: '50px',height: '50px', borderRadius: '50%', alignItems:'center', display:'flex', justifyContent: 'center' , fontWeight: 'bold'}}>QL</div>
          <p>&nbsp;Quantitative Literacy</p>
          </div>

          <div style={{display:'flex'}}>
          <div style={{ backgroundColor: '#57b9d8', color: '#FFFFFF', width: '50px',height: '50px', borderRadius: '50%', alignItems:'center', display:'flex', justifyContent: 'center' , fontWeight: 'bold'}}>MAT</div>
          <p>&nbsp;Mathematics</p>
         </div>
       
        </div>
      </div>

      {/* Grid of Test Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' , width: '90%'}}>
        
      <style>
    {`
      @media (min-width: 768px) {
        div[style] {
          grid-template-columns: repeat(3, 1fr); /* Three columns on larger screens */
        }
      }
    `}
  </style>
        
        {/* Academic Literacy Test Card */}
        <div
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
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'Arial' }}>The Academic Literacy Test (AL)</h2>
          <p style={{ color: '#555', fontFamily: 'Arial' }}>
            The Academic Literacy Test is a 3-hour exam in which students will be tested on their capacity to engage successfully with the demands of academic study in the medium of instructions provided.
          </p>
        </div>

        {/* Quantitative Literacy Test Card */}
        <div
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
            justifyContent: 'space-between',
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
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'Arial' }}>The Mathematics Test (ML)</h2>
          <p style={{ color: '#555', fontFamily: 'Arial' }}>
            The Mathematics Test is a 3-hour exam in which students are tested on their ability to relate to mathematical concepts formally regarded as part of the secondary school curriculum.
          </p>
        </div>
      </div>
      <button><strong>Book an NBT Test</strong></button>
    </div>
    
  );
};

export default NBTPage;

