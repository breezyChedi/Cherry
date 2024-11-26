// app/calculator/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import {
    Snackbar,
    Alert,
    Select,
    MenuItem,
    TextField,
    Button,
    Typography,
    Grid,
    CircularProgress,
    Tooltip,
} from '@mui/material';

import { useRouter } from 'next/navigation';
import { auth, db } from '../firebaseConfig'; // Import Firebase Auth and Firestore
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

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
    // State variables for subjects and marks
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

    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');


    // Options for spinners 4-6
    const [options4, setOptions4] = useState<string[]>(allSubjects);
    const [options5, setOptions5] = useState<string[]>(allSubjects);
    const [options6, setOptions6] = useState<string[]>(allSubjects);

    useEffect(() => {
        // Update options for spinners 4-6 to prevent duplicate selections
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
        // Check user authentication status
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
        // Check if all subjects are selected
        if (
            !subject1 ||
            !subject2 ||
            !subject3 ||
            !subject4 ||
            !subject5 ||
            !subject6
        ) {
            setErrorMessage('Please select all 6 subjects.');
            setErrorOpen(true);
            return;
        }

        // Retrieve marks and convert to numbers
        const marks = [
            parseInt(mark1) || 0,
            parseInt(mark2) || 0,
            parseInt(mark3) || 0,
            parseInt(mark4) || 0,
            parseInt(mark5) || 0,
            parseInt(mark6) || 0,
        ];

        // Calculate points for each mark
        const points = marks.map(getPointsForMark);

        // Sum the points
        const totalAPS = points.reduce((acc, curr) => acc + curr, 0);

        // Update the state
        setApsScore(totalAPS);

        // Optionally, save marks and subjects to localStorage
        //saveDataToLocalStorage();

    
    };


    const handleSaveToProfile = async () => {
        if (!isAuthenticated) {
            router.push('/profile'); // Redirect to sign-in/sign-up page
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            const profileData = {
                apsScore: apsScoreLoc,
                subjects: {
                    subject1,
                    subject2,
                    subject3,
                    subject4,
                    subject5,
                    subject6,
                },
                marks: {
                    mark1,
                    mark2,
                    mark3,
                    mark4,
                    mark5,
                    mark6,
                },
                nbtScores: {
                    nbtAL,
                    nbtQL,
                    nbtMAT,
                },
                savedAt: new Date(),
            };

            await setDoc(doc(db, 'profiles', user.uid), profileData);

            setErrorMessage('Profile saved successfully!');
            setErrorOpen(true);
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to save profile.');
            setErrorOpen(true);
        }
    };

    return (
        <div style={{ padding: '16px' }}>
            <Typography variant="h6" gutterBottom>
                Subject Selection
            </Typography>

            <Grid container spacing={2}>
                {/* Subject 1 */}
                <Grid item xs={8} sm={8}>
                    <Select
                        fullWidth
                        value={subject1}
                        onChange={(e) => setSubject1(e.target.value as string)}
                        displayEmpty
                    >
                        <MenuItem value="" disabled>
                            Select Subject
                        </MenuItem>
                        {mathSubjects.map((subject) => (
                            <MenuItem key={subject} value={subject}>
                                {subject}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
                <Grid item xs={4} sm={4}>
                    <TextField
                        fullWidth
                        label="Enter %"
                        value={mark1}
                        onChange={(e) => setMark1(e.target.value)}
                        type="number"
                    />
                </Grid>

                {/* Subject 2 */}
                <Grid item xs={8} sm={8}>
                    <Select
                        fullWidth
                        value={subject2}
                        onChange={(e) => setSubject2(e.target.value as string)}
                        displayEmpty
                    >
                        <MenuItem value="" disabled>
                            Select Subject
                        </MenuItem>
                        {homeLanguages.map((subject) => (
                            <MenuItem key={subject} value={subject}>
                                {subject}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
                <Grid item xs={4} sm={4}>
                    <TextField
                        fullWidth
                        label="Enter %"
                        value={mark2}
                        onChange={(e) => setMark2(e.target.value)}
                        type="number"
                    />
                </Grid>

                {/* Subject 3 */}
                <Grid item xs={8} sm={8}>
                    <Select
                        fullWidth
                        value={subject3}
                        onChange={(e) => setSubject3(e.target.value as string)}
                        displayEmpty
                    >
                        <MenuItem value="" disabled>
                            Select Subject
                        </MenuItem>
                        {additionalLanguages.map((subject) => (
                            <MenuItem key={subject} value={subject}>
                                {subject}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
                <Grid item xs={4} sm={4}>
                    <TextField
                        fullWidth
                        label="Enter %"
                        value={mark3}
                        onChange={(e) => setMark3(e.target.value)}
                        type="number"
                    />
                </Grid>

                {/* Subject 4 */}
                <Grid item xs={8} sm={8}>
                    <Select
                        fullWidth
                        value={subject4}
                        onChange={(e) => setSubject4(e.target.value as string)}
                        displayEmpty
                    >
                        <MenuItem value="" disabled>
                            Select Subject
                        </MenuItem>
                        {options4.map((subject) => (
                            <MenuItem key={subject} value={subject}>
                                {subject}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
                <Grid item xs={4} sm={4}>
                    <TextField
                        fullWidth
                        label="Enter %"
                        value={mark4}
                        onChange={(e) => setMark4(e.target.value)}
                        type="number"
                    />
                </Grid>

                {/* Subject 5 */}
                <Grid item xs={8} sm={8}>
                    <Select
                        fullWidth
                        value={subject5}
                        onChange={(e) => setSubject5(e.target.value as string)}
                        displayEmpty
                    >
                        <MenuItem value="" disabled>
                            Select Subject
                        </MenuItem>
                        {options5.map((subject) => (
                            <MenuItem key={subject} value={subject}>
                                {subject}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
                <Grid item xs={4} sm={4}>
                    <TextField
                        fullWidth
                        label="Enter %"
                        value={mark5}
                        onChange={(e) => setMark5(e.target.value)}
                        type="number"
                    />
                </Grid>

                {/* Subject 6 */}
                <Grid item xs={8} sm={8}>
                    <Select
                        fullWidth
                        value={subject6}
                        onChange={(e) => setSubject6(e.target.value as string)}
                        displayEmpty
                    >
                        <MenuItem value="" disabled>
                            Select Subject
                        </MenuItem>
                        {options6.map((subject) => (
                            <MenuItem key={subject} value={subject}>
                                {subject}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
                <Grid item xs={4} sm={4}>
                    <TextField
                        fullWidth
                        label="Enter %"
                        value={mark6}
                        onChange={(e) => setMark6(e.target.value)}
                        type="number"
                    />
                </Grid>
            </Grid>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={calculateAndDisplayAPS}
                    style={{ marginTop: '16px' }}
                >
                    Calculate APS
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    href="https://nbtests.uct.ac.za/"
                    style={{ marginTop: '16px', marginRight: '5px',marginLeft: '5px', justifyContent: 'center',textAlign: 'center' }}
                >
                    Book a NBT test
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveToProfile}
                    style={{ marginTop: '16px' }}
                >
                    Save to Profile
                </Button>
            </div>

            {/* NBT Inputs */}
            <Typography variant="h6" gutterBottom style={{ marginTop: '24px' }}>
                NBT Scores
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={4} sm={4}>
                    <Tooltip title="Academic Literacy">
                    <TextField
                        fullWidth
                        label="NBT (AL)"
                        value={nbtAL}
                        onChange={(e) => setNbtAL(e.target.value)}
                        type="number"
                    /></Tooltip>
                </Grid>
                <Grid item xs={4} sm={4}>
                    <Tooltip title="Quantitative Literacy">
                    <TextField
                        fullWidth
                        label="NBT (QL)"
                        value={nbtQL}
                        onChange={(e) => setNbtQL(e.target.value)}
                        type="number"
                    /></Tooltip>
                </Grid>
                <Grid item xs={4} sm={4}>
                    <Tooltip title="Mathematics">
                    <TextField
                        fullWidth
                        label="NBT (MAT)"
                        value={nbtMAT}
                        onChange={(e) => setNbtMAT(e.target.value)}
                        type="number"
                    /></Tooltip>
                </Grid>
            </Grid>

            {/* Circular Progress Bar */}
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <CircularProgress
                    variant="determinate"
                    value={(apsScoreLoc / 42) * 100}
                    size={100}
                    thickness={4}
                />
                <Typography variant="h6" style={{ marginTop: '8px', marginBottom: '32px' }}>
                    APS Score: {apsScoreLoc}
                </Typography>
            </div>
            {/* Error Snackbar */}
            <Snackbar
                open={errorOpen}
                autoHideDuration={6000}
                onClose={() => setErrorOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setErrorOpen(false)} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>

        </div>
    );

};

export default CalculatorPage;
