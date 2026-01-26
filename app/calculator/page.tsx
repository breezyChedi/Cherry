// app/calculator/page.tsx

'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { auth, db } from '../firebaseConfig';
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
                background: 'linear-gradient(135deg, #fddeff 0%, #ffe4f5 100%)',
                minHeight: 'calc(100vh - 64px)'
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Paper 
                    elevation={6} 
                    sx={{ 
                        p: 4, 
                        borderRadius: 4,
                        background: 'white',
                        boxShadow: '0 8px 32px rgba(255, 20, 147, 0.15)'
                    }}
                >
                    <Typography 
                        variant="h3" 
                        gutterBottom 
                        align="center" 
                        sx={{ 
                            mb: 4, 
                            fontWeight: 900,
                            background: 'linear-gradient(45deg, #FF1493 30%, #FF69B4 90%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        APS Calculator
                    </Typography>
                    
                    <Box sx={{ maxWidth: isDesktop ? '90%' : '100%', mx: 'auto' }}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#FF1493', mb: 3 }}>
                                    Core Subjects
                                </Typography>
                                
                                {/* Subject 1 */}
                                <Grid container spacing={2} mb={3}>
                                    <Grid item xs={8}>
                                        <Select
                                            fullWidth
                                            value={subject1}
                                            onChange={(e) => setSubject1(e.target.value as string)}
                                            displayEmpty
                                            sx={{ 
                                                borderRadius: 2,
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(255, 20, 147, 0.3)',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#FF1493',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#FF1493',
                                                }
                                            }}
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
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&:hover fieldset': { borderColor: '#FF1493' },
                                                    '&.Mui-focused fieldset': { borderColor: '#FF1493' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Subject 2 */}
                                <Grid container spacing={2} mb={3}>
                                    <Grid item xs={8}>
                                        <Select
                                            fullWidth
                                            value={subject2}
                                            onChange={(e) => setSubject2(e.target.value as string)}
                                            displayEmpty
                                            sx={{ 
                                                borderRadius: 2,
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(255, 20, 147, 0.3)',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#FF1493',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#FF1493',
                                                }
                                            }}
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
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&:hover fieldset': { borderColor: '#FF1493' },
                                                    '&.Mui-focused fieldset': { borderColor: '#FF1493' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Subject 3 */}
                                <Grid container spacing={2} mb={3}>
                                    <Grid item xs={8}>
                                        <Select
                                            fullWidth
                                            value={subject3}
                                            onChange={(e) => setSubject3(e.target.value as string)}
                                            displayEmpty
                                            sx={{ 
                                                borderRadius: 2,
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(255, 20, 147, 0.3)',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#FF1493',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#FF1493',
                                                }
                                            }}
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
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&:hover fieldset': { borderColor: '#FF1493' },
                                                    '&.Mui-focused fieldset': { borderColor: '#FF1493' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#FF1493', mb: 3 }}>
                                    Elective Subjects
                                </Typography>
                                
                                {/* Subject 4 */}
                                <Grid container spacing={2} mb={3}>
                                    <Grid item xs={8}>
                                        <Select
                                            fullWidth
                                            value={subject4}
                                            onChange={(e) => setSubject4(e.target.value as string)}
                                            displayEmpty
                                            sx={{ 
                                                borderRadius: 2,
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(255, 20, 147, 0.3)',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#FF1493',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#FF1493',
                                                }
                                            }}
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
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&:hover fieldset': { borderColor: '#FF1493' },
                                                    '&.Mui-focused fieldset': { borderColor: '#FF1493' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Subject 5 */}
                                <Grid container spacing={2} mb={3}>
                                    <Grid item xs={8}>
                                        <Select
                                            fullWidth
                                            value={subject5}
                                            onChange={(e) => setSubject5(e.target.value as string)}
                                            displayEmpty
                                            sx={{ 
                                                borderRadius: 2,
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(255, 20, 147, 0.3)',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#FF1493',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#FF1493',
                                                }
                                            }}
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
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&:hover fieldset': { borderColor: '#FF1493' },
                                                    '&.Mui-focused fieldset': { borderColor: '#FF1493' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Subject 6 */}
                                <Grid container spacing={2} mb={3}>
                                    <Grid item xs={8}>
                                        <Select
                                            fullWidth
                                            value={subject6}
                                            onChange={(e) => setSubject6(e.target.value as string)}
                                            displayEmpty
                                            sx={{ 
                                                borderRadius: 2,
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(255, 20, 147, 0.3)',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#FF1493',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#FF1493',
                                                }
                                            }}
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
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&:hover fieldset': { borderColor: '#FF1493' },
                                                    '&.Mui-focused fieldset': { borderColor: '#FF1493' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* APS Score Display */}
                        <Box 
                            sx={{
                                mt: 5,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Box 
                                    sx={{ 
                                        position: 'relative', 
                                        display: 'inline-block',
                                        textAlign: 'center',
                                        width: 160, 
                                        height: 160,
                                    }}
                                >
                                    <CircularProgress
                                        variant="determinate"
                                        value={(apsScoreLoc / 42) * 100}
                                        size={160}
                                        thickness={6}
                                        sx={{ 
                                            color: '#FF1493',
                                            position: 'absolute',
                                            left: 0,
                                            filter: 'drop-shadow(0 4px 8px rgba(255, 20, 147, 0.3))'
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
                                            width={55} 
                                            height={55} 
                                        />
                                        <Typography 
                                            variant="h3" 
                                            sx={{ 
                                                color: '#FF1493',
                                                fontWeight: 900, 
                                                mt: 1,
                                            }}
                                        >
                                            {apsScoreLoc}
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                color: '#666',
                                                fontSize: '11px',
                                                fontWeight: 600
                                            }}
                                        >
                                            APS Score
                                        </Typography>
                                    </Box>
                                </Box>
                            </motion.div>
                        </Box>

                        {/* Calculate Button */}
                        <Box sx={{ mt: 5, textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                onClick={calculateAndDisplayAPS}
                                size="large"
                                sx={{ 
                                    px: 6, 
                                    py: 2, 
                                    borderRadius: 3, 
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    background: 'linear-gradient(45deg, #FF1493 30%, #FF69B4 90%)',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 15px rgba(255, 20, 147, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #FF1493 20%, #FF69B4 80%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 20px rgba(255, 20, 147, 0.4)',
                                    },
                                    transition: 'all 0.3s'
                                }}
                            >
                                Calculate APS Score
                            </Button>
                        </Box>

                        {/* NBT Section */}
                        <Box sx={{ mt: 6 }}>
                            <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 700, color: '#FF1493', mb: 3 }}>
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
                                            InputProps={{
                                                startAdornment: <Box component="span" sx={{ mr: 1, color: '#FF1493', fontWeight: 'bold' }}>AL</Box>,
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&:hover fieldset': { borderColor: '#FF1493' },
                                                    '&.Mui-focused fieldset': { borderColor: '#FF1493' }
                                                }
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
                                            InputProps={{
                                                startAdornment: <Box component="span" sx={{ mr: 1, color: '#FF1493', fontWeight: 'bold' }}>QL</Box>,
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&:hover fieldset': { borderColor: '#FF1493' },
                                                    '&.Mui-focused fieldset': { borderColor: '#FF1493' }
                                                }
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
                                            InputProps={{
                                                startAdornment: <Box component="span" sx={{ mr: 1, color: '#FF1493', fontWeight: 'bold' }}>MAT</Box>,
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&:hover fieldset': { borderColor: '#FF1493' },
                                                    '&.Mui-focused fieldset': { borderColor: '#FF1493' }
                                                }
                                            }}
                                        />
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 3, mb: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    window.open('https://nbtests.uct.ac.za/', '_blank', 'noopener,noreferrer');
                                }}
                                sx={{ 
                                    minWidth: 220,
                                    borderRadius: 3,
                                    py: 1.5,
                                    px: 4,
                                    fontWeight: 'bold',
                                    borderColor: '#FF1493',
                                    color: '#FF1493',
                                    borderWidth: 2,
                                    textTransform: 'none',
                                    '&:hover': {
                                        borderColor: '#FF1493',
                                        backgroundColor: 'rgba(255, 20, 147, 0.05)',
                                        borderWidth: 2,
                                    }
                                }}
                            >
                                Book an NBT Test
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSaveToProfile}
                                sx={{ 
                                    minWidth: 220,
                                    borderRadius: 3,
                                    py: 1.5,
                                    px: 4,
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(45deg, #FF1493 30%, #FF69B4 90%)',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 15px rgba(255, 20, 147, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #FF1493 20%, #FF69B4 80%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 20px rgba(255, 20, 147, 0.4)',
                                    },
                                    transition: 'all 0.3s'
                                }}
                            >
                                Save to Profile
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </motion.div>

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
                    sx={{ width: '100%', borderRadius: 2 }}
                    variant="filled"
                >
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default CalculatorPage;
