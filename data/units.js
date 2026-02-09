// BTEC National Business — Unit Specifications
// Extracted from: btecnationals-bus-fdip-spec.pdf (Foundation Diploma, Issue 14, April 2023)
//                  Delivery Guides zip (Issue 1, September 2018)
// v2.1 — February 2026
//
// Priority coursework units: 1, 4, 5, 8, 14, 17, 19, 22, 27
// Unit 5 is Extended Diploma only — criteria sourced from delivery guide

export const UNITS = {

  // ═══════════════════════════════════════════════════════════
  // UNIT 1: EXPLORING BUSINESS
  // ═══════════════════════════════════════════════════════════
  1: {
    number: 1,
    title: 'Exploring Business',
    type: 'internal',
    glh: 90,
    level: 3,
    brief: 'Learners study the purposes of different businesses, their structure, the effect of the external environment, and how they need to be dynamic and innovative to survive.',
    learningAims: {
      A: 'Explore the features of different businesses and analyse what makes them successful',
      B: 'Investigate how businesses are organised',
      C: 'Examine the environment in which businesses operate',
      D: 'Examine business markets',
      E: 'Investigate the role and contribution of innovation and enterprise to business success',
    },
    maxAssignments: 3,
    assignmentGroupings: [
      { label: 'A and B', criteria: ['A.P1', 'A.P2', 'B.P3', 'A.M1', 'B.M2', 'AB.D1'] },
      { label: 'C and D', criteria: ['C.P4', 'C.P5', 'D.P6', 'C.M3', 'D.M4', 'C.D2', 'D.D3'] },
      { label: 'E', criteria: ['E.P7', 'E.M5', 'E.D4'] },
    ],
    criteria: {
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
    assessmentDecisions: {
      A: {
        pass: 'Learners will explain how two contrasting businesses operate, identifying features including ownership, scope, stakeholder relationships, and organisational structures.',
        merit: 'Learners will assess stakeholder relationships with independent research, going beyond description to consider how stakeholder communication affects business success.',
        distinction: 'Learners will evaluate the reasons for success of both businesses, reflecting on gathered evidence and making substantiated judgements.',
      },
      CD: {
        pass: 'Learners will discuss the business environment using appropriate analytical tools such as SWOT, PESTLE, and Porter\'s Five Forces.',
        merit: 'Learners will assess how environmental factors and market changes affect the business, with supported analysis.',
        distinction: 'Learners will evaluate the overall impact of the business environment and market changes, making justified predictions about future responses.',
      },
      E: {
        pass: 'Learners will explore how innovation and enterprise contribute to business success with examples.',
        merit: 'Learners will analyse the effectiveness of innovation and enterprise strategies used by a given business.',
        distinction: 'Learners will justify the use of innovation and enterprise with reference to changing market conditions and environmental factors.',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // UNIT 4: MANAGING AN EVENT
  // ═══════════════════════════════════════════════════════════
  4: {
    number: 4,
    title: 'Managing an Event',
    type: 'internal',
    glh: 90,
    level: 3,
    brief: 'Learners work in groups to plan and run a real business or social enterprise event.',
    learningAims: {
      A: 'Explore the role of an event organiser',
      B: 'Investigate the feasibility of a proposed event',
      C: 'Develop a detailed plan for a business or social enterprise event',
      D: 'Stage and manage a business or social enterprise event',
      E: 'Reflect on the running of the event and evaluate own skills development',
    },
    maxAssignments: 3,
    assignmentGroupings: [
      { label: 'A', criteria: ['A.P1', 'A.P2', 'A.M1', 'A.D1'] },
      { label: 'B and C', criteria: ['B.P3', 'B.P4', 'C.P5', 'C.P6', 'B.M2', 'C.M3', 'BC.D2'] },
      { label: 'D and E', criteria: ['D.P7', 'E.P8', 'D.M4', 'E.M5', 'DE.D3'] },
    ],
    criteria: {
      'A.P1': { grade: 'Pass', text: 'Explain the role and skills required to be an effective event organiser.' },
      'A.P2': { grade: 'Pass', text: 'Investigate own skills in the form of a skills audit.' },
      'A.M1': { grade: 'Merit', text: 'Analyse own skills against those required by an event organiser, highlighting areas for development.' },
      'A.D1': { grade: 'Distinction', text: 'Fully justify how own skills match those of an event organiser.' },
      'B.P3': { grade: 'Pass', text: 'Investigate the staging of several events to determine common success factors.' },
      'B.P4': { grade: 'Pass', text: 'Explain the chosen event idea, including reasons for choice.' },
      'C.P5': { grade: 'Pass', text: 'Explain factors that need to be considered when producing a detailed plan for the proposed event.' },
      'C.P6': { grade: 'Pass', text: 'Produce a detailed plan for your chosen event using planning tools, detailed budget and consideration of risk assessment and contingency planning.' },
      'B.M2': { grade: 'Merit', text: 'Assess the feasibility of the event proposal.' },
      'C.M3': { grade: 'Merit', text: 'Analyse the key factors that need to be considered when producing a plan for an event.' },
      'BC.D2': { grade: 'Distinction', text: 'Evaluate and justify the feasibility of the plan, tools, budget and risk, making any required contingency adjustments.' },
      'D.P7': { grade: 'Pass', text: 'Stage an event, demonstrating some relevant management skills.' },
      'E.P8': { grade: 'Pass', text: 'Review the success of the event in meeting aims and objectives, achieving targets and receiving good feedback from stakeholders.' },
      'D.M4': { grade: 'Merit', text: 'Demonstrate effective and safe management skills when organising and staging an event.' },
      'E.M5': { grade: 'Merit', text: 'Analyse the planning and running of the event, how risks and contingencies were managed, making recommendations for future improvements.' },
      'DE.D3': { grade: 'Distinction', text: 'Justify how own contribution has contributed to a successful outcome of the event by the demonstration of outstanding management skills throughout the arranging and staging of an event.' },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // UNIT 5: INTERNATIONAL BUSINESS
  // (Extended Diploma only — not in Foundation Diploma spec)
  // ═══════════════════════════════════════════════════════════
  5: {
    number: 5,
    title: 'International Business',
    type: 'internal',
    glh: 90,
    level: 3,
    qualification: 'Extended Diploma',
    brief: 'Learners study how UK businesses develop strategies to trade globally. Learners will also consider the factors that influence the implementation of these strategies.',
    learningAims: {
      A: 'Explore the international context for business operations',
      B: 'Investigate the international economic environment in which business operates',
      C: 'Investigate the external factors that influence international businesses',
      D: 'Investigate the cultural factors that influence international businesses',
      E: 'Examine the strategic and operational approaches to developing international trade',
    },
    maxAssignments: 3,
    assignmentGroupings: [
      { label: 'A and B', criteria: ['A.P1', 'A.P2', 'B.P3', 'B.P4', 'A.M1', 'B.M2', 'AB.D1'] },
      { label: 'C and D', criteria: ['C.P5', 'C.P6', 'D.P7', 'C.M3', 'D.M4', 'C.D2', 'D.D3'] },
      { label: 'E', criteria: ['E.P8', 'E.M5', 'E.D4'] },
    ],
    criteria: {
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
        pass: 'Learners will identify the similarities and differences in international business operations between two businesses. The characteristics of target markets should be identified, showing the impact on business operations and management practices.',
        merit: 'Learners will show they have selected relevant research sources, identifying similarities and differences in approach to engaging in international business. They will consider how strategies adopted impact on business structure.',
        distinction: 'Learners will prepare individual reports incorporating a wide range of research evidence evaluating the impact of globalisation on a particular business over a period of five to ten years, with careful consideration of all relevant factors.',
      },
      CD: {
        pass: 'Learners will explain the external factors that influence the business and the support systems available to manage them. Consideration will also be given to the cultural factors affecting the businesses in both countries.',
        merit: 'Learners will carry out a situational analysis on two different countries, considering the impact of external influences, international business support systems, and how cultural differences might affect international trading.',
        distinction: 'Learners will present a case study incorporating a wide range of research evidence. Based on their situational analysis, learners will recommend with justification one suitable country for a business to trade with internationally. The case study will also evaluate the impact of cultural differences.',
      },
      E: {
        pass: 'Learners will study an international business in either manufacturing or service sector, reviewing the product portfolio and how different elements need to be adapted when trading in different markets.',
        merit: 'Learners will analyse the business strategy for product development aimed at an international market, identifying different strategies for different market conditions with regard to resource implications.',
        distinction: 'Learners will present a research study incorporating evidence from relevant sources, with careful consideration of all factors impacting business decisions regarding changes to the product portfolio. An analysis of resource effectiveness and evaluation of strategic decisions will be included.',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // UNIT 8: RECRUITMENT AND SELECTION PROCESS
  // ═══════════════════════════════════════════════════════════
  8: {
    number: 8,
    title: 'Recruitment and Selection Process',
    type: 'internal',
    glh: 60,
    level: 3,
    brief: 'Learners examine how effective recruitment and selection contribute to business success, undertake recruitment activities and reflect on their performance.',
    learningAims: {
      A: 'Examine how effective recruitment and selection contribute to business success',
      B: 'Undertake a recruitment activity to demonstrate the processes leading to a successful job offer',
      C: 'Reflect on the recruitment and selection process and your individual performance',
    },
    maxAssignments: 2,
    assignmentGroupings: [
      { label: 'A', criteria: ['A.P1', 'A.P2', 'A.M1', 'A.D1'] },
      { label: 'B and C', criteria: ['B.P3', 'B.P4', 'C.P5', 'C.P6', 'B.M2', 'C.M3', 'B.D2', 'C.D3'] },
    ],
    criteria: {
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
    assessmentDecisions: {
      A: {
        pass: 'Learners will explain recruitment and selection processes of a large business, covering job descriptions, person specifications, advertising, shortlisting, interviews and legal compliance.',
        merit: 'Learners will analyse the different methods used, comparing their effectiveness and suitability for different roles.',
        distinction: 'Learners will evaluate how recruitment processes contribute to business success, making substantiated judgements.',
      },
      BC: {
        pass: 'Learners will prepare recruitment documentation (job description, person specification, application form, interview questions) and participate in mock interviews as both interviewer and interviewee. They will complete a SWOT analysis and skills development plan.',
        merit: 'Learners will demonstrate analytical questioning and responses in interviews, and analyse how their skills development will contribute to future success.',
        distinction: 'Learners will evaluate the quality of their documentation, interview performance, and the overall process against best practice.',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // UNIT 14: INVESTIGATING CUSTOMER SERVICE
  // ═══════════════════════════════════════════════════════════
  14: {
    number: 14,
    title: 'Investigating Customer Service',
    type: 'internal',
    glh: 60,
    level: 3,
    brief: 'Learners explore how effective customer service contributes to business success, investigate methods used to improve customer service, and demonstrate customer service skills.',
    learningAims: {
      A: 'Explore how effective customer service contributes to business success',
      B: 'Investigate the methods used to improve customer service in a business',
      C: 'Demonstrate customer service in different situations, using appropriate behaviours to meet expectations',
    },
    maxAssignments: 2,
    assignmentGroupings: [
      { label: 'A and B', criteria: ['A.P1', 'A.P2', 'B.P3', 'A.M1', 'B.M2', 'A.D1', 'B.D2'] },
      { label: 'C', criteria: ['C.P4', 'C.P5', 'C.P6', 'C.M3', 'C.D3'] },
    ],
    criteria: {
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

  // ═══════════════════════════════════════════════════════════
  // UNIT 17: DIGITAL MARKETING
  // ═══════════════════════════════════════════════════════════
  17: {
    number: 17,
    title: 'Digital Marketing',
    type: 'internal',
    glh: 60,
    level: 3,
    brief: 'Learners examine the role of digital marketing within the broader marketing mix, investigate the effectiveness of existing digital marketing campaigns, and develop a digital marketing campaign.',
    learningAims: {
      A: 'Examine the role of digital marketing within the broader marketing mix',
      B: 'Investigate the effectiveness of existing digital marketing campaigns',
      C: 'Develop a digital marketing campaign for a selected product or brand',
    },
    maxAssignments: 2,
    assignmentGroupings: [
      { label: 'A and B', criteria: ['A.P1', 'A.P2', 'B.P3', 'B.P4', 'B.P5', 'A.M1', 'B.M2', 'A.D1', 'B.D2'] },
      { label: 'C', criteria: ['C.P6', 'C.M3', 'C.D3'] },
    ],
    criteria: {
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

  // ═══════════════════════════════════════════════════════════
  // UNIT 19: PITCHING FOR A NEW BUSINESS
  // ═══════════════════════════════════════════════════════════
  19: {
    number: 19,
    title: 'Pitching for a New Business',
    type: 'internal',
    glh: 60,
    level: 3,
    brief: 'Learners explore potential ideas for a micro-business start-up, develop a business plan and carry out a pitch for funding.',
    learningAims: {
      A: 'Explore potential ideas for a micro-business start-up',
      B: 'Develop a business plan for a viable micro-business start-up',
      C: 'Carry out a pitch for funding for the chosen micro-business',
    },
    maxAssignments: 2,
    assignmentGroupings: [
      { label: 'A', criteria: ['A.P1', 'A.P2', 'A.M1', 'A.D1'] },
      { label: 'B and C', criteria: ['B.P3', 'B.P4', 'C.P5', 'C.P6', 'B.M2', 'C.M3', 'B.D2', 'C.D3'] },
    ],
    criteria: {
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

  // ═══════════════════════════════════════════════════════════
  // UNIT 22: MARKET RESEARCH
  // ═══════════════════════════════════════════════════════════
  22: {
    number: 22,
    title: 'Market Research',
    type: 'internal',
    glh: 60,
    level: 3,
    brief: 'Learners examine the different aspects of market research used by businesses. They will undertake a research project, interpret their findings and produce a report.',
    learningAims: {
      A: 'Examine the types of market research used in business',
      B: 'Plan and implement a market research activity to meet a specific marketing objective',
      C: 'Analyse and present market research findings and recommend process improvements',
    },
    maxAssignments: 3,
    assignmentGroupings: [
      { label: 'A', criteria: ['A.P1', 'A.M1', 'A.D1'] },
      { label: 'B', criteria: ['B.P2', 'B.P3', 'B.P4', 'B.M2', 'B.D2'] },
      { label: 'C', criteria: ['C.P5', 'C.M3', 'C.D3'] },
    ],
    criteria: {
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
        merit: 'Learners will analyse their final plan, consider the methods chosen and their suitability for the stated purpose. Pilot data will be collected and changes will be made to the plan before learners undertake the actual research. The analysis will cover the type of data to be collected and include both primary and secondary methods. The sampling plan will include sample type and size.',
        distinction: 'Learners will plan a small-scale market research activity for a stated purpose. They will carry out a pilot survey, evaluate the effectiveness of their pilot research and recommend improvements to be made prior to undertaking the final market research activity. Both pilot and final research findings must be provided as an appendix.',
      },
      C: {
        pass: 'Learners will present a basic interpretation of the research data using at least two different formats and two statistical techniques.',
        merit: 'Learners will use a wide range of statistical analysis techniques to fully interpret the findings of the market research data collected, and present these findings using charts, tables and diagrams to show the outcomes of the data analysis.',
        distinction: 'Learners will produce a short report that assesses the limitations of the data collected in terms of its accuracy, subjectivity, bias and reliability. The report must go on to judge the effectiveness of the process undertaken in terms of meeting the research/marketing objectives, and to make recommendations for improvements based on the experience gained.',
      },
    },
    content: {
      A1: {
        title: 'Purpose of market research',
        points: ['Understand customer behaviour', 'Determine buying trends', 'Investigate brand/advertising awareness', 'Aid new product development', 'Investigate feasibility of entry into new markets', 'To meet marketing objectives'],
      },
      A2: {
        title: 'Types of research',
        points: ['Qualitative and quantitative', 'Secondary research: internal (loyalty schemes, EPOS, website monitoring, accounting records, specialist agencies) and external (internet, government statistics, competitor reports, specialist agencies e.g. Mintel, Ipsos)', 'Primary research: surveys, observation, e-marketing, focus groups, pilot research'],
      },
      A3: {
        title: 'Appropriateness of choice of research',
        points: ['Cost', 'Accuracy', 'Timelines', 'Response rates'],
      },
      B1: {
        title: 'Planning stage',
        points: ['Problem definition', 'Set research objectives', 'Budget', 'Determine data to collect', 'Methods (secondary/primary, quantitative/qualitative)', 'Pilot questionnaire design (question type, sequencing, length, avoiding bias, relevance)', 'Pilot sampling plan', 'Probability sampling (random, systematic, stratified, cluster)', 'Non-probability sampling (quota, convenience, observation)', 'Sample size and confidence levels', 'Pilot research'],
      },
      B2: {
        title: 'Implementation stage',
        points: ['Review of pilot primary research', 'Final questionnaire design', 'Final sampling plan', 'Data collection (primary and secondary)'],
      },
      C1: {
        title: 'Statistical analysis and interpretation',
        points: ['Arithmetic mean, mode, median', 'Range and interquartile range', 'Standard deviation', 'Time series', 'Scatter diagrams and trends', 'Interpretation of secondary research'],
      },
      C2: {
        title: 'Presentation of research results',
        points: ['Reports, tables, graphs', 'Presentation of conclusions and recommendations', 'Awareness of audience type'],
      },
      C3: {
        title: 'Value of the information',
        points: ['Limitations: sufficiency, accuracy, bias, subjectivity, reliability of sample', 'Recommend improvements to the process'],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // UNIT 27: WORK EXPERIENCE IN BUSINESS
  // ═══════════════════════════════════════════════════════════
  27: {
    number: 27,
    title: 'Work Experience in Business',
    type: 'internal',
    glh: 60,
    level: 3,
    brief: 'Learners investigate opportunities for work-related learning, carry out work experience safely and appropriately, and reflect on how it influences personal and professional development.',
    learningAims: {
      A: 'Investigate opportunities for work-related learning',
      B: 'Carry out work experience in an appropriate and safe manner',
      C: 'Reflect on work experience undertaken and its influence on own personal and professional development',
    },
    maxAssignments: 2,
    assignmentGroupings: [
      { label: 'A and B', criteria: ['A.P1', 'A.P2', 'B.P3', 'B.P4', 'A.M1', 'B.M2', 'A.D1', 'B.D2'] },
      { label: 'C', criteria: ['C.P5', 'C.P6', 'C.M3', 'C.D3'] },
    ],
    criteria: {
      'A.P1': { grade: 'Pass', text: 'Describe three realistic opportunities for work experience in business and how each can prepare you for the workplace.' },
      'A.P2': { grade: 'Pass', text: 'Explain your preparation for a selected work experience opportunity.' },
      'B.P3': { grade: 'Pass', text: 'Complete a logbook which explains your role in a selected appropriate work experience.' },
      'B.P4': { grade: 'Pass', text: 'Describe in your logbook the activities you undertook in the workplace.' },
      'A.M1': { grade: 'Merit', text: 'Analyse the benefits of work experience and how it can support you in gaining a realistic understanding of opportunities in business.' },
      'B.M2': { grade: 'Merit', text: 'Analyse the importance of carrying out your role in a safe and appropriate manner.' },
      'A.D1': { grade: 'Distinction', text: 'Evaluate how preparing for work experience can support your understanding of the workplace and appropriate career opportunities.' },
      'B.D2': { grade: 'Distinction', text: 'Evaluate the effectiveness of the business\'s induction and health and safety practice, making recommendations for improvement.' },
      'C.P5': { grade: 'Pass', text: 'Review own strengths and areas for development during work experience.' },
      'C.P6': { grade: 'Pass', text: 'Identify improvements to be made to own personal and professional skills in response to feedback from work experience.' },
      'C.M3': { grade: 'Merit', text: 'Assess your performance during work experience, making recommendations for personal and professional development.' },
      'C.D3': { grade: 'Distinction', text: 'Evaluate your work experience, drawing reasoned conclusions as to how it can support your future career.' },
    },
  },
};

// ─── Helper Functions ────────────────────────────────────────

export function getUnitByNumber(num) {
  return UNITS[num] || null;
}

export function getUnitCriteria(unitNumber) {
  const unit = UNITS[unitNumber];
  if (!unit) return {};
  return unit.criteria;
}

export function getCriteriaForAssignment(unitNumber, assignmentLabel) {
  const unit = UNITS[unitNumber];
  if (!unit) return [];

  const grouping = unit.assignmentGroupings.find(g => g.label === assignmentLabel);
  if (!grouping) return [];

  return grouping.criteria.map(ref => ({
    ref,
    ...unit.criteria[ref],
  }));
}

export function getAssignmentGroupingForCriteria(unitNumber, criteriaRef) {
  const unit = UNITS[unitNumber];
  if (!unit) return null;

  return unit.assignmentGroupings.find(g => g.criteria.includes(criteriaRef)) || null;
}

// Get all criteria for a specific grade level
export function getCriteriaByGrade(unitNumber, grade) {
  const unit = UNITS[unitNumber];
  if (!unit) return [];

  return Object.entries(unit.criteria)
    .filter(([, c]) => c.grade === grade)
    .map(([ref, c]) => ({ ref, ...c }));
}

// Get the assessment decision guidance for a learning aim grouping
export function getAssessmentDecisions(unitNumber, groupingKey) {
  const unit = UNITS[unitNumber];
  if (!unit || !unit.assessmentDecisions) return null;
  return unit.assessmentDecisions[groupingKey] || null;
}

// Get all priority unit numbers
export function getPriorityUnits() {
  return Object.keys(UNITS).map(Number);
}
