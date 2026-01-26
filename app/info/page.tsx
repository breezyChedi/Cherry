'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button, 
  Card, 
  CardContent, 
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';

const NBTPage: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const handleNBTClick = () => {
    window.location.href = 'https://nbtests.uct.ac.za/tests/register';
  };

  interface RequirementCard {
    title: string;
    requirements: string[];
    description: string;
    nqf: number;
  }
  
  const requirementsData: RequirementCard[] = [
    {
      title: "National Senior Certificate Pass",
      requirements: [
        "English 40%",
        "2 Other Subjects 40%",
        "3 Other Subjects 30%"
      ],
      description: "Student has achieved a NSC Pass in which they meet the minimum requirements for admission to High certificate study to higher education.",
      nqf: 4
    },
    {
      title: "Pass Entry to Diploma Study",
      requirements: [
        "English 40%",
        "3 Other Subjects 40%",
        "2 Other Subjects 30%"
      ],
      description: "Student has achieved a NSC Pass in which they meet the minimum requirements for admission to Diploma or High Certificate study to higher education.",
      nqf: 5
    },
    {
      title: "Pass Entry to Bachelor's Study",
      requirements: [
        "English 40%",
        "4 Other Subjects 50% (Excluding LO)",
        "2 Other Subjects 30%"
      ],
      description: "Student has achieved a NSC Pass in which they meet the minimum requirements for admission to Bachelor Degree, Diploma or High Certificate study to higher education.",
      nqf: 6
    }
  ];

  interface AchievementLevel {
    level: number;
    competence: string;
    marks: string;
  }
  
  const achievementLevels: AchievementLevel[] = [
    { level: 7, competence: 'Outstanding', marks: '100-80' },
    { level: 6, competence: 'Meritorious', marks: '79-70' },
    { level: 5, competence: 'Substantial', marks: '69-60' },
    { level: 4, competence: 'Adequate', marks: '59-50' },
    { level: 3, competence: 'Moderate', marks: '49-40' },
    { level: 2, competence: 'Elementary', marks: '30-39' },
    { level: 1, competence: 'Not Achieved', marks: '0-29' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4, mb: 8, background: 'linear-gradient(135deg, #fddeff 0%, #ffe4f5 100%)', minHeight: 'calc(100vh - 64px)' }}>
      {/* NBT Section Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={6} 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 8px 32px rgba(255, 20, 147, 0.15)'
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box 
                component="img"
                src="/NBT-logo.png"
                alt="NBT Logo"
                sx={{ 
                  width: isDesktop ? 220 : 150,
                  height: 'auto',
                  maxWidth: '100%'
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: '#FF1493' }}>
                National Benchmark Tests Project
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                The National Benchmark Test is a test used for first-year applicants to assess their quantitative literacy and mathematics proficiency at an entry-level. The NBTs are conducted by the Centre for Educational Testing for Access and Placement (CETAP) on behalf of Universities South Africa (USAF). NBT assess the relationship between high education entry-level proficiencies and school-level exit outcomes.
              </Typography>
              <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ color: '#FF1493' }}>
                The NBT consists of three assessment components:
              </Typography>
              
              <Grid container spacing={2} mt={2}>
                {[
                  { abbr: 'AL', name: 'Academic Literacy' },
                  { abbr: 'QL', name: 'Quantitative Literacy' },
                  { abbr: 'MAT', name: 'Mathematics' }
                ].map((component) => (
                  <Grid item xs={12} sm={4} key={component.abbr}>
                    <Card sx={{ height: '100%', borderLeft: '4px solid #FF1493', borderRadius: 2 }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          sx={{ 
                            background: 'linear-gradient(45deg, #FF1493 30%, #FF69B4 90%)', 
                            color: '#FFFFFF', 
                            width: 50, 
                            height: 50, 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontWeight: 'bold',
                            mr: 2,
                            boxShadow: '0 4px 10px rgba(255, 20, 147, 0.3)'
                          }}
                        >
                          {component.abbr}
                        </Box>
                        <Typography fontWeight={600}>{component.name}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Test Cards */}
      <Typography variant="h4" gutterBottom fontWeight="bold" textAlign="center" mb={4} sx={{ color: '#FF1493' }}>
        Understanding the NBT Tests
      </Typography>
      
      <Grid container spacing={3} mb={5}>
        {[
          {
            title: 'The Academic Literacy Test (AL)',
            description: 'The Academic Literacy Test is a 3-hour exam in which students will be tested on their capacity to engage successfully with the demands of academic study in the medium of instructions provided.'
          },
          {
            title: 'The Quantitative Literacy Test (QL)',
            description: 'The Quantitative Literacy Test is a 3-hour exam in which students will be tested on their ability to manage situations and solve problems in real contexts relevant to higher education study. The basic quantitative information may be presented verbally, graphically, in tabular or symbolic form.'
          },
          {
            title: 'The Mathematics Test (MAT)',
            description: 'The Mathematics Test is a 3-hour exam in which students are tested on their ability to relate to mathematical concepts formally regarded as part of the secondary school curriculum.'
          }
        ].map((test, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Paper 
                elevation={4} 
                sx={{ 
                  height: '100%', 
                  borderRadius: 3,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 24px rgba(255, 20, 147, 0.2)'
                  }
                }}
              >
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#FF1493' }}>
                    {test.title}
                  </Typography>
                  <Divider sx={{ mb: 2, bgcolor: 'rgba(255, 20, 147, 0.2)' }} />
                  <Typography variant="body2" color="text.secondary">
                    {test.description}
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>
      
      {/* Book NBT Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleNBTClick}
          sx={{ 
            py: 2, 
            px: 5, 
            borderRadius: 3, 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FF1493 30%, #FF69B4 90%)',
            boxShadow: '0 4px 15px rgba(255, 20, 147, 0.3)',
            textTransform: 'none',
            fontSize: '16px',
            '&:hover': {
              background: 'linear-gradient(45deg, #FF1493 20%, #FF69B4 80%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(255, 20, 147, 0.4)',
            },
            transition: 'all 0.3s'
          }}
        >
          Book an NBT Test
        </Button>
      </Box>
      
      {/* National Senior Certificate Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Paper 
          elevation={6} 
          sx={{ 
            p: 4, 
            mb: 5, 
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 8px 32px rgba(255, 20, 147, 0.15)'
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box 
                component="img"
                src="/edu-logo.png"
                alt="Education Logo"
                sx={{ 
                  width: 260, 
                  height: 'auto',
                  maxWidth: '100%'
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: '#FF1493' }}>
                National Senior Certificate
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                The National Senior Certificate (NSC) examinations commonly referred to as &ldquo;matric&rdquo; has become an annual event of major public significance. It not only signifies the culmination of twelve years of formal schooling but the NSC examinations is a barometer of the health of the education system.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>
      
      {/* Achievement Levels Table */}
      <Typography variant="h4" gutterBottom fontWeight="bold" textAlign="center" mb={4} sx={{ color: '#FF1493' }}>
        Achievement Levels
      </Typography>
      
      <Paper elevation={4} sx={{ mb: 5, overflow: 'hidden', borderRadius: 3 }}>
        <Box sx={{ display: 'table', width: '100%', borderCollapse: 'collapse' }}>
          {/* Header Row */}
          <Box sx={{ display: 'table-row', background: 'linear-gradient(45deg, #FF1493 30%, #FF69B4 90%)' }}>
            <Box 
              sx={{ 
                display: 'table-cell', 
                p: 2, 
                color: 'white', 
                fontWeight: 'bold',
                width: '33%',
                textAlign: 'center'
              }}
            >
              Achievement Level
            </Box>
            <Box 
              sx={{ 
                display: 'table-cell', 
                p: 2, 
                color: 'white', 
                fontWeight: 'bold',
                width: '33%',
                textAlign: 'center'
              }}
            >
              Description of Competence
            </Box>
            <Box 
              sx={{ 
                display: 'table-cell', 
                p: 2, 
                color: 'white', 
                fontWeight: 'bold',
                width: '33%',
                textAlign: 'center'
              }}
            >
              MARKS %
            </Box>
          </Box>

          {/* Data Rows */}
          {achievementLevels.map((item, index) => (
            <Box 
              key={`level-${item.level}`} 
              sx={{ 
                display: 'table-row',
                bgcolor: index % 2 === 0 ? 'background.paper' : 'rgba(255, 20, 147, 0.03)',
                '&:hover': {
                  bgcolor: 'rgba(255, 20, 147, 0.08)'
                }
              }}
            >
              <Box 
                sx={{ 
                  display: 'table-cell', 
                  p: 2, 
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#FF1493'
                }}
              >
                {item.level}
              </Box>
              <Box 
                sx={{ 
                  display: 'table-cell', 
                  p: 2, 
                  textAlign: 'center',
                  fontWeight: 600
                }}
              >
                {item.competence}
              </Box>
              <Box 
                sx={{ 
                  display: 'table-cell', 
                  p: 2, 
                  textAlign: 'center'
                }}
              >
                {item.marks}
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
      
      {/* Requirements Cards */}
      <Typography variant="h4" gutterBottom fontWeight="bold" textAlign="center" mb={4} sx={{ color: '#FF1493' }}>
        NSC Requirements
      </Typography>
      
      <Grid container spacing={3}>
        {requirementsData.map((card, index) => (
          <Grid item xs={12} md={4} key={`req-${index}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              <Paper 
                elevation={4} 
                sx={{ 
                  height: '100%', 
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 24px rgba(255, 20, 147, 0.2)'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    background: 'linear-gradient(45deg, #FF1493 30%, #FF69B4 90%)', 
                    color: 'white', 
                    p: 2,
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  {card.title}
                </Box>
                <Box sx={{ p: 3, flexGrow: 1 }}>
                  <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                    {card.requirements.map((req, reqIndex) => (
                      <Box 
                        component="li" 
                        key={`req-item-${reqIndex}`}
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        {req}
                      </Box>
                    ))}
                  </Box>
                  <Typography 
                    variant="body2" 
                    align="center" 
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    {card.description}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    sx={{ 
                      borderRadius: 2, 
                      fontWeight: 'bold', 
                      px: 3,
                      background: 'linear-gradient(45deg, #FF1493 30%, #FF69B4 90%)',
                      textTransform: 'none',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #FF1493 20%, #FF69B4 80%)',
                      }
                    }}
                  >
                    Qualify for NQF Level {card.nqf}
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default NBTPage;
