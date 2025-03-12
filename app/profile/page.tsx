//app/profile/page.tsx
'use client';

import { useRouter } from 'next/navigation';

import React, { useState } from 'react';
import {
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  Box,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import Flag from 'react-world-flags';
import { auth, db } from '../firebaseConfig'; // Import Firebase Auth and Firestore
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Router } from 'next/router';



const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Handle tab switch
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Close Snackbar
  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Gender options
  const genderOptions = ['Male', 'Female'];

  // List of country options with flags
  const countries = [
    { code: 'ZA', name: 'South Africa' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'IN', name: 'India' },
    { code: 'CN', name: 'China' },
    { code: 'JP', name: 'Japan' },
    // Add more countries as needed
  ];

  // Sign Up form with gender and nationality dropdowns
  const SignUpForm: React.FC = () => {
    // Form states
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [highSchool, setHighSchool] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [gender, setGender] = useState('');
    const [nationality, setNationality] = useState('South Africa');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSignUp = async (e: React.FormEvent) => {
      e.preventDefault();

      // Validation checks
      if (email !== confirmEmail) {
        setSnackbar({
          open: true,
          message: 'Emails do not match.',
          severity: 'error',
        });
        return;
      }
      if (password !== confirmPassword) {
        setSnackbar({
          open: true,
          message: 'Passwords do not match.',
          severity: 'error',
        });
        return;
      }

      // Additional validation can be added here (e.g., email format, password strength)

      try {
        // Create user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Save additional user data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name,
          surname,
          highSchool,
          phoneNumber,
          gender,
          nationality,
          email,
          createdAt: new Date(),
        });
        

        router.push('/profile/profileDetails');

        // Show success Snackbar
        setSnackbar({
          open: true,
          message: 'Sign-up successful!',
          severity: 'success',
        });

        // Optionally, reset the form
        setName('');
        setSurname('');
        setHighSchool('');
        setPhoneNumber('');
        setGender('');
        setNationality('South Africa');
        setEmail('');
        setConfirmEmail('');
        setPassword('');
        setConfirmPassword('');

      } catch (err: any) {
        // Show error Snackbar
        setSnackbar({
          open: true,
          message: err.message || 'Sign-up failed.',
          severity: 'error',
        });
      }
    };

    return (
      <Box component="form" onSubmit={handleSignUp} sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Name"
          margin="normal"
          variant="standard"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Surname"
          margin="normal"
          variant="standard"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          required
        />

        {/* Gender dropdown */}
        <Select
          fullWidth
          value={gender}
          onChange={(e) => setGender(e.target.value as string)}
          displayEmpty
          variant="standard"
          sx={{ mt: 2 }}
          required
        >
          <MenuItem value="" disabled>
            Select Gender
          </MenuItem>
          {genderOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>

        <TextField
          fullWidth
          label="High School"
          margin="normal"
          variant="standard"
          value={highSchool}
          onChange={(e) => setHighSchool(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Phone Number"
          margin="normal"
          variant="standard"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />

        {/* Nationality dropdown */}
        <Select
          fullWidth
          value={nationality}
          onChange={(e) => setNationality(e.target.value as string)}
          displayEmpty
          variant="standard"
          sx={{ mt: 2 }}
          required
        >
          <MenuItem value="" disabled>
            Select Nationality
          </MenuItem>
          {countries.map((country) => (
            <MenuItem key={country.code} value={country.name}>
              <Flag
                code={country.code.toLowerCase()}
                style={{ width: 20, marginRight: 8 }}
              />
              {country.name}
            </MenuItem>
          ))}
        </Select>

        <TextField
          fullWidth
          label="Email Address"
          margin="normal"
          variant="standard"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Confirm Email Address"
          margin="normal"
          variant="standard"
          type="email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          variant="standard"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Confirm Password"
          type="password"
          margin="normal"
          variant="standard"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2, bgcolor: 'purple', '&:hover': { bgcolor: 'darkpurple' } }}
        >
          Sign up
        </Button>
      </Box>
    );
  };

  // Sign In form
  const SignInForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // Show success Snackbar
        setSnackbar({
          open: true,
          message: 'Sign-in successful!',
          severity: 'success',
        });

        // Optionally, reset the form
        setEmail('');
        setPassword('');

        router.push('/profile/profileDetails');

      } catch (err: any) {
        // Show error Snackbar
        setSnackbar({
          open: true,
          message: err.message || 'Sign-in failed.',
          severity: 'error',
        });
      }
    };

    return (
      <Box component="form" onSubmit={handleSignIn} sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Email Address"
          margin="normal"
          variant="standard"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          variant="standard"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2, bgcolor: 'purple', '&:hover': { bgcolor: 'darkpurple' } }}
        >
          Sign in
        </Button>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          sx={{ mt: 1 }}
          // Add your forgot password handler here
        >
          Forgot Password
        </Button>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          '& .MuiTab-root': {
            fontWeight: 'bold',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: 'purple',
          },
        }}
      >
        <Tab
          label="Sign up"
          sx={{
            color: activeTab === 0 ? 'white' : 'purple',
            bgcolor:
              activeTab === 0
                ? 'rgba(128, 0, 128, 0.6)'
                : 'rgba(128, 0, 128, 0.2)',
            borderRadius: '8px 8px 0 0',
          }}
        />
        <Tab
          label="Sign in"
          sx={{
            color: activeTab === 1 ? 'white' : 'purple',
            bgcolor:
              activeTab === 1
                ? 'rgba(128, 0, 128, 0.6)'
                : 'rgba(128, 0, 128, 0.2)',
            borderRadius: '8px 8px 0 0',
          }}
        />
      </Tabs>

      {/* Render the forms conditionally based on the active tab */}
      {activeTab === 0 ? <SignUpForm /> : <SignInForm />}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box
        component="footer"
        sx={{
          height: '64px', // Same height as your navbar
          backgroundColor: 'white',
        }}
      ></Box>
    </Box>
  );
};

export default ProfilePage;
