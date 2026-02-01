// BTEC Units and Assignments based on Foundation and Extended Diploma specs

export const COURSES = {
  foundation: {
    id: 'foundation',
    name: 'Foundation Diploma',
    shortName: 'FD',
    year: 1
  },
  extended: {
    id: 'extended', 
    name: 'Extended Diploma',
    shortName: 'ED',
    year: 2
  }
};

export const UNITS = {
  // Foundation Diploma (Year 1)
  unit1: {
    id: 'unit1',
    number: 1,
    title: 'Exploring Business',
    course: 'foundation',
    isExam: false,
    assignments: [
      {
        id: 'unit1-ab',
        name: 'Assignment A&B',
        learningAims: ['A', 'B'],
        criteria: ['P1', 'P2', 'P3', 'M1', 'M2', 'D1'],
        handOut: '2025-09-29',
        handIn: '2025-10-20'
      },
      {
        id: 'unit1-cd',
        name: 'Assignment C&D',
        learningAims: ['C', 'D'],
        criteria: ['P3', 'P4', 'P5', 'P6', 'M3', 'D2', 'D3'],
        handOut: '2025-11-10',
        handIn: '2025-11-24'
      },
      {
        id: 'unit1-e',
        name: 'Assignment E',
        learningAims: ['E'],
        criteria: ['P7', 'M5', 'D4'],
        handOut: '2025-12-01',
        handIn: '2025-12-15'
      }
    ]
  },
  unit2: {
    id: 'unit2',
    number: 2,
    title: 'Developing a Marketing Campaign',
    course: 'foundation',
    isExam: true,
    assignments: []
  },
  unit3: {
    id: 'unit3',
    number: 3,
    title: 'Personal and Business Finance',
    course: 'foundation',
    isExam: true,
    assignments: []
  },
  unit4: {
    id: 'unit4',
    number: 4,
    title: 'Planning an Event',
    course: 'foundation',
    isExam: false,
    assignments: [
      {
        id: 'unit4-a',
        name: 'Assignment A',
        learningAims: ['A'],
        criteria: ['P1', 'P2', 'M1', 'D1'],
        handOut: '2026-01-26',
        handIn: '2026-02-16'
      },
      {
        id: 'unit4-bc',
        name: 'Assignment B&C',
        learningAims: ['B', 'C'],
        criteria: ['P3', 'P4', 'M2', 'P5', 'P6', 'M3', 'D2'],
        handOut: '2026-03-02',
        handIn: '2026-03-23'
      },
      {
        id: 'unit4-de',
        name: 'Assignment D&E',
        learningAims: ['D', 'E'],
        criteria: ['P7', 'M4', 'P8', 'M5', 'D3'],
        handOut: '2026-04-03',
        handIn: '2026-04-24'
      }
    ]
  },
  unit22: {
    id: 'unit22',
    number: 22,
    title: 'Market Research',
    course: 'foundation',
    isExam: false,
    assignments: [
      {
        id: 'unit22-a',
        name: 'Assignment A',
        learningAims: ['A'],
        criteria: ['P1', 'M1', 'D1'],
        handOut: '2026-01-19',
        handIn: '2026-01-26'
      },
      {
        id: 'unit22-b',
        name: 'Assignment B',
        learningAims: ['B'],
        criteria: ['P2', 'P3', 'P4', 'M2', 'D2'],
        handOut: '2026-02-06',
        handIn: '2026-03-06'
      },
      {
        id: 'unit22-c',
        name: 'Assignment C',
        learningAims: ['C'],
        criteria: ['P5', 'M3', 'D3'],
        handOut: '2026-03-20',
        handIn: '2026-04-03'
      }
    ]
  },
  unit27: {
    id: 'unit27',
    number: 27,
    title: 'Work Experience',
    course: 'foundation',
    isExam: false,
    assignments: [
      {
        id: 'unit27-a',
        name: 'Assignment A',
        learningAims: ['A'],
        criteria: ['P1', 'P2', 'M1', 'D1'],
        handOut: '2026-01-26',
        handIn: '2026-02-09'
      },
      {
        id: 'unit27-b',
        name: 'Assignment B',
        learningAims: ['B'],
        criteria: ['P3', 'M2', 'D2'],
        handOut: '2026-02-23',
        handIn: '2026-03-09'
      },
      {
        id: 'unit27-c',
        name: 'Assignment C',
        learningAims: ['C'],
        criteria: ['P5', 'P6', 'M3', 'D3'],
        handOut: '2026-03-16',
        handIn: '2026-03-30'
      }
    ]
  },
  
  // Extended Diploma (Year 2)
  unit5: {
    id: 'unit5',
    number: 5,
    title: 'International Business',
    course: 'extended',
    isExam: false,
    assignments: [
      {
        id: 'unit5-ab',
        name: 'Assignment A&B',
        learningAims: ['A', 'B'],
        criteria: ['P1', 'P2', 'P3', 'P4', 'M1', 'M2', 'D1'],
        handOut: '2025-09-29',
        handIn: '2025-10-13'
      },
      {
        id: 'unit5-cd',
        name: 'Assignment C&D',
        learningAims: ['C', 'D'],
        criteria: ['P5', 'P6', 'P7', 'M2', 'M3', 'M4', 'D2', 'D3'],
        handOut: '2025-10-27',
        handIn: '2025-11-10'
      },
      {
        id: 'unit5-e',
        name: 'Assignment E',
        learningAims: ['E'],
        criteria: ['P8', 'M5', 'D4'],
        handOut: '2025-11-24',
        handIn: '2025-12-08'
      }
    ]
  },
  unit8: {
    id: 'unit8',
    number: 8,
    title: 'Recruitment and Selection',
    course: 'extended',
    isExam: false,
    assignments: [
      {
        id: 'unit8-a',
        name: 'Assignment A',
        learningAims: ['A'],
        criteria: ['P1', 'P2', 'M1', 'D1'],
        handOut: '2026-02-09',
        handIn: '2026-02-23'
      },
      {
        id: 'unit8-b',
        name: 'Assignment B',
        learningAims: ['B'],
        criteria: ['P3', 'P4', 'M2', 'D2'],
        handOut: '2026-03-09',
        handIn: '2026-03-23'
      },
      {
        id: 'unit8-c',
        name: 'Assignment C',
        learningAims: ['C'],
        criteria: ['P5', 'P6', 'M3', 'D3'],
        handOut: '2026-04-06',
        handIn: '2026-04-27'
      }
    ]
  },
  unit14: {
    id: 'unit14',
    number: 14,
    title: 'Investigating Customer Service',
    course: 'extended',
    isExam: false,
    assignments: [
      {
        id: 'unit14-a',
        name: 'Assignment A',
        learningAims: ['A'],
        criteria: ['P1', 'P2', 'M1', 'D1'],
        handOut: '2026-05-11',
        handIn: '2026-05-22'
      },
      {
        id: 'unit14-b',
        name: 'Assignment B',
        learningAims: ['B'],
        criteria: ['P3', 'M2', 'D2'],
        handOut: '2026-05-22',
        handIn: '2026-06-01'
      },
      {
        id: 'unit14-c',
        name: 'Assignment C',
        learningAims: ['C'],
        criteria: ['P4', 'P5', 'P6', 'M3', 'D3'],
        handOut: '2026-06-01',
        handIn: '2026-06-15'
      }
    ]
  },
  unit17: {
    id: 'unit17',
    number: 17,
    title: 'Digital Marketing',
    course: 'extended',
    isExam: false,
    assignments: [
      {
        id: 'unit17-a',
        name: 'Assignment A',
        learningAims: ['A'],
        criteria: ['P1', 'P2', 'M1', 'D1'],
        handOut: '2026-01-19',
        handIn: '2026-02-02'
      },
      {
        id: 'unit17-b',
        name: 'Assignment B',
        learningAims: ['B'],
        criteria: ['P3', 'P4', 'P5', 'M2', 'D2'],
        handOut: '2026-02-16',
        handIn: '2026-03-02'
      },
      {
        id: 'unit17-c',
        name: 'Assignment C',
        learningAims: ['C'],
        criteria: ['P6', 'M3', 'D3'],
        handOut: '2026-03-16',
        handIn: '2026-03-30'
      }
    ]
  },
  unit19: {
    id: 'unit19',
    number: 19,
    title: 'Pitching for a New Business',
    course: 'extended',
    isExam: false,
    assignments: [
      {
        id: 'unit19-a',
        name: 'Assignment A',
        learningAims: ['A'],
        criteria: ['P1', 'P2', 'M1', 'M2', 'D1'],
        handOut: '2026-02-09',
        handIn: '2026-02-23'
      },
      {
        id: 'unit19-b',
        name: 'Assignment B',
        learningAims: ['B'],
        criteria: ['P3', 'P4', 'M2', 'D2'],
        handOut: '2026-03-09',
        handIn: '2026-03-23'
      },
      {
        id: 'unit19-c',
        name: 'Assignment C',
        learningAims: ['C'],
        criteria: ['P5', 'P6', 'M3', 'D3'],
        handOut: '2026-04-06',
        handIn: '2026-04-27'
      }
    ]
  }
};

// Helper to get units by course
export function getUnitsByCourse(courseId) {
  return Object.values(UNITS).filter(u => u.course === courseId && !u.isExam);
}

// Helper to get all assignments as flat list
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
          course: unit.course
        });
      });
    }
  });
  return assignments;
}

// Helper to find assignment by ID
export function getAssignmentById(assignmentId) {
  for (const unit of Object.values(UNITS)) {
    const assignment = unit.assignments.find(a => a.id === assignmentId);
    if (assignment) {
      return {
        ...assignment,
        unitId: unit.id,
        unitNumber: unit.number,
        unitTitle: unit.title,
        course: unit.course
      };
    }
  }
  return null;
}
