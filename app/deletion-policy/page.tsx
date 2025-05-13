'use client'

import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button } from '@mui/material';

const AccountDeletionPage: React.FC = () => {
  const handleContactClick = () => {
    // Replace with your actual contact email
    window.location.href = 'mailto:info@cherry.org.za?subject=Account%20Deletion%20Request';
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, margin: '0 auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#B45309', textAlign: 'center' }}>
          Cherry Account Deletion
        </Typography>

        <Typography variant="body1" paragraph sx={{ mt: 3 }}>
          As a Cherry app user, you have the right to request the deletion of your account and associated data. 
          Please follow the steps below to initiate an account deletion request.
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Steps to Request Account Deletion:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="1. Send Deletion Request" 
              secondary="Contact our support team via email with your account deletion request"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="2. Verify Identity" 
              secondary="Provide your registered email address and any additional verification information requested"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="3. Confirmation" 
              secondary="Wait for confirmation email of your deletion request (usually within 48 hours)"
            />
          </ListItem>
        </List>

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Data Deletion Information:
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          The following data will be permanently deleted:
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="• Personal profile information (name, surname, contact details)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Academic records (APS scores, subject marks)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• NBT scores" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Saved preferences and calculations" />
          </ListItem>
        </List>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Data Retention Period:
        </Typography>
        <Typography variant="body1" paragraph>
          After receiving your deletion request, we will process it within 30 days. Some information may be retained for legal compliance purposes for up to 90 days after deletion.
        </Typography>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            onClick={handleContactClick}
            sx={{ 
              bgcolor: '#B45309',
              '&:hover': {
                bgcolor: '#8B4513'
              }
            }}
          >
            Request Account Deletion
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 4, textAlign: 'center', color: 'gray' }}>
          For any additional questions about account deletion, please contact our support team at support@cherry.org.za
        </Typography>
      </Paper>
    </Box>
  );
};

export default AccountDeletionPage;