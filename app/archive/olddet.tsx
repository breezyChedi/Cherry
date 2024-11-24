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

  return (
    <Box sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Avatar sx={{ bgcolor: 'purple', width: 56, height: 56 }}>
          {userProfile?.name
            ? userProfile.name.charAt(0)
            : user?.email?.charAt(0)?.toUpperCase()}
        </Avatar>
        <LogoutIcon
          onClick={handleSignOut}
          style={{ cursor: 'pointer', color: 'red', width: 24, height: 24 }}
          title="Logout"
        />
      </Box>

      {/* User Info Section */}
      <Typography variant="h5" align="center" mt={2}>
        {userProfile
          ? `${userProfile.name} ${userProfile.surname}`
          : user?.email}
      </Typography>

      {/* Personal Details */}
      {userProfile && (
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                <strong>Email:</strong> {userProfile.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                <strong>Phone Number:</strong> {userProfile.phoneNumber}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                <strong>Gender:</strong> {userProfile.gender}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                <strong>Nationality:</strong> {userProfile.nationality}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                <strong>High School:</strong> {userProfile.highSchool}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <Flag
                  code={
                    userProfile.nationality
                      ? getCountryCode(userProfile.nationality)
                      : 'ZA'
                  }
                  style={{ width: 20, marginRight: 8 }}
                />
                <Typography variant="subtitle1">
                  {userProfile.nationality}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Profile Details */}
      {profile ? (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" color="purple" gutterBottom>
            Academic Details
          </Typography>

          {/* APS Score */}
          {profile.apsScore !== undefined && (
            <Typography variant="subtitle1">
              <strong>APS Score:</strong> {profile.apsScore}
            </Typography>
          )}

          {/* Subjects and Marks */}
          {profile.subjects && Object.keys(profile.subjects).length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Subjects:</strong>
              </Typography>
              {Object.entries(profile.subjects).map(([key, subjectName], index) => {
                const markKey = `mark${index + 1}`;
                const mark = profile.marks ? profile.marks[markKey] : 'N/A';
                return (
                  <Box
                    key={key}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'lightpink',
                      borderRadius: 1,
                      my: 1,
                      p: 1,
                    }}
                  >
                    <Typography>{subjectName}</Typography>
                    <Typography>{mark}%</Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* NBT Scores */}
          {profile.nbtScores && Object.keys(profile.nbtScores).length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>NBT Scores:</strong>
              </Typography>
              {Object.entries(profile.nbtScores).map(([key, value]) => (
                <Typography key={key}>
                  {formatNBTKey(key)}: {value}%
                </Typography>
              ))}
            </Box>
          )}

          {/* Saved At */}
          {profile.savedAt && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 2 }}>
              Last Updated: {profile.savedAt.toDate().toLocaleString()}
            </Typography>
          )}
        </Box>
      ) : (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="subtitle1" gutterBottom>
            No academic details found.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2, bgcolor: 'purple' }}
            onClick={() => router.push('/calculator')}
          >
            Add Subjects and Marks
          </Button>
        </Box>
      )}
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