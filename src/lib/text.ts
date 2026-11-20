/** Small, conservative text helpers. They tidy wording but never add facts. */

export function lines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-•*·]\s*/, '').trim())
    .filter(Boolean);
}

export function splitList(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split(/[,;\n]/)) {
    const item = raw.trim().replace(/\.$/, '');
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

const FIRST_PERSON: [RegExp, string][] = [
  [/^i was responsible for\s+/i, 'Responsible for '],
  [/^i am responsible for\s+/i, 'Responsible for '],
  [/^i'm responsible for\s+/i, 'Responsible for '],
  [/^i (?:helped|help) (?:to )?/i, 'Helped '],
  [/^(?:i|we) /i, ''],
  [/^my job was to\s+/i, ''],
];

/**
 * Turns "I keep the schedule up to date." into "Keep the schedule up to date".
 * Only removes first-person openers and fixes capitalisation/punctuation.
 */
export function polishBullet(raw: string): string {
  let s = raw.trim().replace(/\s+/g, ' ');
  for (const [re, rep] of FIRST_PERSON) {
    if (re.test(s)) {
      s = s.replace(re, rep);
      break;
    }
  }
  s = s.replace(/[.;,\s]+$/, '');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function sentence(raw: string): string {
  const s = raw.trim().replace(/\s+/g, ' ');
  if (!s) return '';
  const cap = s.charAt(0).toUpperCase() + s.slice(1);
  return /[.!?]$/.test(cap) ? cap : `${cap}.`;
}

export function dateRange(start: string, end: string, current = false): string {
  const s = start.trim();
  const e = current ? 'Present' : end.trim();
  if (s && e) return `${s} – ${e}`;
  return s || e;
}

export function joinNonEmpty(parts: (string | undefined | null)[], sep = ' · '): string {
  return parts.map((p) => (p ?? '').trim()).filter(Boolean).join(sep);
}

/** Contains a digit — used to remind people to verify numbers. */
export function hasNumber(text: string): boolean {
  return /\d/.test(text);
}

export function article(word: string): string {
  return /^[aeiou]/i.test(word.trim()) ? 'an' : 'a';
}
