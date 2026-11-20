/**
 * Local demo generator.
 *
 * This is NOT an AI service. It assembles drafts from the person's confirmed answers
 * with simple, predictable rules: it tidies wording (capitalisation, first-person
 * openers, punctuation) and arranges sections. It never invents skills, metrics,
 * employers, dates or achievements.
 */
import { fields } from '../../config/copy';
import type {
  ExperienceEntry,
  GeneratedContent,
  LinkedInDraft,
  Profile,
  ResumeDraft,
  ResumeSectionItem,
} from '../../state/types';
import { article, dateRange, joinNonEmpty, lines, polishBullet, sentence, splitList } from '../text';
import type { DraftGenerator, GenerateInput } from './types';

const isWork = (e: ExperienceEntry) => e.kind === 'job' || e.kind === 'internship';
const hasContent = (e: ExperienceEntry) => Boolean(e.title.trim() || e.org.trim());

function fieldName(input: GenerateInput): string {
  if (input.fieldDetail.trim()) return input.fieldDetail.trim();
  if (!input.field || input.field === 'other') return '';
  return fields.find((f) => f.id === input.field)?.label.toLowerCase() ?? '';
}

function isEarly(p: Profile) {
  return p.stage === 'student' || p.stage === 'recent-grad' || p.stage === null;
}

/** e.g. "Information Systems student at Ohio Valley University" — built only from stated facts. */
export function identity(input: GenerateInput): string {
  const p = input.profile;
  const edu = p.education.find((e) => e.school.trim());
  const current = p.experience.find((e) => e.current && e.title.trim() && isWork(e));
  const latestWork = current ?? p.experience.find((e) => e.title.trim() && isWork(e));

  if (p.stage === 'student' && edu) return joinNonEmpty([edu.study, 'student at', edu.school], ' ');
  if (p.stage === 'student') return 'Student';
  if (p.stage === 'recent-grad' && edu) return joinNonEmpty(['Recent', edu.study, 'graduate of', edu.school], ' ');
  if (current) return joinNonEmpty([current.title, current.org && `at ${current.org}`], ' ');
  if (latestWork) return latestWork.title;
  if (edu) return joinNonEmpty([edu.study, 'graduate of', edu.school], ' ');
  return '';
}

function intention(input: GenerateInput): string {
  const role = input.targetRole.trim();
  const field = fieldName(input);
  if (role) return `seeking ${article(role)} ${role} role`;
  switch (input.goal) {
    case 'internship':
      return field ? `seeking an internship in ${field}` : 'seeking an internship';
    case 'first-job':
      return field ? `looking for a first full-time role in ${field}` : 'looking for a first full-time role';
    case 'career-change':
      return field ? `moving into ${field}` : 'moving into a new field';
    case 'promotion':
      return field ? `seeking a more senior role in ${field}` : 'seeking a more senior role';
    default:
      return field ? `interested in opportunities in ${field}` : '';
  }
}

function evidence(p: Profile): string {
  const roles = p.experience.filter(hasContent).slice(0, 2).map((e) => e.title || e.org);
  const projects = p.projects.filter((x) => x.name.trim()).slice(0, 1).map((x) => x.name);
  if (roles.length && projects.length) return `Experience as ${roles.join(' and ')}, plus project work including ${projects[0]}`;
  if (roles.length) return `Experience as ${roles.join(' and ')}`;
  if (projects.length) return `Project work including ${projects[0]}`;
  return '';
}

function buildSummary(input: GenerateInput): string {
  const p = input.profile;
  const id = identity(input);
  const intent = intention(input);
  const skills = splitList(p.skills).slice(0, 4);
  const first = id && intent ? `${id}, ${intent}` : id || (intent ? intent.charAt(0).toUpperCase() + intent.slice(1) : '');
  const parts = [sentence(first)];
  if (input.prefs.length === 'standard') parts.push(sentence(evidence(p)));
  if (skills.length) parts.push(sentence(`Skills include ${listJoin(skills)}`));
  return parts.filter(Boolean).join(' ');
}

