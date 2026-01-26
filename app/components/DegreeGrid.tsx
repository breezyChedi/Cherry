'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Degree, SubjectRequirement } from '../types';
import { filterDegreesByEligibility } from '../utils/eligibility';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ChevronDown, ChevronUp, Award, BookOpen, Loader, AlertCircle } from 'lucide-react';

import MathIcon from '../icons/math.svg';
import LangIcon from '../icons/earth.svg';
import HisIcon from '../icons/hour.svg';
import PhysIcon from '../icons/phys.svg';
import BioIcon from '../icons/bio.svg';
import DefaultIcon from '../icons/lang.svg';
import matLitIcon from '../icons/matLit.svg';
import geoIcon from '../icons/geo.svg';
import dramaIcon from '../icons/drama.svg';
import artIcon from '../icons/art.svg';
import codeIcon from '../icons/code.svg';
import agriIcon from '../icons/agri.svg';
import monIcon from '../icons/money.svg';

const subjectIconMap: { [key: string]: React.ElementType } = {
  'Mathematics': MathIcon,
  'English HL': LangIcon,
  'History': HisIcon,
  'Life Science': BioIcon,
  'Physical Science': PhysIcon,
  'Mathematical Literacy': matLitIcon,
  'Geography': geoIcon,
  'Language HL/FAL': LangIcon,
  'Technical Mathematics': matLitIcon,
  'Visual Arts': dramaIcon,
  'Dramatic Arts': artIcon,
  'Agricultural Science': agriIcon,
  'Information Technology': codeIcon,
  'Economics': monIcon,
  'Accounting': monIcon,
  'Business Studies': monIcon,
};

const PinkCircleWithIcon = ({ Icon }: { Icon: React.ElementType }) => (
  <div className="flex items-center justify-center w-8 h-8 bg-pink-100 rounded-full">
    <Icon style={{ width: '20px', height: '20px' }} />
  </div>
);

interface DegreeGridProps {
  degrees: Degree[];
  filterByEligibility: boolean;
  faculty: string;
}

