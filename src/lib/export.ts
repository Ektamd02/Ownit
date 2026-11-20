import type { LinkedInDraft, ResumeDraft } from '../state/types';

export function resumeToText(r: ResumeDraft): string {
  const out: string[] = [r.name.toUpperCase()];
  if (r.contactLine) out.push(r.contactLine);
  const block = (title: string, body: string[]) => {
    out.push('', title.toUpperCase(), ...body);
  };
  if (r.summary) block('Summary', [r.summary]);
  const skills = r.skills.length ? [r.skills.join(', ')] : [];
  if (r.skillsFirst && skills.length) block('Skills', skills);
  for (const s of r.sections) {
    const body: string[] = [];
    s.items.forEach((it, i) => {
      if (i > 0) body.push('');
      body.push([it.heading, it.subheading].filter(Boolean).join(' — '));
      if (it.meta) body.push(it.meta);
      it.bullets.forEach((b) => body.push(`- ${b}`));
    });
    block(s.title, body);
  }
  if (!r.skillsFirst && skills.length) block('Skills', skills);
  for (const x of r.extras) block(x.title, x.lines.map((l) => (x.lines.length > 1 ? `- ${l}` : l)));
  return out.join('\n') + '\n';
}

export function linkedInToText(l: LinkedInDraft): string {
  const parts = [`HEADLINE\n${l.headline}`, `ABOUT\n${l.about}`];
  if (l.experience.length) {
    parts.push('EXPERIENCE\n' + l.experience.map((e) => [e.title, e.org, e.dates, e.description].filter(Boolean).join('\n')).join('\n\n'));
  }
  if (l.education.length) parts.push('EDUCATION\n' + l.education.map((e) => [e.school, e.detail, e.dates].filter(Boolean).join('\n')).join('\n\n'));
  if (l.skills.length) parts.push(`SKILLS\n${l.skills.join(', ')}`);
  return parts.join('\n\n') + '\n';
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A simple Word-compatible document (HTML saved as .doc). Opens in Word, Pages and Google Docs. */
export function resumeToWordHtml(r: ResumeDraft): string {
  const h = (t: string) => `<h2 style="font-size:11pt;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #999;margin:14pt 0 4pt;">${esc(t)}</h2>`;
  const body: string[] = [`<h1 style="font-size:18pt;margin:0;">${esc(r.name)}</h1>`, `<p style="margin:2pt 0 0;">${esc(r.contactLine)}</p>`];
  if (r.summary) body.push(h('Summary'), `<p>${esc(r.summary)}</p>`);
  const skills = r.skills.length ? [h('Skills'), `<p>${esc(r.skills.join(' • '))}</p>`] : [];
  if (r.skillsFirst) body.push(...skills);
  for (const s of r.sections) {
    body.push(h(s.title));
    for (const it of s.items) {
      body.push(`<p style="margin:6pt 0 0;"><b>${esc(it.heading)}</b>${it.subheading ? ` — ${esc(it.subheading)}` : ''}${it.meta ? `<br/><i>${esc(it.meta)}</i>` : ''}</p>`);
      if (it.bullets.length) body.push(`<ul style="margin:2pt 0;">${it.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`);
    }
  }
  if (!r.skillsFirst) body.push(...skills);
  for (const x of r.extras) body.push(h(x.title), x.lines.length > 1 ? `<ul>${x.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : `<p>${esc(x.lines[0])}</p>`);
  return `<html><head><meta charset="utf-8"><title>${esc(r.name)} — Resume</title></head><body style="font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.3;">${body.join('')}</body></html>`;
}

export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function fileSafe(name: string) {
  return (name || 'resume').trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'resume';
}
