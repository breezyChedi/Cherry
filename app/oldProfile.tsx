'use client';

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
} from '@mui/material';
import Flag from 'react-world-flags';
import { auth } from '../firebaseConfig'; // Import Firebase Auth
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Handle tab switch
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
  const SignUpForm = () => {
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [gender, setGender] = useState('');
    const [nationality, setNationality] = useState('South Africa');
    const [error, setError] = useState('');

    const handleSignUp = async (e: React.FormEvent) => {
      e.preventDefault();

      // Validation checks
      if (email !== confirmEmail) {
        setError('Emails do not match.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Sign-up successful!');
      } catch (err: any) {
        setError(err.message);
      }
    };

    return (
      <Box component="form" onSubmit={handleSignUp} sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Name*"
          margin="normal"
          variant="standard"
        />
        <TextField
          fullWidth
          label="Surname*"
          margin="normal"
          variant="standard"
        />

        {/* Gender dropdown */}
        <Select
          fullWidth
          value={gender}
          onChange={(e) => setGender(e.target.value as string)}
          displayEmpty
          variant="standard"
          sx={{ mt: 2 }}
        >
          <MenuItem value="" disabled>
            Male or Female*
          </MenuItem>
          {genderOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>

        <TextField
          fullWidth
          label="High School*"
          margin="normal"
          variant="standard"
        />
        <TextField
          fullWidth
          label="Phone Number*"
          margin="normal"
          variant="standard"
        />

        {/* Nationality dropdown */}
        <Select
          fullWidth
          value={nationality}
          onChange={(e) => setNationality(e.target.value as string)}
          displayEmpty
          variant="standard"
          sx={{ mt: 2 }}
        >
          {countries.map((country) => (
            <MenuItem key={country.code} value={country.name}>
              <Flag code={country.code.toLowerCase()} style={{ width: 20, marginRight: 8 }} />
              {country.name}
            </MenuItem>
          ))}
        </Select>

        <TextField
          fullWidth
          label="Email Address*"
          margin="normal"
          variant="standard"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          label="Confirm Email Address*"
          margin="normal"
          variant="standard"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
        />
        <TextField
          fullWidth
          label="Password*"
          type="password"
          margin="normal"
          variant="standard"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          fullWidth
          label="Confirm Password*"
          type="password"
          margin="normal"
          variant="standard"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2, bgcolor: 'purple' }}
        >
          Sign up
        </Button>
      </Box>
    );
  };

  // Sign In form
  const SignInForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSignIn = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Sign-in successful!');
      } catch (err: any) {
        setError(err.message);
      }
    };

    return (
      <Box component="form" onSubmit={handleSignIn} sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Email Address*"
          margin="normal"
          variant="standard"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          label="Password*"
          type="password"
          margin="normal"
          variant="standard"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2, bgcolor: 'purple' }}
        >
          Sign in
        </Button>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          sx={{ mt: 1 }}
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
            bgcolor: activeTab === 0 ? 'rgba(128, 0, 128, 0.6)' : 'rgba(128, 0, 128, 0.2)',
            borderRadius: '8px 8px 0 0',
          }}
        />
        <Tab
          label="Sign in"
          sx={{
            color: activeTab === 1 ? 'white' : 'purple',
            bgcolor: activeTab === 1 ? 'rgba(128, 0, 128, 0.6)' : 'rgba(128, 0, 128, 0.2)',
            borderRadius: '8px 8px 0 0',
          }}
        />
      </Tabs>

      {/* Render the forms conditionally based on the active tab */}
      {activeTab === 0 ? <SignUpForm /> : <SignInForm />}
      <Box
    component="footer"
    sx={{
      height: '64px', // Same height as your navbar
      backgroundColor: 'white',
    }}
  >
  </Box>
    </Box>
  );
};

export default ProfilePage;


