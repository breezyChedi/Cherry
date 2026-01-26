//app/profile/profileDetails/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../firebaseConfig';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { 
  Box, 
  Typography, 
  Button, 
  Avatar, 
  Alert, 
  Grid, 
  CircularProgress, 
  Container,
  Paper,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';
import Flag from 'react-world-flags';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import FlagIcon from '@mui/icons-material/Flag';
import PhoneIcon from '@mui/icons-material/Phone';
import WcIcon from '@mui/icons-material/Wc';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import firebase from 'firebase/compat/app';

// Define the profile structure for type safety
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
  const theme = useTheme();
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
          // Fetch user data from 'users' collection
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            setUserProfile(null);
          }

          // Fetch profile data from 'profiles' collection
          const profileDocRef = doc(db, 'profiles', currentUser.uid);
          const profileDoc = await getDoc(profileDocRef);
          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as Profile);
          } else {
            setProfile(null);
          }
        } catch (err: any) {
          console.error('Error fetching user data:', err);
          setError('Failed to load profile data.');
        }
      } else {
        router.push('/profile'); // Redirect to sign-in if not authenticated
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/profile'); // Redirect to sign-in page
    } catch (err: any) {
      console.error('Error signing out:', err);
      setError('Failed to sign out.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          variant="filled"
          action={
            <Button color="inherit" size="small" onClick={() => router.refresh()}>
              Retry
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  const getSortedSubjects = () => {
    if (!profile?.subjects) return [];

    // Extract subject keys and sort them numerically
    const sortedKeys = Object.keys(profile.subjects).sort((a, b) => {
      const aNum = parseInt(a.replace('subject', ''), 10);
      const bNum = parseInt(b.replace('subject', ''), 10);
      return aNum - bNum;
    });

    // Map sorted keys to subject and corresponding mark
    return sortedKeys.map((key) => {
      const subjectNumber = key.replace('subject', '');
      const subject = profile.subjects![key];
      const mark = profile.marks?.[`mark${subjectNumber}`] || '0';
      return { subject, mark: parseInt(mark) };
    });
  };

  const sortedSubjects = getSortedSubjects();
  
  // Grade point colors based on mark ranges
  const getMarkColor = (mark: number) => {
    if (mark >= 80) return '#4caf50'; // A - Green
    if (mark >= 70) return '#8bc34a'; // B - Light Green
    if (mark >= 60) return '#cddc39'; // C - Lime
    if (mark >= 50) return '#ffc107'; // D - Amber
    if (mark >= 40) return '#ff9800'; // E - Orange
    return '#f44336'; // F - Red
  };

  // Get letter grade
  const getGrade = (mark: number) => {
    if (mark >= 80) return 'A';
    if (mark >= 70) return 'B';
    if (mark >= 60) return 'C';
    if (mark >= 50) return 'D';
    if (mark >= 40) return 'E';
    return 'F';
  };

  // Get progress value for NBT scores (assuming NBT scores are out of 100)
  const getNBTProgress = (score: string) => {
    const value = parseInt(score);
    return isNaN(value) ? 0 : value;
  };

  // Format date
  const formatDate = (timestamp?: firebase.firestore.Timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Profile Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%',
              position: 'relative',
              background: 'linear-gradient(to bottom, #f5f7fa 0%, #c3cfe2 100%)'
            }}
          >
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <Tooltip title="Sign Out">
                <IconButton 
                  onClick={handleSignOut}
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                  }}
                >
                  <LogoutIcon color="error" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar 
                sx={{
                  bgcolor: userProfile?.gender === 'Male' ? '#5334cb' : userProfile?.gender === 'Female' ? '#e718a7' : '#808080',
                  width: 120, 
                  height: 120,
                  fontSize: 48,
                  mb: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}
              >
                {userProfile?.name
                  ? userProfile.name.charAt(0).toUpperCase()
                  : user?.email?.charAt(0)?.toUpperCase()}
              </Avatar>
              
              <Typography variant="h5" fontWeight="bold" align="center">
                {userProfile
                  ? `${userProfile.name} ${userProfile.surname}`
                  : user?.email?.split('@')[0]}
              </Typography>
              
              <Chip 
                icon={<EmailIcon />} 
                label={user?.email} 
                size="small" 
                sx={{ mt: 1 }} 
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* User Details */}
            <Box sx={{ mt: 2 }}>
              {userProfile?.gender && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WcIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography>
                    {userProfile.gender}
                  </Typography>
                </Box>
              )}
              
              {userProfile?.phoneNumber && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography>
                    {userProfile.phoneNumber}
                  </Typography>
                </Box>
              )}
              
              {userProfile?.highSchool && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography>
                    {userProfile.highSchool}
                  </Typography>
                </Box>
              )}
              
              {userProfile?.nationality && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FlagIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Flag
                      code={getCountryCode(userProfile.nationality)}
                      style={{ width: 24, marginRight: 8 }}
                    />
                    <Typography>
                      {userProfile.nationality}
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {userProfile?.createdAt && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarTodayIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography>
                    Joined {formatDate(userProfile.createdAt)}
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* APS Score */}
            <Box 
              sx={{ 
                mt: 3, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: 'background.paper',
                borderRadius: 2,
                p: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                APS Score
              </Typography>
              
              <Box 
                sx={{ 
                  position: 'relative',
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={(profile?.apsScore || 0) / 42 * 100}
                  size={120}
                  thickness={8}
                  sx={{
                    color: (profile?.apsScore || 0) >= 30 
                      ? '#4caf50' 
                      : (profile?.apsScore || 0) >= 20 
                        ? '#ffc107' 
                        : '#f44336',
                    borderRadius: '50%',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
                  }}
                >
                  <Typography
                    variant="h4"
                    component="div"
                    color="text.primary"
                    fontWeight="bold"
                  >
                    {profile?.apsScore || 0}
                  </Typography>
                </Box>
              </Box>
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mt: 1 }}
              >
                Out of 42 possible points
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Subjects Section */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              mb: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              sx={{ 
                mb: 3,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ScoreboardIcon sx={{ mr: 1, color: 'primary.main' }} />
              Academic Performance
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            {sortedSubjects.length > 0 ? (
              <Grid container spacing={2}>
                {sortedSubjects.map(({ subject, mark }, index) => (
                  <Grid item xs={12} sm={6} key={`subject-${index}`}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        borderColor: getMarkColor(mark),
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: 2
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" component="div">
                            {subject}
                          </Typography>
                          <Box 
                            sx={{ 
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center'
                            }}
                          >
                            <Typography 
                              variant="h5" 
                              fontWeight="bold" 
                              sx={{ color: getMarkColor(mark) }}
                            >
                              {getGrade(mark)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {mark}%
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box 
                          sx={{ 
                            mt: 1, 
                            width: '100%', 
                            height: 8, 
                            bgcolor: 'background.paper',
                            borderRadius: 5,
                            overflow: 'hidden'
                          }}
                        >
                          <Box 
                            sx={{ 
                              width: `${mark}%`, 
                              height: '100%', 
                              bgcolor: getMarkColor(mark)
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 4, 
                  bgcolor: 'background.paper',
                  borderRadius: 2
                }}
              >
                <Typography color="text.secondary">
                  No subjects available. Add your subjects in the APS Calculator.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  onClick={() => router.push('/calculator')}
                >
                  Go to APS Calculator
                </Button>
              </Box>
            )}
          </Paper>
          
          {/* NBT Scores Section */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              sx={{ 
                mb: 3,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ScoreboardIcon sx={{ mr: 1, color: 'secondary.main' }} />
              National Benchmark Test (NBT) Scores
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            {profile?.nbtScores && Object.keys(profile.nbtScores).length > 0 ? (
              <Grid container spacing={3}>
                {Object.keys(profile.nbtScores).map((key, index) => {
                  const score = profile.nbtScores![key];
                  const progress = getNBTProgress(score);
                  
                  return (
                    <Grid item xs={12} sm={4} key={`nbt-${index}`}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          textAlign: 'center',
                          p: 2,
                          boxShadow: 2,
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: 4
                          }
                        }}
                      >
                        <Typography 
                          variant="h6" 
                          color="primary" 
                          fontWeight="medium"
                          gutterBottom
                        >
                          {formatNBTKey(key)}
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            position: 'relative',
                            display: 'inline-flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            my: 2
                          }}
                        >
                          <CircularProgress
                            variant="determinate"
                            value={progress}
                            size={80}
                            thickness={8}
                            sx={{
                              color: progress >= 70 
                                ? '#4caf50' 
                                : progress >= 50 
                                  ? '#ffc107' 
                                  : '#f44336'
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
                            }}
                          >
                            <Typography
                              variant="h6"
                              component="div"
                              color="text.primary"
                              fontWeight="bold"
                            >
                              {score}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ maxWidth: 200, mx: 'auto' }}
                        >
                          {getNBTDescription(key)}
                        </Typography>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 4, 
                  bgcolor: 'background.paper',
                  borderRadius: 2
                }}
              >
                <Typography color="text.secondary">
                  No NBT scores available. Enter your scores in the APS Calculator.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  sx={{ mt: 2 }}
                  onClick={() => window.open('https://nbtests.uct.ac.za/', '_blank')}
                >
                  Book an NBT Test
                </Button>
              </Box>
            )}
            
            {profile?.savedAt && (
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ display: 'block', textAlign: 'right', mt: 2 }}
              >
                Last updated: {formatDate(profile.savedAt)}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

// Helper function to get country code based on nationality
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
    // Add more mappings as needed
  };

  return countryMap[nationality] || 'ZA'; // Default to 'ZA' if not found
};

// Helper function to format NBT keys
const formatNBTKey = (key: string): string => {
  switch (key) {
    case 'nbtAL':
      return 'Academic Literacy';
    case 'nbtMAT':
      return 'Mathematics';
    case 'nbtQL':
      return 'Quantitative Literacy';
    default:
      return key;
  }
};

// Helper function to get NBT description
const getNBTDescription = (key: string): string => {
  switch (key) {
    case 'nbtAL':
      return 'Tests your capacity to engage with academic study in English';
    case 'nbtMAT':
      return 'Tests mathematical concepts from secondary school curriculum';
    case 'nbtQL':
      return 'Tests ability to manage quantitative problem-solving in academic contexts';
    default:
      return '';
  }
};

export default ProfileDetailsPage;