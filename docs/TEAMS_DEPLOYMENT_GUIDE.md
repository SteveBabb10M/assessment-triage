# Assessment Triage — Teams Deployment Guide

## Y2-BS1: BTEC Level 3 Extended Diploma Business
### Team: GW - Business L3 National Ext Dip Y2 - BS1

### Overview

This guide walks through deploying Assessment Triage as a tab within the **GW - Business L3 National Ext Dip Y2 - BS1** Microsoft Teams team. Once deployed for this cohort, the same process can be repeated for any other cohort team.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  TEAMS: GW - Business L3 National Ext Dip Y2 - BS1  │
│                                                       │
│  ┌─────────────────┐  ┌──────────────────────────┐   │
│  │ General Channel  │  │ Staff Only Channel        │   │
│  │                  │  │ (private - teachers only)  │   │
│  │ • Assignment Tab │  │ • Triage Dashboard Tab     │   │
│  │   (submit work)  │  │ • Analysis notifications   │   │
│  └────────┬─────────┘  └──────────┬───────────────┘   │
│           │                        │                   │
└───────────┼────────────────────────┼───────────────────┘
            │                        │
            ▼                        ▼
    ┌───────────────┐      ┌─────────────────────┐
    │ Microsoft Form │      │ Assessment Triage    │
    │ (submission)   │─────▶│ App (Vercel)         │
    └───────────────┘      │                      │
            │    Power      │ • Analyses text      │
            │    Automate   │ • Generates report   │
            │               │ • Returns RAG + grade│
            ▼               └──────────┬──────────┘
    ┌───────────────┐                  │
    │ SharePoint     │                  │
    │ (files stay    │◀─────────────────┘
    │  here)         │    Reads text only,
    └───────────────┘    files never copied
```

---

## Step 1: Configure the Teams Team

Your team **GW - Business L3 National Ext Dip Y2 - BS1** should already exist. Check it has:

### Channels needed:
1. **General** — Where students will see the submission form
2. **Staff Only** (private channel) — Where teachers receive analysis reports

### To create the Staff Only channel:
1. Click the **...** next to the team name → **Add channel**
2. Name: `Staff Only`
3. Privacy: **Private — Accessible only to a specific group of people**
4. Add all teachers: Steve Babb, Teacher One team (AMS/CPE/YAR), Teacher Two team (DUR/SBR/JSH), Tina Ababio, Ashar Saeed
5. Do NOT add students

---

## Step 2: Add Assessment Triage as a Tab

### For the teacher dashboard:
1. Go to **Staff Only** channel
2. Click **+** (Add a tab) at the top
3. Select **Apps**
4. Search for **Website**
5. Name: `Assessment Triage`
6. URL: `https://assessment-triage.vercel.app/dashboard`
7. Click **Save**

### For student-facing (optional, for checking their own reports later):
Not recommended at this stage — keep analysis teacher-side only.

---

## Step 3: Create the Microsoft Form

### 3a. Create the Form
1. Go to **forms.office.com** (logged in with your college account)
2. Click **New Form**
3. Title: **Y2-BS1 Assignment Submission**
4. Description: *Submit your assignment work here. Your name is captured automatically from your login.*

### 3b. Add Fields

| # | Field Name | Type | Configuration |
|---|-----------|------|---------------|
| 1 | **Which assignment?** | Choice (dropdown) | See options below |
| 2 | **Upload your work** | File Upload | .docx only, 1 file max |
| 3 | **Confirm this is your own work** | Choice | Yes / No (required) |

### Assignment dropdown options (update as assignments are issued):

**Currently active / upcoming:**
```
Unit 8 - Assignment A: Evaluating Recruitment and Selection (Due: 23 Feb)
Unit 17 - Assignment A: Digital Marketing (Due: 2 Feb) [if still accepting]
Unit 19 - Assignment A: Pitching for a New Business (Due: 23 Feb)
```

**Add later as they're issued:**
```
Unit 8 - Assignment B: Documentation & Interviews (Due: 23 Mar)
Unit 8 - Assignment C: Reflection and Skills Development (Due: 27 Apr)
Unit 17 - Assignment B (Due: 2 Mar)
Unit 17 - Assignment C (Due: 30 Mar)
Unit 19 - Assignment B (Due: 23 Mar)
Unit 19 - Assignment C (Due: 27 Apr)
Unit 14 - Assignment A (Due: 22 May)
Unit 14 - Assignment B (Due: 1 Jun)
Unit 14 - Assignment C (Due: 15 Jun)
```

### 3c. Form Settings
1. Click **⚙️ Settings** (top right)
2. ✅ **Record name** — This auto-captures the student's login name
3. ✅ **One response per person** — Prevents duplicate submissions (can be turned off for resubmissions)
4. ✅ **Upload file** — Allow file uploads
5. Set **Start date** and **End date** to match assignment windows

