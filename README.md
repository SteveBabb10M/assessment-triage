# Assessment Triage

AI-powered assessment triage system for BTEC Business educators. Automatically analyzes student submissions for originality concerns and criteria achievement, helping teachers prioritize their marking.

## Features

- **🔴🟡🟢 RAG Triage** — Submissions automatically classified by priority
- **📊 Originality Analysis** — AI-powered detection of potential AI-generated content
- **📋 Criteria Assessment** — Automatic evaluation against BTEC criteria (P/M/D)
- **👤 Student Profiles** — Track individual student progress across all units
- **🏢 Department Overview** — Head of Department view of all groups and at-risk students
- **🖨️ Printable Reports** — Professional reports for records and discussions

## Quick Start

### 1. Deploy to Vercel

1. Push this code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variable:
   - `ANTHROPIC_API_KEY` = your API key from [console.anthropic.com](https://console.anthropic.com)
4. Click Deploy

### 2. Test It

1. Open your deployed URL
2. Go to **Setup > Test Upload**
3. Upload a student .docx file
4. Select a student and assignment
5. Click **Analyze Submission**
6. View the report

### 3. Show Colleagues

- Go to **Dashboard** to see the triage view
- Click on submissions to see full reports
- Click on students to see their profile across all units
- As "Teacher 1" (HoD), click **Department** to see the overview

---

## Demo Data

The system comes pre-loaded with:

- **5 Teachers** (Teacher 1 is Head of Department)
- **8 Groups** (4 Foundation Diploma, 4 Extended Diploma)
- **80 Students** (10 per group)
- **10 Sample Submissions** with various RAG statuses
- **All BTEC Units** from your assessment plans

---

## Project Structure

```
assessment-triage/
├── app/
│   ├── api/
│   │   ├── analyze/route.js    # AI analysis endpoint
│   │   └── webhook/route.js    # Power Automate webhook
│   ├── dashboard/
│   │   ├── page.js             # Main triage dashboard
│   │   ├── student/[id]/       # Student profile view
│   │   └── submission/[id]/    # Full report view
│   ├── setup/page.js           # Test upload & config
│   ├── layout.js               # Root layout with nav
│   ├── page.js                 # Redirects to dashboard
│   └── globals.css             # Styles
├── data/
│   ├── units.js                # BTEC units & assignments
│   ├── demo.js                 # Teachers, groups, students
│   └── submissions.js          # Submission data & helpers
├── lib/
│   └── analysis.js             # AI analysis logic
├── docs/
│   └── UX_SPECIFICATION.md     # Full UX spec
└── README.md
```

---

## RAG Classification

| Flag | Trigger | Action |
|------|---------|--------|
| 🔴 **Review** | Originality < 80% OR Grade = Fail | Priority attention |
| 🟡 **Check** | Originality 80-90% OR Grade = Pass | Quick review |
| 🟢 **On Track** | Originality ≥ 90% AND Grade ≥ Merit | Mark with confidence |

### At Risk Definition

A student is flagged "At Risk" if:
- Any submission has originality score below 80%
- Any submission has estimated grade of Fail (P criteria not met)

---

## BTEC Grading Rules

The system follows BTEC sequential achievement:

```
All P + All M + All D = Distinction
All P + All M         = Merit
All P                 = Pass
Missing any P         = Fail
```

---

## Teams Integration (Phase 2)

To connect student submissions from Teams:

### Step 1: Create Microsoft Form

Create a form with:
- Student Name (dropdown)
- Group (dropdown)  
- Assignment (dropdown)
- Upload Work (file)

### Step 2: Create Power Automate Flow

1. Trigger: "When a new response is submitted"
2. Action: Get file content from SharePoint
3. Action: HTTP POST to `https://your-app.vercel.app/api/webhook`

### Step 3: Webhook Payload

```json
{
  "studentName": "Student 1",
  "studentId": "student1",
  "assignmentId": "unit1-ab",
  "fileName": "submission.docx",
  "fileContent": "<base64>"
}
```

### Step 4: Teams Notifications

Configure Power Automate to post the analysis result back to a Teams channel.

---

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local with your ANTHROPIC_API_KEY
cp .env.example .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## Privacy & Data

- **Files stay in SharePoint** — The system reads content but doesn't store files
- **Text sent to Claude** — For AI analysis (same as Turnitin sending to their servers)
- **Reports stored** — Analysis results only, not original submissions
- **GDPR** — For production, ensure appropriate DPA with Anthropic

---

## Next Steps

1. **Pilot** — Test with your department
2. **Feedback** — Gather teacher input
3. **Database** — Add Supabase for persistent storage
4. **Teams Integration** — Connect Power Automate
5. **Real Data** — Replace demo data with actual teachers/students

---

## Support

Built for BTEC Business Studies educators. For questions or issues, contact the developer.
