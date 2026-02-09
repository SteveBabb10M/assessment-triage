// BTEC Units and Assignments
// Units included: those assigned in teaching assignments
// Exam units excluded from triage (no coursework to analyse)
//
// v2.1 — February 2026
// Added: Full assessment criteria from BTEC specs (Foundation Diploma Issue 14,
//        Extended Diploma Issue 15, April 2023) and delivery guides
// Changed: BF3 → BS3 cohort references

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
    ],
    // ── Spec Data ──
    learningAimDescriptions: {
      A: 'Explore the features of different businesses and analyse what makes them successful',
      B: 'Investigate how businesses are organised',
      C: 'Examine the environment in which businesses operate',
      D: 'Examine business markets',
      E: 'Investigate the role and contribution of innovation and enterprise to business success',
    },
    specCriteria: {
      'A.P1': { grade: 'Pass', text: 'Explain the features of two contrasting businesses.' },
      'A.P2': { grade: 'Pass', text: 'Explain how two contrasting businesses are influenced by stakeholders.' },
      'B.P3': { grade: 'Pass', text: 'Explore the organisation structures, aims and objectives of two contrasting businesses.' },
      'A.M1': { grade: 'Merit', text: 'Assess the relationship and communication with stakeholders of two contrasting businesses using independent research.' },
      'B.M2': { grade: 'Merit', text: 'Analyse how the structures of two contrasting businesses allow each to achieve its aims and objectives.' },
      'AB.D1': { grade: 'Distinction', text: 'Evaluate the reasons for the success of two contrasting businesses, reflecting on evidence gathered.' },
      'C.P4': { grade: 'Pass', text: 'Discuss the effect of internal, external and competitive environment on a given business.' },
      'C.P5': { grade: 'Pass', text: 'Select a variety of techniques to undertake a situational analysis of a given business.' },
      'D.P6': { grade: 'Pass', text: 'Explore how the market structure and influences on supply and demand affect the pricing and output decisions for a given business.' },
      'C.M3': { grade: 'Merit', text: 'Assess the effects of the business environment on a given business.' },
      'D.M4': { grade: 'Merit', text: 'Assess how a given business has responded to changes in the market.' },
      'C.D2': { grade: 'Distinction', text: 'Evaluate the extent to which the business environment affects a given business, using a variety of situational analysis techniques.' },
      'D.D3': { grade: 'Distinction', text: 'Evaluate how changes in the market have impacted on a given business and how this business may react to future changes.' },
      'E.P7': { grade: 'Pass', text: 'Explore how innovation and enterprise contribute to the success of a business.' },
      'E.M5': { grade: 'Merit', text: 'Analyse how successful the use of innovation and enterprise has been for a given business.' },
      'E.D4': { grade: 'Distinction', text: 'Justify the use of innovation and enterprise for a business in relation to its changing market and environment.' },
    },
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
    ],
    // ── Spec Data ──
    learningAimDescriptions: {
      A: 'Examine the types of market research used in business',
      B: 'Plan and implement a market research activity to meet a specific marketing objective',
      C: 'Analyse and present market research findings and recommend process improvements',
    },
    specCriteria: {
      'A.P1': { grade: 'Pass', text: 'Explain the range of market research methods used by a selected business.' },
      'A.M1': { grade: 'Merit', text: 'Assess, using suitable examples, how different market research methods are appropriate in helping a selected business to meet marketing objectives and inform decision making.' },
      'A.D1': { grade: 'Distinction', text: 'Justify the use of different market research methods used by a selected business to support its purpose for research.' },
      'B.P2': { grade: 'Pass', text: 'Undertake secondary research for a selected marketing objective.' },
      'B.P3': { grade: 'Pass', text: 'Undertake pilot primary market research and collect sample data.' },
      'B.P4': { grade: 'Pass', text: 'Undertake the final market research activity using a detailed sampling plan to obtain a range of secondary and primary data.' },
      'B.M2': { grade: 'Merit', text: 'Analyse the reasons for choosing particular research methods, the type of data to be collected and the sampling plan.' },
      'B.D2': { grade: 'Distinction', text: 'Evaluate the effectiveness of the pilot research, recommending improvements that could be made to the final market research activity.' },
      'C.P5': { grade: 'Pass', text: 'Interpret findings from the market research undertaken, presenting them in a range of different formats.' },
      'C.M3': { grade: 'Merit', text: 'Analyse the findings of the market research using a wide range of statistical techniques and comment on its limitations.' },
      'C.D3': { grade: 'Distinction', text: 'Assess the limitations of the data collected and justify research planning process improvements in light of the work undertaken.' },
    },
    assessmentDecisions: {
      A: {
        pass: 'Learners will include in their report examples of types of research used by a selected business. It will be fit for purpose, professional and written in appropriate business language. The report explains at least two primary and two secondary types of research for the business and will use realistic examples.',
        merit: 'Learners will assess the different types of research that can be used by a selected business that has different marketing objectives.',
        distinction: 'Learners will justify how different methods of market research clearly support the purpose of the research, the response will include appropriate examples throughout to support the justification.',
      },
      B: {
        pass: 'Learners will produce a plan for carrying out both primary and secondary research. At least two methods of each type must be included in the plan. Pilot data will be collected before learners undertake the actual research.',
        merit: 'Learners will analyse their final plan, consider the methods chosen and their suitability for the stated purpose. Pilot data will be collected and changes will be made to the plan before learners undertake the actual research.',
        distinction: 'Learners will plan a small-scale market research activity for a stated purpose. They will carry out a pilot survey, evaluate the effectiveness of their pilot research and recommend improvements prior to undertaking the final market research activity.',
      },
      C: {
        pass: 'Learners will present a basic interpretation of the research data using at least two different formats and two statistical techniques.',
        merit: 'Learners will use a wide range of statistical analysis techniques to fully interpret the findings of the market research data collected, and present these findings using charts, tables and diagrams.',
        distinction: 'Learners will produce a short report that assesses the limitations of the data collected in terms of its accuracy, subjectivity, bias and reliability. The report must judge the effectiveness of the process and make recommendations for improvements.',
      },
    },
  },
  // ─── Extended Diploma (Y2) ─────────────────────────────────
  unit5: {
    id: 'unit5', number: 5, title: 'International Business',
    course: 'extended', isExam: false,
    assignments: [
      { id: 'unit5-ab', name: 'Assignment A&B', learningAims: ['A', 'B'],
        criteria: ['P1', 'P2', 'P3', 'P4', 'M1', 'M2', 'D1'], handOut: '2025-09-15', handIn: '2025-10-06' },
      { id: 'unit5-cd', name: 'Assignment C&D', learningAims: ['C', 'D'],
        criteria: ['P5', 'P6', 'P7', 'M3', 'M4', 'D2', 'D3'], handOut: '2025-10-20', handIn: '2025-11-10' },
      { id: 'unit5-e', name: 'Assignment E', learningAims: ['E'],
        criteria: ['P8', 'M5', 'D4'], handOut: '2025-11-17', handIn: '2025-12-08' },
    ],
    // ── Spec Data (Extended Diploma Issue 15, April 2023) ──
    learningAimDescriptions: {
      A: 'Explore the international context for business operations',
      B: 'Investigate the international economic environment in which business operates',
      C: 'Investigate the external factors that influence international businesses',
      D: 'Investigate the cultural factors that influence international businesses',
      E: 'Examine the strategic and operational approaches to developing international trade',
    },
    specCriteria: {
      'A.P1': { grade: 'Pass', text: 'Explain why two businesses operate in contrasting international markets.' },
      'A.P2': { grade: 'Pass', text: 'Explain the types of finance available for international business.' },
      'B.P3': { grade: 'Pass', text: 'Explain the main features of globalisation that affect two contrasting businesses.' },
      'B.P4': { grade: 'Pass', text: 'Explore the role of trading blocs on international trade.' },
      'A.M1': { grade: 'Merit', text: 'Analyse the support that is available to contrasting businesses that operate internationally.' },
      'B.M2': { grade: 'Merit', text: 'Analyse the barriers of operating internationally for two contrasting businesses.' },
      'AB.D1': { grade: 'Distinction', text: 'Evaluate the impact of globalisation on a business.' },
      'C.P5': { grade: 'Pass', text: 'Explain the external factors that influence a selected business considering trading internationally.' },
      'C.P6': { grade: 'Pass', text: 'Explain how business support systems enable a selected business to trade internationally.' },
      'D.P7': { grade: 'Pass', text: 'Explore the cultural differences affecting international businesses.' },
      'C.M3': { grade: 'Merit', text: 'Carry out a situational analysis on two countries a selected business may consider trading in.' },
      'D.M4': { grade: 'Merit', text: 'Analyse how cultural differences affect international businesses.' },
      'C.D2': { grade: 'Distinction', text: 'Recommend one country that a selected business could target for international trade, justifying your decision.' },
      'D.D3': { grade: 'Distinction', text: 'Evaluate the impact of cultural differences on international business.' },
      'E.P8': { grade: 'Pass', text: 'Explain how products and processes have to be adapted for international markets by a selected business.' },
      'E.M5': { grade: 'Merit', text: 'Analyse the effectiveness of the strategies and resources used by a selected international business.' },
      'E.D4': { grade: 'Distinction', text: 'Evaluate the success of the strategies and resources used by a selected international business in one of its markets.' },
    },
    assessmentDecisions: {
      AB: {
        pass: 'Learners will identify the similarities and differences in international business operations between two businesses, showing the impact of target market characteristics on operations and management practices.',
        merit: 'Learners will select relevant research sources, identifying similarities and differences in approach and considering how strategies impact on business structure.',
        distinction: 'Learners will prepare individual reports incorporating a wide range of research evidence evaluating the impact of globalisation on a particular business over five to ten years.',
      },
      CD: {
        pass: 'Learners will explain external factors and support systems, with consideration of cultural factors in both countries.',
        merit: 'Learners will carry out situational analysis on two countries, considering external influences, support systems, and cultural differences.',
        distinction: 'Learners will present a case study recommending with justification one suitable country for international trade, evaluating the impact of cultural differences.',
      },
      E: {
        pass: 'Learners will study an international business, reviewing the product portfolio and how elements need to be adapted for different markets.',
        merit: 'Learners will analyse the business strategy for product development in an international market, identifying strategies for different market conditions.',
        distinction: 'Learners will present a research study evaluating the success of strategic decisions, with analysis of how effectively business resources are being used.',
      },
    },
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
    ],
    // ── Spec Data ──
    learningAimDescriptions: {
      A: 'Examine how effective recruitment and selection contribute to business success',
      B: 'Undertake a recruitment activity to demonstrate the processes leading to a successful job offer',
      C: 'Reflect on the recruitment and selection process and your individual performance',
    },
    specCriteria: {
      'A.P1': { grade: 'Pass', text: 'Explain how a large business recruits and selects giving reasons for their processes.' },
      'A.P2': { grade: 'Pass', text: 'Explain how and why a business adheres to recruitment processes which are ethical and comply with current employment law.' },
      'A.M1': { grade: 'Merit', text: 'Analyse the different recruitment methods used in a selected business.' },
      'A.D1': { grade: 'Distinction', text: 'Evaluate the recruitment processes used and how they contribute to the success of the selected business.' },
      'B.P3': { grade: 'Pass', text: 'Prepare appropriate documentation for use in selection and recruitment activities.' },
      'B.P4': { grade: 'Pass', text: 'Participate in the selection interviews, as an interviewer and interviewee.' },
      'B.M2': { grade: 'Merit', text: 'In recruitment interviews, demonstrate analytical responses and questioning to allow assessment of skills and knowledge.' },
      'B.D2': { grade: 'Distinction', text: 'Evaluate how well the documents prepared and participation in the interview activities supported the process for a job offer.' },
      'C.P5': { grade: 'Pass', text: 'Complete a SWOT analysis on your performance in the interviewing activities.' },
      'C.P6': { grade: 'Pass', text: 'Prepare a personal skills development plan for future interview situations.' },
      'C.M3': { grade: 'Merit', text: 'Analyse the results of the process and how your skills development will contribute to your future success.' },
      'C.D3': { grade: 'Distinction', text: 'Evaluate how well the recruitment and selection process complied with best practice, drawing reasoned conclusions as to how it will support your future career.' },
    },
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
    ],
    // ── Spec Data ──
    learningAimDescriptions: {
      A: 'Explore how effective customer service contributes to business success',
      B: 'Investigate the methods used to improve customer service in a business',
      C: 'Demonstrate customer service in different situations, using appropriate behaviours to meet expectations',
    },
    specCriteria: {
      'A.P1': { grade: 'Pass', text: 'Describe the different approaches to customer service delivery in different industries.' },
      'A.P2': { grade: 'Pass', text: 'Examine ways that customer service in a selected business can meet the expectations and satisfaction of customers and adhere to relevant current legislation and regulations.' },
      'B.P3': { grade: 'Pass', text: 'Research methods a business can use to make improvements to the customer service provision.' },
      'A.M1': { grade: 'Merit', text: 'Analyse how legislation and regulation impacts on customer service provision in a selected business.' },
      'B.M2': { grade: 'Merit', text: 'Analyse different methods of monitoring customer service for a product or service in a selected business.' },
      'A.D1': { grade: 'Distinction', text: 'Evaluate the importance for a selected business of providing excellent customer service and adhering to relevant current legislation and regulations.' },
      'B.D2': { grade: 'Distinction', text: 'Evaluate the benefits of improvements to customer service performance for the business, the customer, and the employee.' },
      'C.P4': { grade: 'Pass', text: 'Demonstrate communication and interpersonal skills appropriate to meet customer needs in different situations.' },
      'C.P5': { grade: 'Pass', text: 'Review own customer service skills, identifying gaps where improvements could be made.' },
      'C.P6': { grade: 'Pass', text: 'Present a clear, effective development plan for own customer service skills.' },
      'C.M3': { grade: 'Merit', text: 'Assess how the development plan may improve the performance of customer service skills.' },
      'C.D3': { grade: 'Distinction', text: 'Demonstrate initiative in making high-quality justified recommendations to develop own communication and interpersonal skills to meet both customer and business needs.' },
    },
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
    ],
    // ── Spec Data ──
    learningAimDescriptions: {
      A: 'Examine the role of digital marketing within the broader marketing mix',
      B: 'Investigate the effectiveness of existing digital marketing campaigns',
      C: 'Develop a digital marketing campaign for a selected product or brand',
    },
    specCriteria: {
      'A.P1': { grade: 'Pass', text: 'Explain the role of digital marketing as an extension of traditional marketing and the ways the messages can be delivered.' },
      'A.P2': { grade: 'Pass', text: 'Investigate the ways in which advertisers are targeting mobile device users.' },
      'B.P3': { grade: 'Pass', text: 'Discuss the digital strategies that a selected business uses to meet two different objectives.' },
      'B.P4': { grade: 'Pass', text: 'Outline different compensation models used in digital marketing.' },
      'B.P5': { grade: 'Pass', text: 'Explain the benefits of, and concerns about, digital marketing from the perspective of both the customer and the marketer.' },
      'A.M1': { grade: 'Merit', text: 'Analyse, using examples, the effectiveness of different digital delivery methods.' },
      'B.M2': { grade: 'Merit', text: 'Analyse the different digital strategies and compensation models used to create brand recognition and brand loyalty.' },
      'A.D1': { grade: 'Distinction', text: 'Justify the extent to which the digital environment is influencing consumer choices.' },
      'B.D2': { grade: 'Distinction', text: 'Evaluate the effectiveness of digital marketing campaigns from different businesses, and suggest ways to overcome concerns raised about digital marketing.' },
      'C.P6': { grade: 'Pass', text: 'Produce an outline for a digital marketing campaign that will create brand loyalty for a new or existing product or brand.' },
      'C.M3': { grade: 'Merit', text: 'Produce a detailed digital marketing campaign and demonstrate how it integrates into the wider marketing and promotional mix for a new or existing product or brand.' },
      'C.D3': { grade: 'Distinction', text: 'Produce creatively a digital marketing campaign, justifying the key decisions taken and potential improvements that could be used to create brand loyalty.' },
    },
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
    ],
    // ── Spec Data ──
    learningAimDescriptions: {
      A: 'Explore potential ideas for a micro-business start-up',
      B: 'Develop a business plan for a viable micro-business start-up',
      C: 'Carry out a pitch for funding for the chosen micro-business',
    },
    specCriteria: {
      'A.P1': { grade: 'Pass', text: 'Describe the potential business opportunities for a micro-business start-up.' },
      'A.P2': { grade: 'Pass', text: 'Review the factors that need to be considered to start up a micro-business.' },
      'A.M1': { grade: 'Merit', text: 'Analyse the internal and external factors associated with a selected micro-business start-up.' },
      'A.D1': { grade: 'Distinction', text: 'Evaluate the internal and external factors associated with a selected micro-business start-up.' },
      'B.P3': { grade: 'Pass', text: 'Explain your marketing plan for a selected micro-business.' },
      'B.P4': { grade: 'Pass', text: 'Explain how legal and financial aspects will affect the start-up of the business.' },
      'B.M2': { grade: 'Merit', text: 'Analyse the financial and marketing plans for your micro-business.' },
      'B.D2': { grade: 'Distinction', text: 'Evaluate your plan for a micro-business and justify your conclusions.' },
      'C.P5': { grade: 'Pass', text: 'Pitch for funding to start up a micro-business.' },
      'C.P6': { grade: 'Pass', text: 'Review the viability and risks of the start-up using audience feedback.' },
      'C.M3': { grade: 'Merit', text: 'Effectively present an individual pitch to negotiate funding for a micro-business start-up, analysing audience feedback and viability issues.' },
      'C.D3': { grade: 'Distinction', text: 'Demonstrate individual responsibility and effective self-management in the preparation, delivery and review of the presentation of a high-quality pitch.' },
    },
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

