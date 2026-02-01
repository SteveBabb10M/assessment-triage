// Demo data - Teachers, Groups, Students

export const TEACHERS = [
  { id: 'teacher1', name: 'Teacher 1', initials: 'T1', isHoD: true },
  { id: 'teacher2', name: 'Teacher 2', initials: 'T2', isHoD: false },
  { id: 'teacher3', name: 'Teacher 3', initials: 'T3', isHoD: false },
  { id: 'teacher4', name: 'Teacher 4', initials: 'T4', isHoD: false },
  { id: 'teacher5', name: 'Teacher 5', initials: 'T5', isHoD: false },
];

export const GROUPS = [
  // Foundation Diploma (Year 1) - 4 groups
  { id: 'fd-a', name: 'Group A', course: 'foundation', teacherId: 'teacher1' },
  { id: 'fd-b', name: 'Group B', course: 'foundation', teacherId: 'teacher2' },
  { id: 'fd-c', name: 'Group C', course: 'foundation', teacherId: 'teacher3' },
  { id: 'fd-d', name: 'Group D', course: 'foundation', teacherId: 'teacher4' },
  
  // Extended Diploma (Year 2) - 4 groups
  { id: 'ed-a', name: 'Group A', course: 'extended', teacherId: 'teacher2' },
  { id: 'ed-b', name: 'Group B', course: 'extended', teacherId: 'teacher3' },
  { id: 'ed-c', name: 'Group C', course: 'extended', teacherId: 'teacher5' },
  { id: 'ed-d', name: 'Group D', course: 'extended', teacherId: 'teacher1' },
];

// Generate 80 students (10 per group)
export const STUDENTS = [];

let studentNum = 1;
GROUPS.forEach(group => {
  for (let i = 0; i < 10; i++) {
    STUDENTS.push({
      id: `student${studentNum}`,
      name: `Student ${studentNum}`,
      groupId: group.id,
      course: group.course
    });
    studentNum++;
  }
});

// Helper functions
export function getTeacherById(teacherId) {
  return TEACHERS.find(t => t.id === teacherId);
}

export function getGroupById(groupId) {
  return GROUPS.find(g => g.id === groupId);
}

export function getStudentById(studentId) {
  return STUDENTS.find(s => s.id === studentId);
}

export function getStudentsByGroup(groupId) {
  return STUDENTS.filter(s => s.groupId === groupId);
}

export function getGroupsByTeacher(teacherId) {
  return GROUPS.filter(g => g.teacherId === teacherId);
}

export function getGroupsByCourse(courseId) {
  return GROUPS.filter(g => g.course === courseId);
}

export function getStudentsByCourse(courseId) {
  return STUDENTS.filter(s => s.course === courseId);
}

export function getTeacherForStudent(studentId) {
  const student = getStudentById(studentId);
  if (!student) return null;
  const group = getGroupById(student.groupId);
  if (!group) return null;
  return getTeacherById(group.teacherId);
}

export function getGroupFullName(groupId) {
  const group = getGroupById(groupId);
  if (!group) return '';
  const courseName = group.course === 'foundation' ? 'Foundation Diploma' : 'Extended Diploma';
  return `${courseName} ${group.name}`;
}
