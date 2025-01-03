// app/types/index.ts

export interface University {
  id: number;
  name: string;
  location: string;
  logoUrl: string;
  appUrl: string;
  // Add other properties as needed
}

// types/index.ts
export interface SubjectRequirement {
    minPoints: number;
    orSubject: string | null;
    subject: string;
  }
  
export interface Faculty {
    id: number;
    name: string;
    // Add other properties if needed
  }
  
export interface UniversityWithFaculties {
    id: number;
    name: string;
    location: string;
    logoUrl: string;
    appUrl: string;
    faculties: Faculty[]; // Array of Faculty objects
  }

  export interface Degree {
    id: number;
    name: string;
    description: string;
    subjectRequirements: SubjectRequirement[];
    pointRequirement: number | null;
    pointCalculation: string;

    // Add other properties as needed
  }
  