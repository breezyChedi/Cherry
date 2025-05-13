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
  Container,
  Paper,
  Grid,
  Divider,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Flag from 'react-world-flags';
import { auth, db } from '../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FlagIcon from '@mui/icons-material/Flag';
import WcIcon from '@mui/icons-material/Wc';
import LockIcon from '@mui/icons-material/Lock';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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

    // Form validation states
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateEmail = (email: string): boolean => {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    };

    const validatePassword = (password: string): boolean => {
      return password.length >= 8;
    };

    const handleSignUp = async (e: React.FormEvent) => {
      e.preventDefault();
      let isValid = true;

      // Reset errors
      setEmailError('');
      setPasswordError('');

      // Validate email
      if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address');
        isValid = false;
      }

      // Validate password
      if (!validatePassword(password)) {
        setPasswordError('Password must be at least 8 characters long');
        isValid = false;
      }

      // Check if emails match
      if (email !== confirmEmail) {
        setEmailError('Emails do not match');
        isValid = false;
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match');
        isValid = false;
      }

      if (!isValid) return;

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

        // Reset the form
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
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                labelId="gender-label"
                value={gender}
                onChange={(e) => setGender(e.target.value as string)}
                label="Gender"
                startAdornment={
                  <InputAdornment position="start">
                    <WcIcon color="primary" />
                  </InputAdornment>
                }
              >
                {genderOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="High School"
              value={highSchool}
              onChange={(e) => setHighSchool(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SchoolIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="nationality-label">Nationality</InputLabel>
              <Select
                labelId="nationality-label"
                value={nationality}
                onChange={(e) => setNationality(e.target.value as string)}
                label="Nationality"
                startAdornment={
                  <InputAdornment position="start">
                    <FlagIcon color="primary" />
                  </InputAdornment>
                }
              >
                {countries.map((country) => (
                  <MenuItem key={country.code} value={country.name}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Flag
                        code={country.code.toLowerCase()}
                        style={{ width: 20, marginRight: 8 }}
                      />
                      {country.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }}>
              <Typography variant="caption" color="text.secondary">
                ACCOUNT DETAILS
              </Typography>
            </Divider>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              error={!!emailError}
              helperText={emailError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Confirm Email Address"
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              error={!!passwordError}
              helperText={passwordError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={toggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ 
            mt: 4, 
            mb: 2, 
            py: 1.5, 
            borderRadius: 2,
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #9c27b0 30%, #d81b60 90%)',
            boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)'
          }}
        >
          Create Account
        </Button>
      </Box>
    );
  };

  // Sign In form
  const SignInForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');

    const handleSignIn = async (e: React.FormEvent) => {
      e.preventDefault();
      setEmailError('');
      
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // Show success Snackbar
        setSnackbar({
          open: true,
          message: 'Sign-in successful!',
          severity: 'success',
        });

        // Reset the form
        setEmail('');
        setPassword('');

        router.push('/profile/profileDetails');

      } catch (err: any) {
        // Show appropriate error messages
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          setEmailError('Invalid email or password');
        } else {
          setSnackbar({
            open: true,
            message: err.message || 'Sign-in failed.',
            severity: 'error',
          });
        }
      }
    };

    return (
      <Box component="form" onSubmit={handleSignIn} sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          error={!!emailError}
          helperText={emailError}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="primary" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="primary" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={togglePasswordVisibility}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ 
            mt: 4, 
            mb: 2,
            py: 1.5, 
            borderRadius: 2,
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #9c27b0 30%, #d81b60 90%)',
            boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)'
          }}
        >
          Sign In
        </Button>
        
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          sx={{ 
            mb: 2,
            py: 1.2,
            borderRadius: 2
          }}
        >
          Forgot Password
        </Button>
      </Box>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        {/* Header with logo or brand */}
        <Box 
          sx={{ 
            bgcolor: 'primary.dark', 
            py: 3, 
            textAlign: 'center',
            borderBottom: '5px solid',
            borderImage: 'linear-gradient(to right, #9c27b0, #d81b60) 1'
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            color="white"
            fontWeight="bold"
          >
            Welcome to Cherry
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="rgba(255,255,255,0.8)"
          >
            {activeTab === 0 ? 'Create an account to start your journey' : 'Sign in to your account'}
          </Typography>
        </Box>
        
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '.MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              background: 'linear-gradient(to right, #9c27b0, #d81b60)',
            },
          }}
        >
          <Tab 
            label={
              <Box sx={{ py: 1, fontWeight: activeTab === 0 ? 'bold' : 'normal' }}>
                Sign up
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ py: 1, fontWeight: activeTab === 1 ? 'bold' : 'normal' }}>
                Sign in
              </Box>
            }
          />
        </Tabs>

        <Box sx={{ p: isDesktop ? 4 : 2 }}>
          {/* Render the forms conditionally based on the active tab */}
          {activeTab === 0 ? <SignUpForm /> : <SignInForm />}
        </Box>
      </Paper>

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
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;
