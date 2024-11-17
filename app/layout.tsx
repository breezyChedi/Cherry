import type { Metadata } from "next";
import localFont from "next/font/local";
// app/layout.tsx

'use client';
import dynamic from 'next/dynamic';
import React from 'react';
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
import { usePathname, useRouter } from 'next/navigation';
import MenuIcon from './icons/prof.svg'; 

// Import your custom SVG icons
// app/layout.tsx

import CalculatorIcon from './icons/aps.svg';
import Page2Icon from './icons/book.svg';
import Page3Icon from './icons/plant.svg';
import Cherry from './icons/cherry.svg';
import { purple } from '@mui/material/colors';


//import Page2Icon from './icons/book.svg';
//import Page3Icon from './icons/plant.svg';

const theme = createTheme({
  palette: {
    primary: {
      main: purple[700], // You can choose any shade from purple[50] to purple[900]
    },
  },
});



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = React.useState(pathname);

  React.useEffect(() => {
    setValue(pathname);
  }, [pathname]);

  const handleChange = (
    event: React.SyntheticEvent,
    newValue: string
  ) => {
    setValue(newValue);
    router.push(newValue);
  };

  const handleProfileClick = () => {
    router.push('/profile'); // Redirect to profile creation page
  };
  

  return (
    <html lang="en">
      <head>
        <title>Calculator App</title>
      </head>
      <body>
        <ThemeProvider theme={theme}>
          {/* Render the current page's content */}
          <AppBar position="fixed">
            <Toolbar>
              {/* Profile Icon on the Left */}
              <IconButton
                edge="start"
                color="inherit"
                aria-label="profile"
                onClick={handleProfileClick}
              >
                {/* Replace with your Profile Icon */}
                <MenuIcon />
              </IconButton>

              {/* Centered Title */}
              <Typography
                variant="h6"
                component="div"
                sx={{
                  flexGrow: 1,
                  textAlign: 'center',
                  marginRight: '56px', // Adjust to offset the profile icon width
                }}
              >
                Cherry Web App
              </Typography>
              <IconButton
                edge="end"
                color="inherit"
                aria-label="profile"
                onClick={handleProfileClick}
              >
                {/* Replace with your Profile Icon */}
                <Cherry/>
              </IconButton>
            </Toolbar>
          </AppBar>

          {/* Adjust content to account for fixed header */}
          <div style={{ marginTop: '64px' }}>
            {/* Render the current page's content */}
            {children}
          </div>
          

          {/* Bottom Navigation Menu */}
          <Paper
            sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
            elevation={3}
          >
            <BottomNavigation value={value} onChange={handleChange}>
              <BottomNavigationAction
                label="Calculator"
                value="/calculator"
                icon={<CalculatorIcon style={{ width: 24, height: 24}} />}
              />
              <BottomNavigationAction
                label="Explore"
                value="/universities"
                icon={<Page2Icon style={{ width: 24, height: 24 }} />}
              />
              <BottomNavigationAction
                label="Opportunities"
                value="/page3"
                icon={<Page3Icon style={{ width: 24, height:24 }} />}
              />
            </BottomNavigation>
          </Paper>
        </ThemeProvider>
      </body>
    </html>
  );
}


