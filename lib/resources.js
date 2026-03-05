// Resource Loader — Teacher-Specific
// Reads guidance documents from /resources/{teacher.name}/{assignmentId}-{type}.md
// Lookup order: uploader's folder first, then cohort teacher's folder as fallback

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { getTeachersForUnitCohort } from '../data/staff';
import { getAssignmentById } from '../data/units';

const RESOURCES_DIR = join(process.cwd(), 'resources');

const RESOURCE_TYPES = {
  brief: {
    label: 'Assignment Brief',
    description: 'Task description and criteria requirements',
  },
  scaffolding: {
    label: 'Student Guidance Framework',
    description: 'Writing frames, PEEL structures, grade-level guidance provided to students',
  },
  exemplar: {
    label: 'WAGOLL Exemplar',
    description: 'Annotated model answer showing expected quality at each grade level',
  },
};

/**
 * Convert a display name to a folder name.
 * "Steve Babb" → "steve.babb"
 * "Amreen Shabir" → "amreen.shabir"
 */
function nameToFolder(name) {
  if (!name) return null;
  return name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
}

/**
 * Load T Level ESP resources for a given assignment.
 * ESP resources use a different naming convention:
 *   - Task-specific: "1.1_Marking_Grid.md", "1.2_Marking_Grid.md"
 *   - ESP-wide: "ESP_Specification.md", "ESP_Assessment_Reference.md", "ESP_Exemplar_A_Grade.md"
 *
 * @param {string} teacherFolder - e.g. 'catherine.pennington'
 * @param {string} taskNumber - e.g. '1.1', '1.2', '2.1' (from learningAims[0])
 * @returns {Array} Array of resource objects
 */
function loadTLevelResources(teacherFolder, taskNumber) {
  if (!teacherFolder || !taskNumber) return [];

  const folderPath = join(RESOURCES_DIR, teacherFolder);
  if (!existsSync(folderPath)) return [];

  const resources = [];
  const files = readdirSync(folderPath).filter(f => f.endsWith('.md'));

  for (const file of files) {
    // Match task-specific files: "1.1_Marking_Grid.md", "1.1_Brief.md" etc.
    const isTaskSpecific = file.startsWith(`${taskNumber}_`);
    // Match ESP-wide files: "ESP_Specification.md", "ESP_Assessment_Reference.md" etc.
    const isEspWide = file.startsWith('ESP_');

    if (isTaskSpecific || isEspWide) {
      const filePath = join(folderPath, file);
      try {
        const content = readFileSync(filePath, 'utf-8').trim();
        if (content.length > 0) {
          // Derive a label from the filename
          const label = file.replace('.md', '').replace(/_/g, ' ');
          resources.push({
            type: isTaskSpecific ? 'marking-grid' : 'esp-reference',
            label,
            description: isTaskSpecific
              ? `Task ${taskNumber} marking grid with band descriptors`
              : 'ESP-wide reference document (specification, exemplar, or assessment guide)',
            content,
            teacher: teacherFolder,
            fileName: file,
          });
        }
      } catch (err) {
        console.warn(`Failed to read T Level resource ${filePath}:`, err.message);
      }
    }
  }

  return resources;
}

/**
 * Look for resources in a specific teacher's folder for a given assignment.
 * Files are named: {assignmentId}-{type}.md
 * e.g. unit8-a-brief.md, unit8-a-scaffolding.md, unit8-a-exemplar.md
 *
 * @param {string} teacherFolder - e.g. 'steve.babb'
 * @param {string} assignmentId - e.g. 'unit8-a'
 * @returns {Array} Array of resource objects, or empty array
 */
function loadFromTeacherFolder(teacherFolder, assignmentId) {
  if (!teacherFolder || !assignmentId) return [];

  const folderPath = join(RESOURCES_DIR, teacherFolder);
  if (!existsSync(folderPath)) return [];

  const resources = [];

  for (const [type, typeInfo] of Object.entries(RESOURCE_TYPES)) {
    const fileName = `${assignmentId}-${type}.md`;
    const filePath = join(folderPath, fileName);

    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath, 'utf-8').trim();
        if (content.length > 0) {
          resources.push({
            type,
            label: typeInfo.label,
            description: typeInfo.description,
            content,
            teacher: teacherFolder,
            fileName,
          });
        }
      } catch (err) {
        console.warn(`Failed to read resource ${filePath}:`, err.message);
      }
    }
  }

  return resources;
}

/**
 * Load resources for a given assignment, checking:
 * 1. The uploader's folder (by name from auth)
 * 2. The cohort teacher's folder (from teaching assignments)
 *
 * @param {string} assignmentId - e.g. 'unit8-a'
 * @param {string} uploaderName - Display name of uploader, e.g. 'Steve Babb'
 * @param {string|null} studentCohortId - Cohort ID for fallback teacher lookup
 * @returns {{ resources: Array, summary: string, teacherName: string } | null}
 */
