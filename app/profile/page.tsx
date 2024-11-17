// app/profile/page.tsx

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
    const [gender, setGender] = useState('');
    const [nationality, setNationality] = useState('South Africa');

    return (
      <Box component="form" sx={{ mt: 3 }}>
        <TextField fullWidth label="Name*" margin="normal" variant="standard" />
        <TextField fullWidth label="Surname*" margin="normal" variant="standard" />

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

        <TextField fullWidth label="High School*" margin="normal" variant="standard" />
        <TextField fullWidth label="Phone Number*" margin="normal" variant="standard" />

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

        <TextField fullWidth label="Email Address*" margin="normal" variant="standard" />
        <TextField fullWidth label="Confirm Email Address*" margin="normal" variant="standard" />
        <TextField fullWidth label="Password*" type="password" margin="normal" variant="standard" />
        <TextField fullWidth label="Confirm Password*" type="password" margin="normal" variant="standard" />

        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2, bgcolor: 'purple' }}>
          Sign up
        </Button>
      </Box>
    );
  };

  // Sign In form
  const SignInForm = () => (
    <Box component="form" sx={{ mt: 3 }}>
      <TextField fullWidth label="Email Address*" margin="normal" variant="standard" />
      <TextField fullWidth label="Password*" type="password" margin="normal" variant="standard" />

      <Button variant="contained" color="primary" fullWidth sx={{ mt: 2, bgcolor: 'purple' }}>
        Sign in
      </Button>
      <Button variant="outlined" color="primary" fullWidth sx={{ mt: 1 }}>
        Forgot Password
      </Button>
    </Box>
  );

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
            bgcolor: activeTab === 0 ? 'purple' : 'rgba(128, 0, 128, 0.2)',
            borderRadius: '8px 8px 0 0',
          }}
        />
        <Tab
          label="Sign in"
          sx={{
            color: activeTab === 1 ? 'white' : 'purple',
            bgcolor: activeTab === 1 ? 'purple' : 'rgba(128, 0, 128, 0.2)',
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
    {/* Navbar content */}
  </Box>
    </Box>
    
  );
};

export default ProfilePage;