### 3d. Embed in Teams
1. Go to the **General** channel in **GW - Business L3 National Ext Dip Y2 - BS1**
2. Click **+** (Add a tab)
3. Select **Apps**
4. Search for **Forms**
5. Choose **Add an existing form**
6. Select **Y2-BS1 Assignment Submission**
7. ✅ Tick **Collect responses**
8. Click **Save**

Students now see the submission form as a tab in their team.

---

## Step 4: Create the Power Automate Flow

### 4a. Create the Flow
1. Go to **flow.microsoft.com**
2. Click **Create** → **Automated cloud flow**
3. Name: `Y2-BS1 Assessment Triage`
4. Trigger: **When a new response is submitted** (Microsoft Forms)
5. Select your form: **Y2-BS1 Assignment Submission**

### 4b. Flow Steps

```
Step 1: TRIGGER — When a new response is submitted
         Form: Y2-BS1 Assignment Submission

Step 2: ACTION — Get response details
         Form: Y2-BS1 Assignment Submission
         Response ID: (dynamic content from trigger)

Step 3: ACTION — Get file content
         Site: your SharePoint site
         File: (dynamic content — file upload field)

Step 4: ACTION — HTTP POST
         Method: POST
         URI: https://assessment-triage.vercel.app/api/webhook
         Headers:
           Content-Type: application/json
         Body: (see below)

Step 5: ACTION — Post adaptive card to Teams
         Team: GW - Business L3 National Ext Dip Y2 - BS1
         Channel: Staff Only
         Card: (see below)
```

### 4c. HTTP POST Body

```json
{
  "studentName": "@{outputs('Get_response_details')?['body/responder']}",
  "studentEmail": "@{outputs('Get_response_details')?['body/responderemail']}",
  "assignmentId": "@{outputs('Get_response_details')?['body/ASSIGNMENT_FIELD_ID']}",
  "fileName": "@{outputs('Get_response_details')?['body/FILE_FIELD_ID']}",
  "fileContent": "@{base64(body('Get_file_content'))}"
}
```

**IMPORTANT — Assignment ID Mapping:**

The dropdown text needs to map to system IDs. Add a **Condition** or **Switch** step:

| Form Dropdown Text | System Assignment ID |
|---|---|
| Unit 8 - Assignment A: Evaluating Recruitment and Selection | `unit8-a` |
| Unit 8 - Assignment B: Documentation & Interviews | `unit8-b` |
| Unit 8 - Assignment C: Reflection and Skills Development | `unit8-c` |
| Unit 17 - Assignment A | `unit17-a` |
| Unit 17 - Assignment B | `unit17-b` |
| Unit 17 - Assignment C | `unit17-c` |
| Unit 19 - Assignment A | `unit19-a` |
| Unit 19 - Assignment B | `unit19-b` |
| Unit 19 - Assignment C | `unit19-c` |
| Unit 14 - Assignment A | `unit14-a` |
| Unit 14 - Assignment B | `unit14-b` |
| Unit 14 - Assignment C | `unit14-c` |

### 4d. Teams Notification Card

After the HTTP action returns, post this to the Staff Only channel:

```json
{
  "type": "AdaptiveCard",
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "version": "1.4",
  "body": [
    {
      "type": "ColumnSet",
      "columns": [
        {
          "type": "Column",
          "width": "auto",
          "items": [
            {
              "type": "TextBlock",
              "text": "🔴",
              "size": "ExtraLarge",
              "isSubtle": false
            }
          ]
        },
        {
          "type": "Column",
          "width": "stretch",
          "items": [
            {
              "type": "TextBlock",
              "text": "New Submission Analysed",
              "weight": "Bolder",
              "size": "Medium"
            },
            {
              "type": "TextBlock",
              "text": "@{body('HTTP')?['summary']?['student']}",
              "spacing": "None"
            }
          ]
        }
      ]
    },
    {
      "type": "FactSet",
      "facts": [
        { "title": "Assignment", "value": "@{body('HTTP')?['summary']?['assignment']}" },
        { "title": "RAG Status", "value": "@{body('HTTP')?['summary']?['rag']}" },
        { "title": "Originality", "value": "@{body('HTTP')?['summary']?['originalityScore']}%" },
        { "title": "Est. Grade", "value": "@{body('HTTP')?['summary']?['estimatedGrade']}" },
        { "title": "Flags", "value": "@{body('HTTP')?['summary']?['flagCount']}" }
      ]
    },
    {
      "type": "TextBlock",
      "text": "@{body('HTTP')?['summary']?['overallSummary']}",
      "wrap": true,
      "spacing": "Medium"
    }
  ],
  "actions": [
    {
      "type": "Action.OpenUrl",
      "title": "View Full Report",
      "url": "https://assessment-triage.vercel.app@{body('HTTP')?['summary']?['reportUrl']}"
    }
  ]
}
```

