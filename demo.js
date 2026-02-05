// Real student and teacher data for Y2-BS1 Extended Diploma Business
// Cohort: 2025-26 Year 2

export const cohort = {
  id: 'y2-bs1',
  name: 'Y2-BS1',
  programme: 'BTEC Level 3 Extended Diploma Business',
  academicYear: '2025-26',
  teamName: 'Y2-BS1 Extended Diploma Business' // Microsoft Teams team name
};

// Teaching staff for this cohort
export const teachers = {
  'sbr': {
    id: 'sbr',
    initials: 'SBR',
    name: 'Steve Babb',
    email: '', // To be configured
    role: 'Teacher Three',
    isHoD: false,
    units: ['unit6', 'unit8', 'unit14'],
    teachingBlocks: {
      block1: { unit: 'unit6', title: 'Principles of Management', type: 'exam' },
      block2: { unit: 'unit8', title: 'Recruitment and Selection', type: 'coursework' },
      block3: { unit: 'unit14', title: 'Investigating Customer Service (shared)', type: 'coursework' }
    }
  },
  'teacher-one': {
    id: 'teacher-one',
    initials: 'AMS/CPE/YAR',
    name: 'Teacher One',
    email: '',
    role: 'Teacher One',
    isHoD: false,
    units: ['unit5', 'unit17', 'unit14'],
    teachingBlocks: {
      block1: { unit: 'unit5', title: 'International Business', type: 'coursework' },
      block2: { unit: 'unit17', title: 'Digital Marketing', type: 'coursework' },
      block3: { unit: 'unit14', title: 'Investigating Customer Service (shared)', type: 'coursework' }
    }
  },
  'teacher-two': {
    id: 'teacher-two',
    initials: 'DUR/SBR/JSH',
    name: 'Teacher Two',
    email: '',
    role: 'Teacher Two',
    isHoD: false,
    units: ['unit7', 'unit19', 'unit14'],
    teachingBlocks: {
      block1: { unit: 'unit7', title: 'Business Decision Making', type: 'exam' },
      block2: { unit: 'unit19', title: 'Pitching for a New Business', type: 'coursework' },
      block3: { unit: 'unit14', title: 'Investigating Customer Service (shared)', type: 'coursework' }
    }
  },
  // IV staff
  'cpe': {
    id: 'cpe',
    name: 'Catherine Pennington',
    role: 'Lead Internal Verifier',
    isLIV: true
  },
  'tab': {
    id: 'tab',
    name: 'Tina Ababio',
    role: 'Assessor / IV',
    units: ['unit8']
  },
  'asd': {
    id: 'asd',
    name: 'Ashar Saeed',
    role: 'Assessor',
    units: ['unit8']
  }
};

// Y2-BS1 Student roster - 22 students
export const students = [
  { id: 'alli-h', surname: 'Alli', firstName: 'Hassan', displayName: 'Hassan Alli' },
  { id: 'ashrif-m', surname: 'Ashrif', firstName: 'Maliha', displayName: 'Maliha Ashrif' },
  { id: 'bechachria-m', surname: 'Bechachria', firstName: 'Mohamed', displayName: 'Mohamed Bechachria' },
  { id: 'bharat-p', surname: 'Bharat', firstName: 'Prayas', displayName: 'Prayas Bharat' },
  { id: 'bharatkumar-m', surname: 'Bharatkumar', firstName: 'Mahek', displayName: 'Mahek Bharatkumar' },
  { id: 'urquhart-d', surname: 'Urquhart', firstName: 'David', displayName: 'David Urquhart' },
  { id: 'dsilva-s', surname: 'DSilva', firstName: 'Sofia Lourenco', displayName: 'Sofia Lourenco DSilva' },
  { id: 'haidari-h', surname: 'Haidari', firstName: 'Hussain', displayName: 'Hussain Haidari' },
  { id: 'hussain-y', surname: 'Hussain', firstName: 'Yaqeen', displayName: 'Yaqeen Hussain' },
  { id: 'itesh-a', surname: 'Itesh', firstName: 'Aksh', displayName: 'Aksh Itesh' },
  { id: 'jenti-r', surname: 'Jenti', firstName: 'Rusik', displayName: 'Rusik Jenti' },
  { id: 'mahmood-mi', surname: 'Mahmood', firstName: 'Muhammad Imaad', displayName: 'Muhammad Imaad Mahmood' },
  { id: 'noormohamed-a', surname: 'Noormohamed', firstName: 'Anwar', displayName: 'Anwar Noormohamed' },
  { id: 'padda-t', surname: 'Padda', firstName: 'Tarndeep', displayName: 'Tarndeep Padda' },
  { id: 'patel-d', surname: 'Patel', firstName: 'Dhvani', displayName: 'Dhvani Patel' },
  { id: 'patel-n', surname: 'Patel', firstName: 'Neel', displayName: 'Neel Patel' },
  { id: 'rashid-q', surname: 'Rashid', firstName: 'Qays', displayName: 'Qays Rashid' },
  { id: 'sankhla-r', surname: 'Sankhla', firstName: 'Raksha', displayName: 'Raksha Sankhla' },
  { id: 'shaban-d', surname: 'Shaban', firstName: 'Didar', displayName: 'Didar Shaban' },
  { id: 'sharma-s', surname: 'Sharma', firstName: 'Sumit', displayName: 'Sumit Sharma' },
  { id: 'sokolov-v', surname: 'Sokolov', firstName: 'Vasil', displayName: 'Vasil Sokolov' },
  { id: 'tandel-p', surname: 'Tandel', firstName: 'Param', displayName: 'Param Tandel' }
];

// Helper functions
export function getStudentById(id) {
  return students.find(s => s.id === id);
}

export function getStudentByName(name) {
  const lower = name.toLowerCase();
  return students.find(s =>
    s.displayName.toLowerCase().includes(lower) ||
    s.surname.toLowerCase().includes(lower) ||
    s.firstName.toLowerCase().includes(lower)
  );
}

export function getStudentDropdownOptions() {
  return students
    .sort((a, b) => a.surname.localeCompare(b.surname))
    .map(s => ({
      value: s.id,
      label: `${s.surname}, ${s.firstName}`
    }));
}

export function getTeachersByUnit(unitId) {
  return Object.values(teachers).filter(t =>
    t.units && t.units.includes(unitId)
  );
}
