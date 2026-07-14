# Design QA — Provider Shift and Encounter Note

- Source visual truth paths:
  - `conversation-attachment://current-turn/shift-card-changed-baseline`
  - `conversation-attachment://current-turn/shift-card-no-change`
  - `conversation-attachment://current-turn/encounter-vital-signs`
  - `conversation-attachment://current-turn/encounter-medications`
  - `conversation-attachment://current-turn/encounter-problems-treatment-plans`
  - `conversation-attachment://current-turn/encounter-cpt-codes`
  - `conversation-attachment://current-turn/shift-summary-density`
  - `conversation-brief://current-turn/facility-selector-hierarchy-and-facility-first-schedule`
  - `conversation-attachment://current-turn/shift-overview-low-density`
- Browser-rendered implementation screenshots:
  - `/tmp/sage-shift-final-reference-match.png`
  - `/tmp/sage-encounter-note-final-top.png`
  - `/tmp/sage-encounter-vitals-final.png`
  - `/tmp/sage-encounter-medications-final.png`
  - `/tmp/sage-encounter-assessment-plan.png`
  - `/tmp/sage-encounter-cpt-final.png`
  - `/tmp/sage-shift-qa.png`
  - `/tmp/sage-review-qa.png`
  - `/tmp/sage-facility-hierarchy.png`
  - `/tmp/sage-schedule-facility-first.png`
  - `/tmp/sage-shift-overview-clean.png`
  - `/tmp/sage-review-sign-details-final.png`
  - `/tmp/sage-review-notes-revision.png`
- Viewport: 390 × 844
- States: Provider Shift · All facilities; Provider Review and Sign · Needs review

## Full-view comparison evidence

The Shift implementation follows the supplied patient-card composition: initials, resident identity, room/last-seen context, lavender reason block, stateful baseline callout, wide purple encounter action, and square message action. The active Shift card uses the reference's amber deviation treatment with a `Since Monday` lead-in and Sage provenance. Reason and change values use regular weight. The current SAGE product requirements remain visible around the card: facility scope, progress, severity, and location-gated encounter actions.

The Encounter Note keeps all sixteen original SAGE clinical sections in one continuous document. Section cards are always expanded with no accordion buttons or chevrons. The four supplied clinical references are reproduced as distinct layouts rather than generic field rows.

The updated Review and Sign view removes the repeated portrait/date block, places `Needs review` at header-right, and shows the resident and completing Scribe below the title. The SAGE summary, encounter metadata, all sixteen white note sections, per-section source statuses, and quiet per-section revision actions sit on a subtle gray reading surface. The final billing action remains visible in a bottom dock while the document scrolls.

## Focused-region comparison evidence

- Vital Signs: six soft-gray tiles in the supplied two-column order—Blood Pressure/Heart Rate, Respiratory Rate/Temperature, O2 Saturation/Weight—with an abnormal blood-pressure value highlighted and `New this visit` badge.
- Medications: `Carried forward` badge, bordered medication cards with medication/instruction hierarchy, five-item initial view, and functional `Show all 21 medications` expansion.
- Assessment & Plan: preserves the original SAGE section name while applying the supplied problems-and-treatment-plans anatomy: diagnosis code pills, diagnosis titles, plan copy, and mint action rows.
- CPT Codes: `New this visit` badge and a purple `99309` code pill paired with `Supported by documentation`.
- No raster or custom image assets were present in the references. Standard interface symbols use the established app icon library.

## Findings and comparison history

### Pass 1

- [P2] Resident recency copy did not use the supplied `last seen` language.
  - Fix: changed resident metadata to `Room {room} · last seen {update}`.
  - Evidence: `/tmp/sage-patient-cards-final-390x844.png`.

### Pass 2

- [P1] Shift severity described resident-directory status and allowed stable/routine changes.
  - Fix: introduced encounter-level deviation severity and concrete baseline deviations for every Shift visit.
  - Evidence: `/tmp/sage-shift-baseline-deviations.png`.

### Pass 3

