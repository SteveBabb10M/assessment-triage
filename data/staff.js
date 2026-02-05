// Real department data — populated from Assessment_Triage_Data_Template.xlsx
// v2.0 — February 2026

// ─── Teachers ────────────────────────────────────────────────
export const TEACHERS = [
  { id: 'sbo', name: 'Simon Brown', initials: 'SBO', isHoD: true },
  { id: 'ams', name: 'Amreen Shabir', initials: 'AMS', isHoD: false },
  { id: 'asd', name: 'Ashar Saeed', initials: 'ASD', isHoD: false },
  { id: 'cla', name: 'Caroline Lawford', initials: 'CLA', isHoD: false },
  { id: 'dau', name: 'David Urquhart', initials: 'DAU', isHoD: false },
  { id: 'jas', name: 'James Shaw', initials: 'JAS', isHoD: false },
  { id: 'sba', name: 'Steve Babb', initials: 'SBA', isHoD: false },
  { id: 'cpe', name: 'Catherine Pennington', initials: 'CPE', isHoD: false },
];

// ─── Cohorts ─────────────────────────────────────────────────
export const COHORTS = [
  { id: 'bs1', name: 'BS1', qualification: 'BTEC L3 National Extended Diploma', course: 'extended', year: 'Y2' },
  { id: 'bs2', name: 'BS2', qualification: 'BTEC L3 National Extended Diploma', course: 'extended', year: 'Y2' },
  { id: 'bf3', name: 'BF3', qualification: 'BTEC L3 National Foundation Diploma', course: 'foundation', year: 'Y1' },
  { id: 'bf4', name: 'BF4', qualification: 'BTEC L3 National Foundation Diploma', course: 'foundation', year: 'Y1' },
];

// ─── Teaching Assignments ────────────────────────────────────
// Maps teacher → unit → cohort (supports co-teaching)
export const TEACHING_ASSIGNMENTS = [
  { teacherId: 'sba', unitNumber: 8, cohortId: 'bs1' },
  { teacherId: 'sba', unitNumber: 8, cohortId: 'bs2' },
  { teacherId: 'ams', unitNumber: 5, cohortId: 'bs1' },
  { teacherId: 'cla', unitNumber: 5, cohortId: 'bs2' },
  { teacherId: 'ams', unitNumber: 17, cohortId: 'bs1' },
  { teacherId: 'cla', unitNumber: 17, cohortId: 'bs2' },
  // Co-taught: David + Simon both teach Unit 19 to BS1 and Unit 14 to BS2
  { teacherId: 'dau', unitNumber: 19, cohortId: 'bs1' },
  { teacherId: 'sbo', unitNumber: 19, cohortId: 'bs1' },
  { teacherId: 'dau', unitNumber: 14, cohortId: 'bs2' },
  { teacherId: 'sbo', unitNumber: 14, cohortId: 'bs2' },
  // Foundation Diploma
  { teacherId: 'ams', unitNumber: 1, cohortId: 'bf3' },
  { teacherId: 'cla', unitNumber: 1, cohortId: 'bf4' },
  { teacherId: 'sba', unitNumber: 22, cohortId: 'bf3' },
  { teacherId: 'sba', unitNumber: 22, cohortId: 'bf4' },
];

