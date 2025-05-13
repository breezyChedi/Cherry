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
    Container,
    Box,
    Paper,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import Image from 'next/image';
import cherryLogoPng from '../icons/cherryLogoPng.png';

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
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    
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
        <Container 
            maxWidth="lg" 
            sx={{ 
                py: 4,
                backgroundColor: 'white' 
            }}
        >
            <Paper 
                elevation={3} 
                sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    backgroundColor: '#f8f9fa',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
            >
                <Typography variant="h4" gutterBottom align="center" color="primary" sx={{ mb: 4, fontWeight: 'bold' }}>
                    APS Calculator
                </Typography>
                
                <Box sx={{ maxWidth: isDesktop ? '80%' : '100%', mx: 'auto' }}>
                    <Grid container spacing={3}>
                        {/* Subject Groups - Two columns on desktop, one on mobile */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom color="secondary">
                                Core Subjects
                            </Typography>
                            
                            {/* Subject 1 */}
                            <Grid container spacing={2} mb={2}>
                                <Grid item xs={8}>
                                    <Select
                                        fullWidth
                                        value={subject1}
                                        onChange={(e) => setSubject1(e.target.value as string)}
                                        displayEmpty
                                        size="small"
                                    >
                                        <MenuItem value="" disabled>
                                            Select Mathematics
                                        </MenuItem>
                                        {mathSubjects.map((subject) => (
                                            <MenuItem key={subject} value={subject}>
                                                {subject}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        fullWidth
                                        label="Mark %"
                                        value={mark1}
                                        onChange={(e) => setMark1(e.target.value)}
                                        type="number"
                                        size="small"
                                    />
                                </Grid>
                            </Grid>

                            {/* Subject 2 */}
                            <Grid container spacing={2} mb={2}>
                                <Grid item xs={8}>
                                    <Select
                                        fullWidth
                                        value={subject2}
                                        onChange={(e) => setSubject2(e.target.value as string)}
                                        displayEmpty
                                        size="small"
                                    >
                                        <MenuItem value="" disabled>
                                            Select Home Language
                                        </MenuItem>
                                        {homeLanguages.map((subject) => (
                                            <MenuItem key={subject} value={subject}>
                                                {subject}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        fullWidth
                                        label="Mark %"
                                        value={mark2}
                                        onChange={(e) => setMark2(e.target.value)}
                                        type="number"
                                        size="small"
                                    />
                                </Grid>
                            </Grid>

                            {/* Subject 3 */}
                            <Grid container spacing={2} mb={2}>
                                <Grid item xs={8}>
                                    <Select
                                        fullWidth
                                        value={subject3}
                                        onChange={(e) => setSubject3(e.target.value as string)}
                                        displayEmpty
                                        size="small"
                                    >
                                        <MenuItem value="" disabled>
                                            Select Additional Language
                                        </MenuItem>
                                        {additionalLanguages.map((subject) => (
                                            <MenuItem key={subject} value={subject}>
                                                {subject}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        fullWidth
                                        label="Mark %"
                                        value={mark3}
                                        onChange={(e) => setMark3(e.target.value)}
                                        type="number"
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom color="secondary">
                                Elective Subjects
                            </Typography>
                            
                            {/* Subject 4 */}
                            <Grid container spacing={2} mb={2}>
                                <Grid item xs={8}>
                                    <Select
                                        fullWidth
                                        value={subject4}
                                        onChange={(e) => setSubject4(e.target.value as string)}
                                        displayEmpty
                                        size="small"
                                    >
                                        <MenuItem value="" disabled>
                                            Select Subject 4
                                        </MenuItem>
                                        {options4.map((subject) => (
                                            <MenuItem key={subject} value={subject}>
                                                {subject}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        fullWidth
                                        label="Mark %"
                                        value={mark4}
                                        onChange={(e) => setMark4(e.target.value)}
                                        type="number"
                                        size="small"
                                    />
                                </Grid>
                            </Grid>

                            {/* Subject 5 */}
                            <Grid container spacing={2} mb={2}>
                                <Grid item xs={8}>
                                    <Select
                                        fullWidth
                                        value={subject5}
                                        onChange={(e) => setSubject5(e.target.value as string)}
                                        displayEmpty
                                        size="small"
                                    >
                                        <MenuItem value="" disabled>
                                            Select Subject 5
                                        </MenuItem>
                                        {options5.map((subject) => (
                                            <MenuItem key={subject} value={subject}>
                                                {subject}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        fullWidth
                                        label="Mark %"
                                        value={mark5}
                                        onChange={(e) => setMark5(e.target.value)}
                                        type="number"
                                        size="small"
                                    />
                                </Grid>
                            </Grid>

                            {/* Subject 6 */}
                            <Grid container spacing={2} mb={2}>
                                <Grid item xs={8}>
                                    <Select
                                        fullWidth
                                        value={subject6}
                                        onChange={(e) => setSubject6(e.target.value as string)}
                                        displayEmpty
                                        size="small"
                                    >
                                        <MenuItem value="" disabled>
                                            Select Subject 6
                                        </MenuItem>
                                        {options6.map((subject) => (
                                            <MenuItem key={subject} value={subject}>
                                                {subject}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        fullWidth
                                        label="Mark %"
                                        value={mark6}
                                        onChange={(e) => setMark6(e.target.value)}
                                        type="number"
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* APS Score Display */}
                    <Box 
                        sx={{
                            mt: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Box 
                            sx={{ 
                                position: 'relative', 
                                display: 'inline-block',
                                textAlign: 'center',
                                width: 140, 
                                height: 140,
                            }}
                        >
                            <CircularProgress
                                variant="determinate"
                                value={(apsScoreLoc / 42) * 100}
                                size={140}
                                thickness={4}
                                sx={{ 
                                    color: '#e718a7',
                                    position: 'absolute',
                                    left: 0,
                                }}
                            />
                            <Box
                                sx={{
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    position: 'absolute',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                }}
                            >
                                <Image 
                                    src={cherryLogoPng} 
                                    alt="Cherry Logo" 
                                    width={50} 
                                    height={50} 
                                />
                                <Typography 
                                    variant="h4" 
                                    sx={{ 
                                        color: '#8932aa',
                                        fontWeight: 'bold', 
                                        mt: 1,
                                    }}
                                >
                                    {apsScoreLoc}
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: '#666',
                                        fontSize: '10px',
                                    }}
                                >
                                    APS Score
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Calculate Button */}
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={calculateAndDisplayAPS}
                            size="large"
                            sx={{ 
                                px: 4, 
                                py: 1.5, 
                                borderRadius: 25, 
                                fontWeight: 'bold',
                                bgcolor: '#8932aa',
                                '&:hover': {
                                    bgcolor: '#6b2587',
                                }
                            }}
                        >
                            CALCULATE APS
                        </Button>
                    </Box>

                    {/* NBT Section */}
                    <Box sx={{ mt: 5 }}>
                        <Typography variant="h6" gutterBottom color="secondary" align="center">
                            National Benchmark Test (NBT) Scores
                        </Typography>
                        <Grid container spacing={3} justifyContent="center">
                            <Grid item xs={12} sm={4}>
                                <Tooltip title="Academic Literacy" placement="top">
                                    <TextField
                                        fullWidth
                                        label="NBT Academic Literacy"
                                        value={nbtAL}
                                        onChange={(e) => setNbtAL(e.target.value)}
                                        type="number"
                                        size="small"
                                        InputProps={{
                                            startAdornment: <Box component="span" sx={{ mr: 1, color: 'primary.main' }}>AL</Box>,
                                        }}
                                    />
                                </Tooltip>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Tooltip title="Quantitative Literacy" placement="top">
                                    <TextField
                                        fullWidth
                                        label="NBT Quantitative Literacy"
                                        value={nbtQL}
                                        onChange={(e) => setNbtQL(e.target.value)}
                                        type="number"
                                        size="small"
                                        InputProps={{
                                            startAdornment: <Box component="span" sx={{ mr: 1, color: 'primary.main' }}>QL</Box>,
                                        }}
                                    />
                                </Tooltip>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Tooltip title="Mathematics" placement="top">
                                    <TextField
                                        fullWidth
                                        label="NBT Mathematics"
                                        value={nbtMAT}
                                        onChange={(e) => setNbtMAT(e.target.value)}
                                        type="number"
                                        size="small"
                                        InputProps={{
                                            startAdornment: <Box component="span" sx={{ mr: 1, color: 'primary.main' }}>MAT</Box>,
                                        }}
                                    />
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                        <Button
                            variant="contained"
                            onClick={() => {
                                window.open('https://nbtests.uct.ac.za/', '_blank', 'noopener,noreferrer');
                            }}
                            sx={{ 
                                minWidth: 200,
                                borderRadius: 25,
                                py: 1.5,
                                fontWeight: 'bold',
                                bgcolor: '#8932aa',
                                color: '#fff',
                                '&:hover': {
                                    bgcolor: '#6b2587',
                                }
                            }}
                        >
                            BOOK AN NBT TEST
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSaveToProfile}
                            sx={{ 
                                minWidth: 200,
                                borderRadius: 25,
                                py: 1.5,
                                fontWeight: 'bold',
                                bgcolor: '#8932aa',
                                '&:hover': {
                                    bgcolor: '#6b2587',
                                }
                            }}
                        >
                            SAVE TO PROFILE
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Error Snackbar */}
            <Snackbar
                open={errorOpen}
                autoHideDuration={6000}
                onClose={() => setErrorOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setErrorOpen(false)} 
                    severity={errorMessage.includes('success') ? 'success' : 'error'} 
                    sx={{ width: '100%' }}
                >
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default CalculatorPage;
