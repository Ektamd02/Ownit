# Connecting an AI writing service

By default Ownit uses `demoGenerator`, a rule-based writer that only tidies and arranges what the
person entered. The UI labels it as a demo. To use a real model:

1. Build a small backend endpoint (any language) that holds the provider API key **server-side**.
2. Set `VITE_OWNIT_GENERATOR_URL=https://your-backend/api/generate` (see `.env.example`) and rebuild.
   The UI then calls `createApiGenerator` (`src/lib/generator/apiGenerator.ts`) and stops showing the demo notice.

## Contract

`POST` JSON body:

```json
{ "input": GenerateInput }
```

`GenerateInput` (see `src/lib/generator/types.ts`) contains the goal, field, optional target role,
selected deliverables, the confirmed `profile`, and `prefs` (`tone`, `length`, `emphasis`, free-text `note`).

Respond with:

```json
{ "resume": ResumeDraft | null, "linkedin": LinkedInDraft | null }
```

Shapes are in `src/state/types.ts`. Return `null` for any deliverable that was not requested.

## Rules your prompt must enforce

- Use only facts present in `input.profile`. Do not invent employers, titles, dates, skills,
  certifications, metrics or achievements. If something is missing, leave it out.
- Keep resume content ATS-friendly: plain section titles, bullet text without symbols or tables.
- LinkedIn headline ≤ 220 characters; About ≤ 2,600 characters.
- Treat `prefs.note` as a style request, never as a source of new facts.
- Don’t log request bodies — they contain personal information.
