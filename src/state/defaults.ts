import type { Draft, EducationEntry, ExperienceEntry, Profile, ProjectEntry } from './types';
import { newId } from '../lib/id';

export function emptyProfile(): Profile {
  return {
    stage: null,
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    website: '',
    education: [],
    experience: [],
    projects: [],
    coursework: '',
    skills: '',
    certifications: '',
    achievements: '',
    aboutYou: '',
  };
}

export const emptyEducation = (): EducationEntry => ({
  id: newId('edu'),
  school: '',
  credential: '',
  study: '',
  start: '',
  end: '',
  details: '',
});

export const emptyExperience = (): ExperienceEntry => ({
  id: newId('exp'),
  kind: 'job',
  title: '',
  org: '',
  location: '',
  start: '',
  end: '',
  current: false,
  highlights: '',
});

export const emptyProject = (): ProjectEntry => ({
  id: newId('proj'),
  name: '',
  context: '',
  date: '',
  description: '',
  link: '',
});

export function newDraft(label = 'My first version'): Draft {
  const now = new Date().toISOString();
  return {
    id: newId('draft'),
    label,
    createdAt: now,
    updatedAt: now,
    isSample: false,
    step: 'goal',
    contextSection: 0,
    goal: null,
    field: null,
    fieldDetail: '',
    targetRole: '',
    roleSkipped: false,
    deliverables: [],
    usedRecommendation: false,
    order: { discountCode: '', confirmedAt: null },
    profile: emptyProfile(),
    factsConfirmed: false,
    template: 'classic',
    prefs: { tone: 'plain', length: 'standard', emphasis: 'auto', note: '' },
    generated: null,
  };
}