function listJoin(items: string[]) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function bullets(text: string, max: number) {
  return lines(text).map(polishBullet).slice(0, max);
}

function buildResume(input: GenerateInput): ResumeDraft {
  const p = input.profile;
  const max = input.prefs.length === 'concise' ? 3 : 6;

  const expItems = (filter: (e: ExperienceEntry) => boolean): ResumeSectionItem[] =>
    p.experience
      .filter((e) => hasContent(e) && filter(e))
      .map((e) => ({
        id: e.id,
        heading: e.title || e.org,
        subheading: e.title ? joinNonEmpty([e.org, e.kind === 'internship' ? 'Internship' : '']) : '',
        meta: joinNonEmpty([dateRange(e.start, e.end, e.current), e.location]),
        bullets: bullets(e.highlights, max),
      }));

  const sectionMap = {
    experience: { id: 'experience', title: 'Experience', items: expItems(isWork) },
    volunteer: { id: 'volunteer', title: 'Volunteering and Leadership', items: expItems((e) => !isWork(e)) },
    projects: {
      id: 'projects',
      title: 'Projects',
      items: p.projects
        .filter((x) => x.name.trim())
        .map((x) => ({
          id: x.id,
          heading: x.name,
          subheading: joinNonEmpty([x.context, x.link]),
          meta: x.date,
          bullets: bullets(x.description, max),
        })),
    },
    education: {
      id: 'education',
      title: 'Education',
      items: p.education
        .filter((e) => e.school.trim())
        .map((e) => ({
          id: e.id,
          heading: e.school,
          subheading: joinNonEmpty([e.credential, e.study], ', '),
          meta: dateRange(e.start, e.end),
          bullets: bullets(e.details, max),
        })),
    },
  };

  const emphasis = input.prefs.emphasis;
  let order: (keyof typeof sectionMap)[];
  if (emphasis === 'projects') order = ['projects', 'experience', 'education', 'volunteer'];
  else if (emphasis === 'experience') order = ['experience', 'projects', 'volunteer', 'education'];
  else if (isEarly(p)) order = ['education', 'projects', 'experience', 'volunteer'];
  else order = ['experience', 'projects', 'volunteer', 'education'];

  const extras: ResumeDraft['extras'] = [];
  const certs = lines(p.certifications);
  if (certs.length) extras.push({ title: 'Certifications', lines: certs.map(polishBullet) });
  const ach = lines(p.achievements);
  if (ach.length) extras.push({ title: 'Awards and Achievements', lines: ach.map(polishBullet) });
  const courses = splitList(p.coursework);
  if (courses.length) extras.push({ title: 'Relevant Coursework', lines: [courses.join(', ')] });

  return {
    name: p.fullName.trim(),
    contactLine: joinNonEmpty([p.location, p.phone, p.email, p.linkedinUrl, p.website], ' | '),
    summary: buildSummary(input),
    sections: order.map((k) => sectionMap[k]).filter((s) => s.items.length > 0),
    skills: splitList(p.skills),
    skillsFirst: emphasis === 'skills',
    extras,
  };
}

function buildHeadline(input: GenerateInput): string {
  const id = identity(input);
  const role = input.targetRole.trim();
  const early = isEarly(input.profile) || input.goal === 'career-change';
  const skills = splitList(input.profile.skills).slice(0, 3);
  const parts = [titleCase(id)];
  if (role) parts.push(early ? `Seeking ${role} roles` : `Interested in ${role} roles`);
  else if (input.goal === 'career-change' && fieldName(input)) parts.push(`Moving into ${fieldName(input)}`);
  if (skills.length) parts.push(skills.join(' · '));
  let headline = parts.filter(Boolean).join(' | ');
  while (headline.length > 220 && parts.length > 1) {
    parts.pop();
    headline = parts.join(' | ');
  }
  return headline;
}

