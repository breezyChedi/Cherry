'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../firebaseConfig';
import { onAuthStateChanged, signOut, User } from 'firebase/auth'; // Import `User` type
import { doc, getDoc } from 'firebase/firestore';
import { Box, Typography, Button, Avatar } from '@mui/material';
import Flag from 'react-world-flags';
import LogoutIcon from '../../icons/logout.svg';

interface Subject {
  name: string;
  mark: string;
}
// Define the profile structure for type safety
interface Profile {
  aps?: number;
  school?: string;
  nationality?: string;
  nationalityCode?: string;
  subjects?: { name: string; mark: number }[];
}

const ProfileDetailsPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null); // Correctly type `user` state
  const [profile, setProfile] = useState<Profile | null>(null); // Type `profile` state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        // Fetch profile data from Firestore
        const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as Profile); // Type cast Firestore data to `Profile`
        } else {
          setProfile(null);
        }
      } else {
        router.push('/profile'); // Redirect to sign in if not authenticated
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/profile'); // Redirect to sign-in page
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Avatar sx={{ bgcolor: 'purple', width: 56, height: 56 }}>
          {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
        </Avatar>
        <LogoutIcon
          onClick={handleSignOut}
          style={{ cursor: 'pointer', color: 'red' }}
        />
      </Box>

      {/* User Info Section */}
      <Typography variant="h5" align="center" mt={2}>
        {user?.displayName || user?.email}
      </Typography>

      {/* Profile Details */}
      {profile ? (
        <Box>
          <Typography
            variant="h6"
            align="center"
            color="purple"
            mt={2}
          >
            APS Score: {profile.aps || 'Not Available'}
          </Typography>
          <Typography align="center">
            School: {profile.school || 'Not Provided'}
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center" mt={1}>
            <Flag
              code={profile.nationalityCode || 'ZA'}
              style={{ width: 20, marginRight: 8 }}
            />
            <Typography>
              Nationality: {profile.nationality || 'Not Provided'}
            </Typography>
          </Box>
          <Box mt={3}>
            <Typography
              variant="h6"
              align="center"
              color="purple"
              mt={2}
            >
              Subjects
            </Typography>
            {profile.subjects ? (
              profile.subjects.map((subject, index) => (
                <Typography
                  key={index}
                  align="center"
                  sx={{
                    backgroundColor: 'lightpink',
                    borderRadius: 1,
                    my: 1,
                    py: 1,
                  }}
                >
                  {subject.name}: {subject.mark}%
                </Typography>
              ))
            ) : (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2, bgcolor: 'purple' }}
                onClick={() => router.push('/calculator')}
              >
                Add Subjects and Marks
              </Button>
            )}
          </Box>
        </Box>
      ) : (
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2, bgcolor: 'purple' }}
          onClick={() => router.push('/calculator')}
        >
          Add Subjects and Marks
        </Button>
      )}
    </Box>
  );
};

export default ProfileDetailsPage;