**Note:** Replace the 🔴 emoji dynamically:
- If RAG = RED → 🔴
- If RAG = AMBER → 🟡
- If RAG = GREEN → 🟢

Use a **Condition** step before posting to set the emoji.

---

## Step 5: Test the Flow

1. Open the **General** channel in **GW - Business L3 National Ext Dip Y2 - BS1**
2. Click the **Y2-BS1 Assignment Submission** tab
3. Fill in the form as a test:
   - Assignment: Unit 8 - Assignment A
   - Upload: a test .docx file
   - Confirm own work: Yes
4. Submit
5. Check:
   - ✅ File appears in SharePoint
   - ✅ Power Automate flow runs (check flow.microsoft.com → My flows)
   - ✅ Analysis report appears in Staff Only channel
   - ✅ Report is viewable via the dashboard tab

---

## Step 6: Repeat for Other Cohorts

To deploy for another cohort team:

1. **Duplicate the Form** — Change the title and assignment options
2. **Duplicate the Power Automate flow** — Update the form trigger and team/channel references
3. **Update the app data** — Add the new cohort's students to `data/demo.js`
4. **Add tabs** — Same process as Step 2

Each cohort team operates independently. Teachers who teach across cohorts will see all their groups in the dashboard.

---

## Student Roster: Y2-BS1 (22 students)

These are auto-captured from login, but for reference:

| # | Student Name |
|---|---|
| 1 | Hassan Alli |
| 2 | Maliha Ashrif |
| 3 | Mohamed Bechachria |
| 4 | Prayas Bharat |
| 5 | Mahek Bharatkumar |
| 6 | David Urquhart |
| 7 | Sofia Lourenco DSilva |
| 8 | Hussain Haidari |
| 9 | Yaqeen Hussain |
| 10 | Aksh Itesh |
| 11 | Rusik Jenti |
| 12 | Muhammad Imaad Mahmood |
| 13 | Anwar Noormohamed |
| 14 | Tarndeep Padda |
| 15 | Dhvani Patel |
| 16 | Neel Patel |
| 17 | Qays Rashid |
| 18 | Raksha Sankhla |
| 19 | Didar Shaban |
| 20 | Sumit Sharma |
| 21 | Vasil Sokolov |
| 22 | Param Tandel |

---

## Assessment Calendar

| Assignment | Unit | Hand Out | Hand In | Resubmission |
|---|---|---|---|---|
| Unit 8 - A | Recruitment & Selection | 9 Feb 2026 | 23 Feb 2026 | 17 Mar 2026 |
| Unit 8 - B | Recruitment & Selection | 9 Mar 2026 | 23 Mar 2026 | 13 Apr 2026 |
| Unit 8 - C | Recruitment & Selection | 6 Apr 2026 | 27 Apr 2026 | 18 May 2026 |
| Unit 17 - A | Digital Marketing | 19 Jan 2026 | 2 Feb 2026 | 19 Feb 2026 |
| Unit 17 - B | Digital Marketing | 16 Feb 2026 | 2 Mar 2026 | 19 Mar 2026 |
| Unit 17 - C | Digital Marketing | 16 Mar 2026 | 30 Mar 2026 | 27 Apr 2026 |
| Unit 19 - A | Pitching for a New Business | 9 Feb 2026 | 23 Feb 2026 | 16 Mar 2026 |
| Unit 19 - B | Pitching for a New Business | 9 Mar 2026 | 23 Mar 2026 | 13 Apr 2026 |
| Unit 19 - C | Pitching for a New Business | 6 Apr 2026 | 27 Apr 2026 | 18 May 2026 |
| Unit 14 - A | Investigating Customer Service | 11 May 2026 | 22 May 2026 | 8 Jun 2026 |
| Unit 14 - B | Investigating Customer Service | 22 May 2026 | 1 Jun 2026 | 18 Jun 2026 |
| Unit 14 - C | Investigating Customer Service | 1 Jun 2026 | 15 Jun 2026 | 27 Jun 2026 |

---

## Environment Variables (Vercel)

| Variable | Value | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Your Claude API key |

For college deployment, this would be changed to the college's own API key.

---

## Data Governance Notes

**Current (pilot):**
- Student files stored in Teams/SharePoint only
- Text content extracted and sent to Anthropic (Claude) for analysis
- Analysis reports stored in Vercel (in-memory, resets on redeploy)
- No persistent student data stored externally

**Future (college-wide):**
- Move to Azure OpenAI (text stays within Microsoft ecosystem)
- Reports stored in Azure SQL or SharePoint
- Full GDPR compliance within college M365 tenant
