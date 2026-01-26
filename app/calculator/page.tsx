'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Calculator, BookOpen, Save, ExternalLink, Check, X } from 'lucide-react';

const mathSubjects = ['Mathematics', 'Mathematical Literacy'];
const homeLanguages = ['English HL', 'Afrikaans HL', 'isiZulu HL'];
const additionalLanguages = [
    'Sesotho FAL',
    'Isizulu FAL',
    'Afrikaans FAL',
    'Sepedi FAL',
    'English FAL',
    'Xitsonga FAL',
    'Setswana FAL',
    'TshiVenda FAL',
];
const allSubjects = [
    'Physical Science',
    'History',
    'Geography',
    'Art',
    'Economics',
    'Biology',
    'Information Technology',
    'Computing and Technology',
    'Dramatic Arts',
];

const CalculatorPage: React.FC = () => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    const [subject1, setSubject1] = useState('');
    const [subject2, setSubject2] = useState('');
    const [subject3, setSubject3] = useState('');
    const [subject4, setSubject4] = useState('');
    const [subject5, setSubject5] = useState('');
    const [subject6, setSubject6] = useState('');

    const [mark1, setMark1] = useState('');
    const [mark2, setMark2] = useState('');
    const [mark3, setMark3] = useState('');
    const [mark4, setMark4] = useState('');
    const [mark5, setMark5] = useState('');
    const [mark6, setMark6] = useState('');

    const [nbtAL, setNbtAL] = useState('');
    const [nbtQL, setNbtQL] = useState('');
    const [nbtMAT, setNbtMAT] = useState('');

    const [apsScoreLoc, setApsScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({ open: false, message: '', severity: 'success' });

    const [options4, setOptions4] = useState<string[]>(allSubjects);
    const [options5, setOptions5] = useState<string[]>(allSubjects);
    const [options6, setOptions6] = useState<string[]>(allSubjects);

    useEffect(() => {
        setOptions4(
            allSubjects.filter(
                (subject) =>
                    subject === subject4 ||
                    (subject !== subject5 && subject !== subject6)
            )
        );
        setOptions5(
            allSubjects.filter(
                (subject) =>
                    subject === subject5 ||
                    (subject !== subject4 && subject !== subject6)
            )
        );
        setOptions6(
            allSubjects.filter(
                (subject) =>
                    subject === subject6 ||
                    (subject !== subject4 && subject !== subject5)
            )
        );
    }, [subject4, subject5, subject6]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
        });
        return () => unsubscribe();
    }, []);

    const getPointsForMark = (mark: number): number => {
        if (mark >= 80) return 7;
        else if (mark >= 70) return 6;
        else if (mark >= 60) return 5;
        else if (mark >= 50) return 4;
        else if (mark >= 40) return 3;
        else if (mark >= 30) return 2;
        else return 0;
    };

    const calculateAndDisplayAPS = () => {
        if (!subject1 || !subject2 || !subject3 || !subject4 || !subject5 || !subject6) {
            setSnackbar({
                open: true,
                message: 'Please select all 6 subjects.',
                severity: 'error',
            });
            return;
        }

        const marks = [
            parseInt(mark1) || 0,
            parseInt(mark2) || 0,
            parseInt(mark3) || 0,
            parseInt(mark4) || 0,
            parseInt(mark5) || 0,
            parseInt(mark6) || 0,
        ];

        const points = marks.map(getPointsForMark);
        const totalAPS = points.reduce((acc, curr) => acc + curr, 0);

        setApsScore(totalAPS);
        setShowResult(true);
    };

    const handleSaveToProfile = async () => {
        if (!isAuthenticated) {
            router.push('/profile');
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            const profileData = {
                apsScore: apsScoreLoc,
                subjects: { subject1, subject2, subject3, subject4, subject5, subject6 },
                marks: { mark1, mark2, mark3, mark4, mark5, mark6 },
                nbtScores: { nbtAL, nbtQL, nbtMAT },
                savedAt: new Date(),
            };

            await setDoc(doc(db, 'profiles', user.uid), profileData);

            setSnackbar({
                open: true,
                message: 'Profile saved successfully!',
                severity: 'success',
            });
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to save profile.',
                severity: 'error',
            });
        }
    };

    return (
        <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #fddeff 0%, #ffe4f5 100%)' }}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="flex justify-center items-center gap-3 mb-3">
                        <Calculator className="text-pink-600" size={40} />
                        <h1 className="text-5xl font-black text-pink-600">APS Calculator</h1>
                    </div>
                    <p className="text-gray-600 text-lg">Calculate your Admission Point Score for university applications</p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Form Section */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-3xl shadow-2xl p-8"
                        >
                            {/* Core Subjects */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <BookOpen className="text-pink-500" size={24} />
                                    Core Subjects
                                </h2>
                                
                                <div className="space-y-4">
                                    {/* Subject 1 */}
                                    <SubjectRow
                                        label="Mathematics"
                                        value={subject1}
                                        onChange={setSubject1}
                                        options={mathSubjects}
                                        mark={mark1}
                                        onMarkChange={setMark1}
                                    />
                                    
                                    {/* Subject 2 */}
                                    <SubjectRow
                                        label="Home Language"
                                        value={subject2}
                                        onChange={setSubject2}
                                        options={homeLanguages}
                                        mark={mark2}
                                        onMarkChange={setMark2}
                                    />
                                    
                                    {/* Subject 3 */}
                                    <SubjectRow
                                        label="Additional Language"
                                        value={subject3}
                                        onChange={setSubject3}
                                        options={additionalLanguages}
                                        mark={mark3}
                                        onMarkChange={setMark3}
                                    />
                                </div>
                            </div>

                            {/* Elective Subjects */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <BookOpen className="text-pink-500" size={24} />
                                    Elective Subjects
                                </h2>
                                
                                <div className="space-y-4">
                                    <SubjectRow
                                        label="Subject 4"
                                        value={subject4}
                                        onChange={setSubject4}
                                        options={options4}
                                        mark={mark4}
                                        onMarkChange={setMark4}
                                    />
                                    
                                    <SubjectRow
                                        label="Subject 5"
                                        value={subject5}
                                        onChange={setSubject5}
                                        options={options5}
                                        mark={mark5}
                                        onMarkChange={setMark5}
                                    />
                                    
                                    <SubjectRow
                                        label="Subject 6"
                                        value={subject6}
                                        onChange={setSubject6}
                                        options={options6}
                                        mark={mark6}
                                        onMarkChange={setMark6}
                                    />
                                </div>
                            </div>

                            {/* NBT Scores */}
                            <div className="border-t-2 border-gray-100 pt-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">National Benchmark Test Scores</h2>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <NBTInput
                                        label="Academic Literacy"
                                        abbr="AL"
                                        value={nbtAL}
                                        onChange={setNbtAL}
                                    />
                                    <NBTInput
                                        label="Quantitative Literacy"
                                        abbr="QL"
                                        value={nbtQL}
                                        onChange={setNbtQL}
                                    />
                                    <NBTInput
                                        label="Mathematics"
                                        abbr="MAT"
                                        value={nbtMAT}
                                        onChange={setNbtMAT}
                                    />
                                </div>
                            </div>

                            {/* Calculate Button */}
                            <button
                                onClick={calculateAndDisplayAPS}
                                className="w-full mt-8 bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white font-bold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <Calculator size={24} />
                                Calculate APS Score
                            </button>
                        </motion.div>
                    </div>

                    {/* Results Sidebar */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 sticky top-8"
                        >
                            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Your APS Score</h2>
                            
                            {/* Circular Progress */}
                            <div className="flex justify-center mb-6">
                                <div className="relative w-48 h-48">
                                    <svg className="transform -rotate-90 w-48 h-48">
                                        <circle
                                            cx="96"
                                            cy="96"
                                            r="88"
                                            stroke="#f0f0f0"
                                            strokeWidth="12"
                                            fill="none"
                                        />
                                        <motion.circle
                                            cx="96"
                                            cy="96"
                                            r="88"
                                            stroke="url(#gradient)"
                                            strokeWidth="12"
                                            fill="none"
                                            strokeLinecap="round"
                                            initial={{ strokeDasharray: "0 552" }}
                                            animate={{ 
                                                strokeDasharray: `${(apsScoreLoc / 42) * 552} 552` 
                                            }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#FF1493" />
                                                <stop offset="100%" stopColor="#FF69B4" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="relative w-12 h-12 mb-2">
                                            <Image 
                                                src="/cherryLogoPng.png" 
                                                alt="Cherry Logo" 
                                                fill 
                                                className="object-contain"
                                            />
                                        </div>
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={apsScoreLoc}
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.5, opacity: 0 }}
                                                className="text-5xl font-black text-pink-600"
                                            >
                                                {apsScoreLoc}
                                            </motion.span>
                                        </AnimatePresence>
                                        <span className="text-sm text-gray-500 mt-1">out of 42</span>
                                    </div>
                                </div>
                            </div>

                            {showResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6"
                                >
                                    <div className={`p-4 rounded-xl ${
                                        apsScoreLoc >= 30 ? 'bg-green-50 border-2 border-green-500' :
                                        apsScoreLoc >= 20 ? 'bg-yellow-50 border-2 border-yellow-500' :
                                        'bg-red-50 border-2 border-red-500'
                                    }`}>
                                        <p className="text-center font-semibold text-gray-700">
                                            {apsScoreLoc >= 30 ? 'Excellent Score!' :
                                             apsScoreLoc >= 20 ? 'Good Score!' :
                                             'Keep Working!'}
                                        </p>
                                        <p className="text-center text-sm text-gray-600 mt-1">
                                            {apsScoreLoc >= 30 ? 'You qualify for most programs' :
                                             apsScoreLoc >= 20 ? 'You qualify for many programs' :
                                             'Consider improving your marks'}
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleSaveToProfile}
                                    className="w-full bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={20} />
                                    Save to Profile
                                </button>
                                
                                <button
                                    onClick={() => window.open('https://nbtests.uct.ac.za/', '_blank', 'noopener,noreferrer')}
                                    className="w-full border-2 border-pink-500 text-pink-600 font-semibold py-3 rounded-xl hover:bg-pink-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <ExternalLink size={20} />
                                    Book NBT Test
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Snackbar Notification */}
            <AnimatePresence>
                {snackbar.open && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
                    >
                        <div
                            className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg ${
                                snackbar.severity === 'success'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-red-500 text-white'
                            }`}
                        >
                            {snackbar.severity === 'success' ? <Check size={24} /> : <X size={24} />}
                            <span className="font-semibold">{snackbar.message}</span>
                            <button
                                onClick={() => setSnackbar({ ...snackbar, open: false })}
                                className="ml-4 hover:opacity-80 transition-opacity"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Subject Row Component
const SubjectRow: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    mark: string;
    onMarkChange: (value: string) => void;
}> = ({ label, value, onChange, options, mark, onMarkChange }) => {
    return (
        <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors bg-white"
                >
                    <option value="">Select {label}</option>
                    {options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mark %</label>
                <input
                    type="number"
                    value={mark}
                    onChange={(e) => onMarkChange(e.target.value)}
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                    placeholder="0-100"
                />
            </div>
        </div>
    );
};

// NBT Input Component
const NBTInput: React.FC<{
    label: string;
    abbr: string;
    value: string;
    onChange: (value: string) => void;
}> = ({ label, abbr, value, onChange }) => {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label}
                <span className="ml-2 text-pink-500 font-bold">({abbr})</span>
            </label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                min="0"
                max="100"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                placeholder="Score"
            />
        </div>
    );
};

export default CalculatorPage;
