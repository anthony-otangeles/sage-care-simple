import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  CalendarCheck2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleUserRound,
  ClipboardCheck,
  Clock3,
  Ellipsis,
  FileCheck2,
  FileText,
  HelpCircle,
  Home,
  ListChecks,
  MapPin,
  MessageSquare,
  Mic,
  Pause,
  Phone,
  Play,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Square,
  Stethoscope,
  UserRound,
  UsersRound,
  Video,
  X,
  Zap,
} from "lucide-react";
import {
  TODAY,
  deepCopy,
  initialActions,
  initialAssignments,
  initialEncounters,
  initialSchedule,
  initialThreads,
  residentById,
  residents,
  roleProfiles,
} from "./data.js";

const STORAGE_VERSION = "sage.simple.functional.v2";
const reviewStatuses = new Set(["needs-review", "revision"]);

function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(`${STORAGE_VERSION}.${key}`);
      return stored ? JSON.parse(stored) : deepCopy(initialValue);
    } catch {
      return deepCopy(initialValue);
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(`${STORAGE_VERSION}.${key}`, JSON.stringify(value));
    } catch {
      // Persistence is best-effort for this local frontend.
    }
  }, [key, value]);

  return [value, setValue];
}

function prettyStatus(status) {
  const labels = {
    scheduled: "Scheduled",
    "provider-in-progress": "In progress",
    "needs-review": "Needs review",
    revision: "Revision requested",
    "submitted-to-billing": "Done",
    open: "Open",
    "in-progress": "In progress",
    completed: "Done",
    flagged: "Flagged",
    pending: "Not started",
    captured: "Captured",
  };
  return labels[status] ?? status.replaceAll("-", " ");
}

function statusTone(status) {
  const normalized = status.toLowerCase();
  if (["declining", "urgent", "flagged"].some((value) => normalized.includes(value))) return "danger";
  if (["watch", "high", "review", "revision", "progress", "new admission"].some((value) => normalized.includes(value))) return "warning";
  if (["done", "submitted", "stable", "captured", "completed"].some((value) => normalized.includes(value))) return "success";
  return "neutral";
}

function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function SageMark() {
  return (
    <div className="sage-mark" aria-label="SAGE">
      <Zap aria-hidden="true" strokeWidth={2.25} />
      <span>SAGE</span>
    </div>
  );
}

function AppHeader({ role, module, onBack, onProfile }) {
  if (module) {
    return (
      <header className="app-header task-header">
        <button className="header-back" type="button" onClick={onBack} aria-label="Go back">
          <ArrowLeft aria-hidden="true" />
        </button>
        <div>
          <strong>{module.title}</strong>
          {module.subtitle && <small>{module.subtitle}</small>}
        </div>
      </header>
    );
  }

  return (
    <header className="app-header">
      <div className="header-row">
        <SageMark />
        <button className="profile-button" type="button" aria-label="Open profile and workspace" onClick={onProfile}>
          <CircleUserRound aria-hidden="true" strokeWidth={1.8} />
        </button>
      </div>
      <div className="header-context">
        <p>Monday, July 13, 2026</p>
        <span>{roleProfiles[role].label}</span>
      </div>
    </header>
  );
}

function Progress({ value, total, label }) {
  const percentage = total ? Math.round((value / total) * 100) : 0;
  return (
    <>
      <p className="progress-copy"><strong>{value}</strong> of {total} {label}</p>
      <div className="progress-track" aria-label={`${value} of ${total} ${label}`}>
        <span style={{ width: `${percentage}%` }} />
      </div>
    </>
  );
}

function TimeBlock({ encounter, primary = false }) {
  return (
    <span className={`time-block${primary ? " primary" : ""}`} aria-label={`${encounter.time} ${encounter.meridiem}`}>
      <strong>{encounter.time}</strong>
      <small>{encounter.meridiem}</small>
    </span>
  );
}

function ProviderHome({ encounters, onStart, onOpenVisit, onOpenReviews, onAddEncounter, onOpenSchedule }) {
  const today = encounters.filter((encounter) => encounter.date === TODAY);
  const completed = today.filter((encounter) => encounter.status === "submitted-to-billing").length;
  const open = today.filter((encounter) => encounter.status === "scheduled" || encounter.status === "provider-in-progress");
  const tomorrow = encounters.filter((encounter) => encounter.date === "2026-07-14" && encounter.status === "scheduled");
  const displayed = open.length ? open : tomorrow;
  const reviewCount = encounters.filter((encounter) => reviewStatuses.has(encounter.status)).length;

  return (
    <section className="screen-content shift-screen" aria-labelledby="shift-title">
      <h1 id="shift-title">Your shift</h1>
      <Progress value={completed} total={today.length} label="visits complete" />

      <section className="up-next" aria-labelledby="up-next-title">
        <div className="section-title-row">
          <h2 id="up-next-title">{open.length ? "Up next" : "Tomorrow’s visits"}</h2>
        </div>
        <button className="add-encounter-home" type="button" onClick={onAddEncounter}><Plus aria-hidden="true" />Add an Encounter</button>
        <div className="visit-list">
          {displayed.slice(0, 3).map((encounter, index) => {
            const resident = residentById(encounter.residentId);
            return (
              <article key={encounter.id} className={`visit-row${index === 0 ? " primary" : ""}`}>
                <button className="visit-main" type="button" onClick={() => onOpenVisit(encounter)}>
                  <TimeBlock encounter={encounter} primary={index === 0} />
                  <span className="visit-copy">
                    <strong>{resident.name}</strong>
                    <span>Room {resident.room}</span>
                    <small>{encounter.reason}</small>
                  </span>
                </button>
                {index === 0 ? (
                  <button className={`start-button${encounter.status === "provider-in-progress" ? " started" : ""}`} type="button" onClick={() => onStart(encounter)}>
                    {encounter.status === "provider-in-progress" ? "Continue" : "Start"}
                  </button>
                ) : (
                  <button className="row-arrow" type="button" onClick={() => onOpenVisit(encounter)} aria-label={`Open ${resident.name}'s visit`}><ChevronRight aria-hidden="true" /></button>
                )}
              </article>
            );
          })}
          {!displayed.length && <div className="calm-empty"><CheckCircle2 /><strong>All visits are complete</strong><span>No visits are scheduled for tomorrow.</span></div>}
        </div>
      </section>

      <button className="review-note" type="button" onClick={onOpenReviews}>
        <span className="review-icon"><FileText aria-hidden="true" /></span>
        <span>{reviewCount} notes need your review</span>
        <strong>Review</strong>
        <ChevronRight aria-hidden="true" />
      </button>
      <button className="quiet-wide" type="button" onClick={onOpenSchedule}><CalendarDays />See the full weekly schedule</button>
    </section>
  );
}

