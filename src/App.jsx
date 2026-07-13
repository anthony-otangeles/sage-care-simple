import { useState } from "react";
import {
  ArrowLeft,
  CalendarCheck2,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Ellipsis,
  FileCheck2,
  FileText,
  HelpCircle,
  Home,
  MapPin,
  MessageSquare,
  Search,
  Settings,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react";

const visits = [
  {
    id: "mary",
    time: "8:40",
    meridiem: "AM",
    name: "Mary Lou Smith",
    room: "204B",
    reason: "Possible UTI / confusion",
    detail: "More confused overnight. Temperature is 100.4°F. CNA reported a strong urine odor.",
  },
  {
    id: "hiroshi",
    time: "10:00",
    meridiem: "AM",
    name: "Hiroshi Tanaka",
    room: "112A",
    reason: "30-day follow-up",
    detail: "Routine follow-up for mobility, pain control, and medication tolerance.",
  },
  {
    id: "reginald",
    time: "11:15",
    meridiem: "AM",
    name: "Reginald Thompson",
    room: "220A",
    reason: "New admission follow-up",
    detail: "Review admission orders, CHF symptoms, weights, and care-plan questions.",
  },
];

const residents = [
  { name: "Mary Lou Smith", room: "204B", status: "Needs attention" },
  { name: "Hiroshi Tanaka", room: "112A", status: "Stable" },
  { name: "Reginald Thompson", room: "220A", status: "New admission" },
  { name: "Beatrice Holloway", room: "208", status: "Note to review" },
];

const messages = [
  { sender: "Nina Alvarez, RN", preview: "Mary Lou was more confused during morning care.", time: "8:12 AM", unread: true },
  { sender: "Care Team · West Hall", preview: "Reginald’s admission medication list is ready.", time: "Yesterday", unread: false },
];

const tabs = [
  { id: "shift", label: "Shift", icon: CalendarCheck2 },
  { id: "residents", label: "Residents", icon: UsersRound },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "more", label: "More", icon: Ellipsis },
];

function SageMark() {
  return (
    <div className="sage-mark" aria-label="SAGE">
      <Zap aria-hidden="true" strokeWidth={2.25} />
      <span>SAGE</span>
    </div>
  );
}

function AppHeader({ compact = false, onProfile }) {
  return (
    <header className={`app-header${compact ? " compact" : ""}`}>
      <div className="header-row">
        <SageMark />
        <button className="profile-button" type="button" aria-label="Open profile" onClick={onProfile}>
          <CircleUserRound aria-hidden="true" strokeWidth={1.8} />
        </button>
      </div>
      {!compact && <p>Monday, July 13, 2026</p>}
    </header>
  );
}

function VisitRow({ visit, primary, started, onOpen, onStart }) {
  return (
    <article className={`visit-row${primary ? " primary" : ""}`}>
      <button className="visit-main" type="button" onClick={() => onOpen(visit)} aria-label={`Open ${visit.name}'s visit`}>
        <span className="time-block" aria-label={`${visit.time} ${visit.meridiem}`}>
          <strong>{visit.time}</strong>
          <small>{visit.meridiem}</small>
        </span>
        <span className="visit-copy">
          <strong>{visit.name}</strong>
          <span>Room {visit.room}</span>
          <small>{visit.reason}</small>
        </span>
      </button>
      {primary ? (
        <button className={`start-button${started ? " started" : ""}`} type="button" onClick={() => onStart(visit)}>
          {started ? "Continue" : "Start"}
        </button>
      ) : (
        <button className="row-arrow" type="button" onClick={() => onOpen(visit)} aria-label={`Open ${visit.name}'s visit`}>
          <ChevronRight aria-hidden="true" />
        </button>
      )}
    </article>
  );
}

