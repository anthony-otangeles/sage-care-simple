# SAGE Care Simple — Provider Experience PRD

Status: Retrospective PRD for test and production planning  
Last updated: July 14, 2026  
Product surface: Provider only  
Source reviewed: `main` at commit `fbce893`  
Repository: https://github.com/anthony-otangeles/sage-care-simple

## Executive summary

SAGE Care Simple gives a long-term-care Provider a facility-aware daily workspace for assessing residents whose condition has deviated from baseline, capturing encounters, reviewing Scribe-completed notes, coordinating with care teams, and planning facility routes.

The experience is mobile-first. The primary design target is 390 × 844, with a required usable fallback at 320 px and Large text. Desktop is not optional: at 900 px and above the same Provider workflows must remain complete in a full-width shell with a persistent sidebar, aligned content, centered dialogs, and no horizontal overflow.

The checked-in application is a functional local prototype. Its seeded clinical data, location, Scribe handoffs, Otangeles Notes+ connection, Ask SAGE answers, voice capture, calls, transcription, and billing submission are simulated. The Test Environment milestone validates this observable product contract. The Production Environment milestone implements and releases the same atomic capabilities with production services, security, authorization, auditing, reliability, and approved clinical-data handling.

## Product problem

Providers covering multiple facilities need a fast answer to four questions:

1. Where should I go and whom should I assess first?
2. What changed from each resident's baseline, and when did it change?
3. What encounter work or Scribe review is still incomplete?
4. How can I coordinate with the resident's care team without losing clinical context?

Traditional schedule-first or dense dashboard experiences obscure severity, facility route, current location, and the next safe action. SAGE Care Simple makes documented baseline deviations the unit of Provider work and keeps resident, facility, note, and communication context connected.

## Users and scope

### Primary user

Provider covering assigned skilled-nursing facilities, often working on a phone while moving between residents and facilities.

### In scope

- Provider authentication and session handling.
- Mobile and desktop Provider shells.
- Assigned-facility scoping and simulated current-location behavior.
- Facility-grouped Provider Shift with severity-ranked baseline deviations.
- Encounter scheduling, capture, voice transcription, orders, and Scribe handoff.
- Scribe review queue, section-scoped revision, signature, and billing submission.
- Resident directory, profiles, timeline, notes, and care-room access.
- Direct, group, and resident care-room messaging, calls, and speaker transcripts.
- Facility-first weekly Schedule.
- Ask SAGE, Provider settings, accessibility preferences, help, and logout.

### Out of scope for this PRD

- DON and CNA product behavior, even though the prototype contains those roles.
- Real EHR, pharmacy, laboratory, billing, Notes+, telephony, speech-to-text, or generative-AI integrations.
- Clinical decision support beyond approved reading-aid behavior.
- Production infrastructure design details that do not change the Provider's observable product contract.

## Design and experience principles

- Mobile-first at 390 × 844; usable at 320 px with Large text.
- Desktop-complete at 900 px and above; no reduced or placeholder desktop flows.
- Plain language, large touch targets, one dominant next action, and four primary destinations: Shift, Residents, Messages, and More.
- Navy `#1C192E`, mint `#00C9A7`, and purple `#845EC2`; use the uploaded SAGE logo and accessible `SΛGE` wordmark.
- Facility and resident context must survive navigation into details, encounters, reviews, schedules, and messages.
- Shift exists for deviations from baseline. Stable or routine residents do not belong in the Shift worklist.
- Every visible control must perform a local action and expose a clear result or next state.

## Core journeys

### 1. Start the Provider day

The Provider signs in, sees all assigned facilities with Brickyard Elkhart marked as the simulated current location, reviews overall and per-facility progress, and works the current facility before traveling to the next facility.

### 2. Assess a baseline deviation

The Provider reads a resident card containing severity, reason for visit, baseline change, onset day, room, facility, and address. Encounter actions are enabled only when the Provider is at the resident's facility. The Provider starts or continues the encounter, captures a text note, records and edits a voice transcript, adds orders, and sends the visit to Scribe.

### 3. Review and sign a Scribe-completed note

The Provider filters Encounter Notes by Needs review or Done, opens a ready note, reads the SAGE encounter summary and complete 16-section note, requests a section-scoped revision when needed, or confirms a saved signature and submits the note for billing.

### 4. Review resident context and coordinate care

The Provider searches the clinically ranked resident directory, opens the resident profile, reviews summary, vitals, reports, timeline, and note history, then opens the automatically provisioned care room or adds an encounter.

### 5. Message and call the care team

The Provider searches resident care rooms or the staff directory, sends direct or group messages, records voice messages, starts voice or video calls, and opens chronological speaker-attributed call transcripts. Care-room membership can be updated with assigned staff from the resident's facility.

### 6. Plan the facility route

The Provider uses a Monday–Sunday picker, opens one facility accordion at a time, distinguishes required visits from the daily Otangeles Notes+ list and other facility items, changes weeks, and adds a schedule item on the selected date.

## Functional requirements

