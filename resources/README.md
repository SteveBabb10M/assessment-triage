# Assignment Resources

This folder contains guidance documents, exemplars, and assignment briefs that the Assessment Triage system uses when analysing student submissions. When a submission is analysed, the system loads any resources matching the assignment and includes them as context — this allows the AI to:

- Assess whether the student has followed the scaffolding and guidance provided
- Recognise structural patterns that come from exemplars (and distinguish these from AI generation)
- Give more accurate criteria assessments based on what was actually taught
- Provide feedback that aligns with the frameworks students are familiar with (PEEL, evaluation structures, etc.)

## Folder Structure

Each assignment gets a subfolder named by its assignment ID (matching `data/units.js`):

```
resources/
├── unit8-a/                    ← Unit 8: Recruitment & Selection, Assignment A
│   ├── brief.md                ← Assignment brief with criteria breakdown
│   ├── scaffolding.md          ← Student workbook / guidance framework
│   └── exemplar.md             ← WAGOLL / model answer (annotated)
│
├── unit22-a/                   ← Unit 22: Market Research, Assignment A
│   ├── brief.md
│   ├── scaffolding.md
│   └── exemplar.md
│
└── README.md                   ← This file
```

## File Naming Convention

- **`brief.md`** — The assignment brief: task description, criteria being assessed, what students are asked to produce. Can include the criteria wording from the specification.
- **`scaffolding.md`** — The guidance framework / student workbook: writing frames, PEEL structures, sentence starters, section guides, the describe-explain-evaluate pathway, any colour-coded grade guidance.
- **`exemplar.md`** — WAGOLL (What A Good One Looks Like): annotated model answers showing what Pass/Merit/Distinction work looks like. Include annotations explaining why each section meets criteria.

## How to Add Resources

1. Create a subfolder matching the assignment ID from `data/units.js` (e.g. `unit22-a`)
2. Add one or more `.md` files using the names above
3. Push to GitHub — resources are loaded at analysis time from the filesystem
4. You don't need all three files — the system uses whatever is available

## Format Tips

- Use Markdown for readability
- Include criteria codes (P1, M1, D1) where relevant
- For exemplars, use annotations like `[PASS: This meets P1 because...]`
- For scaffolding, include the actual frameworks you taught (PEEL structure, evaluation templates)
- Keep each file under ~3000 words to stay within analysis token limits

## Assignment IDs Reference

| Assignment ID | Unit | Assignment |
|---------------|------|------------|
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
