'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Flag from 'react-world-flags';
import { auth, db } from '../../firebaseConfig';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { 
  LogOut, 
  User as UserIcon, 
  Mail, 
  Phone, 
  School, 
  MapPin, 
  Calendar,
  Award,
  TrendingUp,
  BookOpen,
  Loader
} from 'lucide-react';
import firebase from 'firebase/compat/app';

interface Profile {
  apsScore?: number;
  marks?: { [key: string]: string };
  nbtScores?: { [key: string]: string };
  savedAt?: firebase.firestore.Timestamp;
  subjects?: { [key: string]: string };
}

interface UserProfile {
  createdAt?: firebase.firestore.Timestamp;
  email?: string;
  gender?: string;
  highSchool?: string;
  name?: string;
  nationality?: string;
  phoneNumber?: string;
  surname?: string;
}

const ProfileDetailsPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          }

          const profileDocRef = doc(db, 'profiles', currentUser.uid);
          const profileDoc = await getDoc(profileDocRef);
          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as Profile);
          }
        } catch (err: any) {
          console.error('Error fetching user data:', err);
          setError('Failed to load profile data.');
        }
      } else {
        router.push('/profile');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/profile');
    } catch (err: any) {
      console.error('Error signing out:', err);
      setError('Failed to sign out.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fddeff 0%, #ffe4f5 100%)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader className="w-16 h-16 text-pink-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #fddeff 0%, #ffe4f5 100%)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-500 rounded-2xl p-6 max-w-md"
        >
          <p className="text-red-700 font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-500 text-white font-semibold py-2 rounded-xl hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  const getSortedSubjects = () => {
    if (!profile?.subjects) return [];
    
    const sortedKeys = Object.keys(profile.subjects).sort((a, b) => {
      const aNum = parseInt(a.replace('subject', ''), 10);
      const bNum = parseInt(b.replace('subject', ''), 10);
      return aNum - bNum;
    });

    return sortedKeys.map((key) => {
      const subjectNumber = key.replace('subject', '');
      const subject = profile.subjects![key];
      const mark = profile.marks?.[`mark${subjectNumber}`] || '0';
      return { subject, mark: parseInt(mark) };
    });
  };

  const sortedSubjects = getSortedSubjects();
  
  const getMarkColor = (mark: number) => {
    if (mark >= 80) return 'from-green-500 to-green-600';
    if (mark >= 70) return 'from-green-400 to-green-500';
    if (mark >= 60) return 'from-blue-400 to-blue-500';
    if (mark >= 50) return 'from-yellow-400 to-yellow-500';
    if (mark >= 40) return 'from-orange-400 to-orange-500';
    return 'from-red-400 to-red-500';
  };

  const getGrade = (mark: number) => {
    if (mark >= 80) return 'A';
    if (mark >= 70) return 'B';
    if (mark >= 60) return 'C';
    if (mark >= 50) return 'D';
    if (mark >= 40) return 'E';
    return 'F';
  };

  const formatDate = (timestamp?: firebase.firestore.Timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCountryCode = (nationality: string): string => {
    const countryMap: { [key: string]: string } = {
      'South Africa': 'ZA',
      'United States': 'US',
      'United Kingdom': 'GB',
      'Canada': 'CA',
      'Australia': 'AU',
      'India': 'IN',
      'China': 'CN',
      'Japan': 'JP',
    };
    return countryMap[nationality] || 'ZA';
  };

  const formatNBTKey = (key: string): string => {
    switch (key) {
      case 'nbtAL': return 'Academic Literacy';
      case 'nbtMAT': return 'Mathematics';
      case 'nbtQL': return 'Quantitative Literacy';
      default: return key;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #fddeff 0%, #ffe4f5 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 sticky top-8">
              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="absolute top-4 right-4 p-2 rounded-full bg-red-50 hover:bg-red-100 transition-colors group"
              >
                <LogOut className="text-red-500 group-hover:text-red-600" size={20} />
              </button>

              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-5xl font-bold mb-4 shadow-lg ${
                    userProfile?.gender === 'Male' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                    userProfile?.gender === 'Female' ? 'bg-gradient-to-br from-pink-500 to-pink-600' :
                    'bg-gradient-to-br from-gray-500 to-gray-600'
                  }`}
                >
                  {userProfile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                </motion.div>
                
                <h2 className="text-2xl font-black text-gray-800 text-center">
                  {userProfile ? `${userProfile.name} ${userProfile.surname}` : user?.email?.split('@')[0]}
                </h2>
                
                <div className="flex items-center gap-2 mt-2 text-gray-600">
                  <Mail size={16} />
                  <span className="text-sm">{user?.email}</span>
                </div>
              </div>

              <div className="h-px bg-gray-200 my-6"></div>

              {/* User Details */}
              <div className="space-y-4">
                {userProfile?.phoneNumber && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone size={20} className="text-pink-500" />
                    <span>{userProfile.phoneNumber}</span>
                  </div>
                )}
                
                {userProfile?.highSchool && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <School size={20} className="text-pink-500" />
                    <span>{userProfile.highSchool}</span>
                  </div>
                )}
                
                {userProfile?.nationality && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin size={20} className="text-pink-500" />
                    <div className="flex items-center gap-2">
                      <Flag code={getCountryCode(userProfile.nationality)} style={{ width: 24 }} />
                      <span>{userProfile.nationality}</span>
                    </div>
                  </div>
                )}
                
                {userProfile?.createdAt && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar size={20} className="text-pink-500" />
                    <span>Joined {formatDate(userProfile.createdAt)}</span>
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-200 my-6"></div>

              {/* APS Score */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Your APS Score</h3>
                <div className="relative w-36 h-36 mx-auto">
                  <svg className="transform -rotate-90 w-36 h-36">
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      stroke="#f0f0f0"
                      strokeWidth="10"
                      fill="none"
                    />
                    <motion.circle
                      cx="72"
                      cy="72"
                      r="64"
                      stroke="url(#apsGradient)"
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 402" }}
                      animate={{ strokeDasharray: `${((profile?.apsScore || 0) / 42) * 402} 402` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="apsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF1493" />
                        <stop offset="100%" stopColor="#FF69B4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-pink-600">{profile?.apsScore || 0}</span>
                    <span className="text-xs text-gray-500">out of 42</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Academic Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl p-8"
            >
              <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center gap-3">
                <Award className="text-pink-500" size={32} />
                Academic Performance
              </h2>

              {sortedSubjects.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {sortedSubjects.map(({ subject, mark }, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border-2 border-gray-100 hover:border-pink-300 transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800 flex-1">{subject}</h3>
                        <div className="text-right">
                          <div className={`inline-block bg-gradient-to-r ${getMarkColor(mark)} text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg`}>
                            {getGrade(mark)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${mark}%` }}
                            transition={{ duration: 1, delay: 0.5 + idx * 0.05 }}
                            className={`h-full bg-gradient-to-r ${getMarkColor(mark)}`}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-600">{mark}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No subjects available</p>
                  <button
                    onClick={() => router.push('/calculator')}
                    className="bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
                  >
                    Add Your Subjects
                  </button>
                </div>
              )}
            </motion.div>

            {/* NBT Scores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl shadow-2xl p-8"
            >
              <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center gap-3">
                <TrendingUp className="text-pink-500" size={32} />
                NBT Scores
              </h2>

              {profile?.nbtScores && Object.keys(profile.nbtScores).length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {Object.entries(profile.nbtScores).map(([key, score], idx) => {
                    const value = parseInt(score);
                    const progress = isNaN(value) ? 0 : value;
                    
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 text-center border-2 border-gray-100 hover:border-pink-300 transition-all"
                      >
                        <h3 className="font-bold text-gray-800 mb-4">{formatNBTKey(key)}</h3>
                        <div className="relative w-24 h-24 mx-auto mb-3">
                          <svg className="transform -rotate-90 w-24 h-24">
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="#f0f0f0"
                              strokeWidth="8"
                              fill="none"
                            />
                            <motion.circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke={progress >= 70 ? '#10b981' : progress >= 50 ? '#f59e0b' : '#ef4444'}
                              strokeWidth="8"
                              fill="none"
                              strokeLinecap="round"
                              initial={{ strokeDasharray: "0 251" }}
                              animate={{ strokeDasharray: `${(progress / 100) * 251} 251` }}
                              transition={{ duration: 1, delay: 0.6 + idx * 0.1 }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-black text-gray-800">{score}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">Out of 100</p>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No NBT scores available</p>
                  <button
                    onClick={() => window.open('https://nbtests.uct.ac.za/', '_blank')}
                    className="bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
                  >
                    Book an NBT Test
                  </button>
                </div>
              )}

              {profile?.savedAt && (
                <p className="text-sm text-gray-500 text-right mt-6">
                  Last updated: {formatDate(profile.savedAt)}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailsPage;
