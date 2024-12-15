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
  /*       <Typography variant="h4" gutterBottom>
        Cherry Info
      </Typography>*/
  return (
    <div style={{ padding: '16px' }}>


      {/* Accordion Section */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>APS Score and National Senior Certificate </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Admission Point Score is a measure of a student’s academic performance based on their National Senior Certificate (NSC). The APS score reflects the requirements for a student to enroll into a university and is a simplified system that all universities in the application process which highlights a clear measurement of academic performance.

            The National Senior Certificate is registered at Level 4 on the National Qualifications Framework.
          </Typography>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', backgroundColor: '#f2f2f2' }}>
                  Achievement Level
                </th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', backgroundColor: '#f2f2f2' }}>
                  Description of Competence
                </th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', backgroundColor: '#f2f2f2' }}>
                  Marks
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>7</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>Outstanding</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>100% - 80%</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>6</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>Meritorious</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>79% - 70%</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>5</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>Substantial</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>69% - 60%</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>4</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>Adequate</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>59% - 50%</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>3</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>Moderate</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>49% - 40%</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>2</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>Elementary</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>39% - 30%</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>1</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>Not Achieved</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>0% - 29%</td>
              </tr>
            </tbody>
          </table>
          <Typography>
            Minimum Promotion Requirements into University
          </Typography>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
            <thead><tr>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', backgroundColor: '#f2f2f2' }}>Promotion Requirements</th>

            </tr></thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>National Senior Certificate Pass

                  English 40%

                  2 Other Subjects 40%

                  3 Other Subjects 30%



                  Student has achieved a NSC Pass in which they meet the minimum requirements for admission to High certificate study to higher education. Pass Entry to Diploma Study

                  -	English 40%

                  -	3 Other Subjects 40%

                  -	2 Other Subjects 30%



                  Student has achieved a NSC Pass in which they meet the minimum requirements for admission to Diploma or High Certificate study to higher education.</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>Pass Entry to Bachelor’s Study

                  -	English 40%

                  -	4 Other Subjects 50% (Excluding LO)

                  -	2 Other Subjects 30%



                  Student has achieved a NSC Pass in which they meet the minimum requirements for admission to Bachelor Degree, Diploma or High Certificate study to higher education. </td>
              </tr>
            </tbody>

          </table>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>National Benchmark Test</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            The National Benchmark Test is a test used for first year applicants to assess their quantitative literacy and mathematics proficiency at an entry-level. The NBTS are conducted by the Centre for Educational Testing for Access and Placement (CETAP) on behalf of Universities South Africa (USAF). NBT assess the relationship between high education entry level proficiencies and school-level exit outcomes.



            There are 3 tests that candidates write


          </Typography>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>The Academic Literacy Test

                  (AL)
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>The Academic Literacy Test is a 3-hour exam in which students will be tested on their capacity to engage successfully with the demands of academic study in the medium of instructions provided.
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>The Quantitative Literacy Test

                  (QL)
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>The Quantitative Literacy Test is a 3-hour exam in which students will be tested on their ability to manage situations and solve problems in real contexts relevant to higher education study.



                  The basic quantitative information may be presented verbally graphically, in tabular or symbolic form.
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>The Mathematics Test

                  (ML)
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>The Mathematics Test is a 3-hour exam in which students are tested on their ability to relate to mathematical concepts formally regarded as part of the secondary school curriculum.
                </td>
              </tr>


            </tbody>
          </table>
        </AccordionDetails>
      </Accordion>


      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Student Grants</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            A student grant financial aid that is given by someone, a corporation or the government in which to fund a student’s study at university or college. The grant is used to cover all the tuition costs including accommodation, travels & transportation, textbooks and meals. This financial aid does not need to be paid back as to serve the purposes of funding students with educational financial help.

            The Department of High Education of South Africa has introduced the National Student Financial Aid Scheme (NSFAS) in which the South African Government have provided financial aid to undergraduate students to help pay for their costs in university.

            NSFAS bursary is available to all South African citizens and permanent residents whose combined household income does not exceed R350 000 per annum. For individuals living with disabilities, the income threshold is R600 000 per annum to ensure financial accessibility and support.
          </Typography>
          <table>
            <thead><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', backgroundColor: '#f2f2f2' }}>Requirements</th>
            </thead>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>South African Identification Document (ID)

                Academic Records (NSC)

                Proof of Income such as pay-slips and tax returns.

                Additional Documents such as proof of disability or a parent’s death certificate



                From there visit the NSFAS website and follow the instructions to register.
              </td>

            </tr>
          </table>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Student Loans</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            A student loan is money borrowed to pay for academic tuition in which the student is required to pay back the money with interest. There are different loans with different interest rates and most South African Banks offer study loans with interest. Depending on the student loan, the loan should be paid back after graduation with interest.
          </Typography>
          <table>
            <thead>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', backgroundColor: '#f2f2f2' }}>Standard bank Student Loan  
              </th>
            </thead>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>Depending on the loan that you chose Standard bank offer affordable interest rates of 11.25% and will cover the following fees:  

Registration Fees  

Tuition Fees  

Accommodation  

Textbooks and Study equipment  

 

The loan is offered to full-time and part-time students and will receive a monthly income furthermore, the student will need to co-sign with a parent/guardian in which both parties are to sign the student loan and ensure repayments. The place of study must be an accredited by the following institution: 

SAQA 

SETA  

DHE  

Umalusi  

SACASS approved Flight Schools  
              </td>
            </tr>

          </table>
          <table>
            <thead>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', backgroundColor: '#f2f2f2' }}>ABSA Student Loan  
              </th>
            </thead>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>An ABSA study loan can take a full-time or part-time student. Student will pay interest only for the year of study and covers the following:  

Tuition Fees  

Accommodation  

Study books  

Technical Equipment  

An ABSA study load requires a parent, sponsor/ guardian who has proof of income to take out the loan. ABSA provides loans to the following institutions:  

University, University of Technology, Technical Vocational Education, Training College and Agricultural College (TVET)  

Any private university or college registered at a Sector Education and Training Authority (SETA) and accredited by the South African Qualifications Authority (SAQA)  

Online study courses accredited by the United States Department of Education or the UK Government of Higher Education Quality Assurance Agency (QAA).   

Aviation Training from an approved training organization (ATO) which has been approved by SA Civil Aviation Authority (SACAA).  
              </td>
            </tr>

          </table>
          <table>
            <thead>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', backgroundColor: '#f2f2f2' }}>Nedbank Student Loan  
              </th>
            </thead>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}> A Nedbank student loan offers loans for full-time and part-time students. To qualify for a Nedbank loan you need the following:  

Latest Exam Results. 

A statement of tuition fees, textbooks, equipment and accommodation. 

Proof of registration at an institution that is accredited by the SAQA. 

A Nedbank account which will help you open the loan.  
              </td>
            </tr>

          </table>
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