function DonHome({ actions, onOpenResident, onOpenActions, onSchedule }) {
  const priorityResidents = residents.filter((resident) => resident.status === "Declining" || resident.status === "Watchful");
  const openActions = actions.filter((action) => action.status !== "completed");
  return (
    <section className="screen-content role-home" aria-labelledby="don-title">
      <span className="eyebrow">Good morning, Jamie</span>
      <h1 id="don-title">Today’s priorities</h1>
      <p className="role-home-intro">Start with the residents who have the clearest change from baseline.</p>
      <button className="home-callout" type="button" onClick={() => onOpenResident(priorityResidents[0])}>
        <span className="callout-icon danger"><AlertTriangle /></span>
        <span><small>Review first</small><strong>{priorityResidents[0].name}</strong><p>{priorityResidents[0].latest}</p></span>
        <ChevronRight />
      </button>
      <section className="guided-list-section">
        <div className="section-title-row"><h2>Then check</h2><span>{priorityResidents.length - 1} residents</span></div>
        <div className="guided-list">
          {priorityResidents.slice(1, 4).map((resident) => (
            <button key={resident.id} className="guided-row" type="button" onClick={() => onOpenResident(resident)}>
              <img src={resident.image} alt="" />
              <span><strong>{resident.name}</strong><small>Room {resident.room} · {resident.latest}</small></span>
              <span className={`status-pill ${statusTone(resident.status)}`}>{resident.status}</span>
            </button>
          ))}
        </div>
      </section>
      <button className="review-note" type="button" onClick={onOpenActions}>
        <span className="review-icon"><ListChecks /></span><span>{openActions.length} team actions are open</span><strong>Review</strong><ChevronRight />
      </button>
      <button className="quiet-wide" type="button" onClick={onSchedule}><CalendarCheck2 />Schedule a huddle or follow-up</button>
    </section>
  );
}

function CnaHome({ assignments, actions, onDebrief, onOpenResident, onOpenActions }) {
  const captured = assignments.filter((assignment) => assignment.status === "captured").length;
  const pending = assignments.filter((assignment) => assignment.status !== "captured");
  const cnaActions = actions.filter((action) => action.ownerRole === "cna" && action.status !== "completed");
  return (
    <section className="screen-content role-home" aria-labelledby="cna-title">
      <span className="eyebrow">Good morning, Nina</span>
      <h1 id="cna-title">Your shift</h1>
      <Progress value={captured} total={assignments.length} label="resident updates captured" />
      <section className="guided-list-section">
        <div className="section-title-row"><h2>Next resident</h2><span>{pending.length} remaining</span></div>
        {pending[0] ? (
          <article className="assignment-focus">
            <button type="button" onClick={() => onOpenResident(residentById(pending[0].residentId))}>
              <img src={residentById(pending[0].residentId).image} alt="" />
              <span><strong>{residentById(pending[0].residentId).name}</strong><small>Room {residentById(pending[0].residentId).room}</small></span>
              <ChevronRight />
            </button>
            <div><small>Today’s care</small><strong>{pending[0].care}</strong></div>
            <div><small>Watch for</small><strong>{pending[0].watchFor}</strong></div>
            <button className="primary-wide" type="button" onClick={() => onDebrief(pending[0])}><Mic />Capture resident update</button>
          </article>
        ) : <div className="calm-empty"><CheckCircle2 /><strong>Shift updates complete</strong><span>Every assigned resident has a captured update.</span></div>}
      </section>
      <button className="review-note" type="button" onClick={onOpenActions}>
        <span className="review-icon"><ClipboardCheck /></span><span>{cnaActions.length} care actions are open</span><strong>View</strong><ChevronRight />
      </button>
    </section>
  );
}