- [P1] Adding facility cards pushed Start Encounter below the initial mobile viewport.
  - Fix: tightened Shift-only spacing while preserving touch targets and complete card content.
  - Evidence: `/tmp/sage-facility-cards-shift-final.png`.

### Pass 4

- [P2] Baseline onset was not a separate scannable field.
  - Fix: added required onset-day capture and a visible day reference on each Shift card and Visit details.
  - Evidence: `/tmp/sage-facility-cards-shift-final.png`.

### Pass 5

- [P2] The light 93px bottom navigation was visually weak and consumed excessive height.
  - Fix: reduced it to 72px and introduced the dark navy/mint treatment with 48px minimum tab targets.
  - Evidence: `/tmp/sage-dark-compact-nav.png`.

### Pass 6

- [P1] Baseline deviations used the same gray/green treatment as a no-change state.
  - Fix: real deviations now use amber `Since {day}` callouts with Sage provenance; green is reserved for explicit no-change states.
- [P1] Encounter Note sections were accordions, hiding most clinical content.
  - Fix: all sixteen sections now remain expanded in a continuous document.
- [P2] Vitals, medications, Assessment & Plan, and CPT used generic field rows instead of the supplied component anatomy.
  - Fix: added the screenshot-led vitals grid, medication cards, diagnosis/treatment-plan cards, and CPT pill.
- [P2] Facility scope began with the current location rather than `All facilities`.
  - Fix: `All facilities` is first; the current Brickyard facility follows and remains marked `You’re here`.
- [P2] The first Vitals implementation inherited the old field order.
  - Fix: explicitly ordered the six tiles to match the reference.
  - Post-fix evidence: `/tmp/sage-shift-final-reference-match.png`, `/tmp/sage-encounter-vitals-final.png`, `/tmp/sage-encounter-medications-final.png`, `/tmp/sage-encounter-assessment-plan.png`, and `/tmp/sage-encounter-cpt-final.png`.

### Pass 7

- [P2] The `Since {day}` lead-in inherited the amber change color instead of the black reference treatment.
  - Fix: scoped the lead-in to the primary ink color while preserving amber for the changed value.
- [P2] Facility scope cards visually ran together in the horizontal rail.
  - Fix: increased card gap, strengthened the shadow, and added a subtle rail boundary.
- [P1] Review repeated resident identity and a revision button in nearly every clinical section, creating unnecessary density.
  - Fix: moved review status into the header, added a single encounter-level SAGE summary and revision action, and removed repeated section controls.
- [P1] A revision remained provider-side instead of returning to the Scribe workflow.
  - Fix: revision submission now records the target section, sends the encounter to Scribe, locks it in the queue, and appends a timeline event.
- [P1] The final signing action scrolled away and used completion-only language.
  - Fix: renamed it `Sign and Submit for billing`, docked it at the bottom of Review and Sign, and updated confirmation, toast, and timeline language.
  - Post-fix evidence: `/tmp/sage-shift-qa.png` and `/tmp/sage-review-qa.png`.

### Pass 8

- [P2] Facility scope cards used heavy weights for the kicker, name, and progress, flattening the hierarchy.
  - Fix: reduced the kicker to medium weight, kept the facility name as the only strong line, and changed progress/detail copy to regular weight.
- [P1] Schedule exposed a long patient-by-time list that obscured the Provider’s facility route.
  - Fix: each day now shows facility accordions first. Expanded facilities separate required follow-up and 30/60-day visits from the Otangeles Notes+ daily list, with patient times removed.
- [P2] Adding a Schedule item could omit facility context when All facilities was selected.
  - Fix: the add flow now schedules a facility first, filters required-visit residents to that facility, and removes the patient time field.
  - Post-fix evidence: `/tmp/sage-facility-hierarchy.png` and `/tmp/sage-schedule-facility-first.png`.

### Pass 9

- [P2] The Shift overview flowed directly into facility groups, making the supplied progress/Changes/Add section feel busier than the reference.
  - Fix: isolated the overview as a white low-density section and moved facility groups onto a separated gray surface below it.
