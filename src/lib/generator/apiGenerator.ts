/**
 * Calls YOUR backend, which in turn calls an AI provider.
 *
 * The browser never holds a provider API key. The backend must:
 *   1. accept POST { input: GenerateInput }
 *   2. instruct the model to use only facts in `input.profile` (no invented
 *      skills, employers, dates, metrics or achievements)
 *   3. return { resume: ResumeDraft | null, linkedin: LinkedInDraft | null }
 * See docs/connecting-ai.md for the full contract.
 */
import type { GeneratedContent } from '../../state/types';
import type { DraftGenerator, GenerateInput } from './types';

export function createApiGenerator(endpoint: string): DraftGenerator {
  return {
    mode: 'api',
    label: 'Connected writing service',
    understandsNotes: true,
    async generate(input: GenerateInput, signal?: AbortSignal): Promise<GeneratedContent> {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
        signal,
      });
      if (!res.ok) throw new Error(`The writing service responded with ${res.status}.`);
      const data = (await res.json()) as Partial<GeneratedContent>;
      if (!data || (data.resume === undefined && data.linkedin === undefined)) {
        throw new Error('The writing service returned an unexpected response.');
      }
      return {
        resume: input.deliverables.includes('resume') ? data.resume ?? null : null,
        linkedin: input.deliverables.includes('linkedin') ? data.linkedin ?? null : null,
        generatedAt: new Date().toISOString(),
        source: 'api',
        edited: false,
      };
    },
  };
}
