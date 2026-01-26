'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Flag from 'react-world-flags';
import { auth, db } from '../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  InputAdornment,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { Eye, EyeOff, User, School, Mail, Phone, MapPin, Users, Lock, Check, X } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const genderOptions = ['Male', 'Female'];

  const countries = [
    { code: 'ZA', name: 'South Africa' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'IN', name: 'India' },
    { code: 'CN', name: 'China' },
    { code: 'JP', name: 'Japan' },
  ];

  const SignUpForm: React.FC = () => {
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

      setEmailError('');
      setPasswordError('');

      if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address');
        isValid = false;
      }

      if (!validatePassword(password)) {
        setPasswordError('Password must be at least 8 characters long');
        isValid = false;
      }

      if (email !== confirmEmail) {
        setEmailError('Emails do not match');
        isValid = false;
      }

      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match');
        isValid = false;
      }

      if (!isValid) return;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

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
        
        setSnackbar({
          open: true,
          message: 'Account created successfully!',
          severity: 'success',
        });

        setTimeout(() => router.push('/profile/profileDetails'), 1000);

      } catch (err: any) {
        setSnackbar({
          open: true,
          message: err.message || 'Sign-up failed.',
          severity: 'error',
        });
      }
    };

    return (
      <Box component="form" onSubmit={handleSignUp} sx={{ mt: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start"><User size={20} color="#FF1493" /></InputAdornment>,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': { borderColor: '#FF1493' },
                '&.Mui-focused fieldset': { borderColor: '#FF1493' }
              }
            }}
          />
          
          <TextField
            fullWidth
            label="Surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start"><User size={20} color="#FF1493" /></InputAdornment>,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': { borderColor: '#FF1493' },
                '&.Mui-focused fieldset': { borderColor: '#FF1493' }
              }
            }}
          />

          <FormControl fullWidth required>
            <InputLabel>Gender</InputLabel>
            <Select
              value={gender}
              label="Gender"
              onChange={(e) => setGender(e.target.value)}
              startAdornment={<InputAdornment position="start"><Users size={20} color="#FF1493" /></InputAdornment>}
              sx={{
                borderRadius: '12px',
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FF1493' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FF1493' }
              }}
            >
              {genderOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="High School"
            value={highSchool}
            onChange={(e) => setHighSchool(e.target.value)}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start"><School size={20} color="#FF1493" /></InputAdornment>,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': { borderColor: '#FF1493' },
                '&.Mui-focused fieldset': { borderColor: '#FF1493' }
              }
            }}
          />

          <TextField
            fullWidth
            label="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start"><Phone size={20} color="#FF1493" /></InputAdornment>,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': { borderColor: '#FF1493' },
                '&.Mui-focused fieldset': { borderColor: '#FF1493' }
              }
            }}
          />

          <FormControl fullWidth required>
            <InputLabel>Nationality</InputLabel>
            <Select
              value={nationality}
              label="Nationality"
              onChange={(e) => setNationality(e.target.value)}
              startAdornment={<InputAdornment position="start"><MapPin size={20} color="#FF1493" /></InputAdornment>}
              sx={{
                borderRadius: '12px',
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FF1493' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FF1493' }
              }}
            >
              {countries.map((country) => (
                <MenuItem key={country.code} value={country.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Flag code={country.code.toLowerCase()} style={{ width: 20 }} />
                    {country.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', my: 3, color: 'text.secondary', fontWeight: 600 }}>
          ACCOUNT DETAILS
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              startAdornment: <InputAdornment position="start"><Mail size={20} color="#FF1493" /></InputAdornment>,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': { borderColor: '#FF1493' },
                '&.Mui-focused fieldset': { borderColor: '#FF1493' }
              }
            }}
          />

          <TextField
            fullWidth
            label="Confirm Email"
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start"><Mail size={20} color="#FF1493" /></InputAdornment>,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': { borderColor: '#FF1493' },
                '&.Mui-focused fieldset': { borderColor: '#FF1493' }
              }
            }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              error={!!passwordError}
              helperText={passwordError}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock size={20} color="#FF1493" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': { borderColor: '#FF1493' },
                  '&.Mui-focused fieldset': { borderColor: '#FF1493' }
                }
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock size={20} color="#FF1493" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': { borderColor: '#FF1493' },
                  '&.Mui-focused fieldset': { borderColor: '#FF1493' }
                }
              }}
            />
          </Box>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            mt: 4,
            py: 1.5,
            borderRadius: '12px',
            background: 'linear-gradient(45deg, #FF1493 30%, #FF69B4 90%)',
            fontWeight: 'bold',
            fontSize: '16px',
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(45deg, #FF1493 20%, #FF69B4 80%)',
              transform: 'scale(1.02)',
            },
            transition: 'all 0.2s'
          }}
        >
          Create Account
        </Button>
      </Box>
    );
  };

  const SignInForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');

    const handleSignIn = async (e: React.FormEvent) => {
      e.preventDefault();
      setEmailError('');
      
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setSnackbar({
          open: true,
          message: 'Welcome back!',
          severity: 'success',
        });

        setTimeout(() => router.push('/profile/profileDetails'), 1000);

      } catch (err: any) {
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              startAdornment: <InputAdornment position="start"><Mail size={20} color="#FF1493" /></InputAdornment>,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': { borderColor: '#FF1493' },
                '&.Mui-focused fieldset': { borderColor: '#FF1493' }
              }
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start"><Lock size={20} color="#FF1493" /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': { borderColor: '#FF1493' },
                '&.Mui-focused fieldset': { borderColor: '#FF1493' }
              }
            }}
          />
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            mt: 4,
            py: 1.5,
            borderRadius: '12px',
            background: 'linear-gradient(45deg, #FF1493 30%, #FF69B4 90%)',
            fontWeight: 'bold',
            fontSize: '16px',
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(45deg, #FF1493 20%, #FF69B4 80%)',
              transform: 'scale(1.02)',
            },
            transition: 'all 0.2s'
          }}
        >
          Sign In
        </Button>

        <Button
          fullWidth
          variant="outlined"
          sx={{
            mt: 2,
            py: 1.2,
            borderRadius: '12px',
            borderColor: '#FF1493',
            color: '#FF1493',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              borderColor: '#FF1493',
              backgroundColor: 'rgba(255, 20, 147, 0.04)',
            }
          }}
        >
          Forgot Password?
        </Button>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fddeff 0%, #ffe4f5 100%)',
        py: 4,
        px: 2
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)',
                py: 6,
                px: 4,
                textAlign: 'center'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box sx={{ position: 'relative', width: 64, height: 64 }}>
                  <Image src="/cherryLogoPng.png" alt="Cherry Logo" fill className="object-contain" />
                </Box>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 900, color: 'white', mb: 1 }}>
                Welcome to Cherry
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {activeTab === 'signup' ? 'Create your account and start exploring' : 'Sign in to continue your journey'}
              </Typography>
            </Box>

            {/* Tabs */}
            <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
              <Button
                onClick={() => setActiveTab('signup')}
                fullWidth
                sx={{
                  py: 2,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '16px',
                  color: activeTab === 'signup' ? '#FF1493' : 'text.secondary',
                  borderBottom: activeTab === 'signup' ? '3px solid #FF1493' : 'none',
                  borderRadius: 0,
                  '&:hover': { backgroundColor: 'rgba(255, 20, 147, 0.04)' }
                }}
              >
                Sign Up
              </Button>
              <Button
                onClick={() => setActiveTab('signin')}
                fullWidth
                sx={{
                  py: 2,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '16px',
                  color: activeTab === 'signin' ? '#FF1493' : 'text.secondary',
                  borderBottom: activeTab === 'signin' ? '3px solid #FF1493' : 'none',
                  borderRadius: 0,
                  '&:hover': { backgroundColor: 'rgba(255, 20, 147, 0.04)' }
                }}
              >
                Sign In
              </Button>
            </Box>

            {/* Form Content */}
            <Box sx={{ p: { xs: 3, md: 5 } }}>
              <AnimatePresence mode="wait">
                {activeTab === 'signup' ? (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SignUpForm />
                  </motion.div>
                ) : (
                  <motion.div
                    key="signin"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SignInForm />
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          </Box>
        </motion.div>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ProfilePage;