// ─── Students ────────────────────────────────────────────────
export const STUDENTS = [
  // BS1 — Y2 Extended Diploma (22 students)
  { id: 'bs1-01', name: 'Alli: Hassan', cohortId: 'bs1' },
  { id: 'bs1-02', name: 'Ashrif: Maliha', cohortId: 'bs1' },
  { id: 'bs1-03', name: 'Bechachria: Mohamed', cohortId: 'bs1' },
  { id: 'bs1-04', name: 'Bharat: Prayas', cohortId: 'bs1' },
  { id: 'bs1-05', name: 'Bharatkumar: Mahek', cohortId: 'bs1' },
  { id: 'bs1-06', name: 'David Urquhart', cohortId: 'bs1' },
  { id: 'bs1-07', name: 'DSilva: Sofia Lourenco', cohortId: 'bs1' },
  { id: 'bs1-08', name: 'Haidari: Hussain', cohortId: 'bs1' },
  { id: 'bs1-09', name: 'Hussain: Yaqeen', cohortId: 'bs1' },
  { id: 'bs1-10', name: 'Itesh: Aksh', cohortId: 'bs1' },
  { id: 'bs1-11', name: 'Jenti: Rusik', cohortId: 'bs1' },
  { id: 'bs1-12', name: 'Mahmood: Muhammad Imaad', cohortId: 'bs1' },
  { id: 'bs1-13', name: 'Noormohamed: Anwar', cohortId: 'bs1' },
  { id: 'bs1-14', name: 'Padda: Tarndeep', cohortId: 'bs1' },
  { id: 'bs1-15', name: 'Patel: Dhvani', cohortId: 'bs1' },
  { id: 'bs1-16', name: 'Patel: Neel', cohortId: 'bs1' },
  { id: 'bs1-17', name: 'Rashid: Qays', cohortId: 'bs1' },
  { id: 'bs1-18', name: 'Sankhla: Raksha', cohortId: 'bs1' },
  { id: 'bs1-19', name: 'Shaban: Didar', cohortId: 'bs1' },
  { id: 'bs1-20', name: 'Sharma: Sumit', cohortId: 'bs1' },
  { id: 'bs1-21', name: 'Sokolov: Vasil', cohortId: 'bs1' },
  { id: 'bs1-22', name: 'Tandel: Param', cohortId: 'bs1' },
  // BS2 — Y2 Extended Diploma (18 students)
  { id: 'bs2-01', name: 'Awan: Nail', cohortId: 'bs2' },
  { id: 'bs2-02', name: 'Da Cruz: Maisa', cohortId: 'bs2' },
  { id: 'bs2-03', name: 'Jagdish: Neelkanth', cohortId: 'bs2' },
  { id: 'bs2-04', name: 'Jagdish: Neev', cohortId: 'bs2' },
  { id: 'bs2-05', name: 'Kanti: Meghakxi', cohortId: 'bs2' },
  { id: 'bs2-06', name: 'Kasu: Alisha', cohortId: 'bs2' },
  { id: 'bs2-07', name: 'Kaur: Esha', cohortId: 'bs2' },
  { id: 'bs2-08', name: 'Khan: Rehan', cohortId: 'bs2' },
  { id: 'bs2-09', name: 'Maisuria: Dhruv', cohortId: 'bs2' },
  { id: 'bs2-10', name: 'Mwembamba: Suleiman', cohortId: 'bs2' },
  { id: 'bs2-11', name: 'Patel: Eesaa', cohortId: 'bs2' },
  { id: 'bs2-12', name: 'Patel: Mahima Jiteshkumar', cohortId: 'bs2' },
  { id: 'bs2-13', name: 'Perkuszewska: Victoria', cohortId: 'bs2' },
  { id: 'bs2-14', name: 'Rahman: Gm Asafur', cohortId: 'bs2' },
  { id: 'bs2-15', name: 'Rahsid Dawood: Saif', cohortId: 'bs2' },
  { id: 'bs2-16', name: 'Ram: Vishal', cohortId: 'bs2' },
  { id: 'bs2-17', name: 'Rezaei: Maisam', cohortId: 'bs2' },
  { id: 'bs2-18', name: 'Shantilal: Dipen', cohortId: 'bs2' },
  // BF3 — Y1 Foundation Diploma (21 students)
  { id: 'bf3-01', name: 'Abdi: Muzamil', cohortId: 'bf3' },
  { id: 'bf3-02', name: 'Billa: Lovejit', cohortId: 'bf3' },
  { id: 'bf3-03', name: 'Demco: Sebastian', cohortId: 'bf3' },
  { id: 'bf3-04', name: 'Gaffar: Hisham', cohortId: 'bf3' },
  { id: 'bf3-05', name: 'Ibrahim: Zayd', cohortId: 'bf3' },
  { id: 'bf3-06', name: 'Joni: Santiago', cohortId: 'bf3' },
  { id: 'bf3-07', name: 'Mahmadsajid: Zaid', cohortId: 'bf3' },
  { id: 'bf3-08', name: 'Mahomed: Naval', cohortId: 'bf3' },
  { id: 'bf3-09', name: 'Moataz: Rayan', cohortId: 'bf3' },
  { id: 'bf3-10', name: 'Mohamed: Kawsar', cohortId: 'bf3' },
  { id: 'bf3-11', name: 'Mudukuti: Takunda', cohortId: 'bf3' },
  { id: 'bf3-12', name: 'Mushapaidze: Golden', cohortId: 'bf3' },
  { id: 'bf3-13', name: 'Omar: Abdisalam', cohortId: 'bf3' },
  { id: 'bf3-14', name: 'Owan: Raphael', cohortId: 'bf3' },
  { id: 'bf3-15', name: 'Pravinkumar: Aryan', cohortId: 'bf3' },
  { id: 'bf3-16', name: 'Rakesh: Neel', cohortId: 'bf3' },
  { id: 'bf3-17', name: 'Ravji: Himesh', cohortId: 'bf3' },
  { id: 'bf3-18', name: 'Shantu: Nirmal', cohortId: 'bf3' },
  { id: 'bf3-19', name: 'Sidik: Zayan', cohortId: 'bf3' },
  { id: 'bf3-20', name: 'Thaarick Mohamed: Adam', cohortId: 'bf3' },
  { id: 'bf3-21', name: 'Vinod: Siddhi', cohortId: 'bf3' },
  // BF4 — Y1 Foundation Diploma (20 students)
  { id: 'bf4-01', name: 'Ahmed: Ahmed', cohortId: 'bf4' },
  { id: 'bf4-02', name: 'Allana: Aaishah', cohortId: 'bf4' },
  { id: 'bf4-03', name: 'Amar: Kajal', cohortId: 'bf4' },
  { id: 'bf4-04', name: 'Baria: Heli', cohortId: 'bf4' },
  { id: 'bf4-05', name: 'Bawani: Erik', cohortId: 'bf4' },
  { id: 'bf4-06', name: 'Contractor: Ameer', cohortId: 'bf4' },
  { id: 'bf4-07', name: 'Devgi: Manav', cohortId: 'bf4' },
  { id: 'bf4-08', name: 'Fryekh: Leyna', cohortId: 'bf4' },
  { id: 'bf4-09', name: 'Gani: Ammarah', cohortId: 'bf4' },
  { id: 'bf4-10', name: 'Hiteshkumar: Trushtika', cohortId: 'bf4' },
  { id: 'bf4-11', name: 'Imtihaz: Sahil', cohortId: 'bf4' },
  { id: 'bf4-12', name: 'Karelia: Ronak', cohortId: 'bf4' },
  { id: 'bf4-13', name: 'Modhwadia: Pruthvi', cohortId: 'bf4' },
  { id: 'bf4-14', name: 'Naresh: Jenish', cohortId: 'bf4' },
  { id: 'bf4-15', name: 'Nerway: Aroz', cohortId: 'bf4' },
  { id: 'bf4-16', name: 'Orchard: Krystal', cohortId: 'bf4' },
  { id: 'bf4-17', name: 'Osman: Abdulqaliq', cohortId: 'bf4' },
  { id: 'bf4-18', name: 'Patel: Keanne', cohortId: 'bf4' },
  { id: 'bf4-19', name: 'Raj: Sonia', cohortId: 'bf4' },
  { id: 'bf4-20', name: 'Selvaramesh: Kashmila', cohortId: 'bf4' },
];

