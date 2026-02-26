// Resource Loader
// Reads guidance documents, exemplars, and briefs from /resources/{assignmentId}/
// These are included as context when analysing submissions

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const RESOURCES_DIR = join(process.cwd(), 'resources');

const RESOURCE_TYPES = {
  'brief.md': {
    label: 'Assignment Brief',
    description: 'Task description and criteria requirements',
  },
  'scaffolding.md': {
    label: 'Student Guidance Framework',
    description: 'Writing frames, PEEL structures, grade-level guidance provided to students',
  },
  'exemplar.md': {
    label: 'WAGOLL Exemplar',
    description: 'Annotated model answer showing expected quality at each grade level',
  },
};

/**
 * Load all available resources for a given assignment.
 * @param {string} assignmentId - e.g. 'unit8-a', 'unit22-b'
 * @returns {{ resources: Array<{type, label, description, content}>, summary: string } | null}
 */
export function loadResources(assignmentId) {
  if (!assignmentId) return null;

  const assignmentDir = join(RESOURCES_DIR, assignmentId);

  if (!existsSync(assignmentDir)) {
    return null;
  }

  const files = readdirSync(assignmentDir).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    return null;
  }

  const resources = [];

  for (const file of files) {
    const typeInfo = RESOURCE_TYPES[file];
    if (!typeInfo) continue;

    try {
      const content = readFileSync(join(assignmentDir, file), 'utf-8').trim();
      if (content.length > 0) {
        resources.push({
          type: file.replace('.md', ''),
          label: typeInfo.label,
          description: typeInfo.description,
          content,
        });
      }
    } catch (err) {
      console.warn(`Failed to read resource ${file} for ${assignmentId}:`, err.message);
    }
  }

  if (resources.length === 0) {
    return null;
  }

  const summary = resources.map(r => r.label).join(', ');

  return { resources, summary };
}

/**
 * Format resources into a prompt section for the AI analysis.
 * @param {Array} resources - From loadResources().resources
 * @param {number} maxCharsPerResource - Character limit per resource
 * @returns {string} Formatted prompt section
 */
export function formatResourcesForPrompt(resources, maxCharsPerResource = 4000) {
  if (!resources || resources.length === 0) return '';

  let prompt = '\n\nTEACHER-PROVIDED RESOURCES FOR THIS ASSIGNMENT:\n';
  prompt += 'The following guidance materials were provided to students. Use these to:\n';
  prompt += '- Assess whether the student followed the scaffolding and frameworks taught\n';
  prompt += '- Recognise structural patterns from exemplars (these are EXPECTED, not plagiarism)\n';
  prompt += '- Calibrate your criteria assessment against what was actually required\n';
  prompt += '- Identify whether sophisticated content matches what was taught vs. AI generation\n';
  prompt += '- Frame your WWW/EBI feedback using the same language and frameworks students know\n\n';

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
 * Check which assignments have resources available.
 * @returns {Object} Map of assignmentId -> array of available resource types
 */
export function getResourceAvailability() {
  const availability = {};

  if (!existsSync(RESOURCES_DIR)) return availability;

  try {
    const dirs = readdirSync(RESOURCES_DIR).filter(d => {
      const fullPath = join(RESOURCES_DIR, d);
      try {
        return readdirSync(fullPath).some(f => f.endsWith('.md'));
      } catch {
        return false;
      }
    });

    for (const dir of dirs) {
      const files = readdirSync(join(RESOURCES_DIR, dir)).filter(f => f.endsWith('.md') && RESOURCE_TYPES[f]);
      if (files.length > 0) {
        availability[dir] = files.map(f => f.replace('.md', ''));
      }
    }
  } catch (err) {
    console.warn('Could not read resources directory:', err.message);
  }

  return availability;
}
