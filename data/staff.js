// Real department data — populated from Assessment_Triage_Data_Template.xlsx
// Generated: March 2026

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
  { id: 'bs1-y2', name: 'BS1-Y2', qualification: 'BTEC L3 National Extended Diploma', course: 'extended', year: 'Y2' },
  { id: 'bs2-y2', name: 'BS2-Y2', qualification: 'BTEC L3 National Extended Diploma', course: 'extended', year: 'Y2' },
  { id: 'bs3-y2', name: 'BS3-Y2', qualification: 'BTEC L3 National Extended Diploma', course: 'extended', year: 'Y2' },
  { id: 'bs4-y2', name: 'BS4-Y2', qualification: 'BTEC L3 National Extended Diploma', course: 'extended', year: 'Y2' },
  { id: 'bs1-y1', name: 'BS1-Y1', qualification: 'BTEC L3 National Foundation Diploma', course: 'foundation', year: 'Y1' },
  { id: 'bs2-y1', name: 'BS2-Y1', qualification: 'BTEC L3 National Foundation Diploma', course: 'foundation', year: 'Y1' },
  { id: 'bs3-y1', name: 'BS3-Y1', qualification: 'BTEC L3 National Foundation Diploma', course: 'foundation', year: 'Y1' },
  { id: 'bs4-y1', name: 'BS4-Y1', qualification: 'BTEC L3 National Foundation Diploma', course: 'foundation', year: 'Y1' },
  { id: 'mn1-y1', name: 'MN1-Y1', qualification: 'T Level Management and Administration', course: 'tlevel-management', year: 'Y1' },
  { id: 'mn1-y2', name: 'MN1-Y2', qualification: 'T Level Management and Administration', course: 'tlevel-management', year: 'Y2' },
];

