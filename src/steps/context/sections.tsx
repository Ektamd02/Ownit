/**
 * Editors for each part of the profile. Used on the "Your experience" step and,
 * inline, on the fact-check step so people can correct details in place.
 */
import { contextCopy, experienceKinds, stageOptions } from '../../config/copy';
import { Button } from '../../components/Button';
import { ChoiceGroup } from '../../components/Choice';
import { TextArea, TextField } from '../../components/Field';
import { emptyEducation, emptyExperience, emptyProject } from '../../state/defaults';
import type { DeliverableId, EducationEntry, ExperienceEntry, Profile, ProjectEntry } from '../../state/types';

export type SectionId = 'basics' | 'education' | 'experience' | 'projects' | 'skills';

export interface SectionProps {
  profile: Profile;
  onChange: (patch: Partial<Profile>) => void;
  deliverables: DeliverableId[];
}

export function isEarlyCareer(p: Profile) {
  return p.stage === 'student' || p.stage === 'recent-grad' || p.stage === null;
}

/** Order adapts to the person: students see education and projects before work history. */
export function sectionOrder(p: Profile): SectionId[] {
  return isEarlyCareer(p)
    ? ['basics', 'education', 'projects', 'experience', 'skills']
    : ['basics', 'experience', 'education', 'projects', 'skills'];
}

export const sectionTitles: Record<SectionId, string> = {
  basics: contextCopy.sections.basics.title,
  education: contextCopy.sections.education.title,
  experience: contextCopy.sections.experience.title,
  projects: contextCopy.sections.projects.title,
  skills: contextCopy.sections.skills.title,
};

export function sectionIntro(id: SectionId, p: Profile): string {
  const c = contextCopy.sections;
  const early = isEarlyCareer(p);
  switch (id) {
    case 'basics':
      return c.basics.intro;
    case 'education':
      return c.education.intro;
    case 'experience':
      return early ? c.experience.introEarly : c.experience.introExperienced;
    case 'projects':
      return early ? c.projects.introEarly : c.projects.introExperienced;
    case 'skills':
      return c.skills.intro;
  }
}

function updateItem<T extends { id: string }>(list: T[], id: string, patch: Partial<T>): T[] {
  return list.map((x) => (x.id === id ? { ...x, ...patch } : x));
}

function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const j = index + dir;
  if (j < 0 || j >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[j]] = [copy[j], copy[index]];
  return copy;
}

