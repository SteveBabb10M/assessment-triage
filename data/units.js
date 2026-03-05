// Units and Assignments
// Covers: BTEC Foundation Diploma (Y1), BTEC Extended Diploma (Y2),
//         T Level Management & Administration (Y1 + Y2), and Ad Hoc (Unit 99)

export const COURSES = {
  foundation:        { id: 'foundation',        name: 'BTEC Foundation Diploma',                shortName: 'FD',     year: 'Y1' },
  extended:          { id: 'extended',           name: 'BTEC Extended Diploma',                  shortName: 'ED',     year: 'Y2' },
  'tlevel-management': { id: 'tlevel-management', name: 'T Level Management and Administration', shortName: 'T Lev',  year: 'Y1/Y2' },
};

export const UNITS = {
  // ─── BTEC Foundation Diploma (Y1) ─────────────────────────
  unit1: {
    id: 'unit1', number: 1, title: 'Exploring Business',
    course: 'foundation', isExam: false,
    assignments: [
      { id: 'unit1-ab', name: 'Assignment A&B', learningAims: ['A', 'B'],
        criteria: ['P1', 'P2', 'P3', 'M1', 'M2', 'D1'], handOut: '2025-09-29', handIn: '2025-10-20' },
      { id: 'unit1-cd', name: 'Assignment C&D', learningAims: ['C', 'D'],
        criteria: ['P4', 'P5', 'P6', 'M3', 'D2', 'D3'], handOut: '2025-11-10', handIn: '2025-11-24' },
      { id: 'unit1-e',  name: 'Assignment E',   learningAims: ['E'],
        criteria: ['P7', 'M4', 'M5', 'D4'], handOut: '2025-12-01', handIn: '2025-12-15' },
    ]
  },
  unit22: {
    id: 'unit22', number: 22, title: 'Market Research',
    course: 'foundation', isExam: false,
    assignments: [
      { id: 'unit22-a', name: 'Assignment A', learningAims: ['A'],
        criteria: ['P1', 'M1', 'D1'], handOut: '2026-01-19', handIn: '2026-01-26' },
      { id: 'unit22-b', name: 'Assignment B', learningAims: ['B'],
        criteria: ['P2', 'P3', 'P4', 'M2', 'D2'], handOut: '2026-02-06', handIn: '2026-02-27' },
      { id: 'unit22-c', name: 'Assignment C', learningAims: ['C'],
        criteria: ['P5', 'M3', 'D3'], handOut: '2026-03-09', handIn: '2026-03-30' },
    ]
  },
  unit27: {
    id: 'unit27', number: 27, title: 'Work Experience',
    course: 'foundation', isExam: false,
    assignments: [
      { id: 'unit27-a', name: 'Assignment A', learningAims: ['A'],
        criteria: ['P1', 'P2', 'M1', 'D1'], handOut: '2026-01-12', handIn: '2026-03-30' },
    ]
  },
  unit4: {
    id: 'unit4', number: 4, title: 'Planning an Event',
    course: 'foundation', isExam: false,
    assignments: [
      { id: 'unit4-a', name: 'Assignment A', learningAims: ['A'],
        criteria: ['P1', 'P2', 'M1', 'D1'], handOut: '2026-01-19', handIn: '2026-02-09' },
      { id: 'unit4-b', name: 'Assignment B', learningAims: ['B'],
        criteria: ['P3', 'P4', 'M2', 'D2'], handOut: '2026-02-16', handIn: '2026-03-09' },
    ]
  },
  // ─── BTEC Extended Diploma (Y2) ───────────────────────────
  unit5: {
    id: 'unit5', number: 5, title: 'International Business',
    course: 'extended', isExam: false,
    assignments: [
      { id: 'unit5-ab', name: 'Assignment A&B', learningAims: ['A', 'B'],
        criteria: ['P1', 'P2', 'P3', 'M1', 'M2', 'D1'], handOut: '2025-09-15', handIn: '2025-10-06' },
      { id: 'unit5-cd', name: 'Assignment C&D', learningAims: ['C', 'D'],
        criteria: ['P4', 'P5', 'P6', 'M3', 'M4', 'D2', 'D3'], handOut: '2025-10-20', handIn: '2025-11-10' },
      { id: 'unit5-e',  name: 'Assignment E',   learningAims: ['E'],
        criteria: ['P7', 'P8', 'M5', 'D4'], handOut: '2025-11-17', handIn: '2025-12-08' },
    ]
  },
  unit8: {
    id: 'unit8', number: 8, title: 'Recruitment and Selection',
    course: 'extended', isExam: false,
    assignments: [
      { id: 'unit8-a', name: 'Assignment A', learningAims: ['A'],
        criteria: ['P1', 'P2', 'M1', 'D1'], handOut: '2025-09-15', handIn: '2025-10-06' },
      { id: 'unit8-b', name: 'Assignment B', learningAims: ['B'],
        criteria: ['P3', 'P4', 'M2', 'D2'], handOut: '2025-10-20', handIn: '2025-11-10' },
      { id: 'unit8-c', name: 'Assignment C', learningAims: ['C'],
        criteria: ['P5', 'P6', 'M3', 'D3'], handOut: '2025-11-17', handIn: '2025-12-08' },
    ]
  },
  unit14: {
    id: 'unit14', number: 14, title: 'Investigating Customer Service',
    course: 'extended', isExam: false,
    assignments: [
      { id: 'unit14-a', name: 'Assignment A', learningAims: ['A'],
        criteria: ['P1', 'P2', 'M1', 'D1'], handOut: '2026-01-12', handIn: '2026-02-02' },
      { id: 'unit14-b', name: 'Assignment B', learningAims: ['B'],
        criteria: ['P3', 'P4', 'M2', 'D2'], handOut: '2026-02-09', handIn: '2026-03-02' },
      { id: 'unit14-c', name: 'Assignment C', learningAims: ['C'],
        criteria: ['P5', 'P6', 'M3', 'D3'], handOut: '2026-03-09', handIn: '2026-03-30' },
    ]
  },
  unit17: {
    id: 'unit17', number: 17, title: 'Digital Marketing',
    course: 'extended', isExam: false,
    assignments: [
      { id: 'unit17-a', name: 'Assignment A', learningAims: ['A'],
        criteria: ['P1', 'P2', 'M1', 'D1'], handOut: '2026-01-12', handIn: '2026-02-02' },
      { id: 'unit17-b', name: 'Assignment B', learningAims: ['B'],
        criteria: ['P3', 'P4', 'M2', 'D2'], handOut: '2026-02-09', handIn: '2026-03-02' },
      { id: 'unit17-c', name: 'Assignment C', learningAims: ['C'],
        criteria: ['P5', 'P6', 'M3', 'D3'], handOut: '2026-03-09', handIn: '2026-03-30' },
    ]
  },
  unit19: {
    id: 'unit19', number: 19, title: 'Pitching for a New Business',
    course: 'extended', isExam: false,
    assignments: [
      { id: 'unit19-a', name: 'Assignment A', learningAims: ['A'],
        criteria: ['P1', 'P2', 'M1', 'D1'], handOut: '2026-02-09', handIn: '2026-02-23' },
      { id: 'unit19-b', name: 'Assignment B', learningAims: ['B'],
        criteria: ['P3', 'P4', 'M2', 'D2'], handOut: '2026-03-09', handIn: '2026-03-23' },
      { id: 'unit19-c', name: 'Assignment C', learningAims: ['C'],
        criteria: ['P5', 'P6', 'M3', 'D3'], handOut: '2026-04-06', handIn: '2026-04-27' },
    ]
  },
  // ─── T Level Management & Administration ──────────────────
  // Unit 1 here refers to the T Level Employer Set Project tasks,
  // not BTEC Unit 1. The course field 'tlevel-management' keeps them separate.
  unit1tl: {
    id: 'unit1tl', number: 1, title: 'Employer Set Project',
    course: 'tlevel-management', isExam: false,
    isTLevel: true,
    espTotalMarks: 100,
    gradingType: 'band', // 'band' = numerical marks against band descriptors; 'criteria' = BTEC P/M/D
    assignments: [
      { id: 'tl-1-1', name: 'Task 1.1 — Project Brief Investigation', learningAims: ['1.1'],
        criteria: ['AO1', 'AO2a', 'AO2b', 'AO3', 'AO4a'], handOut: null, handIn: null,
        maxMarks: 20, duration: '8 hours (+0.5 reading)',
        grids: [
          { name: 'AO1 + AO3 (Planning & Techniques)', maxMarks: 6, bands: 3 },
          { name: 'AO2a (Core Knowledge)', maxMarks: 6, bands: 3 },
          { name: 'AO2b + AO4a (Core Skills & Maths)', maxMarks: 8, bands: 4 },
        ] },
      { id: 'tl-1-2', name: 'Task 1.2 — Project Initiation Document', learningAims: ['1.2'],
        criteria: ['AO1', 'AO2a', 'AO2b', 'AO3'], handOut: null, handIn: null,
        maxMarks: 17, duration: '3.5 hours',
        grids: [
          { name: 'AO1 + AO3 (Planning & Techniques)', maxMarks: 8, bands: 4 },
          { name: 'AO2a + AO2b (Core Knowledge & Skills)', maxMarks: 9, bands: 3 },
        ] },
      { id: 'tl-1-3', name: 'Task 1.3 — Project Planning', learningAims: ['1.3'],
        criteria: ['AO1', 'AO2a', 'AO2b', 'AO3', 'AO4a'], handOut: null, handIn: null,
        maxMarks: 17, duration: '4 hours',
        grids: [
          { name: 'AO1 + AO3 + AO4a (Planning & Techniques & Maths)', maxMarks: 9, bands: 3 },
          { name: 'AO2a + AO2b (Core Knowledge & Skills)', maxMarks: 8, bands: 4 },
        ] },
      { id: 'tl-1-4', name: 'Task 1.4 — Presentation', learningAims: ['1.4'],
        criteria: ['AO2a', 'AO2b', 'AO4b', 'AO4c'], handOut: null, handIn: null,
        maxMarks: 19, duration: '3.5 hours',
        grids: [
          { name: 'AO2a + AO2b (Core Knowledge & Skills)', maxMarks: 9, bands: 3 },
          { name: 'AO4b + AO4c (English & Digital Skills)', maxMarks: 10, bands: 5 },
        ] },
      { id: 'tl-2-1', name: 'Task 2.1 — Collaborative Problem Solving', learningAims: ['2.1'],
        criteria: ['AO1', 'AO2a', 'AO2b'], handOut: null, handIn: null,
        maxMarks: 12, duration: '2.5 hours',
        grids: [
          { name: 'AO1 + AO2a (Planning & Core Knowledge)', maxMarks: 6, bands: 3 },
          { name: 'AO2b (Core Skills)', maxMarks: 6, bands: 3 },
        ] },
      { id: 'tl-2-2', name: 'Task 2.2 — Evaluation', learningAims: ['2.2'],
        criteria: ['AO2b', 'AO5a', 'AO5b'], handOut: null, handIn: null,
        maxMarks: 15, duration: '3.5 hours',
        grids: [
          { name: 'AO2b + AO5a + AO5b (Skills & Outcome & Review)', maxMarks: 15, bands: 5 },
        ] },
    ]
  },
  // ─── Ad Hoc (Unit 99) ─────────────────────────────────────
  // Originality-only analysis. No criteria matching performed.
  unit99: {
    id: 'unit99', number: 99, title: 'Ad Hoc Submission',
    course: 'adhoc', isExam: false, isAdHoc: true,
    assignments: [
      { id: 'adhoc', name: 'Ad Hoc — Originality Check Only', learningAims: [],
        criteria: [], handOut: null, handIn: null },
    ]
  },
};