// ─── Teaching Assignments ────────────────────────────────────
// Maps teacher → unit → cohort (supports co-teaching)
// Unit 99 = Ad Hoc (originality-only analysis, no criteria matching)
export const TEACHING_ASSIGNMENTS = [
  // ── Standard assignments ──────────────────────────────────
  { teacherId: 'ams', unitNumber: 1,  cohortId: 'bs1-y1' },
  { teacherId: 'ams', unitNumber: 1,  cohortId: 'bs2-y1' },
  { teacherId: 'ams', unitNumber: 5,  cohortId: 'bs1-y2' },
  { teacherId: 'ams', unitNumber: 17, cohortId: 'bs1-y2' },
  { teacherId: 'ams', unitNumber: 22, cohortId: 'bs1-y1' },
  { teacherId: 'ams', unitNumber: 22, cohortId: 'bs2-y1' },
  { teacherId: 'asd', unitNumber: 4,  cohortId: 'bs4-y1' },
  { teacherId: 'asd', unitNumber: 8,  cohortId: 'bs3-y2' },
  { teacherId: 'asd', unitNumber: 8,  cohortId: 'bs4-y2' },
  { teacherId: 'asd', unitNumber: 14, cohortId: 'bs3-y2' },
  { teacherId: 'asd', unitNumber: 14, cohortId: 'bs4-y2' },
  { teacherId: 'cla', unitNumber: 1,  cohortId: 'bs3-y1' },
  { teacherId: 'cla', unitNumber: 1,  cohortId: 'bs4-y1' },
  { teacherId: 'cla', unitNumber: 5,  cohortId: 'bs2-y2' },
  { teacherId: 'cla', unitNumber: 17, cohortId: 'bs2-y2' },
  { teacherId: 'cla', unitNumber: 27, cohortId: 'bs3-y1' },
  { teacherId: 'cla', unitNumber: 27, cohortId: 'bs4-y1' },
  { teacherId: 'cpe', unitNumber: 1,  cohortId: 'mn1-y1' },
  { teacherId: 'cpe', unitNumber: 1,  cohortId: 'mn1-y2' },
  { teacherId: 'cpe', unitNumber: 4,  cohortId: 'bs2-y1' },
  { teacherId: 'cpe', unitNumber: 5,  cohortId: 'bs2-y2' },
  { teacherId: 'cpe', unitNumber: 22, cohortId: 'bs4-y1' },
  { teacherId: 'dau', unitNumber: 4,  cohortId: 'bs2-y1' },
  { teacherId: 'dau', unitNumber: 4,  cohortId: 'bs4-y1' },
  { teacherId: 'dau', unitNumber: 14, cohortId: 'bs1-y2' },
  { teacherId: 'dau', unitNumber: 19, cohortId: 'bs1-y2' },
  { teacherId: 'jas', unitNumber: 14, cohortId: 'bs2-y2' },
  { teacherId: 'jas', unitNumber: 14, cohortId: 'bs4-y2' },
  { teacherId: 'jas', unitNumber: 19, cohortId: 'bs2-y2' },
  { teacherId: 'jas', unitNumber: 19, cohortId: 'bs4-y2' },
  { teacherId: 'sbo', unitNumber: 19, cohortId: 'bs3-y2' },
  { teacherId: 'sba', unitNumber: 8,  cohortId: 'bs1-y2' },
  { teacherId: 'sba', unitNumber: 8,  cohortId: 'bs2-y2' },
  { teacherId: 'sba', unitNumber: 22, cohortId: 'bs3-y1' },
  { teacherId: 'sba', unitNumber: 22, cohortId: 'bs4-y1' },
  // ── Ad Hoc (Unit 99) ──────────────────────────────────────
  { teacherId: 'ams', unitNumber: 99, cohortId: 'bs1-y1' },
  { teacherId: 'ams', unitNumber: 99, cohortId: 'bs1-y2' },
  { teacherId: 'ams', unitNumber: 99, cohortId: 'bs2-y1' },
  { teacherId: 'asd', unitNumber: 99, cohortId: 'bs3-y2' },
  { teacherId: 'asd', unitNumber: 99, cohortId: 'bs4-y1' },
  { teacherId: 'asd', unitNumber: 99, cohortId: 'bs4-y2' },
  { teacherId: 'cla', unitNumber: 99, cohortId: 'bs2-y2' },
  { teacherId: 'cla', unitNumber: 99, cohortId: 'bs3-y1' },
  { teacherId: 'cla', unitNumber: 99, cohortId: 'bs4-y1' },
  { teacherId: 'cpe', unitNumber: 99, cohortId: 'bs2-y1' },
  { teacherId: 'cpe', unitNumber: 99, cohortId: 'bs2-y2' },
  { teacherId: 'cpe', unitNumber: 99, cohortId: 'bs4-y1' },
  { teacherId: 'cpe', unitNumber: 99, cohortId: 'mn1-y1' },
  { teacherId: 'cpe', unitNumber: 99, cohortId: 'mn1-y2' },
  { teacherId: 'dau', unitNumber: 99, cohortId: 'bs1-y2' },
  { teacherId: 'dau', unitNumber: 99, cohortId: 'bs2-y1' },
  { teacherId: 'dau', unitNumber: 99, cohortId: 'bs4-y1' },
  { teacherId: 'jas', unitNumber: 99, cohortId: 'bs2-y2' },
  { teacherId: 'jas', unitNumber: 99, cohortId: 'bs4-y2' },
  { teacherId: 'sbo', unitNumber: 99, cohortId: 'bs3-y2' },
  { teacherId: 'sba', unitNumber: 99, cohortId: 'bs1-y2' },
  { teacherId: 'sba', unitNumber: 99, cohortId: 'bs2-y2' },
  { teacherId: 'sba', unitNumber: 99, cohortId: 'bs3-y1' },
  { teacherId: 'sba', unitNumber: 99, cohortId: 'bs4-y1' },
];