// ─── Spec Criteria Helpers ───────────────────────────────────

// Get the full spec criteria text for a criterion reference (e.g. 'P1') in context of a unit
export function getSpecCriterionText(unitId, criterionRef) {
  const unit = UNITS[unitId];
  if (!unit || !unit.specCriteria) return null;
  // Try direct match first (e.g. 'A.P1')
  if (unit.specCriteria[criterionRef]) return unit.specCriteria[criterionRef];
  // Search by short ref (e.g. 'P1' matches 'A.P1')
  const match = Object.entries(unit.specCriteria).find(([key]) => key.endsWith(`.${criterionRef}`));
  return match ? match[1] : null;
}

// Get all spec criteria for a specific assignment
export function getSpecCriteriaForAssignment(assignmentId) {
  const assignment = getAssignmentById(assignmentId);
  if (!assignment) return [];
  const unit = UNITS[assignment.unitId];
  if (!unit || !unit.specCriteria) return [];

  return assignment.criteria.map(shortRef => {
    const spec = getSpecCriterionText(assignment.unitId, shortRef);
    return {
      ref: shortRef,
      fullRef: spec ? Object.keys(unit.specCriteria).find(k => k.endsWith(`.${shortRef}`)) || shortRef : shortRef,
      grade: spec?.grade || 'Unknown',
      text: spec?.text || '',
    };
  });
}

// Get assessment decision guidance for a learning aim
export function getAssessmentDecisions(unitId, learningAimKey) {
  const unit = UNITS[unitId];
  if (!unit || !unit.assessmentDecisions) return null;
  return unit.assessmentDecisions[learningAimKey] || null;
}
