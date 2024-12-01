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


function convertSubjPoints(pcMethod: string, val: number, subj: string): number {
  switch (pcMethod) {
    case 'PercNSC':
    case 'UCTFPS':
      // For 'PercNSC' and 'UCTFPS', return the input value directly
      return val;

    case 'APSPlus':
      case 'WitsAPS':
        // Scoring based on the provided table for Wits
        if (subj === 'English' || subj === 'Mathematics' || subj === 'English HL' || subj === 'English FAL') {
          if (val >= 90) return 8 + 2; // 10
          else if (val >= 80) return 7 + 2; // 9
          else if (val >= 70) return 6 + 2; // 8
          else if (val >= 60) return 5 + 2; // 7
          else if (val >= 50) return 4;
          else if (val >= 40) return 3;
          else return 0;
        } else if (subj === 'Life Orientation') {
          if (val >= 90) return 4;
          else if (val >= 80) return 3;
          else if (val >= 70) return 2;
          else if (val >= 60) return 1;
          else return 0;
        } else {
          // For other subjects
          if (val >= 90) return 8;
          else if (val >= 80) return 7;
          else if (val >= 70) return 6;
          else if (val >= 60) return 5;
          else if (val >= 50) return 4;
          else if (val >= 40) return 3;
          else return 0;
        }

    case 'UWCAPS':
      // For 'APSPlus', 'WitsAPS', and 'UWCAPS', use the following point mapping
      if (val >= 90) return 8;
      else if (val >= 80) return 7;
      else if (val >= 70) return 6;
      else if (val >= 60) return 5;
      else if (val >= 50) return 4;
      else if (val >= 40) return 3;
      else if (val >= 30) return 2;
      else if (val >= 20) return 1;
      else return 0;

    case 'APS':
      // For 'APS', use a slightly different point mapping
      if (val >= 80) return 7;
      else if (val >= 70) return 6;
      else if (val >= 60) return 5;
      else if (val >= 50) return 4;
      else if (val >= 40) return 3;
      else if (val >= 30) return 2;
      else if (val >= 20) return 1;
      else return 0;

    default:
      // If pcMethod doesn't match any known cases, return 0 or handle as needed
      console.warn(`Unknown pcMethod: ${pcMethod}. Returning 0.`);
      return 0;
  }
}


function calculateTotalPoints(
  pcMethod: string,
  subjectMarks: SubjectMark[],
  faculty: string,
  nbtScores: { [key: string]: number }
): number {
    console.log("Subject Marks : ", subjectMarks)
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

    case 'UCTFPS':
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
      
      case 'WitsAPS':
        // Calculate the total points for WitsAPS by summing up converted points
        return subjectMarks.reduce((total, { subject, mark }) => {
          const points = convertSubjPoints(pcMethod, mark, subject);
          total += points;
          console.log(`WitsAPS (${subject}): Mark: ${mark}, Points: ${points}, Running Total: ${total}`);
          return total;
        }, 0);

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
    console.log("--degree--\n")
    
    const subjectRequirementsMet = degree.subjectRequirements.every((req) => {

        console.log("degree subject req: ", degree.subjectRequirements)
        console.log("userData: \n", userData,"\n")

/*
      const userSubjectMark = userData.subjectMarks.find(
        (sm) => sm.subject === req.subject || sm.subject === req.orSubject
      );
*/

/*
const userSubjectMark = userData.subjectMarks.find((sm) => {
  if (req.subject === 'otherLang') {
    // Match any FAL subject
    return sm.subject.endsWith('FAL');
  }
  if (req.orSubject) {
    return sm.subject === req.subject || sm.subject === req.orSubject;
  }
  return sm.subject === req.subject;
});
*/
const matchedSubjects = new Set<string>();

const userSubjectMark = userData.subjectMarks.find((sm) => {
  if (matchedSubjects.has(req.subject) || matchedSubjects.has(req.orSubject)) {
    return false; // Prevent re-matching of already-checked subjects
  }

  if (req.subject === 'otherLang') {
    if (sm.subject.endsWith('FAL')) {
      matchedSubjects.add(sm.subject);
      return true;
    }
  } else if (req.orSubject) {
    if (sm.subject === req.subject || sm.subject === req.orSubject) {
      matchedSubjects.add(sm.subject);
      return true;
    }
  } else if (sm.subject === req.subject) {
    matchedSubjects.add(sm.subject);
    return true;
  }

  return false;
});



      console.log("user subj mark:" , userSubjectMark)

      if (!userSubjectMark) {
        return false;
      }

      const convSubjMark=convertSubjPoints(degree.pointCalculation, userSubjectMark.mark,userSubjectMark.subject)

      //console.log("Req: ", userSubjectMark.mark, req.minPoints)
      //return userSubjectMark.mark >= req.minPoints;

      console.log("val vs Req : ", convSubjMark, req.minPoints)
      return convSubjMark>= req.minPoints;

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
    console.log("totalPoints: ", totalPoints)

    if (degree.pointRequirement !== null && totalPoints < degree.pointRequirement) {
      return false;
    }

    // Add NBT requirement checks here if needed

    return true;
  });
}
