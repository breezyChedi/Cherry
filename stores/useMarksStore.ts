// stores/useMarksStore.ts

import {create} from 'zustand';

interface SubjectsState {
  subject1: string;
  subject2: string;
  subject3: string;
  subject4: string;
  subject5: string;
  subject6: string;
}

interface MarksState {
  mark1: string;
  mark2: string;
  mark3: string;
  mark4: string;
  mark5: string;
  mark6: string;
}

interface NbtScoresState {
  nbtAL: string;
  nbtQL: string;
  nbtMAT: string;
}

interface StoreState {
  subjects: SubjectsState;
  marks: MarksState;
  nbtScores: NbtScoresState;
  apsScore: number;
  setMarksData: (data: Partial<StoreState>) => void;
  setSubject: (key: keyof SubjectsState, value: string) => void;
  setMark: (key: keyof MarksState, value: string) => void;
  setNbtScore: (key: keyof NbtScoresState, value: string) => void;
}

const useMarksStore = create<StoreState>((set) => ({
  subjects: {
    subject1: '',
    subject2: '',
    subject3: '',
    subject4: '',
    subject5: '',
    subject6: '',
  },
  marks: {
    mark1: '',
    mark2: '',
    mark3: '',
    mark4: '',
    mark5: '',
    mark6: '',
  },
  nbtScores: {
    nbtAL: '',
    nbtQL: '',
    nbtMAT: '',
  },
  apsScore: 0,

  setMarksData: (data) =>
    set((state) => ({
      ...state,
      ...data,
      subjects: { ...state.subjects, ...(data.subjects || {}) },
      marks: { ...state.marks, ...(data.marks || {}) },
      nbtScores: { ...state.nbtScores, ...(data.nbtScores || {}) },
    })),

  setSubject: (key, value) =>
    set((state) => ({
      subjects: { ...state.subjects, [key]: value },
    })),

  setMark: (key, value) =>
    set((state) => ({
      marks: { ...state.marks, [key]: value },
    })),

  setNbtScore: (key, value) =>
    set((state) => ({
      nbtScores: { ...state.nbtScores, [key]: value },
    })),
}));

export default useMarksStore;