// ─── Helper Functions ────────────────────────────────────────

export function getUnitByNumber(number) {
  return Object.values(UNITS).find(u => u.number === number) || null;
}

// Get units for a cohort's course, excluding exam units.
// Ad Hoc (unit99) is surfaced separately — use getAdHocUnit() for that.
export function getUnitsByCourse(courseId) {
  return Object.values(UNITS).filter(u => u.course === courseId && !u.isExam && !u.isAdHoc);
}

export function getAdHocUnit() {
  return UNITS.unit99;
}

export function getAllAssignments() {
  const assignments = [];
  Object.values(UNITS).forEach(unit => {
    if (!unit.isExam) {
      unit.assignments.forEach(assignment => {
        assignments.push({
          ...assignment,
          unitId: unit.id,
          unitNumber: unit.number,
          unitTitle: unit.title,
          course: unit.course,
          isAdHoc: unit.isAdHoc || false,
        });
      });
    }
  });
  return assignments;
}

export function getAssignmentById(assignmentId) {
  for (const unit of Object.values(UNITS)) {
    const assignment = unit.assignments.find(a => a.id === assignmentId);
    if (assignment) {
      return {
        ...assignment,
        unitId: unit.id,
        unitNumber: unit.number,
        unitTitle: unit.title,
        course: unit.course,
        isAdHoc: unit.isAdHoc || false,
      };
    }
  }
  return null;
}

export function getAssignmentsByUnit(unitId) {
  const unit = UNITS[unitId];
  if (!unit) return [];
  return unit.assignments.map(a => ({
    ...a,
    unitId: unit.id,
    unitNumber: unit.number,
    unitTitle: unit.title,
    course: unit.course,
    isAdHoc: unit.isAdHoc || false,
  }));
}
