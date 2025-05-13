'use client'

import React from 'react';
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
    <Container maxWidth="lg" sx={{ py: 4, mb: 8 }}>
      {/* NBT Section Card */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 2,
          background: 'linear-gradient(to right, #ffffff, #f9f9f9)'
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
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
              National Benchmark Tests Project
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
          The National Benchmark Test is a test used for first-year applicants to assess their quantitative literacy and mathematics proficiency at an entry-level. The NBTs are conducted by the Centre for Educational Testing for Access and Placement (CETAP) on behalf of Universities South Africa (USAF). NBT assess the relationship between high education entry-level proficiencies and school-level exit outcomes.
            </Typography>
            <Typography variant="h6" gutterBottom fontWeight="medium" color="primary">
              The NBT consists of three assessment components:
            </Typography>
            
            <Grid container spacing={2} mt={2}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ height: '100%', borderLeft: '4px solid #57b9d8' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        backgroundColor: '#57b9d8', 
                        color: '#FFFFFF', 
                        width: 50, 
                        height: 50, 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 'bold',
                        mr: 2
                      }}
                    >
                      AL
                    </Box>
                    <Typography>Academic Literacy</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Card sx={{ height: '100%', borderLeft: '4px solid #57b9d8' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        backgroundColor: '#57b9d8', 
                        color: '#FFFFFF', 
                        width: 50, 
                        height: 50, 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 'bold',
                        mr: 2
                      }}
                    >
                      QL
                    </Box>
                    <Typography>Quantitative Literacy</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Card sx={{ height: '100%', borderLeft: '4px solid #57b9d8' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        backgroundColor: '#57b9d8', 
                        color: '#FFFFFF', 
                        width: 50, 
                        height: 50, 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 'bold',
                        mr: 2
                      }}
                    >
                      MAT
                    </Box>
                    <Typography>Mathematics</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Test Cards */}
      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary" textAlign="center" mb={3}>
        Understanding the NBT Tests
      </Typography>
      
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              height: '100%', 
              borderRadius: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                The Academic Literacy Test (AL)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                The Academic Literacy Test is a 3-hour exam in which students will be tested on their capacity to engage successfully with the demands of academic study in the medium of instructions provided.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              height: '100%', 
              borderRadius: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                The Quantitative Literacy Test (QL)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                The Quantitative Literacy Test is a 3-hour exam in which students will be tested on their ability to manage situations and solve problems in real contexts relevant to higher education study.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                The basic quantitative information may be presented verbally, graphically, in tabular or symbolic form.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              height: '100%', 
              borderRadius: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                The Mathematics Test (MAT)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                The Mathematics Test is a 3-hour exam in which students are tested on their ability to relate to mathematical concepts formally regarded as part of the secondary school curriculum.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Book NBT Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={handleNBTClick}
          sx={{ 
            py: 1.5, 
            px: 4, 
            borderRadius: 8, 
            fontWeight: 'bold',
            boxShadow: 3 
          }}
        >
          Book an NBT Test
        </Button>
      </Box>
      
      {/* National Senior Certificate Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 5, 
          borderRadius: 2,
          background: 'linear-gradient(to right, #ffffff, #f9f9f9)'
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
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
              National Senior Certificate
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              The National Senior Certificate (NSC) examinations commonly referred to as "matric" has become an annual event of major public significance. It not only signifies the culmination of twelve years of formal schooling but the NSC examinations is a barometer of the health of the education system.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Achievement Levels Table */}
      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary" textAlign="center" mb={3}>
        Achievement Levels
      </Typography>
      
      <Paper elevation={2} sx={{ mb: 5, overflow: 'hidden', borderRadius: 2 }}>
        <Box sx={{ display: 'table', width: '100%', borderCollapse: 'collapse' }}>
          {/* Header Row */}
          <Box sx={{ display: 'table-row', bgcolor: 'primary.main' }}>
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
                bgcolor: index % 2 === 0 ? 'background.paper' : 'action.hover'
              }}
            >
              <Box 
                sx={{ 
                  display: 'table-cell', 
                  p: 2, 
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: 'primary.main'
                }}
              >
                {item.level}
              </Box>
              <Box 
                sx={{ 
                  display: 'table-cell', 
                  p: 2, 
                  textAlign: 'center'
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
      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary" textAlign="center" mb={3}>
        NSC Requirements
      </Typography>
      
      <Grid container spacing={3}>
      {requirementsData.map((card, index) => (
          <Grid item xs={12} md={4} key={`req-${index}`}>
            <Paper 
              elevation={2} 
              sx={{ 
                height: '100%', 
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box 
                sx={{ 
                  bgcolor: 'secondary.main', 
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
                      sx={{ mb: 1 }}
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
                  color="success"
                  sx={{ borderRadius: 8, fontWeight: 'bold', px: 3 }}
                >
              Qualify for NQF Level {card.nqf}
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default NBTPage;

