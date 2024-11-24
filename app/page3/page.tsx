'use client';

import React from 'react';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Page3: React.FC = () => {
  return (
    <div style={{ padding: '16px' }}>
      <Typography variant="h4" gutterBottom>
        Funding Opportunities
      </Typography>

      {/* Accordion Section */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Student Loans & Grants</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Information about student loans and grants, including eligibility criteria, application process, and repayment options.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Bursaries</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Details about bursaries, their requirements, and how to apply for financial support.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Learnerships</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Explore learnership opportunities that provide a blend of work and study to gain valuable skills.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Scholarships</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Learn about scholarships available for students, including merit-based and need-based options.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default Page3;
