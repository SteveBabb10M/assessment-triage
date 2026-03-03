# Teams Assignments Integration — Power Automate Setup Guide

This guide walks you through connecting Microsoft Teams Assignments to the Assessment Triage system using Power Automate.

---

## Overview

When a student submits work through Teams Assignments, Power Automate will:
1. Detect the submission automatically
2. Extract the student name and assignment title
3. Download the submitted file
4. Send it to the Assessment Triage webhook for analysis
5. (Optional) Post the RAG result back to a Teams channel

**No change required** to how teachers set assignments or students submit work.

---

## Prerequisites

- Power Automate access (included with most Microsoft 365 education licenses)
- Premium connector access OR Power Automate per-user license (for HTTP actions)
- Your Assessment Triage deployment URL
- Access to Teams Assignments in your classes

---

## Step 1: Create New Flow

1. Go to [make.powerautomate.com](https://make.powerautomate.com)
2. Click **+ Create** → **Automated cloud flow**
3. Name it: `Assessment Triage - Teams Submissions`
4. Search for trigger: **"When an assignment submission is turned in"**
5. Select the **Microsoft Teams (Education)** connector
6. Click **Create**

---

## Step 2: Configure the Trigger

In the trigger configuration:

| Field | Setting |
|-------|---------|
| Class | Select a specific class OR leave blank for all classes |
| Assignment | Leave blank to capture all assignments |

**Tip:** You can create separate flows per class, or one flow for everything. One flow is simpler to maintain.

---

## Step 3: Get Submission Details

Add action: **Get submission details** (Microsoft Teams Education)

| Field | Value |
|-------|-------|
| Class ID | `triggerOutputs()?['body/classId']` |
| Assignment ID | `triggerOutputs()?['body/assignmentId']` |
| Submission ID | `triggerOutputs()?['body/id']` |

---

## Step 4: Get Assignment Details

Add action: **Get assignment details** (Microsoft Teams Education)

| Field | Value |
|-------|-------|
| Class ID | `triggerOutputs()?['body/classId']` |
| Assignment ID | `triggerOutputs()?['body/assignmentId']` |

This gives us the **assignment title** (e.g., "Unit 4 Assignment A").

---

## Step 5: Get Student Details

Add action: **Get user profile (V2)** (Office 365 Users)

| Field | Value |
|-------|-------|
| User (UPN) | `outputs('Get_submission_details')?['body/submittedBy/user/id']` |

This gives us the **student's display name**.

---

## Step 6: Get Submitted File

Add action: **Get file content** (SharePoint)

The submitted file is stored in SharePoint. You'll need to:

1. Add action: **Get resource from submission** (Microsoft Teams Education)
2. This returns the file location
3. Add action: **Get file content** (SharePoint) using that location

**Alternative:** If the resource action is tricky, you can:
1. Add a **Compose** action to extract the file URL from the submission details
2. Use **HTTP** action to download the file content

---

## Step 7: Send to Assessment Triage

Add action: **HTTP** (Premium)

| Field | Value |
|-------|-------|
| Method | `POST` |
| URI | `https://your-deployment.vercel.app/api/webhook` |
| Headers | `Content-Type`: `application/json` |
| Body | See below |

**Body (JSON):**

```json
{
  "studentName": "@{outputs('Get_user_profile_(V2)')?['body/displayName']}",
  "assignmentTitle": "@{outputs('Get_assignment_details')?['body/displayName']}",
  "fileName": "@{triggerOutputs()?['body/submittedResources'][0]['displayName']}",
  "fileContent": "@{base64(body('Get_file_content'))}",
  "className": "@{outputs('Get_assignment_details')?['body/classId']}"
}
```

---

## Step 8: (Optional) Post Result to Teams

Add a **Condition** to check the response, then post to a channel:

**Condition:** `outputs('HTTP')?['body/priorityFlag']` is equal to `red`

**If yes:** Add action **Post message in a chat or channel** (Microsoft Teams)

| Field | Value |
|-------|-------|
| Team | Your department team |
| Channel | e.g., "Assessment Alerts" |
| Message | `🔴 Review needed: @{outputs('Get_user_profile_(V2)')?['body/displayName']} submitted @{outputs('Get_assignment_details')?['body/displayName']}` |

You can add similar branches for yellow flags, or just alert on reds.

---

## Assignment Naming Convention

For automatic matching, assignment titles must include a unit number:

| Title contains | Result |
|----------------|--------|
| Unit # + Assignment letter | ✓ Full analysis with criteria assessment |
| Unit # only | ✓ Ad hoc — originality analysis only |
| No Unit # | ✗ Unmatched queue |

**Full analysis examples:**
- `Unit 4 Assignment A`
- `U4 Ass A`
- `Unit 4a`
- `unit 4 - assignment a`
- `U22 Assignment B`

**Ad hoc examples (originality only):**
- `Unit 8 Revision Task`
- `Unit 22 Draft`
- `U17 Practice`
- `Unit 5 Research Notes`

**Won't match:**
- `Planning an Event` (no unit number)
- `Assignment A` (no unit number)
- `Task 1` (no unit or assignment reference)

If an assignment can't be parsed (no unit number), it goes to the **Unmatched Submissions** queue. The student would need to resubmit with a corrected title, or a teacher can manually assign it.

---

## Testing

1. **Save** the flow
2. **Turn it on**
3. Go to Teams and submit a test assignment as a student (or have a student submit)
4. Check the flow run history in Power Automate
5. Check your Assessment Triage dashboard for the submission

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Flow doesn't trigger | Check the trigger is set to the correct class(es) |
| "Student not found" | Add the student to `data/staff.js` with their cohort |
| "Assignment not matched" | Check the assignment title follows the naming convention |
| File content empty | Check SharePoint permissions for the flow connection |
| HTTP action fails | Verify your deployment URL and that the API is running |

---

## Multiple Classes

**Option A: One flow for all**
- Leave the class filter blank in the trigger
- All submissions across all your classes flow through

**Option B: Flow per class**
- Create separate flows for each class
- Easier to debug, but more to maintain

**Option C: Flow per qualification**
- One flow for L3 Extended Diploma classes
- One flow for L3 Foundation Diploma classes
- Good middle ground

---

## Security Notes

- The webhook accepts submissions but requires students to exist in the system
- Unknown students go to the unmatched queue, not processed
- No student data is stored beyond what's needed for analysis
- File content is processed in memory, not permanently stored (in the basic version)

---

## Next Steps

Once the flow is running:

1. Monitor the first few submissions to ensure matching works
2. Add any missing students to the system
3. Train staff on the dashboard and report views
4. Consider the optional Teams notification for red flags
