'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { BookOpen, Award, GraduationCap, ExternalLink, TrendingUp } from 'lucide-react';

const NBTPage: React.FC = () => {
  const handleNBTClick = () => {
    window.location.href = 'https://nbtests.uct.ac.za/tests/register';
  };

  const requirementsData = [
    {
      title: "National Senior Certificate Pass",
      requirements: [
        "English 40%",
        "2 Other Subjects 40%",
        "3 Other Subjects 30%"
      ],
      description: "Student has achieved a NSC Pass in which they meet the minimum requirements for admission to High certificate study to higher education.",
      nqf: 4,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Pass Entry to Diploma Study",
      requirements: [
        "English 40%",
        "3 Other Subjects 40%",
        "2 Other Subjects 30%"
      ],
      description: "Student has achieved a NSC Pass in which they meet the minimum requirements for admission to Diploma or High Certificate study to higher education.",
      nqf: 5,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Pass Entry to Bachelor's Study",
      requirements: [
        "English 40%",
        "4 Other Subjects 50% (Excluding LO)",
        "2 Other Subjects 30%"
      ],
      description: "Student has achieved a NSC Pass in which they meet the minimum requirements for admission to Bachelor Degree, Diploma or High Certificate study to higher education.",
      nqf: 6,
      color: "from-pink-500 to-pink-600"
    }
  ];

  const achievementLevels = [
    { level: 7, competence: 'Outstanding', marks: '100-80', color: 'bg-green-500' },
    { level: 6, competence: 'Meritorious', marks: '79-70', color: 'bg-green-400' },
    { level: 5, competence: 'Substantial', marks: '69-60', color: 'bg-blue-400' },
    { level: 4, competence: 'Adequate', marks: '59-50', color: 'bg-yellow-400' },
    { level: 3, competence: 'Moderate', marks: '49-40', color: 'bg-orange-400' },
    { level: 2, competence: 'Elementary', marks: '30-39', color: 'bg-orange-500' },
    { level: 1, competence: 'Not Achieved', marks: '0-29', color: 'bg-red-500' },
  ];

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #fddeff 0%, #ffe4f5 100%)' }}>
      <div className="max-w-7xl mx-auto">
        {/* NBT Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-64 h-64"
              >
                <Image
                  src="/NBT-logo.png"
                  alt="NBT Logo"
                  fill
                  className="object-contain"
                />
              </motion.div>
            </div>
            
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-pink-600 mb-4 flex items-center gap-3">
                <Award size={40} />
                National Benchmark Tests
              </h1>
              <p className="text-gray-700 mb-6 leading-relaxed">
                The National Benchmark Test is a test used for first-year applicants to assess their quantitative literacy and mathematics proficiency at an entry-level. The NBTs are conducted by the Centre for Educational Testing for Access and Placement (CETAP) on behalf of Universities South Africa (USAF).
              </p>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">The NBT consists of three assessment components:</h3>
              
              <div className="grid grid-cols-1 gap-3">
                {[
                  { abbr: 'AL', name: 'Academic Literacy', color: 'bg-blue-500' },
                  { abbr: 'QL', name: 'Quantitative Literacy', color: 'bg-purple-500' },
                  { abbr: 'MAT', name: 'Mathematics', color: 'bg-pink-500' }
                ].map((component, idx) => (
                  <motion.div
                    key={component.abbr}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-l-4 border-pink-500"
                  >
                    <div className={`${component.color} text-white w-12 h-12 rounded-full flex items-center justify-center font-bold`}>
                      {component.abbr}
                    </div>
                    <span className="font-semibold text-gray-800">{component.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Test Details Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-black text-center text-gray-800 mb-8">Understanding the NBT Tests</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Academic Literacy Test (AL)',
                description: 'The Academic Literacy Test is a 3-hour exam in which students will be tested on their capacity to engage successfully with the demands of academic study in the medium of instructions provided.',
                icon: <BookOpen size={32} className="text-blue-500" />
              },
              {
                title: 'Quantitative Literacy Test (QL)',
                description: 'The Quantitative Literacy Test is a 3-hour exam in which students will be tested on their ability to manage situations and solve problems in real contexts relevant to higher education study. The basic quantitative information may be presented verbally, graphically, in tabular or symbolic form.',
                icon: <TrendingUp size={32} className="text-purple-500" />
              },
              {
                title: 'Mathematics Test (MAT)',
                description: 'The Mathematics Test is a 3-hour exam in which students are tested on their ability to relate to mathematical concepts formally regarded as part of the secondary school curriculum.',
                icon: <GraduationCap size={32} className="text-pink-500" />
              }
            ].map((test, idx) => (
              <motion.div
                key={test.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="mb-4">{test.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{test.title}</h3>
                <p className="text-gray-600 leading-relaxed">{test.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Book NBT Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mb-12"
        >
          <button
            onClick={handleNBTClick}
            className="bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white font-bold px-8 py-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
          >
            <ExternalLink size={24} />
            Book an NBT Test
          </button>
        </motion.div>

        {/* NSC Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-4xl md:text-5xl font-black text-pink-600 mb-4 flex items-center gap-3">
                <Award size={40} />
                National Senior Certificate
              </h2>
              <p className="text-gray-700 leading-relaxed">
                The National Senior Certificate (NSC) examinations commonly referred to as "matric" has become an annual event of major public significance. It not only signifies the culmination of twelve years of formal schooling but the NSC examinations is a barometer of the health of the education system.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                The National Senior Certificate is registered at Level 4 on the National Qualifications Framework.
              </p>
            </div>
            
            <div className="order-1 md:order-2 flex justify-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-72 h-48"
              >
                <Image
                  src="/edu-logo.png"
                  alt="Education Logo"
                  fill
                  className="object-contain"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Achievement Levels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-black text-center text-gray-800 mb-8">Achievement Levels</h2>
          
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white font-bold p-4">
              <div className="text-center">Achievement Level</div>
              <div className="text-center">Description of Competence</div>
              <div className="text-center">MARKS %</div>
            </div>
            
            {achievementLevels.map((item, idx) => (
              <motion.div
                key={item.level}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + idx * 0.05 }}
                className={`grid grid-cols-3 p-4 border-b border-gray-100 hover:bg-pink-50 transition-colors ${
                  idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="text-center flex items-center justify-center">
                  <span className={`${item.color} text-white w-10 h-10 rounded-full flex items-center justify-center font-bold`}>
                    {item.level}
                  </span>
                </div>
                <div className="text-center font-semibold text-gray-800 flex items-center justify-center">
                  {item.competence}
                </div>
                <div className="text-center text-gray-700 flex items-center justify-center">
                  {item.marks}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Requirements Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className="text-3xl font-black text-center text-gray-800 mb-8">NSC Requirements</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {requirementsData.map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + idx * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              >
                <div className={`bg-gradient-to-r ${card.color} text-white p-4 text-center font-bold`}>
                  {card.title}
                </div>
                
                <div className="p-6">
                  <ul className="space-y-2 mb-4">
                    {card.requirements.map((req, reqIdx) => (
                      <li key={reqIdx} className="flex items-center gap-2 text-gray-700">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        {req}
                      </li>
                    ))}
                  </ul>
                  
                  <p className="text-gray-600 text-sm text-center mb-6 leading-relaxed">
                    {card.description}
                  </p>
                  
                  <div className="text-center">
                    <span className={`inline-block bg-gradient-to-r ${card.color} text-white font-bold px-6 py-3 rounded-xl`}>
                      Qualify for NQF Level {card.nqf}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NBTPage;