The release backlog must be generated from the 106 atomic Provider capabilities in [provider-atomic-capabilities.md](./provider-atomic-capabilities.md). Each capability becomes one issue in the Test Environment milestone and one matching issue in the Production Environment milestone. PRD headings are context, not Linear issue boundaries.

### Environment contract

Test Environment issues validate the existing observable behavior against seeded or synthetic data and record defects without silently changing the product contract.

Production Environment issues deliver the matching capability against production services. Each Production issue is blocked by its Test counterpart and must preserve mobile and desktop parity. Production acceptance additionally requires:

- authenticated, role- and facility-authorized server-side data access;
- encryption in transit and at rest;
- minimum-necessary clinical-data display and approved PHI handling;
- auditable create, update, review, signature, membership, and submission events;
- safe retry, idempotency, error, empty, loading, and unavailable states;
- observability that excludes PHI from logs by default;
- accessibility and responsive regression coverage;
- approved integration contracts instead of prototype timers or hard-coded outcomes.

## Data and integrations

### Current prototype behavior

- React/Vite single-page application.
- Seeded data and browser-local persistence.
- Authentication is session-only and resets on full page load.
- The Provider demo account uses a persisted authenticator-app 2FA setting; any non-empty verification code is accepted by the prototype after a valid first factor.
- Provider location is fixed to Brickyard Elkhart.
- Notes+, Ask SAGE, recording, Scribe, calls, transcription, and billing are simulated.

### Production assumptions requiring validation

- A source of truth exists for Provider identity, assigned facilities, resident census, encounter schedule, clinical note content, care-team membership, and billing submission state.
- Scribe and Notes+ expose supported integration contracts and environment separation.
- Voice and video vendors support consent, retention, transcript attribution, and clinical-data requirements.
- Geolocation or facility-presence enforcement has an approved policy, fallback, and override workflow.
- Signature capture and note submission satisfy applicable legal, billing, audit, and retention requirements.

## Safety, privacy, and compliance

- The prototype and Test Environment use synthetic data only unless a formally approved controlled-data plan says otherwise.
- SAGE Summary and Ask SAGE are reading aids; the complete note remains the signed source of truth.
- Unsupported, stale, or unavailable clinical context must be disclosed rather than invented.
- Production authorization must be enforced server-side for Provider role, assigned facilities, residents, notes, messages, calls, and schedule data.
- Call recording and transcription require approved consent, retention, access, and deletion policies.
- Billing submission and revisions require immutable audit history and idempotent state transitions.

## Success metrics

Final targets require baseline measurement in the Test Environment.

- Shift readiness: percentage of Provider sessions in which the next facility and highest-severity resident are identifiable without opening a detail screen.
- Encounter completion: median time from Start Encounter to Scribe handoff, excluding inactive time.
- Review completion: median time from Scribe completion to signed billing submission.
- Revision quality: percentage of revision requests resolved in one Scribe return.
- Route clarity: percentage of Schedule tasks completed without facility or date correction.
- Communication completion: percentage of resident-context messages or calls started from the correct care room.
- Responsive quality: zero critical workflow blockers at 320 px Large text, 390 × 844, 1024 px, and 1440 px.
- Reliability: successful completion rate for authentication, save, handoff, revision, signature, message, membership, call, and schedule mutations.

## Rollout and release gates

### Milestone 1 — Test Environment

- Deploy a Provider-only test build using synthetic data.
- Execute all 106 atomic capability issues on mobile and desktop where applicable.
- Resolve critical safety, authorization, data-loss, navigation, accessibility, and responsive defects.
- Validate integration contracts and document every remaining simulation or assumption.
- Approve a Production go/no-go decision.

### Milestone 2 — Production Environment

- Complete each matching Production capability after its Test issue passes.
- Replace local and simulated behavior with approved production services.
- Complete security, privacy, audit, accessibility, reliability, recovery, and operational-readiness reviews.
- Run a controlled Provider pilot with monitoring and rollback criteria.
- Expand only after clinical, billing, security, and operational owners approve results.

## Known gaps and open questions

- The current README and historical audit contain stale descriptions of earlier behavior; `AGENTS.md`, current source, and the browser smoke suite are the stronger sources for this PRD.
- The prototype does not prove backend persistence, tenant isolation, real facility-presence enforcement, real Scribe lifecycle, real billing submission, or real communications infrastructure.
- Production owners, target dates, supported browsers, uptime objectives, data-retention periods, and integration SLAs are not yet defined.
- The production meaning of “at the facility” and the safe exception path need policy approval.
- Ask SAGE evidence, freshness, citations, and abstention requirements need a separate clinical-safety review before production use.

## Demo credentials

Provider email: `provider@sage.com`  
Password: `password`

These credentials are for the local/test prototype only and must never be reused for Production authentication.

## Source evidence reviewed

- `AGENTS.md` product decisions.
- `src/App.jsx`, `src/data.js`, and `src/styles.css`.
- `scripts/smoke-functional.mjs` browser-level functional and responsive assertions.
- `README.md` and `design/functional-coverage-audit.md`, treated as historical where they conflict with current code or decisions.
