# Assignment Resources

This folder contains teacher-specific guidance documents, exemplars, and assignment briefs. When a submission is analysed, the system loads resources from the uploading teacher's folder (or falls back to the cohort teacher's folder).

## Folder Structure

Each teacher gets a folder named as their **full name in lowercase with dots** (matching their login display name):

```
resources/
├── steve.babb/
│   ├── unit8-a-brief.md
│   ├── unit8-a-scaffolding.md
│   ├── unit8-a-exemplar.md
│   ├── unit22-a-brief.md
│   └── unit22-a-scaffolding.md
│
├── amreen.shabir/
│   ├── unit22-a-brief.md
│   └── unit22-a-scaffolding.md
│
└── README.md
```

## File Naming Convention

Files are named: `{assignmentId}-{type}.md`

- **`{assignmentId}-brief.md`** — Assignment brief with criteria breakdown
- **`{assignmentId}-scaffolding.md`** — Student guidance framework (writing frames, PEEL, grade-level guidance)
- **`{assignmentId}-exemplar.md`** — WAGOLL / annotated model answer

Examples:
- `unit8-a-brief.md` — Brief for Unit 8 Assignment A
- `unit22-a-scaffolding.md` — Scaffolding for Unit 22 Assignment A
- `unit5-ab-exemplar.md` — Exemplar for Unit 5 Assignment A&B

## How Resources Are Found

1. The system checks the **uploader's folder** first (the teacher who uploaded the submission)
2. If nothing found, it checks the **cohort teacher's folder** (the teacher assigned to that unit/cohort in the system)
3. If still nothing found, analysis proceeds without resources

This means each teacher's students are assessed against that teacher's own materials, not someone else's.

## How to Add Resources

1. Create a folder matching your display name: e.g. `steve.babb/`
2. Add `.md` files using the naming convention above
3. Push to GitHub — Vercel will redeploy automatically
4. You don't need all three file types — the system uses whatever is available

## Format Tips

- Use Markdown for readability
- Include criteria codes (P1, M1, D1) where relevant
- For exemplars, use annotations like `[PASS: This meets P1 because...]`
- For scaffolding, include the actual frameworks you taught (PEEL, evaluation templates)
- Keep each file under ~3000 words to stay within analysis token limits
- Convert Word docs to Markdown (or paste the text content)

## Teacher Folder Names

The folder name is your display name from the login system, lowercased with dots replacing spaces:

| Display Name | Folder Name |
|---|---|
| Steve Babb | `steve.babb` |
| Simon Brown | `simon.brown` |
| Amreen Shabir | `amreen.shabir` |
| Ashar Saeed | `ashar.saeed` |
| Caroline Lawford | `caroline.lawford` |
| David Urquhart | `david.urquhart` |

## Assignment IDs Reference

| ID | Unit | Assignment |
|---|---|---|
| unit1-ab | Unit 1: Exploring Business | Assignment A&B |
| unit1-cd | Unit 1: Exploring Business | Assignment C&D |
| unit1-e | Unit 1: Exploring Business | Assignment E |
| unit22-a | Unit 22: Market Research | Assignment A |
| unit22-b | Unit 22: Market Research | Assignment B |
| unit22-c | Unit 22: Market Research | Assignment C |
| unit5-ab | Unit 5: International Business | Assignment A&B |
| unit5-cd | Unit 5: International Business | Assignment C&D |
| unit5-e | Unit 5: International Business | Assignment E |
| unit8-a | Unit 8: Recruitment & Selection | Assignment A |
| unit8-b | Unit 8: Recruitment & Selection | Assignment B |
| unit8-c | Unit 8: Recruitment & Selection | Assignment C |
| unit14-a | Unit 14: Customer Service | Assignment A |
| unit14-b | Unit 14: Customer Service | Assignment B |
| unit14-c | Unit 14: Customer Service | Assignment C |
| unit17-a | Unit 17: Digital Marketing | Assignment A |
| unit17-b | Unit 17: Digital Marketing | Assignment B |
| unit17-c | Unit 17: Digital Marketing | Assignment C |
| unit19-a | Unit 19: Pitching for a New Business | Assignment A |
| unit19-b | Unit 19: Pitching for a New Business | Assignment B |
| unit19-c | Unit 19: Pitching for a New Business | Assignment C |