function ResidentsScreen({ role, encounters, onOpenResident }) {
  const [query, setQuery] = useState("");
  const visibleResidents = role === "cna" ? residents.filter((resident) => ["mary", "reginald", "eduardo", "hiroshi"].includes(resident.id)) : residents;
  const filtered = visibleResidents.filter((resident) => `${resident.name} ${resident.room} ${resident.latest}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="screen-content secondary-screen" aria-labelledby="residents-title">
      <h1 id="residents-title">Residents</h1>
      <p className="screen-intro">Search by name, room, or concern.</p>
      <label className="search-field"><Search /><span className="sr-only">Search residents</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search residents" /></label>
      <div className="resident-list">
        {filtered.map((resident) => {
          const reviewCount = encounters.filter((encounter) => encounter.residentId === resident.id && reviewStatuses.has(encounter.status)).length;
          return (
            <button key={resident.id} className="resident-row" type="button" onClick={() => onOpenResident(resident)}>
              <img src={resident.image} alt="" />
              <span><strong>{resident.name}</strong><small>Room {resident.room} · {resident.latest}</small>{reviewCount > 0 && <em>{reviewCount} note{reviewCount > 1 ? "s" : ""} to review</em>}</span>
              <span className={`status-pill ${statusTone(resident.status)}`}>{resident.status}</span>
            </button>
          );
        })}
        {!filtered.length && <div className="calm-empty"><Search /><strong>No residents found</strong><span>Try a name, room, or concern.</span></div>}
      </div>
    </section>
  );
}

function MessagesScreen({ threads, onOpenThread, onNewMessage }) {
  const [filter, setFilter] = useState("rooms");
  const visible = threads.filter((thread) => filter === "rooms" ? thread.kind === "room" : thread.kind === "person");
  return (
    <section className="screen-content secondary-screen" aria-labelledby="messages-title">
      <div className="section-title-row"><div><h1 id="messages-title">Messages</h1><p className="screen-intro">Care-team conversations in one place.</p></div><button className="round-action" type="button" onClick={onNewMessage} aria-label="New message"><Plus /></button></div>
      <div className="segmented" role="tablist" aria-label="Message type">
        <button className={filter === "rooms" ? "active" : ""} type="button" onClick={() => setFilter("rooms")}>Care teams</button>
        <button className={filter === "people" ? "active" : ""} type="button" onClick={() => setFilter("people")}>People</button>
      </div>
      <div className="thread-list">
        {visible.map((thread) => {
          const last = thread.messages[thread.messages.length - 1];
          const resident = thread.residentId ? residentById(thread.residentId) : null;
          return (
            <button key={thread.id} className="thread-row" type="button" onClick={() => onOpenThread(thread)}>
              {resident ? <img src={resident.image} alt="" /> : <span className="thread-icon"><UsersRound /></span>}
              <span><strong>{thread.title}</strong><small>{last?.text}</small><em>{last?.time}</em></span><ChevronRight />
            </button>
          );
        })}
        {!visible.length && <div className="calm-empty"><MessageSquare /><strong>No conversations yet</strong><span>Start a message when you need the care team.</span></div>}
      </div>
    </section>
  );
}

function MoreScreen({ role, reviewCount, actionCount, onOpen }) {
  const common = [
    { id: "schedule", label: "Schedule", helper: "Visits, huddles, orders, and follow-ups", icon: CalendarDays },
    { id: "sage", label: "Ask Sage", helper: "Get a plain-language clinical summary", icon: Zap },
  ];
  const roleItems = role === "provider"
    ? [
        { id: "reviews", label: "Encounter notes", helper: `${reviewCount} need review`, icon: FileCheck2 },
        { id: "actions", label: "My actions", helper: `${actionCount} assigned to you`, icon: ListChecks },
      ]
    : role === "don"
      ? [{ id: "actions", label: "Team actions", helper: `${actionCount} open across the team`, icon: ListChecks }]
      : [
          { id: "debrief", label: "Shift debrief", helper: "Capture resident-by-resident updates", icon: Mic },
          { id: "actions", label: "My care actions", helper: `${actionCount} still open`, icon: ClipboardCheck },
        ];
  const items = [...roleItems, ...common, { id: "settings", label: "Settings and workspace", helper: "Profile, preferences, and role", icon: Settings }, { id: "help", label: "Help using SAGE", helper: "A simple guide to every section", icon: HelpCircle }];
  return (
    <section className="screen-content secondary-screen" aria-labelledby="more-title">
      <h1 id="more-title">More</h1><p className="screen-intro">Everything else, in plain language.</p>
      <div className="tool-list">
        {items.map(({ id, label, helper, icon: Icon }) => (
          <button key={id} className="tool-row" type="button" onClick={() => onOpen(id)}>
            <span><Icon /></span><span><strong>{label}</strong><small>{helper}</small></span><ChevronRight />
          </button>
        ))}
      </div>
    </section>
  );
}

function BottomNav({ role, activeTab, onChange }) {
  const tabs = [
    { id: "home", label: roleProfiles[role].homeLabel, icon: role === "don" ? Activity : CalendarCheck2 },
    { id: "residents", label: "Residents", icon: UsersRound },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "more", label: "More", icon: Ellipsis },
  ];
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button key={id} className={activeTab === id ? "active" : ""} type="button" aria-current={activeTab === id ? "page" : undefined} onClick={() => onChange(id)}><Icon /><span>{label}</span></button>
      ))}
    </nav>
  );
}

function ResidentDetail({ resident, role, encounters, onMessage, onAddEncounter, onAssignAction, onDebrief, onOpenReview }) {
  const [tab, setTab] = useState("summary");
  const residentEncounters = encounters.filter((encounter) => encounter.residentId === resident.id);
  return (
    <section className="task-content resident-detail">
      <div className="resident-hero">
        <img src={resident.image} alt="" /><span><strong>{resident.name}</strong><small>Room {resident.room} · {resident.age} years old</small></span><span className={`status-pill ${statusTone(resident.status)}`}>{resident.status}</span>
      </div>
      <div className="resident-actions">
        <button type="button" onClick={onMessage}><MessageSquare />Message</button>
        {role === "provider" && <button type="button" onClick={onAddEncounter}><Stethoscope />Add encounter</button>}
        {role === "don" && <button type="button" onClick={onAssignAction}><ListChecks />Assign action</button>}
        {role === "cna" && <button type="button" onClick={onDebrief}><Mic />Debrief</button>}
      </div>
      <div className="segmented resident-tabs" role="tablist">
        {[["summary", "Summary"], ["timeline", "Timeline"], ["notes", "Notes"]].map(([id, label]) => <button key={id} className={tab === id ? "active" : ""} type="button" onClick={() => setTab(id)}>{label}</button>)}
      </div>
      {tab === "summary" && (
        <div className="detail-stack">
          <section className="plain-section emphasis"><span className="eyebrow">What changed</span><h2>{resident.latest}</h2><p>{resident.summary}</p><div className="why-box"><ShieldCheck /><span><strong>Why it matters</strong>{resident.why}</span></div></section>
          <section className="plain-section"><h2>Vitals compared with baseline</h2><div className="vital-list">{resident.vitals.map((vital) => <div key={vital.label}><span><strong>{vital.label}</strong><small>Usual {vital.baseline}</small></span><b className={vital.tone}>{vital.value}</b></div>)}</div></section>
          <section className="plain-section"><h2>Care-team reports</h2><div className="report-list">{resident.reports.map((report) => <article key={report.id}><header><strong>{report.author} · {report.role}</strong><small>{report.time}</small></header><p>{report.text}</p><small><strong>Why it matters:</strong> {report.why}</small></article>)}</div></section>
        </div>
      )}
      {tab === "timeline" && <div className="timeline-list">{resident.timeline.map((event) => <article key={`${event.time}-${event.title}`}><span /><div><small>{event.time}</small><strong>{event.title}</strong><p>{event.text}</p></div></article>)}</div>}
      {tab === "notes" && (
        <div className="note-history">
          {residentEncounters.map((encounter) => <button key={encounter.id} type="button" onClick={() => onOpenReview(encounter)}><span><strong>{encounter.reason}</strong><small>{formatDate(encounter.date)} · {encounter.type}</small></span><span className={`status-pill ${statusTone(prettyStatus(encounter.status))}`}>{prettyStatus(encounter.status)}</span><ChevronRight /></button>)}
          {!residentEncounters.length && <div className="calm-empty"><FileText /><strong>No encounter notes</strong><span>Notes created for this resident will appear here.</span></div>}
        </div>
      )}
    </section>
  );
}

function ReviewQueue({ encounters, onOpen }) {
  const [filter, setFilter] = useState("needs");
  const filtered = encounters.filter((encounter) => {
    if (filter === "needs") return reviewStatuses.has(encounter.status);
    if (filter === "done") return encounter.status === "submitted-to-billing";
    return reviewStatuses.has(encounter.status) || encounter.status === "submitted-to-billing";
  });
  const counts = { all: encounters.filter((item) => reviewStatuses.has(item.status) || item.status === "submitted-to-billing").length, needs: encounters.filter((item) => reviewStatuses.has(item.status)).length, done: encounters.filter((item) => item.status === "submitted-to-billing").length };
  return (
    <section className="task-content review-queue">
      <div className="queue-summary"><span className="queue-count">{counts.needs}</span><span><strong>encounters need your review</strong><small>Review one at a time. Your place is saved.</small></span></div>
      <div className="segmented queue-filters" role="tablist">
        {["all", "needs", "done"].map((id) => <button key={id} className={filter === id ? "active" : ""} type="button" onClick={() => setFilter(id)}>{id === "needs" ? "Needs review" : id === "done" ? "Done" : "All"}<span>{counts[id]}</span></button>)}
      </div>
      <div className="queue-list">
        {filtered.map((encounter) => {
          const resident = residentById(encounter.residentId);
          return <button key={encounter.id} type="button" onClick={() => onOpen(encounter)}><img src={resident.image} alt="" /><span><strong>{resident.name}</strong><small>{formatDate(encounter.date)} · {encounter.reason}</small><em>{encounter.type}</em></span><span className={`status-pill ${statusTone(prettyStatus(encounter.status))}`}>{prettyStatus(encounter.status)}</span><ChevronRight /></button>;
        })}
        {!filtered.length && <div className="calm-empty"><CheckCircle2 /><strong>Nothing in this list</strong><span>Choose another filter to see more notes.</span></div>}
      </div>
    </section>
  );
}

function ReviewDocument({ encounter, onUpdate, onRevision, onSign, onPlayVoice }) {
  const resident = residentById(encounter.residentId);
  const readOnly = encounter.status === "submitted-to-billing";
  const verifiedCount = encounter.sections.filter((section) => section.verified).length;
  const [openSection, setOpenSection] = useState(encounter.sections[0]?.id);
  function verifyAll() {
    onUpdate({ ...encounter, sections: encounter.sections.map((section) => ({ ...section, verified: true })) });
  }
  return (
    <section className="task-content review-document">
      <div className="document-patient"><img src={resident.image} alt="" /><span><strong>{resident.name}</strong><small>{formatDate(encounter.date)} · {encounter.type}</small></span><span className={`status-pill ${statusTone(prettyStatus(encounter.status))}`}>{prettyStatus(encounter.status)}</span></div>
      {!readOnly && <div className="verification-progress"><span><strong>{verifiedCount} of {encounter.sections.length}</strong> sections verified</span><button type="button" onClick={verifyAll}>Verify all</button></div>}
      <div className="document-sections">
        {encounter.sections.map((section) => {
          const open = openSection === section.id;
          return (
            <article key={section.id} className={open ? "open" : ""}>
              <button className="document-section-head" type="button" onClick={() => setOpenSection(open ? null : section.id)}><span>{section.verified && <CheckCircle2 />}<strong>{section.title}</strong></span>{open ? <ChevronUp /> : <ChevronDown />}</button>
              {open && <div className="document-section-body"><p>{section.text}</p>{section.revisions?.map((revision) => <div key={revision.id} className="revision-note"><small>Revision requested · {revision.createdAt}</small><p>{revision.text}</p>{revision.source === "voice" && <button type="button" onClick={() => onPlayVoice(revision)}><Play />Play voice revision · {revision.duration}s</button>}</div>)}{!readOnly && <div className="section-buttons"><button type="button" onClick={() => onRevision(section)}><MessageSquare />Request change</button><button className={section.verified ? "verified" : ""} type="button" onClick={() => onUpdate({ ...encounter, sections: encounter.sections.map((item) => item.id === section.id ? { ...item, verified: !item.verified } : item) })}><Check />{section.verified ? "Verified" : "Verify"}</button></div>}</div>}
            </article>
          );
        })}
      </div>
      {readOnly ? <div className="signed-banner"><ShieldCheck /><span><strong>Signed and complete</strong><small>{encounter.signedAt}</small></span></div> : <button className="document-sign" type="button" disabled={verifiedCount !== encounter.sections.length} onClick={() => onSign(encounter)}><ShieldCheck />Sign and mark done</button>}
    </section>
  );
}

function EncounterWorkspace({ encounter, onUpdate, onOrder, onEnd, recording, onRecord }) {
  const resident = residentById(encounter.residentId);
  return (
    <section className="task-content encounter-workspace">
      <div className="document-patient"><img src={resident.image} alt="" /><span><strong>{resident.name}</strong><small>Room {resident.room} · {encounter.reason}</small></span><span className="status-pill warning">In progress</span></div>
      <section className="encounter-context"><span className="eyebrow">What changed</span><h2>{resident.latest}</h2><p>{resident.summary}</p><div className="why-box"><ShieldCheck /><span><strong>Why it matters</strong>{resident.why}</span></div></section>
      <label className="note-field"><span>Visit note</span><textarea value={encounter.textNote ?? ""} onChange={(event) => onUpdate({ ...encounter, textNote: event.target.value })} placeholder="Type what you assessed and decided…" /></label>
      <div className="voice-capture"><span><strong>Voice note</strong><small>{encounter.voiceTranscript || "Record a mock transcript hands-free."}</small></span><button className={recording ? "recording" : ""} type="button" onClick={onRecord}>{recording ? <Square /> : <Mic />}{recording ? `Stop ${recording.seconds}s` : "Record"}</button></div>
      {encounter.orders?.length > 0 && <div className="order-list"><h2>Orders from this visit</h2>{encounter.orders.map((order) => <div key={order.id}><FileText /><span><strong>{order.type}</strong><small>{order.details}</small></span></div>)}</div>}
      <button className="quiet-wide" type="button" onClick={onOrder}><Plus />Add an order</button>
      <button className="document-sign" type="button" disabled={!encounter.textNote?.trim() && !encounter.voiceTranscript?.trim()} onClick={onEnd}><CheckCircle2 />End visit and send for review</button>
    </section>
  );
}

function ThreadView({ thread, onSend, onVoice, onCall, onResident, onPlayVoice }) {
  const [draft, setDraft] = useState("");
  function submit(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    onSend(draft.trim()); setDraft("");
  }
  return (
    <section className="task-content thread-view">
      <div className="thread-tools"><span>{thread.members}</span><div><button type="button" onClick={() => onCall("voice")} aria-label="Start voice call"><Phone /></button><button type="button" onClick={() => onCall("video")} aria-label="Start video call"><Video /></button>{thread.residentId && <button type="button" onClick={onResident} aria-label="View resident"><UserRound /></button>}</div></div>
      <div className="message-stream">{thread.messages.map((message) => <article key={message.id} className={message.mine ? "mine" : "theirs"}><small>{message.from} · {message.time}</small>{message.kind === "voice" ? <button type="button" onClick={() => onPlayVoice(message)}><Play />Play voice message · {message.duration}s</button> : <p>{message.text}</p>}</article>)}</div>
      <form className="message-composer" onSubmit={submit}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a clear update…" /><button type="button" onClick={onVoice} aria-label="Send mock voice message"><Mic /></button><button type="submit" aria-label="Send message"><Send /></button></form>
    </section>
  );
}

function ScheduleView({ events, onOpenResident, onOpenEvent, onAdd }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const monday = new Date(`${TODAY}T12:00:00`);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + (weekOffset * 7));
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date.toISOString().slice(0, 10);
  });
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const range = `${monday.toLocaleDateString([], { month: "short", day: "numeric" })} – ${sunday.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`;
  return (
    <section className="task-content schedule-view">
      <div className="section-title-row"><div><span className="eyebrow">{weekOffset === 0 ? "This week" : weekOffset < 0 ? "Earlier week" : "Upcoming week"}</span><h2>{range}</h2></div><button className="round-action" type="button" onClick={onAdd} aria-label="Add schedule item"><Plus /></button></div>
      <div className="week-controls"><button type="button" onClick={() => setWeekOffset((value) => value - 1)}><ChevronLeft />Previous</button><button type="button" disabled={weekOffset === 0} onClick={() => setWeekOffset(0)}>Today</button><button type="button" onClick={() => setWeekOffset((value) => value + 1)}>Next<ChevronRight /></button></div>
      <div className="schedule-days">{days.map((date) => { const items = events.filter((event) => event.date === date); return <section key={date} className={date === TODAY ? "today" : ""}><header><span>{new Date(`${date}T12:00:00`).toLocaleDateString([], { weekday: "short" })}</span><strong>{new Date(`${date}T12:00:00`).toLocaleDateString([], { month: "short", day: "numeric" })}</strong><small>{items.length} item{items.length === 1 ? "" : "s"}</small></header><div>{items.map((event) => <button key={event.id} type="button" onClick={() => event.residentId ? onOpenResident(residentById(event.residentId)) : onOpenEvent(event)}><span className={`schedule-kind ${event.kind}`}><CalendarCheck2 /></span><span><strong>{event.time} · {event.title}</strong><small>{event.detail}</small></span><ChevronRight /></button>)}{!items.length && <p>No scheduled items</p>}</div></section>; })}</div>
    </section>
  );
}

function ActionsView({ role, actions, onUpdate, onAdd }) {
  const visible = role === "don" ? actions : actions.filter((action) => action.ownerRole === role);
  return (
    <section className="task-content actions-view">
      {role === "don" && <button className="primary-wide" type="button" onClick={onAdd}><Plus />Assign a new action</button>}
      <div className="action-list">{visible.map((action) => { const resident = residentById(action.residentId); return <article key={action.id}><header><img src={resident.image} alt="" /><span><strong>{action.title}</strong><small>{resident.name} · Room {resident.room}</small></span><span className={`status-pill ${statusTone(prettyStatus(action.status))}`}>{prettyStatus(action.status)}</span></header><p>{action.instructions}</p><div className="action-meta"><span>{action.owner}</span><span>{action.due}</span></div>{action.status !== "completed" && <div className="action-buttons"><button type="button" onClick={() => onUpdate({ ...action, status: "flagged" })}><AlertTriangle />Flag concern</button><button type="button" onClick={() => onUpdate({ ...action, status: "completed" })}><Check />Mark done</button></div>}</article>; })}</div>
    </section>
  );
}

function DebriefView({ assignments, selectedId, onSelect, draft, onDraft, recording, onRecord, onSave }) {
  const assignment = assignments.find((item) => item.id === selectedId) ?? assignments[0];
  const resident = residentById(assignment.residentId);
  return (
    <section className="task-content debrief-view">
      <div className="debrief-progress">{assignments.map((item) => <button key={item.id} className={`${item.id === assignment.id ? "active" : ""} ${item.status}`} type="button" onClick={() => onSelect(item.id)}><span>{item.status === "captured" ? <Check /> : assignments.indexOf(item) + 1}</span><small>{residentById(item.residentId).name.split(" ")[0]}</small></button>)}</div>
      <div className="document-patient"><img src={resident.image} alt="" /><span><strong>{resident.name}</strong><small>Room {resident.room} · {assignment.care}</small></span><span className={`status-pill ${statusTone(prettyStatus(assignment.status))}`}>{prettyStatus(assignment.status)}</span></div>
      <section className="debrief-prompt"><span className="eyebrow">Tell SAGE</span><h2>How was {resident.name.split(" ")[0]} today?</h2><p>Anything unusual with eating, movement, mood, pain, breathing, skin, or toileting?</p><button className={recording ? "recording" : ""} type="button" onClick={onRecord}>{recording ? <Square /> : <Mic />}{recording ? `Stop recording · ${recording.seconds}s` : "Start voice capture"}</button></section>
      <label className="note-field"><span>Captured update</span><textarea value={draft} onChange={(event) => onDraft(event.target.value)} placeholder="Speak or type what you noticed…" /></label>
      <div className="watch-reminder"><AlertTriangle /><span><strong>Watch for</strong>{assignment.watchFor}</span></div>
      <button className="document-sign" type="button" disabled={!draft.trim()} onClick={() => onSave(assignment, draft)}><CheckCircle2 />Save and go to next resident</button>
    </section>
  );
}

function SageView({ messages, onSend, onPrompt }) {
  const [draft, setDraft] = useState("");
  const prompts = ["Who needs attention first?", "Summarize Mary Lou", "What is still incomplete?"];
  function submit(event) { event.preventDefault(); if (!draft.trim()) return; onSend(draft.trim()); setDraft(""); }
  return (
    <section className="task-content sage-view"><div className="sage-intro"><span><Zap /></span><div><h2>Ask in plain language</h2><p>SAGE uses the resident and shift context already in this prototype.</p></div></div><div className="prompt-chips">{prompts.map((prompt) => <button key={prompt} type="button" onClick={() => onPrompt(prompt)}>{prompt}</button>)}</div><div className="sage-messages">{messages.map((message) => <article key={message.id} className={message.mine ? "mine" : "sage"}><p>{message.text}</p></article>)}</div><form className="message-composer" onSubmit={submit}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask SAGE…" /><button type="submit"><Send /></button></form></section>
  );
}

function SettingsView({ role, onRole, onReset, onSave, notify, onNotify }) {
  const profile = roleProfiles[role];
  const [name, setName] = useState(profile.name);
  return (
    <section className="task-content settings-view"><section className="settings-section"><h2>My profile</h2><label>Display name<input value={name} onChange={(event) => setName(event.target.value)} /></label><label>Role<input value={profile.role} readOnly /></label><button className="primary-wide" type="button" onClick={() => onSave(name)}><Check />Save profile</button></section><section className="settings-section"><h2>Preferences</h2><label className="toggle-row"><span><strong>Push notifications</strong><small>Care-team and resident updates</small></span><input type="checkbox" checked={notify} onChange={(event) => onNotify(event.target.checked)} /></label></section><section className="settings-section"><h2>Workspace</h2><div className="role-choice compact">{Object.entries(roleProfiles).map(([id, item]) => <button key={id} className={role === id ? "active" : ""} type="button" onClick={() => onRole(id)}><strong>{item.label}</strong><small>{item.name}</small></button>)}</div><button className="danger-wide" type="button" onClick={onReset}><RotateCcw />Reset prototype data</button></section></section>
  );
}

function HelpView() {
  const steps = [
    ["1", "Start on your home screen", "The first item is always the clearest next action for your role."],
    ["2", "Tap a person or task", "SAGE opens one focused screen and explains why the information matters."],
    ["3", "Look for the filled button", "The filled purple or green button is the recommended next step."],
    ["4", "Use Back when finished", "Your place and unfinished work are saved automatically."],
  ];
  return <section className="task-content help-view"><div className="help-hero"><HelpCircle /><h2>SAGE is designed to guide you</h2><p>You do not need to memorize where anything lives.</p></div><div className="help-steps">{steps.map(([number, title, copy]) => <article key={number}><span>{number}</span><div><strong>{title}</strong><p>{copy}</p></div></article>)}</div><div className="why-box"><Phone /><span><strong>Still need help?</strong>Ask your SAGE workspace administrator for hands-on help.</span></div></section>;
}

function Sheet({ title, children, onClose }) {
  return <div className="sheet-scrim" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title"><div className="sheet-handle" /><header><h2 id="sheet-title">{title}</h2><button type="button" onClick={onClose} aria-label="Close"><X /></button></header>{children}</section></div>;
}

export function App() {
  const [role, setRole] = useStoredState("role", "provider");
  const [encounters, setEncounters] = useStoredState("encounters", initialEncounters);
  const [actions, setActions] = useStoredState("actions", initialActions);
  const [assignments, setAssignments] = useStoredState("assignments", initialAssignments);
  const [threads, setThreads] = useStoredState("threads", initialThreads);
  const [schedule, setSchedule] = useStoredState("schedule", initialSchedule);
  const [notify, setNotify] = useStoredState("notify", true);
  const [activeTab, setActiveTab] = useState("home");
  const [module, setModule] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef(null);
  const [recording, setRecording] = useState(null);
  const [debriefDraft, setDebriefDraft] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(initialAssignments[0].id);
  const [sageMessages, setSageMessages] = useState([{ id: "sage-welcome", mine: false, text: "Ask me who needs attention, what changed, or what is still incomplete." }]);

  useEffect(() => {
    if (!recording) return undefined;
    const timer = window.setInterval(() => setRecording((current) => current ? { ...current, seconds: current.seconds + 1 } : current), 1000);
    return () => window.clearInterval(timer);
  }, [Boolean(recording)]);

  function toast(message) {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => {
      setNotice("");
      noticeTimer.current = null;
    }, 2600);
  }
  function updateEncounter(next) { setEncounters((items) => items.map((item) => item.id === next.id ? next : item)); }
  function updateAction(next) { setActions((items) => items.map((item) => item.id === next.id ? next : item)); toast(next.status === "completed" ? "Action marked done." : "Concern flagged for follow-up."); }
  function openTask(type, payload = {}) { setModule({ type, ...payload }); setSheet(null); }
  function closeTask() { setModule(null); setRecording(null); }
  function openResident(resident) { openTask("resident", { residentId: resident.id }); }
  function openReview(encounter) { openTask("review", { encounterId: encounter.id }); }
  function startEncounter(encounter) { const next = { ...encounter, status: "provider-in-progress", startedAt: "Today · now" }; updateEncounter(next); openTask("encounter", { encounterId: next.id }); }
  function openThread(thread) { openTask("thread", { threadId: thread.id }); }
  function switchRole(nextRole) { setRole(nextRole); setActiveTab("home"); closeTask(); setSheet(null); toast(`Switched to ${roleProfiles[nextRole].label}.`); }

  function stopRecording() {
    if (!recording) return;
    if (recording.kind === "encounter") {
      const encounter = encounters.find((item) => item.id === recording.id);
      updateEncounter({ ...encounter, voiceTranscript: "Resident assessed at bedside. Current symptoms, vital signs, and change from baseline reviewed with nursing." });
      toast("Voice transcript added to the visit.");
    }
    if (recording.kind === "revision") {
      setSheet((current) => current ? { ...current, source: "voice", duration: recording.seconds, text: current.text || "Please clarify the symptom timeline and include the nurse’s follow-up assessment." } : current);
    }
    if (recording.kind === "debrief") {
      setDebriefDraft("Resident completed morning care with usual assistance. Ate about half of breakfast. No new pain or breathing change observed.");
    }
    if (recording.kind === "message") {
      const thread = threads.find((item) => item.id === recording.id);
      setThreads((items) => items.map((item) => item.id === thread.id ? { ...item, messages: [...item.messages, { id: `m-${Date.now()}`, from: roleProfiles[role].name, mine: true, time: "Now", kind: "voice", duration: recording.seconds }] } : item));
      toast("Voice message sent.");
    }
    setRecording(null);
  }

  function toggleRecording(kind, id) {
    if (recording?.kind === kind && recording?.id === id) stopRecording();
    else setRecording({ kind, id, seconds: 0 });
  }

  const reviewCount = encounters.filter((encounter) => reviewStatuses.has(encounter.status)).length;
  const roleActionCount = role === "don" ? actions.filter((action) => action.status !== "completed").length : actions.filter((action) => action.ownerRole === role && action.status !== "completed").length;
  const activeModuleMeta = module ? {
    resident: { title: residentById(module.residentId)?.name, subtitle: `Room ${residentById(module.residentId)?.room}` },
    reviews: { title: "Encounter notes", subtitle: `${reviewCount} need review` },
    review: { title: encounters.find((item) => item.id === module.encounterId)?.status === "submitted-to-billing" ? "Encounter note" : "Review encounter", subtitle: residentById(encounters.find((item) => item.id === module.encounterId)?.residentId)?.name },
    encounter: { title: "Encounter", subtitle: residentById(encounters.find((item) => item.id === module.encounterId)?.residentId)?.name },
    thread: { title: threads.find((item) => item.id === module.threadId)?.title, subtitle: "Care-team message" },
    schedule: { title: "Schedule", subtitle: "This week" },
    actions: { title: role === "don" ? "Team actions" : "My actions", subtitle: `${roleActionCount} open` },
    debrief: { title: "Shift debrief", subtitle: "One resident at a time" },
    sage: { title: "Ask Sage", subtitle: "Plain-language clinical support" },
    settings: { title: "Settings", subtitle: roleProfiles[role].label },
    help: { title: "Help using SAGE", subtitle: "Simple steps" },
  }[module.type] : null;

  function handleMore(id) {
    if (id === "reviews") openTask("reviews");
    else if (id === "schedule") openTask("schedule");
    else if (id === "actions") openTask("actions");
    else if (id === "debrief") openTask("debrief");
    else if (id === "sage") openTask("sage");
    else if (id === "settings") openTask("settings");
    else if (id === "help") openTask("help");
  }

  function openAddEncounter(residentId = "") {
    setSheet({ type: "add-encounter", residentId, visitType: "Acute" });
  }
  function createEncounter() {
    if (!sheet.residentId) return;
    const resident = residentById(sheet.residentId);
    const activeEncounter = encounters.find((item) => item.residentId === resident.id && item.date === TODAY && item.status === "provider-in-progress");
    if (activeEncounter) {
      setSheet(null);
      openTask("encounter", { encounterId: activeEncounter.id });
      toast("Continuing the encounter already in progress.");
      return;
    }
    const scheduledEncounter = encounters.find((item) => item.residentId === resident.id && item.date === TODAY && item.status === "scheduled");
    if (scheduledEncounter) {
      const started = { ...scheduledEncounter, status: "provider-in-progress" };
      updateEncounter(started);
      setSheet(null);
      openTask("encounter", { encounterId: started.id });
      toast("Today’s scheduled encounter started.");
      return;
    }
    const encounter = { id: `enc-${Date.now()}`, residentId: resident.id, date: TODAY, time: "Now", meridiem: "", type: sheet.visitType, status: "provider-in-progress", priority: "Routine", reason: sheet.visitType, change: resident.latest, textNote: "", voiceTranscript: "", orders: [], sections: deepCopy(initialEncounters[0].sections).map((section) => ({ ...section, verified: false, revisions: [] })) };
    setEncounters((items) => [...items, encounter]); setSheet(null); openTask("encounter", { encounterId: encounter.id }); toast("Encounter started.");
  }
  function addAction() {
    if (!sheet.residentId || !sheet.title?.trim()) return;
    setActions((items) => [...items, { id: `a-${Date.now()}`, residentId: sheet.residentId, title: sheet.title.trim(), ownerRole: sheet.ownerRole, owner: sheet.ownerRole === "cna" ? "Nina Alvarez" : "Dr. Hannah Cole", priority: sheet.priority, due: sheet.due || "Today", instructions: sheet.instructions || "Follow up and report the result.", status: "open" }]); setSheet(null); toast("Action assigned.");
  }
  function addScheduleItem() {
    if (!sheet.title?.trim()) return;
    setSchedule((items) => [...items, { id: `s-${Date.now()}`, date: sheet.date, time: sheet.time, kind: sheet.kind, title: sheet.title.trim(), detail: sheet.detail || "Scheduled in SAGE", residentId: sheet.residentId || null }]); setSheet(null); toast("Schedule updated.");
  }
  function addOrder() {
    if (!sheet.typeName?.trim()) return;
    const encounter = encounters.find((item) => item.id === sheet.encounterId);
    updateEncounter({ ...encounter, orders: [...(encounter.orders ?? []), { id: `o-${Date.now()}`, type: sheet.typeName.trim(), details: sheet.details || "Follow facility protocol." }] }); setSheet(null); toast("Order added to this visit.");
  }
  function addRevision() {
    if (!sheet.text?.trim()) return;
    const encounter = encounters.find((item) => item.id === sheet.encounterId);
    updateEncounter({ ...encounter, status: "revision", sections: encounter.sections.map((section) => section.id === sheet.sectionId ? { ...section, verified: false, revisions: [...(section.revisions ?? []), { id: `r-${Date.now()}`, text: sheet.text.trim(), source: sheet.source ?? "text", duration: sheet.duration, createdAt: "Now" }] } : section) }); setSheet(null); toast("Revision request added.");
  }
  function sendThreadMessage(threadId, text) { setThreads((items) => items.map((thread) => thread.id === threadId ? { ...thread, messages: [...thread.messages, { id: `m-${Date.now()}`, from: roleProfiles[role].name, mine: true, time: "Now", text }] } : thread)); }
  function sageResponse(prompt) {
    let response = "I can help summarize residents, priorities, notes, and unfinished work.";
    if (prompt.toLowerCase().includes("attention")) response = "Mary Lou Smith needs attention first. Her confusion increased overnight and her temperature is 100.4°F, which may indicate infection.";
    if (prompt.toLowerCase().includes("mary")) response = "Mary Lou is more confused than baseline, has a low-grade temperature and mild tachycardia, and has a urine sample action still open.";
    if (prompt.toLowerCase().includes("incomplete")) response = `${reviewCount} encounter notes need review and ${roleActionCount} actions are still open for this workspace.`;
    setSageMessages((items) => [...items, { id: `q-${Date.now()}`, mine: true, text: prompt }, { id: `a-${Date.now() + 1}`, mine: false, text: response }]);
  }

  const rootContent = activeTab === "home"
    ? role === "provider" ? <ProviderHome encounters={encounters} onStart={startEncounter} onOpenVisit={(encounter) => setSheet({ type: "visit-details", encounterId: encounter.id })} onOpenReviews={() => openTask("reviews")} onAddEncounter={() => openAddEncounter()} onOpenSchedule={() => openTask("schedule")} />
      : role === "don" ? <DonHome actions={actions} onOpenResident={openResident} onOpenActions={() => openTask("actions")} onSchedule={() => openTask("schedule")} />
        : <CnaHome assignments={assignments} actions={actions} onDebrief={(assignment) => { setSelectedAssignmentId(assignment.id); setDebriefDraft(assignment.transcript || ""); openTask("debrief"); }} onOpenResident={openResident} onOpenActions={() => openTask("actions")} />
    : activeTab === "residents" ? <ResidentsScreen role={role} encounters={encounters} onOpenResident={openResident} />
      : activeTab === "messages" ? <MessagesScreen threads={threads} onOpenThread={openThread} onNewMessage={() => setSheet({ type: "new-message", threadId: threads[0]?.id, text: "" })} />
        : <MoreScreen role={role} reviewCount={reviewCount} actionCount={roleActionCount} onOpen={handleMore} />;

  let moduleContent = null;
  if (module?.type === "resident") {
    const resident = residentById(module.residentId);
    moduleContent = <ResidentDetail resident={resident} role={role} encounters={encounters} onMessage={() => { const thread = threads.find((item) => item.residentId === resident.id); if (thread) openThread(thread); else setSheet({ type: "new-message", residentId: resident.id, threadId: threads[0]?.id, text: "" }); }} onAddEncounter={() => openAddEncounter(resident.id)} onAssignAction={() => setSheet({ type: "action", residentId: resident.id, ownerRole: "cna", title: "", priority: "High", instructions: "" })} onDebrief={() => { const assignment = assignments.find((item) => item.residentId === resident.id); if (assignment) { setSelectedAssignmentId(assignment.id); setDebriefDraft(assignment.transcript || ""); openTask("debrief"); } }} onOpenReview={openReview} />;
  }
  if (module?.type === "reviews") moduleContent = <ReviewQueue encounters={encounters} onOpen={openReview} />;
  if (module?.type === "review") {
    const encounter = encounters.find((item) => item.id === module.encounterId);
    moduleContent = <ReviewDocument encounter={encounter} onUpdate={updateEncounter} onRevision={(section) => setSheet({ type: "revision", encounterId: encounter.id, sectionId: section.id, sectionTitle: section.title, text: "", source: "text", duration: 0 })} onPlayVoice={(revision) => toast(`Playing ${revision.duration || 1}-second voice revision.`)} onSign={(item) => { updateEncounter({ ...item, status: "submitted-to-billing", signedAt: "Today · now" }); toast("Encounter signed and marked done."); openTask("reviews"); }} />;
  }
  if (module?.type === "encounter") {
    const encounter = encounters.find((item) => item.id === module.encounterId);
    moduleContent = <EncounterWorkspace encounter={encounter} onUpdate={updateEncounter} onOrder={() => setSheet({ type: "order", encounterId: encounter.id, typeName: "", details: "" })} onEnd={() => { const next = { ...encounter, status: "needs-review", sections: encounter.sections.map((section) => section.id === "notes" ? { ...section, text: encounter.textNote || encounter.voiceTranscript } : section) }; updateEncounter(next); toast("Visit ended and added to the review queue."); openTask("reviews"); }} recording={recording?.kind === "encounter" && recording.id === encounter.id ? recording : null} onRecord={() => toggleRecording("encounter", encounter.id)} />;
  }
  if (module?.type === "thread") {
    const thread = threads.find((item) => item.id === module.threadId);
    moduleContent = <ThreadView thread={thread} onSend={(text) => sendThreadMessage(thread.id, text)} onVoice={() => toggleRecording("message", thread.id)} onPlayVoice={(message) => toast(`Playing ${message.duration || 1}-second voice message.`)} onCall={(kind) => toast(`${kind === "video" ? "Video" : "Voice"} call started with ${thread.title}.`)} onResident={() => openResident(residentById(thread.residentId))} />;
  }
  if (module?.type === "schedule") moduleContent = <ScheduleView events={schedule} onOpenResident={openResident} onOpenEvent={(event) => toast(`${event.title} is scheduled for ${event.time}.`)} onAdd={() => setSheet({ type: "schedule", date: TODAY, time: "2:00 PM", kind: "huddle", title: "", detail: "", residentId: "" })} />;
  if (module?.type === "actions") moduleContent = <ActionsView role={role} actions={actions} onUpdate={updateAction} onAdd={() => setSheet({ type: "action", residentId: "mary", ownerRole: "cna", title: "", priority: "High", instructions: "" })} />;
  if (module?.type === "debrief") moduleContent = <DebriefView assignments={assignments} selectedId={selectedAssignmentId} onSelect={(id) => { setSelectedAssignmentId(id); setDebriefDraft(assignments.find((item) => item.id === id)?.transcript || ""); }} draft={debriefDraft} onDraft={setDebriefDraft} recording={recording?.kind === "debrief" ? recording : null} onRecord={() => toggleRecording("debrief", selectedAssignmentId)} onSave={(assignment, draft) => { setAssignments((items) => items.map((item) => item.id === assignment.id ? { ...item, status: "captured", transcript: draft } : item)); const remaining = assignments.filter((item) => item.id !== assignment.id && item.status !== "captured"); if (remaining[0]) { setSelectedAssignmentId(remaining[0].id); setDebriefDraft(remaining[0].transcript || ""); } toast("Resident update saved."); }} />;
  if (module?.type === "sage") moduleContent = <SageView messages={sageMessages} onSend={sageResponse} onPrompt={sageResponse} />;
  if (module?.type === "settings") moduleContent = <SettingsView role={role} onRole={switchRole} notify={notify} onNotify={setNotify} onSave={() => toast("Profile saved.")} onReset={() => { ["encounters", "actions", "assignments", "threads", "schedule", "notify"].forEach((key) => window.localStorage.removeItem(`${STORAGE_VERSION}.${key}`)); window.location.reload(); }} />;
  if (module?.type === "help") moduleContent = <HelpView />;

  return (
    <main className="prototype-stage"><div className="mobile-prototype full-app">
      <AppHeader role={role} module={activeModuleMeta} onBack={closeTask} onProfile={() => openTask("settings")} />
      <div className={`app-scroll-region${module ? " task-region" : ""}`}>{module ? moduleContent : rootContent}</div>
      {!module && <BottomNav role={role} activeTab={activeTab} onChange={setActiveTab} />}

      {sheet?.type === "visit-details" && (() => { const encounter = encounters.find((item) => item.id === sheet.encounterId); const resident = residentById(encounter.residentId); return <Sheet title="Visit details" onClose={() => setSheet(null)}><div className="sheet-person"><img src={resident.image} alt="" /><span><strong>{resident.name}</strong><small>Room {resident.room}</small></span></div><div className="detail-lines"><p><Clock3 /><span><small>Scheduled</small><strong>{encounter.time} {encounter.meridiem}</strong></span></p><p><MapPin /><span><small>Reason</small><strong>{encounter.reason}</strong></span></p></div><p className="sheet-summary">{resident.summary}</p><button className="sheet-primary" type="button" onClick={() => { setSheet(null); startEncounter(encounter); }}>{encounter.status === "provider-in-progress" ? "Continue visit" : "Start visit"}</button></Sheet>; })()}
      {sheet?.type === "add-encounter" && <Sheet title="Add an encounter" onClose={() => setSheet(null)}><div className="sheet-form"><label>Resident<select value={sheet.residentId} onChange={(event) => setSheet({ ...sheet, residentId: event.target.value })}><option value="">Choose a resident</option>{residents.map((resident) => <option key={resident.id} value={resident.id}>{resident.name} · Room {resident.room}</option>)}</select></label><label>Encounter type<select value={sheet.visitType} onChange={(event) => setSheet({ ...sheet, visitType: event.target.value })}>{["Acute", "Follow-up", "30-day follow-up", "Admission follow-up", "Wound care", "Fall assessment"].map((type) => <option key={type}>{type}</option>)}</select></label><button className="sheet-primary" type="button" disabled={!sheet.residentId} onClick={createEncounter}>Start encounter now</button></div></Sheet>}
      {sheet?.type === "revision" && <Sheet title={`Request change · ${sheet.sectionTitle}`} onClose={() => { setRecording(null); setSheet(null); }}><div className="revision-mode"><button className={sheet.source === "text" ? "active" : ""} type="button" onClick={() => setSheet({ ...sheet, source: "text" })}>Type</button><button className={sheet.source === "voice" ? "active" : ""} type="button" onClick={() => setSheet({ ...sheet, source: "voice" })}>Voice</button></div>{sheet.source === "voice" && <button className={`record-revision ${recording?.kind === "revision" ? "recording" : ""}`} type="button" onClick={() => toggleRecording("revision", sheet.encounterId)}>{recording?.kind === "revision" ? <Square /> : <Mic />}{recording?.kind === "revision" ? `Stop recording · ${recording.seconds}s` : sheet.duration ? `Record again · ${sheet.duration}s captured` : "Record revision request"}</button>}<label className="note-field"><span>{sheet.source === "voice" ? "Editable transcript" : "Revision request"}</span><textarea value={sheet.text} onChange={(event) => setSheet({ ...sheet, text: event.target.value })} placeholder="Explain exactly what should change…" /></label><button className="sheet-primary" type="button" disabled={!sheet.text.trim()} onClick={addRevision}>Add revision request</button></Sheet>}
      {sheet?.type === "order" && <Sheet title="Add an order" onClose={() => setSheet(null)}><div className="sheet-form"><label>Order type<input value={sheet.typeName} onChange={(event) => setSheet({ ...sheet, typeName: event.target.value })} placeholder="Lab, imaging, medication…" /></label><label>Instructions<textarea value={sheet.details} onChange={(event) => setSheet({ ...sheet, details: event.target.value })} placeholder="What should the care team do?" /></label><button className="sheet-primary" type="button" disabled={!sheet.typeName.trim()} onClick={addOrder}>Add order</button></div></Sheet>}
      {sheet?.type === "action" && <Sheet title="Assign an action" onClose={() => setSheet(null)}><div className="sheet-form"><label>Resident<select value={sheet.residentId} onChange={(event) => setSheet({ ...sheet, residentId: event.target.value })}>{residents.map((resident) => <option key={resident.id} value={resident.id}>{resident.name}</option>)}</select></label><label>Action<input value={sheet.title} onChange={(event) => setSheet({ ...sheet, title: event.target.value })} placeholder="What needs to be done?" /></label><label>Assign to<select value={sheet.ownerRole} onChange={(event) => setSheet({ ...sheet, ownerRole: event.target.value })}><option value="cna">CNA · Nina Alvarez</option><option value="provider">Provider · Dr. Hannah Cole</option></select></label><label>Priority<select value={sheet.priority} onChange={(event) => setSheet({ ...sheet, priority: event.target.value })}><option>Routine</option><option>High</option><option>Urgent</option></select></label><label>Instructions<textarea value={sheet.instructions} onChange={(event) => setSheet({ ...sheet, instructions: event.target.value })} placeholder="Add a simple instruction…" /></label><button className="sheet-primary" type="button" disabled={!sheet.title.trim()} onClick={addAction}>Assign action</button></div></Sheet>}
      {sheet?.type === "schedule" && <Sheet title="Add to schedule" onClose={() => setSheet(null)}><div className="sheet-form"><label>Type<select value={sheet.kind} onChange={(event) => setSheet({ ...sheet, kind: event.target.value })}><option value="huddle">Huddle</option><option value="follow-up">Follow-up</option><option value="order">Clinical order</option></select></label><label>Title<input value={sheet.title} onChange={(event) => setSheet({ ...sheet, title: event.target.value })} placeholder="What is being scheduled?" /></label><div className="form-pair"><label>Date<input type="date" value={sheet.date} onChange={(event) => setSheet({ ...sheet, date: event.target.value })} /></label><label>Time<input value={sheet.time} onChange={(event) => setSheet({ ...sheet, time: event.target.value })} /></label></div><label>Resident (optional)<select value={sheet.residentId} onChange={(event) => setSheet({ ...sheet, residentId: event.target.value })}><option value="">No specific resident</option>{residents.map((resident) => <option key={resident.id} value={resident.id}>{resident.name}</option>)}</select></label><button className="sheet-primary" type="button" disabled={!sheet.title.trim()} onClick={addScheduleItem}>Add to schedule</button></div></Sheet>}
      {sheet?.type === "new-message" && <Sheet title="New message" onClose={() => setSheet(null)}><div className="sheet-form"><label>Conversation<select value={sheet.threadId} onChange={(event) => setSheet({ ...sheet, threadId: event.target.value })}>{threads.map((thread) => <option key={thread.id} value={thread.id}>{thread.title}</option>)}</select></label><label>Message<textarea value={sheet.text} onChange={(event) => setSheet({ ...sheet, text: event.target.value })} placeholder="Write a clear update…" /></label><button className="sheet-primary" type="button" disabled={!sheet.text.trim()} onClick={() => { sendThreadMessage(sheet.threadId, sheet.text.trim()); const thread = threads.find((item) => item.id === sheet.threadId); setSheet(null); openThread(thread); }}>Send message</button></div></Sheet>}
      {recording && <div className="recording-banner" role="status"><span><i />Recording · {recording.seconds}s</span><button type="button" onClick={stopRecording}><Square />Stop</button></div>}
      {notice && <div className="toast" role="status"><Check />{notice}</div>}
    </div></main>
  );
}
