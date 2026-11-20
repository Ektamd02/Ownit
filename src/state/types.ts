export type DeliverableId = 'resume' | 'linkedin';

export type GoalId = 'first-job' | 'internship' | 'career-change' | 'promotion' | 'exploring';

export type FieldId =
  | 'technology'
  | 'finance'
  | 'fintech'
  | 'marketing'
  | 'operations'
  | 'science'
  | 'commerce'
  | 'other';

export type StageId = 'student' | 'recent-grad' | 'working' | 'returning';

export type ExperienceKind = 'job' | 'internship' | 'volunteer' | 'leadership';

export interface EducationEntry {
  id: string;
  school: string;
  credential: string; // e.g. "BSc", "Diploma"
  study: string; // e.g. "Computer Science"
  start: string;
  end: string; // or "Expected May 2026"
  details: string; // honours, GPA if they want it, activities
}

export interface ExperienceEntry {
  id: string;
  kind: ExperienceKind;
  title: string;
  org: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  highlights: string; // one item per line, in the user's words
}

export interface ProjectEntry {
  id: string;
  name: string;
  context: string; // "Class project — Data Structures", "Personal project"
  date: string;
  description: string;
  link: string;
}

export interface Profile {
  stage: StageId | null;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  website: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  coursework: string;
  skills: string; // comma or line separated
  certifications: string; // one per line
  achievements: string; // one per line
  aboutYou: string; // LinkedIn: what you care about / how you work, in your words
}

export interface Order {
  discountCode: string; // applied code (normalised) or ''
  confirmedAt: string | null; // ISO date of the demo checkout confirmation
}

export type ResumeTemplateId = 'classic' | 'modern' | 'compact';

export type Tone = 'plain' | 'warm' | 'formal';
export type Length = 'concise' | 'standard';
export type Emphasis = 'auto' | 'experience' | 'projects' | 'skills';

export interface GenerationPrefs {
  tone: Tone;
  length: Length;
  emphasis: Emphasis;
  note: string; // free-text change request (used by a connected AI provider)
}

export interface ResumeSectionItem {
  id: string;
  heading: string; // title / project name / school
  subheading: string; // org / context / credential
  meta: string; // dates, location
  bullets: string[];
}

export interface ResumeDraft {
  name: string;
  contactLine: string;
  summary: string;
  sections: { id: string; title: string; items: ResumeSectionItem[] }[];
  skills: string[];
  skillsFirst: boolean;
  extras: { title: string; lines: string[] }[]; // certifications, achievements, coursework
}

export interface LinkedInExperience {
  id: string;
  title: string;
  org: string;
  dates: string;
  description: string;
}

export interface LinkedInDraft {
  headline: string;
  about: string;
  experience: LinkedInExperience[];
  education: { id: string; school: string; detail: string; dates: string }[];
  skills: string[];
}

export interface GeneratedContent {
  resume: ResumeDraft | null;
  linkedin: LinkedInDraft | null;
  generatedAt: string;
  source: 'demo' | 'api';
  /** True once the user has edited the generated text by hand. */
  edited: boolean;
}

export type StepId =
  | 'welcome'
  | 'goal'
  | 'role'
  | 'deliverables'
  | 'checkout'
  | 'context'
  | 'factcheck'
  | 'preview'
  | 'deliver';

export interface Draft {
  id: string;
  label: string; // user-facing version name
  createdAt: string;
  updatedAt: string;
  isSample: boolean;
  step: StepId;
  contextSection: number;
  goal: GoalId | null;
  field: FieldId | null;
  fieldDetail: string;
  targetRole: string;
  roleSkipped: boolean;
  deliverables: DeliverableId[];
  usedRecommendation: boolean;
  order: Order;
  profile: Profile;
  factsConfirmed: boolean;
  template: ResumeTemplateId;
  prefs: GenerationPrefs;
  generated: GeneratedContent | null;
}
