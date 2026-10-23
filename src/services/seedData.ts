import { StudentProfile, RequestTicket } from '../types';

// Only real students who register will be stored in the directory
export const INITIAL_PROFILES: StudentProfile[] = [];

// Real community requests posted by registered students
export const INITIAL_REQUESTS: RequestTicket[] = [];

export const SCHOOL_STATS = {
  activeTutors: 0,
  sessionsCompletedThisTerm: 0,
  matchSatisfactionRate: 100,
  averageResponseTimeMin: 15
};