function ShiftScreen({ completed, startedVisitId, onOpenVisit, onStartVisit, onReview }) {
  return (
    <section className="screen-content shift-screen" aria-labelledby="shift-title">
      <h1 id="shift-title">Your shift</h1>
      <p className="progress-copy"><strong>{completed}</strong> of 5 visits complete</p>
      <div className="progress-track" aria-label={`${completed} of 5 visits complete`}>
        <span style={{ width: `${(completed / 5) * 100}%` }} />
      </div>

      <section className="up-next" aria-labelledby="up-next-title">
        <h2 id="up-next-title">Up next</h2>
        <div className="visit-list">
          {visits.map((visit, index) => (
            <VisitRow
              key={visit.id}
              visit={visit}
              primary={index === 0}
              started={startedVisitId === visit.id}
              onOpen={onOpenVisit}
              onStart={onStartVisit}
            />
          ))}
        </div>
      </section>

      <button className="review-note" type="button" onClick={onReview}>
        <span className="review-icon"><FileText aria-hidden="true" /></span>
        <span>1 note needs your review</span>
        <strong>Review now</strong>
        <ChevronRight aria-hidden="true" />
      </button>
    </section>
  );
}

function ResidentsScreen({ onOpenResident }) {
  const [query, setQuery] = useState("");
  const filteredResidents = residents.filter((resident) => resident.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="screen-content secondary-screen" aria-labelledby="residents-title">
      <h1 id="residents-title">Residents</h1>
      <p className="screen-intro">Find a resident by name or room.</p>
      <label className="search-field">
        <Search aria-hidden="true" />
        <span className="sr-only">Search residents</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search residents" />
      </label>
      <div className="simple-list">
        {filteredResidents.map((resident) => (
          <button key={resident.name} className="simple-row" type="button" onClick={() => onOpenResident(resident)}>
            <span className="initials" aria-hidden="true">{resident.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
            <span><strong>{resident.name}</strong><small>Room {resident.room} · {resident.status}</small></span>
            <ChevronRight aria-hidden="true" />
          </button>
        ))}
        {!filteredResidents.length && <p className="empty-state">No residents match “{query}”.</p>}
      </div>
    </section>
  );
}

function MessagesScreen() {
  return (
    <section className="screen-content secondary-screen" aria-labelledby="messages-title">
      <h1 id="messages-title">Messages</h1>
      <p className="screen-intro">Updates from your care team.</p>
      <div className="simple-list message-list">
        {messages.map((message) => (
          <button key={message.sender} className="simple-row message-row" type="button">
            <span className="initials" aria-hidden="true"><MessageSquare /></span>
            <span><strong>{message.sender}</strong><small>{message.preview}</small></span>
            <span className="message-meta">{message.unread && <i aria-label="Unread" />}<small>{message.time}</small></span>
          </button>
        ))}
      </div>
      <button className="primary-wide" type="button">New message</button>
    </section>
  );
}

function MoreScreen({ onProfile }) {
  const items = [
    { label: "My profile", helper: "Hannah Cole, MD", icon: UserRound, action: onProfile },
    { label: "Facility", helper: "Otangeles Care Center", icon: Home },
    { label: "Settings", helper: "Notifications and preferences", icon: Settings },
    { label: "Help", helper: "Get help using SAGE", icon: HelpCircle },
  ];
  return (
    <section className="screen-content secondary-screen" aria-labelledby="more-title">
      <h1 id="more-title">More</h1>
      <p className="screen-intro">Account, facility, and help.</p>
      <div className="simple-list more-list">
        {items.map(({ label, helper, icon: Icon, action }) => (
          <button key={label} className="simple-row" type="button" onClick={action}>
            <span className="initials" aria-hidden="true"><Icon /></span>
            <span><strong>{label}</strong><small>{helper}</small></span>
            <ChevronRight aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}

function BottomNav({ activeTab, onChange }) {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button key={id} className={activeTab === id ? "active" : ""} type="button" aria-current={activeTab === id ? "page" : undefined} onClick={() => onChange(id)}>
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function Sheet({ title, children, onClose }) {
  return (
    <div className="sheet-scrim" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div className="sheet-handle" />
        <header>
          <h2 id="sheet-title">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose}><X aria-hidden="true" /></button>
        </header>
        {children}
      </section>
    </div>
  );
}

export function App() {
  const [activeTab, setActiveTab] = useState("shift");
  const [sheet, setSheet] = useState(null);
  const [startedVisitId, setStartedVisitId] = useState(null);
  const [completed, setCompleted] = useState(2);
  const [notice, setNotice] = useState("");

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  function beginVisit(visit) {
    setStartedVisitId(visit.id);
    setSheet(null);
    showNotice(`${visit.name}’s visit is ready.`);
  }

  function approveNote() {
    setSheet(null);
    showNotice("Note approved and marked done.");
  }

  const activeVisit = sheet?.type === "visit" || sheet?.type === "start" ? sheet.visit : null;

  return (
    <main className="prototype-stage">
      <div className="mobile-prototype">
        <AppHeader onProfile={() => setSheet({ type: "profile" })} />

        <div className="app-scroll-region">
          {activeTab === "shift" && (
            <ShiftScreen
              completed={completed}
              startedVisitId={startedVisitId}
              onOpenVisit={(visit) => setSheet({ type: "visit", visit })}
              onStartVisit={(visit) => setSheet({ type: "start", visit })}
              onReview={() => setSheet({ type: "review" })}
            />
          )}
          {activeTab === "residents" && <ResidentsScreen onOpenResident={(resident) => setSheet({ type: "resident", resident })} />}
          {activeTab === "messages" && <MessagesScreen />}
          {activeTab === "more" && <MoreScreen onProfile={() => setSheet({ type: "profile" })} />}
        </div>

        <BottomNav activeTab={activeTab} onChange={setActiveTab} />

        {activeVisit && (
          <Sheet title={sheet.type === "start" ? "Start this visit?" : "Visit details"} onClose={() => setSheet(null)}>
            <div className="sheet-person">
              <span className="sheet-avatar"><UserRound aria-hidden="true" /></span>
              <span><strong>{activeVisit.name}</strong><small>Room {activeVisit.room}</small></span>
            </div>
            <div className="detail-lines">
              <p><Clock3 aria-hidden="true" /><span><small>Scheduled</small><strong>{activeVisit.time} {activeVisit.meridiem}</strong></span></p>
              <p><MapPin aria-hidden="true" /><span><small>Reason for visit</small><strong>{activeVisit.reason}</strong></span></p>
            </div>
            <p className="sheet-summary">{activeVisit.detail}</p>
            <button className="sheet-primary" type="button" onClick={() => beginVisit(activeVisit)}>
              {startedVisitId === activeVisit.id ? "Continue visit" : "Begin visit"}
            </button>
          </Sheet>
        )}

        {sheet?.type === "review" && (
          <Sheet title="Review note" onClose={() => setSheet(null)}>
            <div className="note-review-copy">
              <span className="sheet-avatar"><FileCheck2 aria-hidden="true" /></span>
              <span><strong>Mary Lou Smith</strong><small>Visit note · Drafted at 8:18 AM</small></span>
            </div>
            <div className="note-preview">
              Resident is more confused than baseline. Temperature 100.4°F and mild tachycardia noted. Nursing was notified to collect a urine sample per standing order.
            </div>
            <button className="sheet-primary" type="button" onClick={approveNote}><Check aria-hidden="true" />Approve note</button>
            <button className="sheet-secondary" type="button" onClick={() => showNotice("Revision request opened.")}>Request a change</button>
          </Sheet>
        )}

        {sheet?.type === "resident" && (
          <Sheet title="Resident" onClose={() => setSheet(null)}>
            <div className="sheet-person">
              <span className="sheet-avatar"><UserRound aria-hidden="true" /></span>
              <span><strong>{sheet.resident.name}</strong><small>Room {sheet.resident.room}</small></span>
            </div>
            <p className="sheet-summary">Current status: {sheet.resident.status}. Open the resident chart to review recent changes, visits, and care-team updates.</p>
            <button className="sheet-primary" type="button" onClick={() => { setSheet(null); showNotice("Resident chart opened."); }}>Open resident chart</button>
          </Sheet>
        )}

        {sheet?.type === "profile" && (
          <Sheet title="My profile" onClose={() => setSheet(null)}>
            <div className="sheet-person">
              <span className="sheet-avatar"><CircleUserRound aria-hidden="true" /></span>
              <span><strong>Dr. Hannah Cole</strong><small>Physician · Otangeles Care Center</small></span>
            </div>
            <p className="sheet-summary">You are signed in for today’s provider shift.</p>
            <button className="sheet-secondary" type="button" onClick={() => setSheet(null)}><ArrowLeft aria-hidden="true" />Back to SAGE</button>
          </Sheet>
        )}

        {notice && <div className="toast" role="status"><Check aria-hidden="true" />{notice}</div>}
      </div>
    </main>
  );
}