const DegreeGrid: React.FC<DegreeGridProps> = ({ degrees, filterByEligibility, faculty }) => {
  const [filteredDegrees, setFilteredDegrees] = useState<Degree[]>(degrees);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    if (filterByEligibility) {
      setLoading(true);
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            const profileDocRef = doc(db, 'profiles', currentUser.uid);
            const profileDoc = await getDoc(profileDocRef);
            if (profileDoc.exists()) {
              const profileData = profileDoc.data();
              const subjectMarks: { subject: string; mark: number }[] = [];

              if (profileData.subjects && profileData.marks) {
                const subjects = profileData.subjects;
                const marks = profileData.marks;

                for (const key in subjects) {
                  const subjectName = subjects[key];
                  const markKey = 'mark' + key.replace('subject', '');
                  const markValue = parseInt(marks[markKey] || '0', 10);
                  subjectMarks.push({ subject: subjectName, mark: markValue });
                }
              }

              const nbtScores: { [key: string]: number } = {};
              if (profileData.nbtScores) {
                for (const key in profileData.nbtScores) {
                  nbtScores[key] = parseInt(profileData.nbtScores[key], 10);
                }
              }

              const userData = { subjectMarks, nbtScores };
              const eligibleDegrees = filterDegreesByEligibility(degrees, userData, faculty);

              setFilteredDegrees(eligibleDegrees);
            } else {
              setError('Profile data not found.');
            }
          } catch (err) {
            console.error('Error fetching profile data:', err);
            setError('Error fetching profile data.');
          } finally {
            setLoading(false);
          }
        } else {
          setError('Please sign in to filter degrees by eligibility.');
          setLoading(false);
        }
      });

      return () => unsubscribe();
    } else {
      setFilteredDegrees(degrees);
    }
  }, [degrees, filterByEligibility, faculty]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="w-12 h-12 text-pink-600 animate-spin mb-4" />
        <p className="text-gray-600 font-semibold">Filtering degrees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-semibold">{error}</p>
      </div>
    );
  }

  const handleToggle = (degreeId: string) => {
    setExpandedCard((prev) => (prev === degreeId ? null : degreeId));
  };

  const formatDescription = (description: string): string => {
    return description.replace(/\*\*(.*?)\*\*/g, '<br><br><strong>$1</strong><br>');
  };

  const formatSubjectRequirements = (requirements: SubjectRequirement[]) => {
    const processed: JSX.Element[] = [];
    const orGroups: { [key: string]: { [subject: string]: number } } = {};

    requirements.forEach((req) => {
      if (req.orSubject) {
        const subjects = [req.subject, req.orSubject].sort();
        const key = subjects.join(' OR ');

        if (!orGroups[key]) {
          orGroups[key] = { [req.subject]: req.minPoints };
        } else {
          orGroups[key][req.subject] = req.minPoints;
        }
      } else {
        processed.push(
          <div className="flex items-center gap-3 mb-2" key={req.subject}>
            <PinkCircleWithIcon Icon={subjectIconMap[req.subject] || DefaultIcon} />
            <span className="text-gray-700">
              {req.subject}: <strong className="text-pink-600">{req.minPoints}</strong>
            </span>
          </div>
        );
      }
    });

    Object.entries(orGroups).forEach(([subjects, subjectPoints]) => {
      const formattedSubjects = Object.entries(subjectPoints).map(([subject, points]) => {
        const Icon = subjectIconMap[subject] || DefaultIcon;
        return (
          <div className="flex items-center gap-2" key={subject}>
            <PinkCircleWithIcon Icon={Icon} />
            <span className="text-gray-700">
              {subject}: <strong className="text-pink-600">{points}</strong>
            </span>
          </div>
        );
      });

      processed.push(
        <div className="flex items-center flex-wrap gap-2 mb-2" key={subjects}>
          {formattedSubjects.reduce((prev: any[], curr, index) => [
            ...prev,
            curr,
            index < formattedSubjects.length - 1 && (
              <span key={`or-${index}`} className="text-gray-500 font-semibold">OR</span>
            ),
          ], [])}
        </div>
      );
    });

    return processed;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      <AnimatePresence>
        {filteredDegrees.map((degree, idx) => (
          <motion.div
            key={degree.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-white rounded-2xl shadow-lg border-2 border-pink-200 overflow-hidden transition-all ${
              expandedCard === degree.id.toString() ? 'md:col-span-2 lg:col-span-3' : ''
            }`}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight mb-2">{degree.name}</h3>
                  {degree.pointRequirement !== null && (
                    <div className="inline-block bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Min APS: {degree.pointRequirement}
                    </div>
                  )}
                </div>
              </div>

              {/* Subject Requirements */}
              {degree.subjectRequirements &&
                degree.subjectRequirements.every((req) => req !== null) &&
                degree.subjectRequirements[0].subject !== null &&
                degree.subjectRequirements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <BookOpen size={18} className="text-pink-500" />
                      Subject Requirements
                    </h4>
                    <div className="space-y-1">
                      {formatSubjectRequirements(degree.subjectRequirements)}
                    </div>
                  </div>
                )}

              {/* Toggle Button */}
              <button
                onClick={() => handleToggle(degree.id.toString())}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-50 hover:from-pink-100 hover:to-pink-50 text-gray-800 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {expandedCard === degree.id.toString() ? (
                  <>
                    <ChevronUp size={20} />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown size={20} />
                    View Details
                  </>
                )}
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedCard === degree.id.toString() && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t-2 border-gray-100">
                      {degree.description && (
                        <div
                          className="text-gray-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: formatDescription(degree.description) }}
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {filteredDegrees.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-full bg-gray-50 rounded-2xl p-12 text-center"
        >
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">No degrees found matching your criteria</p>
        </motion.div>
      )}
    </div>
  );
};

export default DegreeGrid;
