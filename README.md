# Assessment Triage v2.0

AI-powered assessment triage system for BTEC Business educators. Automatically analyses student submissions for originality concerns and criteria achievement, helping teachers prioritise their marking.

## How It Works

1. **Students submit** assignments in Microsoft Teams as normal
2. **Power Automate** detects the submission and sends it to this system
3. **AI analysis** generates a detailed originality report with section-by-section breakdown
4. **Teachers open the dashboard** to see which submissions need attention first (🔴🟡🟢)
5. **Marking happens in Teams** as normal — this system just prioritises the pile

**Zero change** to teacher or student workflow. The triage layer is invisible.

---

## Real Data (February 2026)

| | Count |
|---|---|
| **Teachers** | 8 (Simon Brown = HoD) |
| **Cohorts** | 4 (BS1, BS2 = Y2 Extended Diploma; BF3, BF4 = Y1 Foundation Diploma) |
| **Students** | 81 |
| **Teaching Assignments** | 14 (including 2 co-taught units) |
| **Units** | 7 coursework units across both qualifications |

### Co-teaching Support
Unit 19 (BS1) and Unit 14 (BS2) are co-taught by David Urquhart and Simon Brown. Both teachers see the same submissions on their dashboards.

---

## Assignment Naming Convention

For automatic matching from Teams, assignment titles should include a unit number:

| Title contains | Result |
|----------------|--------|
| Unit # + Assignment letter | ✓ Full analysis with criteria assessment |
| Unit # only | ✓ Ad hoc — originality analysis only, no criteria |
| No Unit # | ✗ Unmatched queue, requires resubmission or manual fix |

**Examples:**

| Works ✓ | Type |
|---------|------|
| `Unit 4 Assignment A` | Full analysis |
| `U4 Ass A` | Full analysis |
| `Unit 4a` | Full analysis |
| `Unit 8 Revision Task` | Ad hoc (originality only) |
| `Unit 22 Draft` | Ad hoc (originality only) |

| Doesn't work ✗ | Why |
|----------------|-----|
| `Planning an Event` | No unit number |
| `Assignment A` | No unit number |
| `Task 1` | No unit number |

The parser is **case insensitive** and handles common abbreviations. Ad hoc submissions get the full originality report (section analysis, AI phrase detection, vocabulary flags, etc.) but no criteria assessment since there's no marking guide.

---

## Deploy to Vercel

1. Push this code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variable:
   - `ANTHROPIC_API_KEY` = your API key from [console.anthropic.com](https://console.anthropic.com)
4. Click Deploy

## Connect Teams Assignments

See **[docs/TEAMS_INTEGRATION.md](docs/TEAMS_INTEGRATION.md)** for the full Power Automate setup guide.

## Test Manually

1. Open your deployed URL
2. Go to **Setup > Test Upload**
3. Select a cohort, student, and assignment
4. Upload a student .docx file
5. Click **Analyse Submission**
6. View the detailed report

## Teacher Views

- **Simon Brown (HoD)**: Sees all cohorts + Department overview
- **Steve Babb**: Sees Unit 8 (BS1, BS2), Unit 22 (BF3, BF4)
- **Amreen Shabir**: Sees Unit 5 (BS1), Unit 17 (BS1), Unit 1 (BF3)
- **Caroline Lawford**: Sees Unit 5 (BS2), Unit 17 (BS2), Unit 1 (BF4)
- **David Urquhart**: Sees Unit 19 (BS1), Unit 14 (BS2) — co-taught with Simon
- **Ashar Saeed, James Shaw, Catherine Pennington**: No assignments yet

---

## RAG Classification

| Flag | Trigger | Action |
|------|---------|--------|
| 🔴 **Review** | Originality < 80% OR Grade = Fail | Priority attention |
| 🟡 **Check** | Originality 80-90% OR Grade = Pass | Quick review |
| 🟢 **On Track** | Originality ≥ 90% AND Grade ≥ Merit | Mark with confidence |

## BTEC Grading Rules (Sequential Achievement)

```
All P + All M + All D = Distinction
All P + All M         = Merit
All P                 = Pass
Missing any P         = Fail
```

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
│   ├── staff.js                # Teachers, cohorts, students, teaching assignments
│   ├── units.js                # BTEC units & assignments
│   └── submissions.js          # Submission data & helpers
├── lib/
│   └── analysis.js             # AI analysis logic
└── README.md
```
