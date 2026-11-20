import { describe, expect, it } from 'vitest';
import { generateLocally } from '../lib/generator/demoGenerator';
import { inputFromDraft } from '../lib/generator';
import { computeTotals, findDiscount } from '../lib/pricing';
import { canGenerate, findChecks } from '../lib/factcheck';
import { polishBullet, splitList } from '../lib/text';
import { recommend } from '../lib/recommend';
import { newDraft, emptyExperience } from '../state/defaults';
import { sampleDraft } from '../state/sample';
import { resumeToText } from '../lib/export';

describe('pricing', () => {
  it('applies the bundle saving and a percent code', () => {
    const t = computeTotals(['resume', 'linkedin'], 'welcome10');
    expect(t.subtotalCents).toBe(3400);
    expect(t.bundleCents).toBe(500);
    expect(t.discount?.cents).toBe(290);
    expect(t.totalCents).toBe(2610);
  });
  it('ignores unknown codes and never goes below zero', () => {
    expect(findDiscount('NOPE')).toBeNull();
    expect(computeTotals(['resume'], 'NOPE').totalCents).toBe(1900);
    expect(computeTotals([], 'FRIEND5').totalCents).toBe(0);
  });
});

describe('text helpers', () => {
  it('removes first-person openers without changing meaning', () => {
    expect(polishBullet('I keep the schedule up to date.')).toBe('Keep the schedule up to date');
    expect(polishBullet('i was responsible for opening the store')).toBe('Responsible for opening the store');
  });
  it('dedupes list items', () => {
    expect(splitList('Excel, excel, SQL;Python\nSQL')).toEqual(['Excel', 'SQL', 'Python']);
  });
});

describe('recommendations', () => {
  it('suggests both for an internship and explains why', () => {
    const r = recommend('internship');
    expect(r.every((x) => x.recommended)).toBe(true);
    expect(r.every((x) => x.reason.length > 10)).toBe(true);
  });
});

describe('fact checks', () => {
  it('blocks generation without a name or any experience', () => {
    const d = { ...newDraft(), deliverables: ['resume' as const] };
    expect(canGenerate(d)).toBe(false);
    expect(findChecks(d).map((c) => c.id)).toEqual(expect.arrayContaining(['name', 'nothing']));
  });
  it('asks to verify numbers', () => {
    const d = sampleDraft();
    expect(findChecks(d).some((c) => c.level === 'verify')).toBe(true);
    expect(canGenerate(d)).toBe(true);
  });
});

describe('demo generator never invents content', () => {
  it('only uses skills, employers and numbers the person entered', () => {
    const d = sampleDraft();
    const out = generateLocally(inputFromDraft(d));
    const text = resumeToText(out.resume!) + JSON.stringify(out.linkedin);
    const source = JSON.stringify(d.profile) + d.targetRole + d.fieldDetail;
    // Every number in the output must already appear in the input.
    for (const n of text.match(/\d+/g) ?? []) expect(source).toContain(n);
    // Every skill listed must come from the input.
    for (const s of out.resume!.skills) expect(d.profile.skills).toContain(s);
    expect(out.linkedin!.headline.length).toBeLessThanOrEqual(220);
  });

  it('leaves out empty sections instead of filling them', () => {
    const d = newDraft();
    d.deliverables = ['resume', 'linkedin'];
    d.profile.fullName = 'Sam Lee';
    d.profile.experience = [{ ...emptyExperience(), title: 'Cashier', org: 'Corner Market' }];
    const out = generateLocally(inputFromDraft(d));
    expect(out.resume!.skills).toEqual([]);
    expect(out.resume!.sections.map((s) => s.id)).toEqual(['experience']);
    expect(out.resume!.sections[0].items[0].bullets).toEqual([]);
    expect(out.linkedin!.about).not.toMatch(/Skills:/);
  });

  it('respects the selected deliverables', () => {
    const d = sampleDraft();
    d.deliverables = ['linkedin'];
    const out = generateLocally(inputFromDraft(d));
    expect(out.resume).toBeNull();
    expect(out.linkedin).not.toBeNull();
  });
});
