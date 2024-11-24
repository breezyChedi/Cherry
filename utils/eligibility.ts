// app/utils/eligibility.ts

import { Degree } from '../types';

interface SubjectMark {
  subject: string;
  mark: number;
}

interface UserData {
  subjectMarks: SubjectMark[];
  nbtScores: { [key: string]: number };
}

function calculateTotalPoints(
  pcMethod: string,
  subjectMarks: SubjectMark[],
  faculty: string,
  nbtScores: { [key: string]: number }
): number {

    //pc passed to calc Tot determmines switch
    console.log("\ncalc tot Elig:", pcMethod)
  switch (pcMethod) {
    case 'APS':
      return subjectMarks.reduce((total, { mark }) => {
        let point = 0;
        if (mark >= 80) point = 7;
        else if (mark >= 70) point = 6;
        else if (mark >= 60) point = 5;
        else if (mark >= 50) point = 4;
        else if (mark >= 40) point = 3;
        else if (mark >= 30) point = 2;
        else if (mark >= 20) point = 1;
        total += point;
        return total;
      }, 0);

    case 'APSPlus':
      return subjectMarks.reduce((total, { mark }) => {
        let point = 0;
        if (mark >= 90) point = 8;
        else if (mark >= 80) point = 7;
        else if (mark >= 70) point = 6;
        else if (mark >= 60) point = 5;
        else if (mark >= 50) point = 4;
        else if (mark >= 40) point = 3;
        else if (mark >= 30) point = 2;
        else if (mark >= 20) point = 1;
        total += point;
        return total;
      }, 0);

    case 'UWCAPS':
      return subjectMarks.reduce((total, { subject, mark }) => {
        let point = 0;
        if (['English HL', 'English FAL', 'Mathematics'].includes(subject)) {
          if (mark >= 90) point = 15;
          else if (mark >= 80) point = 13;
          else if (mark >= 70) point = 11;
          else if (mark >= 60) point = 9;
          else if (mark >= 50) point = 7;
          else if (mark >= 40) point = 5;
          else if (mark >= 30) point = 3;
          else if (mark >= 20) point = 1;
        } else {
          if (mark >= 90) point = 8;
          else if (mark >= 80) point = 7;
          else if (mark >= 70) point = 6;
          else if (mark >= 60) point = 5;
          else if (mark >= 50) point = 4;
          else if (mark >= 40) point = 3;
          else if (mark >= 30) point = 2;
          else if (mark >= 20) point = 1;
        }
        total += point;
        return total;
      }, 0);

    case 'UCTAPS':
      if (faculty === 'Health Science') {
        const subjectTotal = subjectMarks.reduce((sum, { mark }) => sum + mark, 0);
        const nbtTotal = Object.values(nbtScores).reduce((sum, score) => sum + score, 0);
        return subjectTotal + nbtTotal;
      } else if (faculty === 'Science') {
        return subjectMarks.reduce((total, { subject, mark }) => {
          if (['Physical Science', 'Mathematics'].includes(subject)) {
            total += mark * 2;
          } else {
            total += mark;
          }

          return total;
        }, 0);
      } else {
        
        return subjectMarks.reduce((sum, { mark }) => sum + mark, 0);
        
        //subjectMArks.reduce comp or 0?
      }
    default:
      return 0;
  }
}

export function filterDegreesByEligibility(
  degrees: Degree[],
  userData: UserData,
  faculty: string
): Degree[] {
    console.log("\nfilter degrees?:")
  return degrees.filter((degree) => {
    console.log("degree 1?")
    
    const subjectRequirementsMet = degree.subjectRequirements.every((req) => {
        console.log("degsubjreq", degree.subjectRequirements)

      const userSubjectMark = userData.subjectMarks.find(
        (sm) => sm.subject === req.subject || sm.subject === req.orSubject
      );
      console.log("usrsubjmrk:" , userSubjectMark)
      if (!userSubjectMark) {
        return false;
      }
      console.log("Req: ", userSubjectMark.mark, req.minPoints)
      return userSubjectMark.mark >= req.minPoints;
    });

    if (!subjectRequirementsMet) {
      return false;
    }

    //degree detected, degree.pointCalculaton - pc detected - early switch for subject comparison, check nbt requirements and subject req

    const totalPoints = calculateTotalPoints(
      degree.pointCalculation,
      userData.subjectMarks,
      faculty,
      userData.nbtScores
    );

    if (degree.pointRequirement !== null && totalPoints < degree.pointRequirement) {
      return false;
    }

    // Add NBT requirement checks here if needed

    return true;
  });
}
