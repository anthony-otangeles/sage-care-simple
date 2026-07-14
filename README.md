# SAGE Care Simple

A standalone, mobile-first redesign of the SAGE care-monitoring experience. It preserves the original Provider, Director of Nursing, and CNA workflows while turning each role’s day into a clear, guided sequence.

## Prototype credentials

These accounts are for the local prototype only. They do not provide access to a production SAGE environment.

| User | Role | Email | Password | Two-factor code |
| --- | --- | --- | --- | --- |
| Dr. Hannah Cole | Provider | `provider@sage.com` | `password` | Any six digits, such as `123456` |
| Jamie Patel, MSN, RN | Director of Nursing | `don@sage.com` | `password` | Not required by default |
| Nina Alvarez | CNA | `cna@sage.com` | `password` | Not required by default |

The simulated **Sign in with Otangeles Notes+** flow accepts any email listed above without asking for the shared password. Provider sign-in still proceeds to the prototype two-factor screen, where any complete six-digit code is accepted.

## Run locally

```bash
npm install
npm run dev
```

## Included functional flows

- Role-aware Provider, Director of Nursing, and CNA home screens
- Provider encounter list, start/continue, Add an Encounter, notes, voice capture, orders, and visit completion
- Multi-encounter review queue with `All`, `Needs review`, and `Done` filters
- Full encounter documents with section verification, text or voice revision requests, signing, and read-only completed notes
- Resident search, situation summaries, vitals, care-team reports, timelines, and note history
- Weekly schedule with previous/next week navigation and schedule creation
- Team action assignment, concern flagging, and completion
- CNA resident-by-resident assignments and guided voice debrief
- Care-team and direct messages, typed or voice messages, call feedback, and resident links
- Context-aware mock Sage assistant, profile preferences, role switching, and in-app help
- Local persistence plus a data reset control
- Responsive 390 × 844 mobile frame with a 320px small-screen fallback

## Verify locally

With the dev server open on port 5178 and Chrome remote debugging on port 9226:

```bash
npm run build
npm run smoke
```

Use `APP_URL` or `CDP_ENDPOINT` to point the smoke test at different local ports.

## Design source and QA

The selected visual direction and browser comparison evidence live in [`design/`](design/). The final review is documented in [`design-qa.md`](design-qa.md).

This is a separate project. It does not modify or replace the original `sage-care-monitoring` repository.
