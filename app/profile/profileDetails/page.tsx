//app/profile/profileDetails/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../firebaseConfig';
import { onAuthStateChanged, signOut, User } from 'firebase/auth'; // Import `User` type
import { doc, getDoc } from 'firebase/firestore';
import { Box, Typography, Button, Avatar, Alert, Grid, CircularProgress } from '@mui/material';
import Flag from 'react-world-flags';
import LogoutIcon from '../../icons/logout.svg';
import firebase from 'firebase/compat/app';

interface Subject {
  name: string;
  mark: string;
}
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" color="primary" onClick={() => router.refresh()}>
          Retry
        </Button>
      </Box>
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
      return { subject, mark };
    });
  };

  const sortedSubjects = getSortedSubjects();

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Avatar sx={{
          bgcolor: userProfile?.gender === 'Male' ? '#5334cb' : userProfile?.gender === 'Female' ? '#e718a7' : '#808080',
          width: 72, height: 72
        }}>
          {userProfile?.name
            ? userProfile.name.charAt(0)
            : user?.email?.charAt(0)?.toUpperCase()}
        </Avatar>
        <LogoutIcon
          onClick={handleSignOut}
          style={{ cursor: 'pointer', color: 'red', width: 32, height: 32 }}
          title="Logout"
        />
      </Box>

      {/* User Info Section */}
      <Typography
        variant="h5"
        align="center"
        mt={2}
        sx={{ backgroundColor: 'purple', color: 'white', borderRadius: 5, p: 1 }}
      >
        {userProfile
          ? `${userProfile.name} ${userProfile.surname}`
          : user?.email}
      </Typography>

      <Grid container spacing={2} mt={3}>
        <Grid item xs={6}>
          <Box
            sx={{
              backgroundColor: 'purple',
              color: 'white',
              borderRadius: 5,
              p: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%', // Ensures equal height with the adjacent card
            }}
          >
            <Typography>APS Score</Typography>
            <Typography variant="h4">{profile?.apsScore || 0}</Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box
            sx={{
              backgroundColor: 'purple',
              color: 'white',
              borderRadius: 5,
              p: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%', // Ensures equal height with the adjacent card
            }}
          >
            <Typography>School</Typography>
            <Typography>{userProfile?.highSchool || 'N/A'}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography
            sx={{
              backgroundColor: 'purple',
              color: 'white',
              borderRadius: 5,
              p: 1,
              borderTop: 10,
            }}
            component="div"
          >
            Nationality
            <Box display="flex" justifyContent="center" alignItems="center">
              <Flag
                code={
                  userProfile?.nationality
                    ? getCountryCode(userProfile.nationality)
                    : 'ZA'
                }
                style={{ width: 24, marginRight: 8 }}
              />
              {userProfile?.nationality || 'N/A'}
            </Box>
          </Typography>
        </Grid>
      </Grid>

      {/* Subjects Section */}
      <Box mt={4}>
        <Typography
          variant="h6"
          align="center"
          sx={{ color: 'purple', fontWeight: 'bold', mb: 2 }}
        >
          Subjects at {userProfile?.highSchool || 'High School'}
        </Typography>
        {sortedSubjects.length > 0 ? (
          sortedSubjects.map(({ subject, mark }, index) => (
            <Box
              key={`subject-${index + 1}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                backgroundColor: 'lightpink',
                borderRadius: 1,
                p: 1,
                mb: 1,
              }}
            >
              <Typography>{subject}</Typography>
              <Typography>{mark}%</Typography>
            </Box>
          ))) : (
          <Typography>No subjects available.</Typography>
        )}
      </Box>
      <Box mt={4}>
        <Typography
          variant="h6"
          align="center"
          sx={{ color: 'purple', fontWeight: 'bold', mb: 2 }}
        >
          National Benchmark Test (NBT) Scores
        </Typography>
        {profile?.nbtScores ? (
          Object.keys(profile.nbtScores).map((key, index) => (
            <Box
              key={`nbt-${index}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                backgroundColor: 'lightblue',
                borderRadius: 1,
                p: 1,
                mb: 1,
              }}
            >
              <Typography>{formatNBTKey(key)}</Typography>
              <Typography>{profile.nbtScores[key]}</Typography>
            </Box>
          ))
        ) : (
          <Typography>No NBT scores available.</Typography>
        )}
      </Box>
    </Box>
  );
};

// Helper function to get country code based on nationality
const getCountryCode = (nationality: string): string => {
  const countryMap: { [key: string]: string } = {
    'South Africa': 'ZA',
    'United States': 'US',
    'United Kingdom': 'GB',
    Canada: 'CA',
    Australia: 'AU',
    India: 'IN',
    China: 'CN',
    Japan: 'JP',
    // Add more mappings as needed
  };

  return countryMap[nationality] || 'ZA'; // Default to 'ZA' if not found
};

// Helper function to format NBT keys
const formatNBTKey = (key: string): string => {
  switch (key) {
    case 'nbtAL':
      return 'NBT AL';
    case 'nbtMAT':
      return 'NBT MAT';
    case 'nbtQL':
      return 'NBT QL';
    default:
      return key;
  }
};

export default ProfileDetailsPage;