# Provider atomic capability inventory

This file is the source list for Linear issues. One row equals one independently observable Provider capability. The Test and Production milestones must contain the same 106 capability IDs.

The product is mobile-first at 390 × 844, must remain usable at 320 px with Large text, and must provide the complete workflow at desktop widths of 900 px and above.

| ID | Area | Atomic capability |
| --- | --- | --- |
| AUTH-01 | Authentication | Provider is able to sign in with email and password. |
| AUTH-02 | Authentication | Provider is able to see an error after entering invalid credentials. |
| AUTH-03 | Authentication | Provider is able to request a password-reset link without account enumeration. |
| AUTH-04 | Authentication | Provider is able to sign in through the simulated Otangeles Notes+ connection. |
| AUTH-05 | Authentication | Provider is able to log out through a confirmation step. |
| AUTH-06 | Authentication | Provider is required to authenticate again after a full page reload while persisted clinical data remains available. |
| AUTH-07 | Authentication | Provider is able to complete two-factor verification with any non-empty prototype code after a valid first factor. |
| SHELL-01 | Application shell | Provider is able to navigate among Shift, Residents, Messages, and More. |
| SHELL-02 | Application shell | Provider is able to use a persistent desktop navigation sidebar at widths of 900 px and above. |
| SHELL-03 | Application shell | Provider is able to use the full mobile workflow at a 390 × 844 viewport without horizontal overflow. |
| SHELL-04 | Application shell | Provider is able to use the full mobile workflow at 320 px with Large text without horizontal overflow. |
| SHELL-05 | Application shell | Provider is able to use the full desktop workflow at 1024 px and 1440 px without horizontal overflow. |
| SHELL-06 | Application shell | Provider is able to hide the mobile header and bottom navigation by scrolling down and restore them by scrolling up. |
| SHELL-07 | Application shell | Provider is able to return to the actual prior screen and preserved filter, tab, or week through Back. |
| SHELL-08 | Application shell | Provider is able to open Ask SAGE directly from the primary header. |
| BRAND-01 | Application shell | Provider is able to see the current uploaded SAGE logo and accessible SΛGE wordmark in authentication and application chrome. |
| BRAND-02 | Application shell | Provider is able to recognize the app through the current SAGE favicon and approved navy, mint, and purple palette. |
| FAC-01 | Facility scope | Provider is able to view All facilities first followed by all assigned facility cards. |
| FAC-02 | Facility scope | Provider is able to see Brickyard Elkhart marked as the simulated current facility. |
| FAC-03 | Facility scope | Provider is able to select one facility and filter residents, encounters, messages, actions, assignments, and schedule data. |
| FAC-04 | Facility scope | Provider is able to distinguish facility cards through clear type hierarchy and visual separation. |
| SHIFT-01 | Shift | Provider is able to view overall completed-visit progress for today's 12 visits. |
| SHIFT-02 | Shift | Provider is able to view separate progress for each facility. |
| SHIFT-03 | Shift | Provider is able to view today's open visits grouped by facility with the current facility first. |
| SHIFT-04 | Shift | Provider is able to view each open resident as a separate roomy card with initials and no patient photograph. |
| SHIFT-05 | Shift | Provider is able to see each resident's current deviation severity. |
| SHIFT-06 | Shift | Provider is able to see each resident's reason for visit without opening details. |
| SHIFT-07 | Shift | Provider is able to see what changed from baseline and when the change began without opening details. |
| SHIFT-08 | Shift | Provider is able to recognize SAGE provenance on each baseline-deviation callout. |
| SHIFT-09 | Shift | Provider is able to see residents ordered by deviation severity within each facility. |
| SHIFT-10 | Shift | Provider is able to see room, facility name, and street address before starting an encounter. |
| SHIFT-11 | Shift | Provider is able to start or continue an encounter only while at the resident's facility. |
| SHIFT-12 | Shift | Provider is able to see a disabled Start Encounter action for every off-site resident even when stale data says the encounter is in progress. |
| SHIFT-13 | Shift | Provider is able to open the resident's care room from the Shift card. |
| ENC-01 | Add Encounter | Provider is able to search for a resident by name, room, or facility when adding an encounter. |
| ENC-02 | Add Encounter | Provider is able to select from the complete ordered list of 77 encounter types. |
| ENC-03 | Add Encounter | Provider is required to enter a reason for visit, deviation severity, baseline change, and onset day before scheduling an encounter. |
| ENC-04 | Add Encounter | Provider is prevented from adding a duplicate scheduled or in-progress encounter for the same resident and day. |
| ENC-05 | Add Encounter | Provider is able to add a validated encounter to today's Shift without starting it automatically. |
| ENC-06 | In-progress Encounter | Provider is able to start a scheduled encounter from Shift or Visit details. |
| ENC-07 | In-progress Encounter | Provider is able to continue an in-progress encounter while at the resident's facility. |
| ENC-08 | In-progress Encounter | Provider is able to capture and edit a text Visit note in a prominent writing area. |
| ENC-09 | In-progress Encounter | Provider is able to record a prominent Voice note with an inline timer and Stop action. |
| ENC-10 | In-progress Encounter | Provider is able to review and edit the voice transcription after recording stops. |
| ENC-11 | In-progress Encounter | Provider is able to add encounter orders that appear in Assessment & Plan rather than Notes. |
| ENC-12 | In-progress Encounter | Provider is able to end the visit and send the encounter to Scribe. |
| ENC-13 | Scribe handoff | Provider is able to see a newly handed-off encounter locked and prioritized at the top of Needs review. |
| ENC-14 | Scribe handoff | Provider is able to see the assigned Scribe and persistent progress state without an automatic return time. |
| REV-01 | Encounter Notes | Provider is able to filter Encounter Notes by Needs review or Done. |
| REV-02 | Encounter Notes | Provider is able to see separate queue cards for ready, Scribe-in-progress, revision, and completed encounters. |
| REV-03 | Review and Sign | Provider is able to see Needs review status on the right side of the Review and Sign header on mobile and desktop. |
| REV-04 | Review and Sign | Provider is able to see the resident name and completing Scribe directly below the Review and Sign title. |
| REV-05 | Review and Sign | Provider is able to review Service Date, Visit type, Facility, and Provider metadata. |
| REV-06 | Review and Sign | Provider is able to read an encounter-level SAGE Summary with a clear reading-aid disclaimer. |
| REV-07 | Review and Sign | Provider is able to review all 16 original SAGE note sections in an always-expanded layout. |
| REV-08 | Review and Sign | Provider is able to distinguish New this visit from Carried forward content on every clinical section. |
| REV-09 | Review and Sign | Provider is able to review Vital Signs in a two-column six-value grid. |
| REV-10 | Review and Sign | Provider is able to review carried-forward medication cards and expand the complete medication list. |
| REV-11 | Review and Sign | Provider is able to review diagnosis and treatment-plan cards in Assessment & Plan. |
| REV-12 | Review and Sign | Provider is able to review CPT codes and the complete Code Status description. |
| REV-13 | Review and Sign | Provider is able to request a revision from each eligible clinical section except SAGE Summary and Notes. |
| REV-14 | Review and Sign | Provider is able to submit a text or voice revision that locks the note and sends it back to Scribe. |
| REV-15 | Review and Sign | Provider is able to open a revision sheet without its submit action being covered by the billing dock. |
| REV-16 | Signature | Provider is required to save a signature before signing an encounter. |
| REV-17 | Signature | Provider is able to save a drawn, typed, or supported uploaded signature and preview or remove it. |
| REV-18 | Signature | Provider is able to confirm the encounter-specific signature details before final submission. |
| REV-19 | Signature | Provider is able to sign and submit a note for billing from a docked action that hides and restores with scroll. |
| REV-20 | Signature | Provider is able to reopen a signed note read-only with signer, timestamp, and signature snapshot. |
| RES-01 | Residents | Provider is able to view every resident as a separate initials-based card. |
| RES-02 | Residents | Provider is able to see residents ordered by clinical status and then alphabetically. |
| RES-03 | Residents | Provider is able to search residents while preserving clinical ordering. |
| RES-04 | Resident profile | Provider is able to review resident summary, vitals, and care-team reports. |
| RES-05 | Resident profile | Provider is able to review the persisted resident timeline and Provider note lifecycle events. |
| RES-06 | Resident profile | Provider is able to review current and historical encounter notes from the resident profile. |
| RES-07 | Resident profile | Provider is able to add an encounter through a solid purple action. |
| RES-08 | Resident profile | Provider is able to open the resident's correctly linked care room. |
| MSG-01 | Messages | Provider is able to view one automatically provisioned card for every resident care room. |
| MSG-02 | Messages | Provider is able to search care rooms by resident or message content. |
| MSG-03 | Messages | Provider is able to view and search a contactable staff directory with explicit Call and Message actions. |
| MSG-04 | Messages | Provider is able to start or reopen a direct message with one searchable person. |
| MSG-05 | Messages | Provider is able to create a multi-select staff group chat or group call. |
| MSG-06 | Messages | Provider is able to send a typed message in direct, group, and care-room conversations. |
| MSG-07 | Messages | Provider is able to record and play a voice message separately from call transcription. |
| MSG-08 | Messages | Provider is able to start voice and video calls from compact conversation headers. |
| MSG-09 | Messages | Provider is able to open a persisted call event and view chronological speaker-attributed transcription. |
| MSG-10 | Messages | Provider is able to see private-call transcripts containing You and the actual other participant. |
| MSG-11 | Messages | Provider is able to see group and care-room transcripts containing actual conversation members. |
| MSG-12 | Care rooms | Provider is able to see the live care-room member count in the conversation header. |
| MSG-13 | Care rooms | Provider is able to add non-duplicate assigned staff from the resident's facility and see the count and membership event update immediately. |
| MSG-14 | Care rooms | Provider is able to open the correct resident profile from the care-room header menu. |
| SCH-01 | Schedule | Provider is able to select one day from a horizontal Monday–Sunday picker. |
| SCH-02 | Schedule | Provider is able to view only the selected day's facilities and patient-count summary. |
| SCH-03 | Schedule | Provider is able to expand one facility accordion at a time with the current facility prioritized when available. |
| SCH-04 | Schedule | Provider is able to distinguish Required visits, the daily Otangeles Notes+ visit list, and Facility items without patient appointment-time ordering. |
| SCH-05 | Schedule | Provider is able to move to the previous or next week with Today selected in the current week and Monday selected otherwise. |
| SCH-06 | Schedule | Provider is able to add a facility-first schedule item with the selected date prefilled. |
| SCH-07 | Schedule | Provider is able to add a schedule item from a plain empty-day state. |
| SAGE-01 | Ask SAGE | Provider is able to submit a typed plain-language question and receive a context-aware response. |
| SAGE-02 | Ask SAGE | Provider is able to record, stop, transcribe, and submit an audio question inline beside Submit. |
| MORE-01 | More | Provider is able to open Encounter Notes, Schedule, Ask SAGE, Settings, and Help from plain-language task entries. |
| SET-01 | Settings | Provider is able to update separate First name and Last name fields while Role remains read-only. |
| SET-02 | Settings | Provider is able to view every assigned facility in Profile Settings. |
| SET-03 | Settings | Provider is able to enable or disable Push Notifications from a full-row target with a standard checkbox. |
| SET-04 | Settings | Provider is able to choose and persist Small, Default, or Large app-wide text size. |
| SET-05 | Settings | Provider is able to manage the saved Provider signature from Settings. |
| SET-06 | Settings | Provider is able to set up or reconfigure authenticator-app two-factor authentication from Settings. |

## Environment-specific acceptance

### Test Environment

- The capability is exercised with the Provider demo account and synthetic data.
- The observable result matches the capability and current PRD contract.
- Mobile is checked at 390 × 844; relevant narrow-layout behavior is checked at 320 px with Large text.
- The complete corresponding workflow is checked at 1024 px desktop; critical shell and layout behavior is also checked at 1440 px.
- No page-level horizontal overflow, uncaught browser exception, or data-loss defect occurs.
- Any simulation or unavailable external service is clearly disclosed.

### Production Environment

- The matching Test issue is complete and the accepted behavior remains unchanged.
- The capability uses approved production authentication, authorization, persistence, and integration services.
- Loading, empty, error, retry, duplicate-submission, and unavailable states fail safely.
- Security, privacy, audit, accessibility, responsive, monitoring, and rollback requirements are satisfied.
- No prototype credential, hard-coded role, fixed clinical outcome, local-only state, or timer-driven external workflow is used as production behavior.