- [P1] Review and Sign omitted service date, visit type, facility, Provider, and completing-Scribe context.
  - Fix: added a four-field encounter-details card and the resident/completing-Scribe line beneath the header title.
- [P1] Review status sat below the title rather than at header-right, and the first right-aligned implementation truncated the completing-Scribe line.
  - Fix: positioned status at the right without consuming the subtitle column; post-fix measurement confirms the full subtitle fits its 301px track.
- [P1] Product-owner clarification requires revision at every note section, including Notes, plus the SAGE Summary.
  - Fix: restored a quiet per-section action on all sixteen sections, kept a Summary action, pre-scoped each revision sheet, and changed the queue result to locked `Revision sent to Scribe`.
- [P2] Section provenance was shown only on selected clinical sections.
  - Fix: every section now displays exactly one `New this visit` or `Carried forward` badge.
- [P2] The SAGE summary could be mistaken for part of the signed clinical note.
  - Fix: appended the exact reading-aid disclaimer supplied by the product owner.
  - Post-fix evidence: `/tmp/sage-shift-overview-clean.png`, `/tmp/sage-review-sign-details-final.png`, and `/tmp/sage-review-notes-revision.png`.

No actionable P0, P1, or P2 findings remain.

## Required fidelity surfaces

- Fonts and typography: existing Inter/system stack retained; clinical values use regular weight while labels, codes, and section headings carry the reference hierarchy. No visible text clips at 390px.
- Spacing and layout rhythm: compact 70px header, horizontal facility rail, 20px Shift inset, rounded clinical cards, two-column vitals grid, and 72px navigation preserve the reference density without hiding the primary encounter action.
- Colors and visual tokens: restrained SAGE purple remains the primary action/accent; amber communicates deviation, mint is reserved for no-change/success and plan actions, and soft neutral tiles match the clinical references.
- Image quality and asset fidelity: references contain UI components rather than raster assets. Existing SAGE icons remain sharp and appropriately scaled; no placeholder or handcrafted graphic substitutes are used.
- Copy and content: the implementation uses seeded resident-specific clinical content, explicit onset day, original SAGE section names, the requested medication examples, and CPT 99309 support language.

## Primary interactions and browser checks

- Confirmed All facilities is the first scope card and Brickyard Elkhart is marked `You’re here`.
- Confirmed the 70px primary header and 72px bottom navigation both hide on downward scroll and return at the top.
- Confirmed Start Encounter remains fully visible at 390 × 844.
- Confirmed all sixteen Encounter Note sections render simultaneously with zero accordion header buttons.
- Confirmed `Show all 21 medications` expands the medication list.
- Confirmed the Review and Sign header shows `Needs review` at right and the complete resident/completing-Scribe line below the title.
- Confirmed the Summary and all sixteen clinical sections—including Notes—have pre-scoped Request revision actions that send the encounter back to Scribe as a locked queue item.
- Confirmed every clinical section shows a `New this visit` or `Carried forward` status and the gray/white background hierarchy remains legible.
- Confirmed Service Date, Visit type, Facility, Provider, and the exact SAGE reading-aid disclaimer are present.
- Confirmed `Sign and Submit for billing` remains docked to the 390 × 844 viewport while note content scrolls.
- Confirmed facility selector context and progress are visibly lighter than the facility name.
- Confirmed Schedule renders facility accordions instead of patient-time rows, defaults the simulated current facility open, and labels 30-day and 60-day required visits.
- Confirmed expanded facilities show the Otangeles Notes+ daily list and keep resident/facility-item actions functional.
- Confirmed full Provider, DON, and CNA functional smoke suite passes with no browser exceptions or console errors.
- Confirmed 390px and 320px Large-text states have no page-level horizontal overflow.

## Expected product-specific differences

- The section remains titled `Assessment & Plan` to preserve the original SAGE clinical-note name while using the supplied Problems & Treatment Plans visual anatomy.
- The SAGE Summary and clinical sections use the existing SAGE card language while adding workflow context not represented in the supplied clinical-section screenshots.

final result: passed