// ─── Helper Functions ────────────────────────────────────────

export function getTeacherById(id) {
  return TEACHERS.find(t => t.id === id) || null;
}

export function getCohortById(id) {
  return COHORTS.find(c => c.id === id) || null;
}

export function getCohortFullName(cohortId) {
  const cohort = getCohortById(cohortId);
  if (!cohort) return 'Unknown';
  return `${cohort.year} ${cohort.qualification} — ${cohort.name}`;
}

export function getCohortShortName(cohortId) {
  const cohort = getCohortById(cohortId);
  if (!cohort) return 'Unknown';
  const qual = cohort.course === 'extended' ? 'Ext Dip' : 'Found Dip';
  return `${cohort.name} (${qual} ${cohort.year})`;
}

export function getStudentsByCohort(cohortId) {
  return STUDENTS.filter(s => s.cohortId === cohortId);
}

export function getStudentById(id) {
  return STUDENTS.find(s => s.id === id) || null;
}

// Get all cohorts a teacher has access to (via teaching assignments)
export function getCohortsByTeacher(teacherId) {
  const teacher = getTeacherById(teacherId);
  if (!teacher) return [];
  // HoD sees all cohorts
  if (teacher.isHoD) return COHORTS;
  const cohortIds = [...new Set(
    TEACHING_ASSIGNMENTS
      .filter(ta => ta.teacherId === teacherId)
      .map(ta => ta.cohortId)
  )];
  return cohortIds.map(id => getCohortById(id)).filter(Boolean);
}

// Get all unit numbers a teacher delivers to a specific cohort
export function getUnitsByTeacherAndCohort(teacherId, cohortId) {
  return TEACHING_ASSIGNMENTS
    .filter(ta => ta.teacherId === teacherId && ta.cohortId === cohortId)
    .map(ta => ta.unitNumber);
}

// Get all teachers assigned to a specific unit+cohort (supports co-teaching)
export function getTeachersForUnitCohort(unitNumber, cohortId) {
  return TEACHING_ASSIGNMENTS
    .filter(ta => ta.unitNumber === unitNumber && ta.cohortId === cohortId)
    .map(ta => getTeacherById(ta.teacherId))
    .filter(Boolean);
}

// Check if a teacher can see a submission (teaches that unit to that cohort, or is HoD)
export function canTeacherSeeSubmission(teacherId, unitNumber, cohortId) {
  const teacher = getTeacherById(teacherId);
  if (!teacher) return false;
  if (teacher.isHoD) return true;
  return TEACHING_ASSIGNMENTS.some(
    ta => ta.teacherId === teacherId && ta.unitNumber === unitNumber && ta.cohortId === cohortId
  );
}

// Get all students a teacher has access to
export function getStudentsByTeacher(teacherId) {
  const cohorts = getCohortsByTeacher(teacherId);
  const cohortIds = cohorts.map(c => c.id);
  return STUDENTS.filter(s => cohortIds.includes(s.cohortId));
}
