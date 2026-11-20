import type { Draft } from '../state/types';
import { hasNumber } from './text';

export type CheckLevel = 'required' | 'suggest' | 'verify';

export interface Check {
  id: string;
  level: CheckLevel;
  message: string;
  /** Section on the context step that fixes this (index into the visible sections). */
  section: 'basics' | 'education' | 'experience' | 'projects' | 'skills';
}

/**
 * Follow-up questions shown before generation. We never fill gaps ourselves —
 * either the person adds the detail or it's left out of the draft.
 */
export function findChecks(draft: Draft): Check[] {
  const p = draft.profile;
  const wantsResume = draft.deliverables.includes('resume');
  const wantsLinkedIn = draft.deliverables.includes('linkedin');
  const out: Check[] = [];

  if (!p.fullName.trim()) {
    out.push({ id: 'name', level: 'required', section: 'basics', message: 'Add your name so it appears at the top of your drafts.' });
  }
  if (wantsResume && !p.email.trim() && !p.phone.trim()) {
    out.push({ id: 'contact', level: 'suggest', section: 'basics', message: 'Add an email or phone number so employers can reach you.' });
  }
  if (p.education.length === 0 && p.experience.length === 0 && p.projects.length === 0) {
    out.push({
      id: 'nothing',
      level: 'required',
      section: 'experience',
      message: 'Add at least one job, project, volunteer role or education entry. A class project counts.',
    });
  }

  for (const e of p.experience) {
    const name = e.title || e.org || 'one of your roles';
    if (!e.title.trim() && !e.org.trim()) {
      out.push({ id: `exp-empty-${e.id}`, level: 'required', section: 'experience', message: 'One experience entry has no title or organization. Fill it in or remove it.' });
      continue;
    }
    if (!e.title.trim()) out.push({ id: `exp-title-${e.id}`, level: 'suggest', section: 'experience', message: `What was your role at ${e.org}? Add a title, even an informal one.` });
    if (!e.start.trim() && !e.end.trim() && !e.current) {
      out.push({ id: `exp-dates-${e.id}`, level: 'suggest', section: 'experience', message: `When were you at ${e.org || name}? Add dates, or we’ll leave them off.` });
    }
    if (!e.highlights.trim()) {
      out.push({ id: `exp-hl-${e.id}`, level: 'suggest', section: 'experience', message: `What did you do as ${name}? A line or two helps — otherwise we’ll list just the title.` });
    } else if (hasNumber(e.highlights)) {
      out.push({ id: `exp-num-${e.id}`, level: 'verify', section: 'experience', message: `You included numbers for ${name}. Make sure each one is accurate.` });
    }
  }

  for (const pr of p.projects) {
    if (!pr.name.trim()) {
      out.push({ id: `proj-name-${pr.id}`, level: 'required', section: 'projects', message: 'One project has no name. A short descriptive title is fine.' });
    } else if (!pr.description.trim()) {
      out.push({ id: `proj-desc-${pr.id}`, level: 'suggest', section: 'projects', message: `What did you do on “${pr.name}”? Add a sentence, or we’ll list just the name.` });
    } else if (hasNumber(pr.description)) {
      out.push({ id: `proj-num-${pr.id}`, level: 'verify', section: 'projects', message: `You included numbers for “${pr.name}”. Double-check they’re right.` });
    }
  }

  for (const ed of p.education) {
    if (!ed.school.trim()) out.push({ id: `edu-school-${ed.id}`, level: 'required', section: 'education', message: 'One education entry is missing the school or program name.' });
    else if (!ed.end.trim()) out.push({ id: `edu-end-${ed.id}`, level: 'suggest', section: 'education', message: `When did you (or will you) finish at ${ed.school}? “Expected May 2027” works.` });
  }

  if (!p.skills.trim()) {
    out.push({ id: 'skills', level: 'suggest', section: 'skills', message: 'Add a few skills you could talk about in an interview. Tools, languages and people skills all count.' });
  }
  if (wantsLinkedIn && !p.aboutYou.trim()) {
    out.push({
      id: 'about',
      level: 'suggest',
      section: 'skills',
      message: 'Your LinkedIn About will be built only from the facts above. Add a sentence about what you enjoy if you’d like it to sound more like you.',
    });
  }
  if (hasNumber(p.achievements)) {
    out.push({ id: 'ach-num', level: 'verify', section: 'skills', message: 'Your achievements include numbers. Make sure each one is accurate.' });
  }
  return out;
}

export const canGenerate = (draft: Draft) => !findChecks(draft).some((c) => c.level === 'required');
