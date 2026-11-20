/**
 * Product copy — questions, options, examples and helper text.
 * Edit wording here without touching components.
 */
import type { DeliverableId, ExperienceKind, FieldId, GoalId, StageId, StepId } from '../state/types';

export const welcomeCopy = {
  eyebrow: 'Resume and LinkedIn, step by step',
  lead: 'Answer a few simple questions about what you’ve done. We’ll shape it into a clear resume and LinkedIn profile — using only what’s true.',
  points: [
    { title: 'A resume', body: 'One clean page that recruiters and hiring software can read.' },
    { title: 'A LinkedIn profile', body: 'Headline, About, experience and skills, ready to paste in.' },
    { title: 'Nothing made up', body: 'You check every detail before anything is written.' },
  ],
  start: 'Get started',
  resume: 'Continue where you left off',
  sample: 'Look around with sample info',
  time: 'Takes about 15 minutes. You can stop and come back.',
};

export const stepLabels: Record<StepId, string> = {
  welcome: 'Welcome',
  goal: 'Your goal',
  role: 'Target role',
  deliverables: 'What to create',
  checkout: 'Price',
  context: 'Your experience',
  factcheck: 'Check the facts',
  preview: 'Preview',
  deliver: 'Edit and download',
};

export const goalCopy = {
  title: 'What are you hoping to do next? 👋',
  intro: 'Pick the one that fits best. You can change it later.',
  fieldTitle: 'Which field are you aiming for?',
  fieldDetailLabel: 'Want to be more specific? (optional)',
  fieldDetailPlaceholder: 'e.g. Cybersecurity, Brand marketing, Supply chain',
  fieldOtherLabel: 'What field is it?',
  fieldOtherPlaceholder: 'e.g. Healthcare administration, Education, Design',
};

export const goals: { id: GoalId; label: string; hint: string }[] = [
  { id: 'first-job', label: 'Land my first job', hint: 'Starting out after school or training' },
  { id: 'internship', label: 'Get an internship', hint: 'Part-time, summer or co‑op roles' },
  { id: 'career-change', label: 'Change careers', hint: 'Moving into a new field' },
  { id: 'promotion', label: 'Move up', hint: 'A promotion or a more senior role' },
  { id: 'exploring', label: 'Just exploring', hint: 'Getting ready for whatever comes next' },
];

export const fields: { id: FieldId; label: string; roles: string[] }[] = [
  { id: 'technology', label: 'Technology', roles: ['Software Engineer', 'Data Analyst', 'IT Support Specialist', 'Product Manager'] },
  { id: 'finance', label: 'Finance', roles: ['Financial Analyst', 'Accounting Assistant', 'Investment Banking Analyst', 'Credit Analyst'] },
  { id: 'fintech', label: 'Fintech', roles: ['Product Analyst', 'Risk & Compliance Analyst', 'Payments Operations Associate', 'Business Analyst'] },
  { id: 'marketing', label: 'Marketing', roles: ['Marketing Coordinator', 'Social Media Specialist', 'Content Writer', 'Growth Marketing Associate'] },
  { id: 'operations', label: 'Operations', roles: ['Operations Coordinator', 'Supply Chain Analyst', 'Project Coordinator', 'Office Manager'] },
  { id: 'science', label: 'Science', roles: ['Research Assistant', 'Lab Technician', 'Clinical Research Coordinator', 'Quality Control Analyst'] },
  { id: 'commerce', label: 'Commerce', roles: ['Sales Associate', 'E-commerce Coordinator', 'Account Executive', 'Retail Store Supervisor'] },
  { id: 'other', label: 'Something else', roles: ['Administrative Assistant', 'Customer Success Associate', 'Program Coordinator'] },
];

export const roleCopy = {
  title: 'Is there a role you have in mind?',
  intro: 'This helps us choose what to highlight. It’s fine if you’re not sure yet.',
  label: 'Role title',
  examplesLabel: 'Ideas for your field',
  skip: 'Skip for now',
};

export const deliverablesCopy = {
  title: 'What would you like to create?',
  intro: 'Choose one or both, or let us suggest what fits your goal.',
  helpLabel: 'Help me decide',
  helpHint: 'A quick suggestion based on your goal',
  recTitle: 'Our recommendation',
  whyTitle: 'Why we recommend this',
  accept: 'Use this recommendation',
  change: 'I’ll choose myself',
  usingRec: 'Using our recommendation. You can still tick or untick either option.',
};

export const recommendationReasons: Record<GoalId, Record<DeliverableId, string | null>> = {
  'first-job': {
    resume: 'Most job applications ask for one, even for entry-level roles.',
    linkedin: 'Recruiters search LinkedIn for new graduates. A complete profile helps them find you.',
  },
  internship: {
    resume: 'Internship applications almost always ask for a resume — projects and classes count.',
    linkedin: 'Useful for connecting with alumni and recruiters at companies you’re curious about.',
  },
  'career-change': {
    resume: 'A resume lets you lead with the skills that carry over to your new field.',
    linkedin: 'Your headline and About section tell people where you’re heading, not just where you’ve been.',
  },
  promotion: {
    resume: 'Internal and external applications for senior roles usually ask for an updated resume.',
    linkedin: null,
  },
  exploring: {
    resume: null,
    linkedin: 'A low-pressure way to get your experience in one place and be discoverable.',
  },
};

