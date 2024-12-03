// app/components/DegreeGrid.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Degree } from '../types';
import { Grid, Card, Button, Collapse, CardContent, Typography, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { SubjectRequirement } from '../types';

import { filterDegreesByEligibility } from '../utils/eligibility';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface DegreeGridProps {
  degrees: Degree[];
  filterByEligibility: boolean; // Ignored for now
  faculty: string;
}

const DegreeGrid: React.FC<DegreeGridProps> = ({ degrees, filterByEligibility, faculty }) => {

  const [filteredDegrees, setFilteredDegrees] = useState<Degree[]>(degrees);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    console.log('useEffect triggered');
    console.log('filterByEligibility:', filterByEligibility);
    if (filterByEligibility) {



      setLoading(true);
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            const profileDocRef = doc(db, 'profiles', currentUser.uid);
            const profileDoc = await getDoc(profileDocRef);
            if (profileDoc.exists()) {
              const profileData = profileDoc.data();
              const subjectMarks: { subject: string; mark: number }[] = [];

              if (profileData.subjects && profileData.marks) {
                const subjects = profileData.subjects;
                const marks = profileData.marks;

                for (const key in subjects) {
                  const subjectName = subjects[key];
                  const markKey = 'mark' + key.replace('subject', '');
                  const markValue = parseInt(marks[markKey] || '0', 10);
                  subjectMarks.push({ subject: subjectName, mark: markValue });
                }
              }

              const nbtScores: { [key: string]: number } = {};
              if (profileData.nbtScores) {
                for (const key in profileData.nbtScores) {
                  nbtScores[key] = parseInt(profileData.nbtScores[key], 10);
                }
              }

              const userData = { subjectMarks, nbtScores };
              console.log("degree grid: elig make")
              const eligibleDegrees = filterDegreesByEligibility(degrees, userData, faculty);

              setFilteredDegrees(eligibleDegrees);
            } else {
              console.error('Profile data not found.');
              setError('Profile data not found.');
            }
          } catch (err) {

            console.error('Error fetching profile data:', err);
            setError('Error fetching profile data.');
          } finally {
            setLoading(false);
          }
        } else {
          console.error('User not authenticated.');
          setError('Please sign in to filter degrees by eligibility.');
          setLoading(false);
        }
      });

      return () => unsubscribe();
    } else {
      setFilteredDegrees(degrees);
    }
  }, [degrees, filterByEligibility, faculty]);

  if (loading) {
    return (
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </div>
    );
  }
  const handleToggle = (degreeId: string) => {
    setExpandedCard((prev) => (prev === degreeId ? null : degreeId));
  };


  const formatDescription = (description: string): string => {
    // Replace `**...**` with `<strong>...</strong>` for bold subheadings
    return description.replace(/\*\*(.*?)\*\*/g, '<br><br><strong>$1</strong><br>');
  };

  const formatSubjectRequirements = (requirements: SubjectRequirement[]) => {
    const processed: string[] = [];
    const orGroups: { [key: string]: { [subject: string]: number } } = {};

    requirements.forEach((req) => {
      if (req.orSubject) {
        // Sort subjects alphabetically to create a unique key
        const subjects = [req.subject, req.orSubject].sort();
        const key = subjects.join(' OR ');

        if (!orGroups[key]) {
          orGroups[key] = { [req.subject]: req.minPoints };
        } else {
          orGroups[key][req.subject] = req.minPoints;
        }
      } else {
        // Non-OR requirements are added directly
        processed.push(`${req.subject}: ${req.minPoints}`);
      }
    });

    // Process OR groups to create combined display strings
    Object.entries(orGroups).forEach(([subjects, subjectPoints]) => {
      const formattedSubjects = Object.entries(subjectPoints)
        .map(([subject, points]) => `${subject}: ${points}`)
        .join(' OR ');

      processed.push(formattedSubjects);
    });

    return processed;
  };


  return (
    <Grid container spacing={2} style={{ marginTop: '16px', marginBottom: '48px' }}>
      {filteredDegrees.map((degree) => (
        <Grid item xs={expandedCard === degree.id.toString() ? 12 : 6} sm={expandedCard === degree.id.toString() ? 12 : 6} md={expandedCard === degree.id.toString() ? 12 : 4} key={degree.id} style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: expandedCard === degree.id.toString() ? '20px' : '0',
        }}>
          <Card style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            transition: 'height 0.3s ease',
            height: expandedCard === degree.id.toString() ? 'auto' : '100%',
          }}>
            <CardContent style={{ 
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1 }}>
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
              {degree.subjectRequirements && degree.subjectRequirements !== null && degree.subjectRequirements.filter(req => req !== null).length > 0 ? (
                <div style={{ marginTop: '8px' }}>
                  <Typography variant="subtitle1">
                    <strong>Subject Requirements:</strong>
                  </Typography>
                  <List dense>
                    
                    {formatSubjectRequirements(degree.subjectRequirements).map((req, index) => (

                      <ListItem key={index} disableGutters>
                        <ListItemText primary={req} />
                      </ListItem>
                    ))}
                  </List>
                </div>
              ) : (
                <Typography variant="body2" color="textSecondary" style={{ marginTop: '8px' }}>
                  <strong>Subject Requirements:</strong> N/A
                </Typography>
              )}
              <Button
                size="small"
                onClick={() => handleToggle(degree.id.toString())}
                style={{ marginTop: 'auto' }}
              >
                {expandedCard === degree.id.toString() ? 'Hide Details' : 'View Details'}
              </Button>
              <Collapse in={expandedCard === degree.id.toString()} timeout="auto" unmountOnExit>
                <div style={{ marginTop: '16px' }}>
                  {degree.description && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      dangerouslySetInnerHTML={{ __html: formatDescription(degree.description) }}
                    />
                  )}
                  {/* Add any additional details here */}
                </div>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DegreeGrid;