// ─── Students ────────────────────────────────────────────────
export const STUDENTS = [
  // BS1-Y2
  { id: 'bs1-y2-01', name: 'Alli: Hassan', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-02', name: 'Ashrif: Maliha', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-03', name: 'Bechachria: Mohamed', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-04', name: 'Bharat: Prayas', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-05', name: 'Bharatkumar: Mahek', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-06', name: 'DSilva: Sofia Lourenco', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-07', name: 'Haidari: Hussain', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-08', name: 'Hussain: Yaqeen', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-09', name: 'Itesh: Aksh', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-10', name: 'Jenti: Rusik', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-11', name: 'Mahmood: Muhammad Imaad', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-12', name: 'Noormohamed: Anwar', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-13', name: 'Padda: Tarndeep', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-14', name: 'Patel: Dhvani', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-15', name: 'Patel: Neel', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-16', name: 'Rashid: Qays', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-17', name: 'Sankhla: Raksha', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-18', name: 'Shaban: Didar', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-19', name: 'Sharma: Sumit', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-20', name: 'Sokolov: Vasil', cohortId: 'bs1-y2' },
  { id: 'bs1-y2-21', name: 'Tandel: Param', cohortId: 'bs1-y2' },
  // BS2-Y1
  { id: 'bs2-y1-01', name: 'Ahmed: Maryam', cohortId: 'bs2-y1' },
  { id: 'bs2-y1-02', name: 'Basten: Qusay', cohortId: 'bs2-y1' },
  { id: 'bs2-y1-03', name: 'Bhatt: Dev', cohortId: 'bs2-y1' },
  { id: 'bs2-y1-04', name: 'Gill: Tia', cohortId: 'bs2-y1' },
  { id: 'bs2-y1-05', name: 'Jignesh: Monika', cohortId: 'bs2-y1' },
  { id: 'bs2-y1-06', name: 'Kaur: Kimmi', cohortId: 'bs2-y1' },
  { id: 'bs2-y1-07', name: 'Kritikos: Christo', cohortId: 'bs2-y1' },
  { id: 'bs2-y1-08', name: 'Lazin: Elias', cohortId: 'bs2-y1' },
  { id: 'bs2-y1-09', name: 'Mohammed Farook: Fathima', cohortId: 'bs2-y1' },
  { id: 'bs2-y1-10', name: 'Negi: Nupur', cohortId: 'bs2-y1' },
  { id: 'bs2-y1-11', name: 'Parekh: Krishna', cohortId: 'bs2-y1' },
  { id: 'bs2-y1-12', name: 'Patel: Ayaan', cohortId: 'bs2-y1' },
  { id: 'bs2-y1-13', name: 'Patel: Faheema', cohortId: 'bs2-y1' },
  { id: 'bs2-y1-14', name: 'Pirbhai: Kais', cohortId: 'bs2-y1' },
  { id: 'bs2-y1-15', name: 'Ratilal: Dhruvi', cohortId: 'bs2-y1' },
  { id: 'bs2-y1-16', name: 'Sarwari: Umar', cohortId: 'bs2-y1' },
  { id: 'bs2-y1-17', name: 'Shaikh: Aairah', cohortId: 'bs2-y1' },
  { id: 'bs2-y1-18', name: 'Valdez: Karly', cohortId: 'bs2-y1' },
  { id: 'bs2-y1-19', name: 'Vijay: Dhruvi', cohortId: 'bs2-y1' },
  // BS2-Y2
  { id: 'bs2-y2-01', name: 'Awan: Nail', cohortId: 'bs2-y2' },
  { id: 'bs2-y2-02', name: 'Da Cruz: Maisa', cohortId: 'bs2-y2' },
  { id: 'bs2-y2-03', name: 'Jagdish: Neelkanth', cohortId: 'bs2-y2' },
  { id: 'bs2-y2-04', name: 'Jagdish: Neev', cohortId: 'bs2-y2' },
  { id: 'bs2-y2-05', name: 'Kanti: Meghakxi', cohortId: 'bs2-y2' },
  { id: 'bs2-y2-06', name: 'Kasu: Alisha', cohortId: 'bs2-y2' },
  { id: 'bs2-y2-07', name: 'Kaur: Esha', cohortId: 'bs2-y2' },
  { id: 'bs2-y2-08', name: 'Khan: Rehan', cohortId: 'bs2-y2' },
  { id: 'bs2-y2-09', name: 'Maisuria: Dhruv', cohortId: 'bs2-y2' },
  { id: 'bs2-y2-10', name: 'Mwembamba: Suleiman', cohortId: 'bs2-y2' },
  { id: 'bs2-y2-11', name: 'Patel: Eesaa', cohortId: 'bs2-y2' },
  { id: 'bs2-y2-12', name: 'Patel: Mahima Jiteshkumar', cohortId: 'bs2-y2' },
  { id: 'bs2-y2-13', name: 'Perkuszewska: Victoria', cohortId: 'bs2-y2' },
  { id: 'bs2-y2-14', name: 'Rahman: Gm Asafur', cohortId: 'bs2-y2' },
  { id: 'bs2-y2-15', name: 'Rahsid Dawood: Saif', cohortId: 'bs2-y2' },
  { id: 'bs2-y2-16', name: 'Ram: Vishal', cohortId: 'bs2-y2' },
  { id: 'bs2-y2-17', name: 'Rezaei: Maisam', cohortId: 'bs2-y2' },
  { id: 'bs2-y2-18', name: 'Shantilal: Dipen', cohortId: 'bs2-y2' },
  // BS3-Y1
  { id: 'bs3-y1-01', name: 'Abdi: Muzamil', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-02', name: 'Billa: Lovejit', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-03', name: 'Demco: Sebastian', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-04', name: 'Gaffar: Hisham', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-05', name: 'Ibrahim: Zayd', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-06', name: 'Joni: Santiago', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-07', name: 'Mahmadsajid: Zaid', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-08', name: 'Mahomed: Naval', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-09', name: 'Moataz: Rayan', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-10', name: 'Mohamed: Kawsar', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-11', name: 'Mudukuti: Takunda', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-12', name: 'Mushapaidze: Golden', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-13', name: 'Omar: Abdisalam', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-14', name: 'Owan: Raphael', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-15', name: 'Pravinkumar: Aryan', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-16', name: 'Rakesh: Neel', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-17', name: 'Ravji: Himesh', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-18', name: 'Shantu: Nirmal', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-19', name: 'Sidik: Zayan', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-20', name: 'Thaarick Mohamed: Adam', cohortId: 'bs3-y1' },
  { id: 'bs3-y1-21', name: 'Vinod: Siddhi', cohortId: 'bs3-y1' },
  // BS3-Y2
  { id: 'bs3-y2-01', name: 'Basran: Treena', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-02', name: 'Chudasama: Minal', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-03', name: 'Dada: Daniel', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-04', name: 'Darr: Abdullah', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-05', name: 'Dhindsa Singh: Harshit', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-06', name: 'Dhiru: Sagar', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-07', name: 'Farid: Umair', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-08', name: 'Gobina: Gobina', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-09', name: 'Gunawardana: Neha', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-10', name: 'Jayesh: Neev', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-11', name: 'Kaji: Bilal', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-12', name: 'Karavadra: Shivam', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-13', name: 'Keshav: Krishna', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-14', name: 'Menshi: Prajay', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-15', name: 'Nkumba: Karl', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-16', name: 'Parmar: Veena', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-17', name: 'Patel: Rheya', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-18', name: 'Ramji: Nikil', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-19', name: 'Sajjan: Aran', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-20', name: 'Shaikh: Ibrahim', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-21', name: 'Shaikh: Sheefa', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-22', name: 'Singh: Pawandeep', cohortId: 'bs3-y2' },
  { id: 'bs3-y2-23', name: 'Tandel: Daxh', cohortId: 'bs3-y2' },
  // BS4-Y1
  { id: 'bs4-y1-01', name: 'Ahmed: Ahmed', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-02', name: 'Allana: Aaishah', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-03', name: 'Amar: Kajal', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-04', name: 'Baria: Heli', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-05', name: 'Bawani: Erik', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-06', name: 'Contractor: Ameer', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-07', name: 'Devgi: Manav', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-08', name: 'Fryekh: Leyna', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-09', name: 'Gani: Ammarah', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-10', name: 'Hiteshkumar: Trushtika', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-11', name: 'Imtihaz: Sahil', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-12', name: 'Karelia: Ronak', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-13', name: 'Modhwadia: Pruthvi', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-14', name: 'Naresh: Jenish', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-15', name: 'Nerway: Aroz', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-16', name: 'Orchard: Krystal', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-17', name: 'Osman: Abdulqaliq', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-18', name: 'Patel: Keanne', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-19', name: 'Raj: Sonia', cohortId: 'bs4-y1' },
  { id: 'bs4-y1-20', name: 'Selvaramesh: Kashmila', cohortId: 'bs4-y1' },
  // BS4-Y2
  { id: 'bs4-y2-01', name: 'Abdule: Suhayb', cohortId: 'bs4-y2' },
  { id: 'bs4-y2-02', name: 'Bhaven: Hitik', cohortId: 'bs4-y2' },
  { id: 'bs4-y2-03', name: 'Biring: Veer', cohortId: 'bs4-y2' },
  { id: 'bs4-y2-04', name: 'Kalpesh: Tanish', cohortId: 'bs4-y2' },
  { id: 'bs4-y2-05', name: 'Mahmmod: Shaz', cohortId: 'bs4-y2' },
  { id: 'bs4-y2-06', name: 'Mallhi: Sanya', cohortId: 'bs4-y2' },
  { id: 'bs4-y2-07', name: 'Mukesh: Aryan', cohortId: 'bs4-y2' },
  { id: 'bs4-y2-08', name: 'Noor: Salil', cohortId: 'bs4-y2' },
  { id: 'bs4-y2-09', name: 'Pandor: Ammira', cohortId: 'bs4-y2' },
  { id: 'bs4-y2-10', name: 'Paresh: Urvashi', cohortId: 'bs4-y2' },
  { id: 'bs4-y2-11', name: 'Patel: Bilaal', cohortId: 'bs4-y2' },
  { id: 'bs4-y2-12', name: 'Ramchandra: Aadi', cohortId: 'bs4-y2' },
  { id: 'bs4-y2-13', name: 'Uddin: Essa', cohortId: 'bs4-y2' },
  { id: 'bs4-y2-14', name: 'Waghela: Shruti', cohortId: 'bs4-y2' },
  { id: 'bs4-y2-15', name: 'Zaid: Yaseen', cohortId: 'bs4-y2' },
  // BS1-Y1
  { id: 'bs1-y1-01', name: 'Babu: Aditya', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-02', name: 'Chowdhury: Hamzah', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-03', name: 'Ishak: Omar', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-04', name: 'Kadri: Kazim', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-05', name: 'Kassam: Zayyan', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-06', name: 'Kaur: Kiranbir', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-07', name: 'Mahendra: Ankit', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-08', name: 'Osman: Hamza', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-09', name: 'Pankaj: Nihal', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-10', name: 'Patel: Radhika', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-11', name: 'Raje: Khaleesah', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-12', name: 'Sanjay: Manthan', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-13', name: 'Saram: Muhammad', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-14', name: 'Shashikant: Dhrumil', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-15', name: 'Shashikant: Vikesh', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-16', name: 'Shatishkumar: Nirali', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-17', name: 'Soma: Kinjal', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-18', name: 'Vaja: Dhruv', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-19', name: 'Wiish: Abdi', cohortId: 'bs1-y1' },
  { id: 'bs1-y1-20', name: 'Yala: Mahmoud', cohortId: 'bs1-y1' },
  // MN1-Y1 (T Level Y1)
  { id: 'mn1-y1-01', name: 'Kishor, Bhavisha', cohortId: 'mn1-y1' },
  { id: 'mn1-y1-02', name: 'March, Ben', cohortId: 'mn1-y1' },
  { id: 'mn1-y1-03', name: 'Patel, Niyam', cohortId: 'mn1-y1' },
  { id: 'mn1-y1-04', name: 'Sarkoziova, Rosalinda', cohortId: 'mn1-y1' },
  // MN1-Y2 (T Level Y2)
  { id: 'mn1-y2-01', name: 'Adil, Tamanna', cohortId: 'mn1-y2' },
  { id: 'mn1-y2-02', name: 'Govaria, Saarah', cohortId: 'mn1-y2' },
  { id: 'mn1-y2-03', name: 'Ibrahim, Amreen', cohortId: 'mn1-y2' },
  { id: 'mn1-y2-04', name: 'Jussab, Sameer', cohortId: 'mn1-y2' },
  { id: 'mn1-y2-05', name: 'Makulova, Sofie', cohortId: 'mn1-y2' },
  { id: 'mn1-y2-06', name: 'Muthumari, Priya', cohortId: 'mn1-y2' },
  { id: 'mn1-y2-07', name: 'Singh, Miroslav', cohortId: 'mn1-y2' },
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
  const qualMap = {
    'extended': 'Ext Dip',
    'foundation': 'Found Dip',
    'tlevel-management': 'T Level',
  };
  const qual = qualMap[cohort.course] || cohort.qualification;
  return `${cohort.name} (${qual} ${cohort.year})`;
}

export function getStudentsByCohort(cohortId) {
  return STUDENTS.filter(s => s.cohortId === cohortId);
}

export function getStudentById(id) {
  return STUDENTS.find(s => s.id === id) || null;
}

export function getCohortsByTeacher(teacherId) {
  const teacher = getTeacherById(teacherId);
  if (!teacher) return [];
  if (teacher.isHoD) return COHORTS;
  const cohortIds = [...new Set(
    TEACHING_ASSIGNMENTS
      .filter(ta => ta.teacherId === teacherId)
      .map(ta => ta.cohortId)
  )];
  return cohortIds.map(id => getCohortById(id)).filter(Boolean);
}

export function getUnitsByTeacherAndCohort(teacherId, cohortId) {
  return TEACHING_ASSIGNMENTS
    .filter(ta => ta.teacherId === teacherId && ta.cohortId === cohortId)
    .map(ta => ta.unitNumber);
}

export function getTeachersForUnitCohort(unitNumber, cohortId) {
  return TEACHING_ASSIGNMENTS
    .filter(ta => ta.unitNumber === unitNumber && ta.cohortId === cohortId)
    .map(ta => getTeacherById(ta.teacherId))
    .filter(Boolean);
}

export function canTeacherSeeSubmission(teacherId, unitNumber, cohortId) {
  const teacher = getTeacherById(teacherId);
  if (!teacher) return false;
  if (teacher.isHoD) return true;
  return TEACHING_ASSIGNMENTS.some(
    ta => ta.teacherId === teacherId && ta.unitNumber === unitNumber && ta.cohortId === cohortId
  );
}

export function getStudentsByTeacher(teacherId) {
  const cohorts = getCohortsByTeacher(teacherId);
  const cohortIds = cohorts.map(c => c.id);
  return STUDENTS.filter(s => cohortIds.includes(s.cohortId));
}