export const optionalReason: Record<DeliverableId, string> = {
  resume: 'Optional for now — useful the moment you decide to apply somewhere.',
  linkedin: 'Optional — nice to have, but not essential for this goal.',
};

export const checkoutCopy = {
  title: 'Here’s what you’re getting',
  intro: 'One-time charge. No subscription.',
  sampleNotice: 'Sample prices — not final.',
  demoNotice: 'This is a demo checkout. No card details are collected and you won’t be charged.',
  discountLabel: 'Discount code',
  apply: 'Apply',
  remove: 'Remove',
  continue: 'Continue (demo — no payment)',
};

/**
 * Short lines that acknowledge the previous answer at the top of the next step.
 * Keep them brief and plain — one sentence, no exclamation marks.
 */
const goalPhrases: Record<GoalId, string> = {
  'first-job': 'your first job',
  internship: 'an internship',
  'career-change': 'a career change',
  promotion: 'a step up',
  exploring: 'keeping your options open',
};

export const acknowledgements = {
  field: (goal: GoalId) => `Got it — ${goalPhrases[goal]}. Now let’s find the field you’re aiming for.`,
  role: (field: string) => (field ? `${field} it is.` : 'Good to know.'),
  deliverables: (role: string) => (role ? `Noted — we’ll keep ${role} in mind.` : 'No problem — you can add a role any time.'),
  checkout: (names: string[]) => (names.length > 1 ? 'Both it is. Here’s the breakdown.' : `Just the ${names[0]?.toLowerCase() ?? 'one'} — got it.`),
  context: 'You’re all set. Now for the important part: what you’ve done.',
  factcheck: (firstName: string) => (firstName ? `Thanks, ${firstName}. Nearly there.` : 'Thanks. Nearly there.'),
  preview: 'Everything below comes from the details you confirmed.',
};

export const stageOptions: { id: StageId; label: string; hint: string }[] = [
  { id: 'student', label: 'I’m a student', hint: 'In school, college or a training program' },
  { id: 'recent-grad', label: 'I recently finished', hint: 'Graduated or completed training in the last couple of years' },
  { id: 'working', label: 'I’m working', hint: 'Currently employed, full- or part-time' },
  { id: 'returning', label: 'I’m returning to work', hint: 'After a break of any kind' },
];

export const experienceKinds: { id: ExperienceKind; label: string }[] = [
  { id: 'job', label: 'Job' },
  { id: 'internship', label: 'Internship' },
  { id: 'volunteer', label: 'Volunteering' },
  { id: 'leadership', label: 'Club or leadership role' },
];

export const contextCopy = {
  title: 'Tell us about you',
  intro: 'Use your own words — we’ll tidy them up. Leave out anything that doesn’t apply.',
  sections: {
    basics: {
      title: 'The basics',
      intro: 'How you’d like your name and contact details to appear.',
    },
    education: {
      title: 'Education',
      intro: 'School, college, bootcamps and training programs all count.',
      empty: 'No education added yet. Add one, or skip this if it doesn’t apply.',
      add: 'Add education',
    },
    experience: {
      title: 'Work and experience',
      introEarly: 'Part-time jobs, internships, volunteering and club roles all count.',
      introExperienced: 'Start with your most recent role.',
      empty: 'Nothing here yet. Any job, internship or volunteer role counts.',
      add: 'Add experience',
      highlightsLabel: 'What did you do there?',
      highlightsHint:
        'One thing per line. Say what you did and what came of it — only include numbers you’re sure of.',
      highlightsPlaceholder:
        'Answered customer questions at the front desk\nTrained two new team members\nKept the weekly schedule up to date',
    },
    projects: {
      title: 'Projects',
      introEarly: 'Tell us about something you’ve worked on. A class project counts.',
      introExperienced: 'Optional — side projects or notable work projects you want to call out.',
      empty: 'No projects yet. Class assignments, personal builds and group projects all count.',
      add: 'Add a project',
      descriptionPlaceholder:
        'e.g. Built a budgeting app with two classmates using Python. I designed the database and wrote the reports page.',
    },
    skills: {
      title: 'Skills and extras',
      intro: 'List skills you could talk about in an interview.',
    },
  },
  voiceHint: 'You can type or speak your answer.',
};

export const factcheckCopy = {
  title: 'Here’s what I understood',
  intro: 'You can change anything before we use it. We’ll only write what’s here.',
  checksTitle: 'A few things to double-check',
  noChecks: 'Everything we need is here. Give it one last read.',
  confirm: 'I’ve checked these details and they’re accurate.',
  generate: 'Create my drafts',
};

export const previewCopy = {
  title: 'Your first draft',
  intro: 'Pick a resume style. You can edit every word on the next step.',
  templateLabel: 'Resume style',
  generating: 'Putting your drafts together…',
  continue: 'Edit and download',
};

export const deliverCopy = {
  title: 'Make it yours',
  intro: 'Edit anything, ask for changes, then download or copy.',
  storage:
    'Drafts are saved only in this browser, on this device. Nothing is sent to a server in demo mode. Clearing your browser data will remove them.',
};

export const templates: { id: 'classic' | 'modern' | 'compact'; name: string; description: string }[] = [
  { id: 'classic', name: 'Classic', description: 'Centered name, clear section lines.' },
  { id: 'modern', name: 'Modern', description: 'Left-aligned with a subtle accent.' },
  { id: 'compact', name: 'Compact', description: 'Tighter spacing to fit more on a page.' },
];
