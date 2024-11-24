//app/layout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation'; // Correct imports
import { onAuthStateChanged } from 'firebase/auth'; // Firebase Auth
import { auth } from './firebaseConfig'; // Ensure this points to your Firebase config file
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import { purple } from '@mui/material/colors';

// Icons
import MenuIcon from './icons/prof.svg';
import CalculatorIcon from './icons/aps.svg';
import Page2Icon from './icons/book.svg';
import Page3Icon from './icons/plant.svg';
import Cherry from './icons/cherry.svg';

// Create MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: purple[700],
    },
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState(pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check user authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // Set to true if a user is logged in
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setValue(pathname);
  }, [pathname]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    router.push(newValue);
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      router.push('/profile/profileDetails'); // Redirect to Profile Details if logged in
    } else {
      router.push('/profile'); // Redirect to Profile Sign-In/Sign-Up if not logged in
    }
  };

  return (
    <html lang="en">
      <head>
        <title>Calculator App</title>
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <AppBar position="fixed">
            <Toolbar>
              {/* Profile Icon on the Left */}
              <IconButton
                edge="start"
                color="inherit"
                aria-label="profile"
                onClick={handleProfileClick}
              >
                <MenuIcon />
              </IconButton>

              {/* Centered Title */}
              <Typography
                variant="h6"
                component="div"
                sx={{
                  flexGrow: 1,
                  textAlign: 'center',
                  marginRight: '56px',
                }}
              >
                Cherry Web App
              </Typography>

              {/* Right-side Icon */}
              <IconButton edge="end" color="inherit" aria-label="cherry">
                <Cherry />
              </IconButton>
            </Toolbar>
          </AppBar>

          {/* Adjust content to account for fixed header */}
          <div style={{ marginTop: '64px' }}>{children}</div>

          {/* Bottom Navigation Menu */}
          <Paper
            sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
            elevation={3}
          >
            <BottomNavigation value={value} onChange={handleChange}>
              <BottomNavigationAction
                label="Calculator"
                value="/calculator"
                icon={<CalculatorIcon style={{ width: 24, height: 24 }} />}
              />
              <BottomNavigationAction
                label="Explore"
                value="/universities"
                icon={<Page2Icon style={{ width: 24, height: 24 }} />}
              />
              <BottomNavigationAction
                label="Opportunities"
                value="/page3"
                icon={<Page3Icon style={{ width: 24, height: 24 }} />}
              />
            </BottomNavigation>
          </Paper>
        </ThemeProvider>
      </body>
    </html>
  );
}