function EntryCard({ title, index, total, onRemove, onMove, children }: {
  title: string;
  index: number;
  total: number;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="entry">
      <legend className="entry__legend">{title}</legend>
      <div className="entry__tools">
        {total > 1 && (
          <>
            <button type="button" className="text-btn" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move ${title} up`}>Move up</button>
            <button type="button" className="text-btn" onClick={() => onMove(1)} disabled={index === total - 1} aria-label={`Move ${title} down`}>Move down</button>
          </>
        )}
        <button type="button" className="text-btn text-btn--danger" onClick={onRemove} aria-label={`Remove ${title}`}>Remove</button>
      </div>
      {children}
    </fieldset>
  );
}

export function BasicsSection({ profile: p, onChange, deliverables }: SectionProps) {
  const resume = deliverables.includes('resume');
  return (
    <div className="stack-lg">
      <ChoiceGroup
        legend="Where are you right now?"
        legendClassName="h3"
        description="This changes which questions we ask next."
        options={stageOptions.map((s) => ({ id: s.id, label: s.label, hint: s.hint }))}
        value={p.stage}
        onChange={(stage) => onChange({ stage })}
        columns={2}
      />
      <div className="grid-2">
        <TextField label="Full name" hint="As you’d like it to appear." value={p.fullName} onChange={(fullName) => onChange({ fullName })} autoComplete="name" />
        <TextField label="City and state or country" optional hint="e.g. Austin, TX — no street address needed." value={p.location} onChange={(location) => onChange({ location })} autoComplete="address-level2" />
        {resume && (
          <>
            <TextField label="Email" type="email" hint="Use one you check often." value={p.email} onChange={(email) => onChange({ email })} autoComplete="email" />
            <TextField label="Phone" optional type="tel" value={p.phone} onChange={(phone) => onChange({ phone })} autoComplete="tel" />
            <TextField label="LinkedIn URL" optional placeholder="linkedin.com/in/your-name" value={p.linkedinUrl} onChange={(linkedinUrl) => onChange({ linkedinUrl })} />
            <TextField label="Portfolio or website" optional placeholder="e.g. github.com/your-name" value={p.website} onChange={(website) => onChange({ website })} />
          </>
        )}
      </div>
    </div>
  );
}

export function EducationSection({ profile: p, onChange }: SectionProps) {
  const set = (education: EducationEntry[]) => onChange({ education });
  return (
    <div className="stack">
      {p.education.length === 0 && <p className="empty">{contextCopy.sections.education.empty}</p>}
      {p.education.map((e, i) => (
        <EntryCard
          key={e.id}
          title={e.school || `Education ${i + 1}`}
          index={i}
          total={p.education.length}
          onRemove={() => set(p.education.filter((x) => x.id !== e.id))}
          onMove={(d) => set(moveItem(p.education, i, d))}
        >
          <div className="grid-2">
            <TextField label="School or program" placeholder="e.g. Riverside Community College" value={e.school} onChange={(school) => set(updateItem(p.education, e.id, { school }))} />
            <TextField label="Degree or credential" optional placeholder="e.g. BA, Associate’s, Certificate" value={e.credential} onChange={(credential) => set(updateItem(p.education, e.id, { credential }))} />
            <TextField label="Area of study" optional placeholder="e.g. Business Administration" value={e.study} onChange={(study) => set(updateItem(p.education, e.id, { study }))} />
            <div className="grid-2 grid-2--tight">
              <TextField label="Start" optional placeholder="Aug 2023" value={e.start} onChange={(start) => set(updateItem(p.education, e.id, { start }))} />
              <TextField label="End" placeholder="May 2027 or Expected May 2027" value={e.end} onChange={(end) => set(updateItem(p.education, e.id, { end }))} />
            </div>
          </div>
          <TextArea
            label="Honors, activities or details"
            optional
            hint="One per line. Only include a GPA if you want it shown."
            placeholder={'Dean’s List, Spring 2025\nTreasurer, Finance Club'}
            rows={3}
            value={e.details}
            onChange={(details) => set(updateItem(p.education, e.id, { details }))}
          />
        </EntryCard>
      ))}
      <Button icon="plus" onClick={() => set([...p.education, emptyEducation()])}>{contextCopy.sections.education.add}</Button>
    </div>
  );
}

export function ExperienceSection({ profile: p, onChange }: SectionProps) {
  const c = contextCopy.sections.experience;
  const set = (experience: ExperienceEntry[]) => onChange({ experience });
  return (
    <div className="stack">
      {p.experience.length === 0 && <p className="empty">{c.empty}</p>}
      {p.experience.map((e, i) => (
        <EntryCard
          key={e.id}
          title={e.title || e.org || `Experience ${i + 1}`}
          index={i}
          total={p.experience.length}
          onRemove={() => set(p.experience.filter((x) => x.id !== e.id))}
          onMove={(d) => set(moveItem(p.experience, i, d))}
        >
          <ChoiceGroup
            legend="What kind of experience?"
            options={experienceKinds.map((k) => ({ id: k.id, label: k.label }))}
            value={e.kind}
            onChange={(kind) => set(updateItem(p.experience, e.id, { kind }))}
            columns={4}
            legendClassName="field__label"
          />
          <div className="grid-2">
            <TextField label="Your title" placeholder="e.g. Cashier, Marketing Intern, Volunteer Tutor" value={e.title} onChange={(title) => set(updateItem(p.experience, e.id, { title }))} />
            <TextField label="Organization" placeholder="e.g. Target, City Food Bank" value={e.org} onChange={(org) => set(updateItem(p.experience, e.id, { org }))} />
            <TextField label="Location" optional placeholder="e.g. Remote, or Denver, CO" value={e.location} onChange={(location) => set(updateItem(p.experience, e.id, { location }))} />
            <div className="grid-2 grid-2--tight">
              <TextField label="Start" placeholder="Jun 2024" value={e.start} onChange={(start) => set(updateItem(p.experience, e.id, { start }))} />
              <TextField label="End" placeholder="Aug 2024" value={e.current ? '' : e.end} disabled={e.current} onChange={(end) => set(updateItem(p.experience, e.id, { end }))} />
            </div>
          </div>
          <label className="inline-check">
            <input type="checkbox" checked={e.current} onChange={(ev) => set(updateItem(p.experience, e.id, { current: ev.target.checked }))} />
            I’m still doing this
          </label>
          <TextArea
            voice
            label={c.highlightsLabel}
            hint={c.highlightsHint}
            placeholder={c.highlightsPlaceholder}
            rows={4}
            value={e.highlights}
            onChange={(highlights) => set(updateItem(p.experience, e.id, { highlights }))}
          />
        </EntryCard>
      ))}
      <Button icon="plus" onClick={() => set([...p.experience, emptyExperience()])}>{c.add}</Button>
    </div>
  );
}

export function ProjectsSection({ profile: p, onChange }: SectionProps) {
  const c = contextCopy.sections.projects;
  const set = (projects: ProjectEntry[]) => onChange({ projects });
  return (
    <div className="stack">
      {p.projects.length === 0 && <p className="empty">{c.empty}</p>}
      {p.projects.map((x, i) => (
        <EntryCard
          key={x.id}
          title={x.name || `Project ${i + 1}`}
          index={i}
          total={p.projects.length}
          onRemove={() => set(p.projects.filter((y) => y.id !== x.id))}
          onMove={(d) => set(moveItem(p.projects, i, d))}
        >
          <div className="grid-2">
            <TextField label="Project name" placeholder="e.g. Budget Tracker App" value={x.name} onChange={(name) => set(updateItem(p.projects, x.id, { name }))} />
            <TextField label="Where it was from" optional placeholder="e.g. Class project — Marketing 201" value={x.context} onChange={(context) => set(updateItem(p.projects, x.id, { context }))} />
            <TextField label="When" optional placeholder="e.g. Fall 2024" value={x.date} onChange={(date) => set(updateItem(p.projects, x.id, { date }))} />
            <TextField label="Link" optional placeholder="e.g. github.com/you/project" value={x.link} onChange={(link) => set(updateItem(p.projects, x.id, { link }))} />
          </div>
          <TextArea
            voice
            label="What did you do?"
            hint="One point per line. Say what you built or did and what tools you used."
            placeholder={c.descriptionPlaceholder}
            rows={4}
            value={x.description}
            onChange={(description) => set(updateItem(p.projects, x.id, { description }))}
          />
        </EntryCard>
      ))}
      <Button icon="plus" onClick={() => set([...p.projects, emptyProject()])}>{c.add}</Button>
    </div>
  );
}

export function SkillsSection({ profile: p, onChange, deliverables }: SectionProps) {
  const early = isEarlyCareer(p);
  const linkedin = deliverables.includes('linkedin');
  return (
    <div className="stack">
      <TextArea
        label="Skills"
        hint="Separate with commas. Tools, languages and people skills all count."
        placeholder="e.g. Excel, Spanish, Customer service, Canva, Python"
        rows={3}
        value={p.skills}
        onChange={(skills) => onChange({ skills })}
      />
      {early && (
        <TextArea label="Relevant coursework" optional hint="Classes that relate to the roles you want." placeholder="e.g. Financial Accounting, Statistics, Business Writing" rows={2} value={p.coursework} onChange={(coursework) => onChange({ coursework })} />
      )}
      <TextArea label="Certifications" optional hint="One per line. Add “(in progress)” if you haven’t finished." placeholder="e.g. Google Analytics Certification" rows={2} value={p.certifications} onChange={(certifications) => onChange({ certifications })} />
      <TextArea label="Awards and achievements" optional hint="One per line. Scholarships, competitions and recognition count." placeholder="e.g. Employee of the Month, March 2024" rows={2} value={p.achievements} onChange={(achievements) => onChange({ achievements })} />
      {linkedin && (
        <TextArea
          voice
          label="In your own words, what do you enjoy about this kind of work?"
          optional
          hint="Used for your LinkedIn About section. A sentence or two is plenty."
          placeholder="e.g. I like solving problems for people and making messy processes simpler."
          rows={3}
          value={p.aboutYou}
          onChange={(aboutYou) => onChange({ aboutYou })}
        />
      )}
    </div>
  );
}

export const sectionComponents: Record<SectionId, (props: SectionProps) => React.JSX.Element> = {
  basics: BasicsSection,
  education: EducationSection,
  experience: ExperienceSection,
  projects: ProjectsSection,
  skills: SkillsSection,
};
