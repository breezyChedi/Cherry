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
import { Eye, EyeOff, User, School, Mail, Phone, MapPin, Users, Lock, Check, X } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

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
  ];

  // Sign Up form
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
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSignUp}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500" size={20} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                placeholder="Enter your name"
              />
            </div>
          </div>

          {/* Surname */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Surname</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500" size={20} />
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                placeholder="Enter your surname"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500 z-10" size={20} />
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors appearance-none bg-white"
              >
                <option value="">Select gender</option>
                {genderOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* High School */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">High School</label>
            <div className="relative">
              <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500" size={20} />
              <input
                type="text"
                value={highSchool}
                onChange={(e) => setHighSchool(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                placeholder="Your high school"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500" size={20} />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                placeholder="+27 123 456 7890"
              />
            </div>
          </div>

          {/* Nationality */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nationality</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500 z-10" size={20} />
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors appearance-none bg-white"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 py-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Details</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                emailError ? 'border-red-500' : 'border-gray-200 focus:border-pink-500'
              }`}
              placeholder="your@email.com"
            />
          </div>
          {emailError && <p className="mt-1 text-sm text-red-500">{emailError}</p>}
        </div>

        {/* Confirm Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500" size={20} />
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
              placeholder="Confirm your email"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  passwordError ? 'border-red-500' : 'border-gray-200 focus:border-pink-500'
                }`}
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordError && <p className="mt-1 text-sm text-red-500">{passwordError}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500" size={20} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white font-bold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 mt-6"
        >
          Create Account
        </button>
      </motion.form>
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
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSignIn}
        className="space-y-6"
      >
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                emailError ? 'border-red-500' : 'border-gray-200 focus:border-pink-500'
              }`}
              placeholder="your@email.com"
            />
          </div>
          {emailError && <p className="mt-1 text-sm text-red-500">{emailError}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white font-bold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
        >
          Sign In
        </button>

        <button
          type="button"
          className="w-full border-2 border-pink-500 text-pink-500 font-semibold py-3 rounded-xl hover:bg-pink-50 transition-colors"
        >
          Forgot Password?
        </button>
      </motion.form>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #fddeff 0%, #ffe4f5 100%)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#FF1493] to-[#FF69B4] px-8 py-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16">
              <Image 
                src="/cherryLogoPng.png" 
                alt="Cherry Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Welcome to Cherry</h1>
          <p className="text-pink-100 text-lg">
            {activeTab === 'signup' ? 'Create your account and start exploring' : 'Sign in to continue your journey'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-4 text-center font-bold transition-all relative ${
              activeTab === 'signup'
                ? 'text-pink-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
            {activeTab === 'signup' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF1493] to-[#FF69B4]"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-4 text-center font-bold transition-all relative ${
              activeTab === 'signin'
                ? 'text-pink-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
            {activeTab === 'signin' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF1493] to-[#FF69B4]"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {activeTab === 'signup' ? (
              <SignUpForm key="signup" />
            ) : (
              <SignInForm key="signin" />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Snackbar Notification */}
      <AnimatePresence>
        {snackbar.open && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div
              className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg ${
                snackbar.severity === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {snackbar.severity === 'success' ? (
                <Check size={24} />
              ) : (
                <X size={24} />
              )}
              <span className="font-semibold">{snackbar.message}</span>
              <button
                onClick={() => setSnackbar({ ...snackbar, open: false })}
                className="ml-4 hover:opacity-80 transition-opacity"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