export function loadResources(assignmentId, uploaderName = null, studentCohortId = null) {
  if (!assignmentId) return null;

  // Check if this is a T Level assignment
  const assignment = getAssignmentById(assignmentId);
  const isTLevel = assignment && assignment.course === 'tlevel-management';
  const taskNumber = isTLevel && assignment.learningAims?.[0] ? assignment.learningAims[0] : null;

  // 1. Try the uploader's folder first
  if (uploaderName) {
    const uploaderFolder = nameToFolder(uploaderName);

    // For T Level: try ESP resource loading
    if (isTLevel && taskNumber) {
      const resources = loadTLevelResources(uploaderFolder, taskNumber);
      if (resources.length > 0) {
        return {
          resources,
          summary: resources.map(r => r.label).join(', '),
          teacherName: uploaderName,
          source: 'uploader',
          isTLevel: true,
        };
      }
    }

    // Standard BTEC resource loading
    const resources = loadFromTeacherFolder(uploaderFolder, assignmentId);
    if (resources.length > 0) {
      return {
        resources,
        summary: resources.map(r => r.label).join(', '),
        teacherName: uploaderName,
        source: 'uploader',
      };
    }
  }

  // 2. Fall back to the cohort teacher
  if (studentCohortId) {
    if (assignment) {
      const teachers = getTeachersForUnitCohort(assignment.unitNumber, studentCohortId);
      for (const teacher of teachers) {
        const teacherFolder = nameToFolder(teacher.name);

        // For T Level: try ESP resource loading
        if (isTLevel && taskNumber) {
          const resources = loadTLevelResources(teacherFolder, taskNumber);
          if (resources.length > 0) {
            return {
              resources,
              summary: resources.map(r => r.label).join(', '),
              teacherName: teacher.name,
              source: 'cohort-teacher',
              isTLevel: true,
            };
          }
        }

        // Standard BTEC resource loading
        const resources = loadFromTeacherFolder(teacherFolder, assignmentId);
        if (resources.length > 0) {
          return {
            resources,
            summary: resources.map(r => r.label).join(', '),
            teacherName: teacher.name,
            source: 'cohort-teacher',
          };
        }
      }
    }
  }

  return null;
}

/**
 * Format resources into a prompt section for the AI analysis.
 *
 * @param {Array} resources - From loadResources().resources
 * @param {string} teacherName - Name of the teacher whose resources these are
 * @param {number} maxCharsPerResource - Character limit per resource
 * @returns {string} Formatted prompt section
 */
export function formatResourcesForPrompt(resources, teacherName = null, maxCharsPerResource = 4000, isTLevel = false) {
  if (!resources || resources.length === 0) return '';

  let prompt = '\n\n';
  if (isTLevel) {
    prompt += 'T LEVEL ESP — MARKING GRIDS AND REFERENCE DOCUMENTS';
    if (teacherName) prompt += ` (from ${teacherName})`;
    prompt += ':\n';
    prompt += 'The following marking grids, specification extracts, and exemplar data define how this task must be assessed.\n';
    prompt += 'You MUST use the band descriptors from the marking grid to place the student\'s work in the correct band and estimate a mark.\n';
    prompt += 'Do NOT use BTEC-style Pass/Merit/Distinction criteria — this qualification uses numerical marks against band descriptors.\n\n';
  } else {
    prompt += 'TEACHER-PROVIDED RESOURCES FOR THIS ASSIGNMENT';
    if (teacherName) prompt += ` (from ${teacherName})`;
    prompt += ':\n';
    prompt += 'The following guidance materials were provided to students. Use these to:\n';
    prompt += '- Assess whether the student followed the scaffolding and frameworks taught\n';
    prompt += '- Recognise structural patterns from exemplars (these are EXPECTED, not plagiarism)\n';
    prompt += '- Calibrate your criteria assessment against what was actually required\n';
    prompt += '- Identify whether sophisticated content matches what was taught vs. AI generation\n';
    prompt += '- Frame your WWW/EBI feedback using the same language and frameworks students know\n\n';
  }

  for (const resource of resources) {
    const truncated = resource.content.length > maxCharsPerResource
      ? resource.content.substring(0, maxCharsPerResource) + '\n[... truncated for length]'
      : resource.content;

    prompt += `--- ${resource.label.toUpperCase()} ---\n`;
    prompt += `(${resource.description})\n\n`;
    prompt += truncated;
    prompt += '\n\n';
  }

  prompt += '--- END OF RESOURCES ---\n';

  return prompt;
}

/**
 * Check which teachers have resources and for which assignments.
 * @returns {Object} Map of teacherFolder -> { assignmentId -> [types] }
 */
export function getResourceAvailability() {
  const availability = {};

  if (!existsSync(RESOURCES_DIR)) return availability;

  try {
    const dirs = readdirSync(RESOURCES_DIR).filter(d => {
      try {
        const fullPath = join(RESOURCES_DIR, d);
        return readdirSync(fullPath).some(f => f.endsWith('.md'));
      } catch {
        return false;
      }
    });

    for (const dir of dirs) {
      const files = readdirSync(join(RESOURCES_DIR, dir)).filter(f => f.endsWith('.md'));
      const assignments = {};

      for (const file of files) {
        // Parse {assignmentId}-{type}.md
        const match = file.match(/^(.+)-(brief|scaffolding|exemplar)\.md$/);
        if (match) {
          const [, assignmentId, type] = match;
          if (!assignments[assignmentId]) assignments[assignmentId] = [];
          assignments[assignmentId].push(type);
        }
      }

      if (Object.keys(assignments).length > 0) {
        availability[dir] = assignments;
      }
    }
  } catch (err) {
    console.warn('Could not read resources directory:', err.message);
  }

  return availability;
}
