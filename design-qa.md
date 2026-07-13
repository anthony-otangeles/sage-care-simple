# Design QA

- Source visual truth: `design/shift-checklist-reference.png`
- Initial implementation: `design/shift-checklist-implementation-v1.png`
- Final implementation: `design/shift-checklist-implementation-v2.png`
- Final full-view comparison: `design/shift-checklist-comparison-v2.jpg`
- Viewport: 390 × 844
- State: Shift home, initial state, 2 of 5 visits complete

## Full-view comparison evidence

The final comparison places the selected Image Gen direction and the browser-rendered prototype together at the same 390 × 844 viewport. The implementation preserves the source hierarchy and crop: 100px lavender header, shift title and progress, three chronological visit rows, review strip, and fixed 93px four-item navigation. The primary Start action and all persistent navigation remain visible without scrolling.

Focused-region comparison was not required because each half of the 780 × 844 final comparison remains at its native 390px width. The logo, type, visit-row copy, controls, dividers, icons, and review strip remain legible at that scale, and the target contains no photographic or custom raster assets needing a separate crop comparison.

## Comparison history

### Pass 1

**Findings**

- [P2] Visit-list density was too compressed.
  - Location: `.up-next`, `.visit-list`, `.visit-row`.
  - Evidence: the first implementation brought the review strip roughly 18px higher than the source and shortened the visit rhythm.
  - Impact: the shift felt more like a dense dashboard and less like the calm, sequential checklist selected by the user.
  - Fix: reduced the pre-list gaps while increasing each visit row from 103px to 113px, aligning all three visits and the review strip with the source.
- [P2] Header and primary control proportions drifted from the source.
  - Location: `.sage-mark`, `.profile-button`, `.start-button`.
  - Evidence: the SAGE mark was oversized and the Start button was visibly narrower than the selected design.
  - Impact: the header competed with the shift task, while the main action had less visual confidence.
  - Fix: reduced the mark and profile icon, adjusted header padding, and widened Start from 78px to 85px.
- [P2] Review icon did not match the selected document metaphor.
  - Location: `.review-icon` in `ShiftScreen`.
  - Evidence: the implementation used a check-document icon while the source used a plain document icon.
  - Impact: it implied the note was already completed rather than awaiting review.
  - Fix: replaced it with the matching document icon from the same icon family.

Post-fix evidence: `design/shift-checklist-implementation-v2.png` and `design/shift-checklist-comparison-v2.jpg`.

### Pass 2

No actionable P0, P1, or P2 differences remain.

## Required fidelity surfaces

- Fonts and typography: system Inter stack, weights, scale, line height, hierarchy, and truncation match the source closely. Names and visit reasons remain readable without clipping at 390px.
- Spacing and layout rhythm: 19px page inset, header, progress, visit rows, review strip, and bottom navigation align with the selected composition. No horizontal overflow is present.
- Colors and visual tokens: SAGE purple, mint action/progress, lavender header, white surface, gray dividers, and accessible dark text map to the source. Semantic actions retain sufficient contrast.
- Image quality and asset fidelity: the target contains no photos or illustrations. All visible symbols use one production icon library; no handcrafted SVG, CSS drawing, emoji, or placeholder imagery is used.
- Copy and content: visible source copy is preserved, including the exact date, resident names, rooms, visit reasons, progress, note-review prompt, and four navigation labels.
- Icons: logo, profile, visit arrows, note, and navigation icons use a consistent outline family and have practical touch targets.
- Accessibility: semantic buttons and navigation, visible focus rings, dialog labels, status announcements, input labels, and 44px-or-larger core touch targets are present.

## Functional and responsive checks

- Started Mary Lou Smith’s visit and confirmed the Start control changed to Continue.
- Opened the visit detail sheet and completed its primary action.
- Switched among Shift, Residents, Messages, and More.
- Verified resident search input and resident detail access.
- Opened the note review sheet and approved the note with a success announcement.
- Checked browser console: no errors.
- Checked 320 × 700: no horizontal overflow, bottom navigation remains fixed, Start remains visible, and long content scrolls vertically.

## Follow-up polish

- [P3] The bottom-navigation content sits a few pixels lower than the generated source; this does not affect clarity or touchability.
- [P3] The live SAGE wordmark uses the system font and is marginally wider than the generated raster lettering.

final result: passed
