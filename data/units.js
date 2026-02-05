// BTEC Units and Assignments
// Units included: those assigned in teaching assignments
// Exam units excluded from triage (no coursework to analyse)

export const COURSES = {
  foundation: { id: 'foundation', name: 'Foundation Diploma', shortName: 'FD', year: 'Y1' },
  extended: { id: 'extended', name: 'Extended Diploma', shortName: 'ED', year: 'Y2' },
};

export const UNITS = {
  // ─── Foundation Diploma (Y1) ───────────────────────────────
  unit1: {
    id: 'unit1', number: 1, title: 'Exploring Business',
    course: 'foundation', isExam: false,
    assignments: [
      { id: 'unit1-ab', name: 'Assignment A&B', learningAims: ['A', 'B'],
        criteria: ['P1', 'P2', 'P3', 'M1', 'M2', 'D1'], handOut: '2025-09-29', handIn: '2025-10-20' },
      { id: 'unit1-cd', name: 'Assignment C&D', learningAims: ['C', 'D'],
        criteria: ['P4', 'P5', 'P6', 'M3', 'D2', 'D3'], handOut: '2025-11-10', handIn: '2025-11-24' },
      { id: 'unit1-e', name: 'Assignment E', learningAims: ['E'],
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
  // ─── Extended Diploma (Y2) ─────────────────────────────────
  unit5: {
    id: 'unit5', number: 5, title: 'International Business',
    course: 'extended', isExam: false,
    assignments: [
      { id: 'unit5-ab', name: 'Assignment A&B', learningAims: ['A', 'B'],
        criteria: ['P1', 'P2', 'P3', 'M1', 'M2', 'D1'], handOut: '2025-09-15', handIn: '2025-10-06' },
      { id: 'unit5-cd', name: 'Assignment C&D', learningAims: ['C', 'D'],
        criteria: ['P4', 'P5', 'P6', 'M3', 'M4', 'D2', 'D3'], handOut: '2025-10-20', handIn: '2025-11-10' },
      { id: 'unit5-e', name: 'Assignment E', learningAims: ['E'],
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
};

// ─── Helper Functions ────────────────────────────────────────

export function getUnitByNumber(number) {
  return Object.values(UNITS).find(u => u.number === number) || null;
}

export function getUnitsByCourse(courseId) {
  return Object.values(UNITS).filter(u => u.course === courseId && !u.isExam);
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
  }));
}
