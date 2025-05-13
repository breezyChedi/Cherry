'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useMediaQuery,
  Tooltip,
  Button,
} from '@mui/material';

import { Metadata } from 'next'
import { purple } from '@mui/material/colors';

// Icons
import MenuIcon from './icons/prof.svg';
import CalculatorIcon from './icons/aps.svg';
import Page2Icon from './icons/book.svg';
import Page3Icon from './icons/plant.svg';
import Cherry from './icons/cherry.svg';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import InfoIcon from '@mui/icons-material/Info';
import SchoolIcon from '@mui/icons-material/School';
import CalculateIcon from '@mui/icons-material/Calculate';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';

// Create MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: purple[700],
    },
    secondary: {
      main: '#efb5eb',
    },
  },
});

// Navigation items data
const navItems = [
  { path: '/calculator', label: 'Calculator', icon: <CalculateIcon /> },
  { path: '/universities', label: 'Universities', icon: <SchoolIcon /> },
  { path: '/info', label: 'Information', icon: <InfoIcon /> },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState(pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if the device is desktop
  const isDesktop = useMediaQuery('(min-width:900px)');

  // Width of the sidebar when open
  const drawerWidth = 240;

  // Check user authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
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

  const handleNavigate = (path: string) => {
    router.push(path);
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      router.push('/profile/profileDetails');
    } else {
      router.push('/profile');
    }
  };

  const handleCherryClick = () => {
    window.open('https://cherry.org.za/home', '_blank');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Sidebar content
  const sidebarContent = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Cherry Menu
        </Typography>
        {isDesktop ? (
          <IconButton edge="end" onClick={toggleSidebar} sx={{ color: 'white' }}>
            <ChevronLeftIcon />
          </IconButton>
        ) : null}
      </Box>

      <Divider />

      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigate('/')}>
            <ListItemIcon>
              <HomeIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>

        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton 
              selected={pathname === item.path}
              onClick={() => handleNavigate(item.path)}
            >
              <ListItemIcon sx={{ color: pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                sx={{ color: pathname === item.path ? 'primary.main' : 'inherit' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleProfileClick}>
            <ListItemIcon>
              <AccountCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary={isAuthenticated ? "My Profile" : "Sign In"} />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <html lang="en">
      <head>
        <title>Cherry</title>
        <meta name="google-site-verification" content="bLl3duV6gX_tPcCXtnjOB9X-hyCMm4DG3MqeTEPjRZ0" />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* App Bar */}
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
              <Toolbar>
                {isDesktop ? (
                  <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={toggleSidebar}
                    sx={{ mr: 2 }}
                  >
                    <MenuOpenIcon />
                  </IconButton>
                ) : (
                  <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="profile"
                    onClick={handleProfileClick}
                  >
                    <MenuIcon />
                  </IconButton>
                )}

                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    flexGrow: 1,
                    textAlign: isDesktop ? 'left' : 'center',
                    ml: isDesktop ? 0 : 2,
                  }}
                >
                  Cherry
                </Typography>

                {isDesktop && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {navItems.map((item) => (
                      <Button
                        key={item.path}
                        color="inherit"
                        startIcon={item.icon}
                        onClick={() => handleNavigate(item.path)}
                        sx={{
                          fontWeight: pathname === item.path ? 'bold' : 'normal',
                          borderBottom: pathname === item.path ? '2px solid white' : 'none',
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </Box>
                )}

                <IconButton edge="end" color="inherit" aria-label="cherry" onClick={handleCherryClick}>
                  <Cherry />
                </IconButton>
              </Toolbar>
            </AppBar>

            {/* Sidebar for desktop */}
            {isDesktop && (
              <Drawer
                variant="persistent"
                anchor="left"
                open={sidebarOpen}
                sx={{
                  width: drawerWidth,
                  flexShrink: 0,
                  '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    top: '64px', // Height of AppBar
                    height: 'calc(100% - 64px)',
                  },
                }}
              >
                {sidebarContent}
              </Drawer>
            )}

            {/* Sidebar/Drawer for mobile - shows as full screen overlay */}
            {!isDesktop && (
              <Drawer
                anchor="left"
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                sx={{
                  '& .MuiDrawer-paper': {
                    width: '80%',
                    maxWidth: '300px',
                  },
                }}
              >
                {sidebarContent}
              </Drawer>
            )}

            {/* Main content */}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                pt: '64px', // Height of the AppBar
                pb: isDesktop ? '20px' : '56px', // Add bottom padding on mobile for the navigation
                pl: isDesktop && sidebarOpen ? `${drawerWidth}px` : 0,
                transition: (theme) =>
                  theme.transitions.create('padding', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                  }),
              }}
            >
              {children}
            </Box>

            {/* Bottom Navigation - Only shown on mobile */}
            {!isDesktop && (
              <Paper
                sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }}
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
                    label="Info"
                    value="/info"
                    icon={<Page3Icon style={{ width: 24, height: 24 }} />}
                  />
                </BottomNavigation>
              </Paper>
            )}
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}

