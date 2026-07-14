# SAGE Functional Coverage Audit

Date: July 13, 2026  
Viewport: 390 × 844 mobile  
Scope: Messages, resident-linked communication, and a source-code comparison of core workflows against the local full SAGE prototype in `../sage-care-monitoring`.

## Overall verdict

The replacement preserved the four-destination mobile structure, but Messages was initially a thin history view rather than a complete communication workflow. Only one resident had a dedicated thread, People only showed an existing direct message, and a resident without a linked thread could be routed into the wrong conversation. The corrected flow now provides one care room per resident, a contactable staff directory, correct resident-to-room linkage, new direct/room conversation targeting, search, calls, voice messages, and conversation summaries.

## Captured flow

1. **Before — Care-team list: Needs work.** Only Mary Lou and a West Hall group were visible. Other residents had no dedicated communication entry. Evidence: [01-before-care-teams.png](functional-audit/01-before-care-teams.png)
2. **Before — New message: Needs work.** The form could only select an existing conversation, so it could not contact a new person or deliberately choose a resident care room. Evidence: [02-before-new-message.png](functional-audit/02-before-new-message.png)
3. **After — Resident care rooms: Healthy.** All eight residents have dedicated rooms, separated from the West Hall team group and searchable by resident or message content. Evidence: [03-after-care-rooms.png](functional-audit/03-after-care-rooms.png)
4. **After — People directory: Healthy.** Staff are available by name, role, availability, and recent conversation context even when no direct thread exists yet. Evidence: [04-after-people-directory.png](functional-audit/04-after-people-directory.png)
5. **After — New message targeting: Healthy.** The user can choose Person or Care room, optionally write the first message, and open or send into the correct conversation. Evidence: [05-after-new-message.png](functional-audit/05-after-new-message.png)
6. **After — Resident-linked room: Healthy.** Beatrice Holloway opens a room carrying Beatrice's identity, room context, care-team messages, calls, resident shortcut, voice capture, and composer. Evidence: [06-after-resident-care-room.png](functional-audit/06-after-resident-care-room.png)

## Strengths retained

- Four stable primary destinations remain unchanged.
- Direct, resident-room, and staff-group threads share the same readable conversation pattern.
- Voice message, voice call, video call, typed message, resident shortcut, and conversation summary controls provide local feedback or state changes.
- Large touch targets, plain labels, presence text, and role labels support hurried care-team users.

## Remaining source-comparison gaps

These are based on the local original SAGE source and Provider Workspace PRD, not screenshot-only accessibility evidence.

### Highest priority

1. **Hospital escalation workflow:** the original supports resident-linked hospital escalations and escalation threads; the replacement has no dedicated escalation path.
2. **Encounter correction:** the original supports soft cancellation and signature revocation; the replacement does not yet expose those lifecycle actions.
3. **Notifications:** the original has attention, review, action, escalation, and schedule notifications with deep links and read state; the replacement only shows counts inside individual screens.
4. **Clinical coordination worklists:** orders, follow-ups, huddles, and actions exist in simplified forms, but there is no unified status/owner/source view matching the original.

### Next priority

5. **Facility scope:** the original supports assigned facilities, facility switching, and facility-aware counts; the replacement uses one fixed facility context.
6. **Explainable Sage evidence:** the original exposes confidence, source evidence, freshness, and recommended actions; the replacement's Ask Sage responses are concise but not independently reviewable.
7. **Advanced messaging:** resident mentions, new staff-group creation, member management, thread renaming, and call transcription remain absent.
8. **Resident coordination context:** the original resident profile includes dedicated actions/orders/updates context; the replacement currently covers summary, vitals, reports, timeline, notes, and care room.
9. **Settings and identity:** assigned facilities, security/session controls, role-specific preferences, and provider signature setup remain simplified.

## Accessibility limits

The captured mobile states show clear labels, non-color presence text, large targets, and usable responsive reflow. Automated browser checks confirmed no page-level horizontal overflow at 390 px and 320 px. Full keyboard order, visible focus, screen-reader announcements, contrast ratios, and assistive-technology semantics still require dedicated testing.