function titleCase(s: string) {
  return s.replace(/\b(student|graduate|recent)\b/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

function buildAbout(input: GenerateInput): string {
  const p = input.profile;
  const { tone, length } = input.prefs;
  const id = identity(input);
  const intent = intention(input);
  const first = p.fullName.trim().split(/\s+/)[0];
  const field = fieldName(input);

  let intro = '';
  const core = id ? `${article(id)} ${lowerFirst(id)}` : '';
  if (tone === 'formal') intro = sentence(joinNonEmpty([id, intent], ', '));
  else if (tone === 'warm' && first) intro = `Hi, I’m ${first}. ` + (core ? sentence(`I’m ${core}${intent ? `, ${intent}` : ''}`) : '');
  else intro = core ? sentence(`I’m ${core}${intent ? `, ${intent}` : ''}`) : sentence(intent ? `I’m ${intent}` : '');

  const paras = [intro.trim()];
  if (p.aboutYou.trim()) paras.push(p.aboutYou.trim().split(/\n+/).map(sentence).join(' '));

  if (length === 'standard') {
    const recent = p.experience.filter(hasContent).slice(0, 2).map((e) => joinNonEmpty([e.title, e.org && `at ${e.org}`], ' '));
    const proj = p.projects.filter((x) => x.name.trim()).slice(0, 2).map((x) => x.name);
    const bits: string[] = [];
    if (recent.length) bits.push(tone === 'formal' ? `Experience includes ${listJoin(recent)}.` : `Recently, I’ve worked as ${listJoin(recent)}.`);
    if (proj.length) bits.push(tone === 'formal' ? `Projects include ${listJoin(proj)}.` : `Projects I’ve worked on include ${listJoin(proj)}.`);
    if (bits.length) paras.push(bits.join(' '));
  }

  const skills = splitList(p.skills).slice(0, 8);
  if (skills.length) paras.push(`Skills: ${skills.join(' · ')}`);

  if (field || input.targetRole.trim()) {
    const topic = field || input.targetRole.trim();
    if (tone === 'warm') paras.push(`If you work in ${topic}, I’d be glad to connect.`);
    else if (tone === 'formal') paras.push(`Open to conversations about opportunities in ${topic}.`);
    else paras.push(`I’m happy to connect with people working in ${topic}.`);
  }
  return paras.filter(Boolean).join('\n\n');
}

function lowerFirst(s: string) {
  // Keep proper nouns: only lowercase a leading generic word like "Student" or "Recent".
  return /^(Student|Recent)\b/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

function buildLinkedIn(input: GenerateInput): LinkedInDraft {
  const p = input.profile;
  return {
    headline: buildHeadline(input),
    about: buildAbout(input),
    experience: p.experience.filter(hasContent).map((e) => ({
      id: e.id,
      title: e.title || (e.kind === 'volunteer' ? 'Volunteer' : ''),
      org: e.org,
      dates: dateRange(e.start, e.end, e.current),
      description: bullets(e.highlights, 8)
        .map((b) => `• ${b}`)
        .join('\n'),
    })),
    education: p.education
      .filter((e) => e.school.trim())
      .map((e) => ({ id: e.id, school: e.school, detail: joinNonEmpty([e.credential, e.study], ', '), dates: dateRange(e.start, e.end) })),
    skills: splitList(p.skills).slice(0, 50),
  };
}

export function generateLocally(input: GenerateInput): GeneratedContent {
  return {
    resume: input.deliverables.includes('resume') ? buildResume(input) : null,
    linkedin: input.deliverables.includes('linkedin') ? buildLinkedIn(input) : null,
    generatedAt: new Date().toISOString(),
    source: 'demo',
    edited: false,
  };
}

export const demoGenerator: DraftGenerator = {
  mode: 'demo',
  label: 'Local demo generator (no AI service connected)',
  understandsNotes: false,
  async generate(input, signal) {
    // A short pause so the loading state is visible and the flow feels the same as with a real service.
    await new Promise<void>((resolve, reject) => {
      const t = window.setTimeout(resolve, 900);
      signal?.addEventListener('abort', () => {
        window.clearTimeout(t);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
    return generateLocally(input);
  },
};
