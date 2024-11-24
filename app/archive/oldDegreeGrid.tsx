// components/DegreeGrid.tsx
'use client';

import React from 'react';
import { Degree } from '../types';
import { Grid, Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';

interface DegreeGridProps {
  degrees: Degree[];
  filterByEligibility: boolean; // Ignored for now
}

const DegreeGrid: React.FC<DegreeGridProps> = ({ degrees, filterByEligibility }) => {
  return (
    <Grid container spacing={2} style={{ marginTop: '16px' }}>
      {degrees.map((degree) => (
        <Grid item xs={12} sm={6} md={4} key={degree.id} style={{ display: 'flex' }}>
          <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CardContent style={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                {degree.name}
              </Typography>

              {/* Display Point Requirement */}
              {degree.pointRequirement !== null ? (
                <Typography variant="body2" color="textSecondary">
                  <strong>Minimum APS Score:</strong> {degree.pointRequirement}
                </Typography>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  <strong>Minimum APS Score:</strong> N/A
                </Typography>
              )}

              {/* Display Subject Requirements */}
              {degree.subjectRequirements.length > 0 ? (
                <div style={{ marginTop: '8px' }}>
                  <Typography variant="subtitle1">
                    <strong>Subject Requirements:</strong>
                  </Typography>
                  <List dense>
                    {degree.subjectRequirements.map((req, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemText
                          primary={
                            req.orSubject
                              ? `${req.subject} OR ${req.orSubject}: Minimum Points ${req.minPoints}`
                              : `${req.subject}: Minimum Points ${req.minPoints}`
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </div>
              ) : (
                <Typography variant="body2" color="textSecondary" style={{ marginTop: '8px' }}>
                  <strong>Subject Requirements:</strong> N/A
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DegreeGrid;