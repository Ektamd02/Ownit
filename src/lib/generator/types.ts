import type { DeliverableId, FieldId, GeneratedContent, GenerationPrefs, GoalId, Profile } from '../../state/types';

/** Everything a generator is allowed to use. It must not add facts beyond this. */
export interface GenerateInput {
  goal: GoalId | null;
  field: FieldId | null;
  fieldDetail: string;
  targetRole: string;
  deliverables: DeliverableId[];
  profile: Profile;
  prefs: GenerationPrefs;
}

export interface DraftGenerator {
  mode: 'demo' | 'api';
  /** Shown in the UI so people know what produced their draft. */
  label: string;
  /** Whether free-text change requests are understood. */
  understandsNotes: boolean;
  generate(input: GenerateInput, signal?: AbortSignal): Promise<GeneratedContent>;
}
