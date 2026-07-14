import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarCheck2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  Clock3,
  Ellipsis,
  FileCheck2,
  FileText,
  HelpCircle,
  Home,
  Eye,
  EyeOff,
  ListChecks,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Mic,
  Pause,
  Phone,
  Play,
  Plus,
  Search,
  Send,
  Signature,
  Settings,
  ShieldCheck,
  Sparkles,
  Square,
  Stethoscope,
  UserRound,
  UserPlus,
  UsersRound,
  Video,
  Upload,
  Trash2,
  X,
} from "lucide-react";
import {
  TODAY,
  createCareRoomThread,
  deepCopy,
  documentSections,
  facilities,
  initialActions,
  initialAssignments,
  initialEncounters,
  initialSchedule,
  initialTimelineEvents,
  initialThreads,
  providerShiftDeviationUpdates,
  residentById,
  residents,
  roleProfiles,
  staffDirectory,
  visitTypes,
} from "./data.js";

const STORAGE_VERSION = "sage.simple.functional.v9";
const reviewableStatuses = new Set(["needs-review"]);
const scribeStatuses = new Set(["scribe-in-progress", "revision"]);
const reviewQueueStatuses = new Set([...scribeStatuses, ...reviewableStatuses]);
const facilityScopedModuleTypes = new Set(["reviews", "schedule", "actions", "debrief", "sage"]);
const loginAccounts = {
  "provider@sage.com": "provider",
  "don@sage.com": "don",
  "cna@sage.com": "cna",
};
const initialProfileFields = {
  provider: { firstName: "Hannah", lastName: "Cole" },
  don: { firstName: "Jamie", lastName: "Patel" },
  cna: { firstName: "Nina", lastName: "Alvarez" },
};
const initialTwoFactorSettings = {
  provider: { enabled: true, configured: true, method: "Authenticator app", setupKey: "SAGE-DEMO-HANNAH", savedAt: "Demo account default" },
};
const residentStatusRank = { Declining: 0, Watchful: 1, "New admission": 2, Stable: 3 };
const deviationSeverityRank = { Urgent: 0, High: 1, Moderate: 2, Mild: 3 };
const SHIFT_DEVIATION_MIGRATION = `${STORAGE_VERSION}.shift-deviations-v2`;
const DEMO_PROVIDER_LOCATION = {
  status: "ready",
  coords: { latitude: 41.659507, longitude: -85.980714 },
  accuracy: 10,
  simulated: true,
};

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
    "scribe-in-progress": "Sent to Scribe",
    "needs-review": "Needs review",
    revision: "Revision sent to Scribe",
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
  if (["watch", "high", "review", "revision", "progress", "scribe", "new admission"].some((value) => normalized.includes(value))) return "warning";
  if (["done", "submitted", "stable", "captured", "completed"].some((value) => normalized.includes(value))) return "success";
  return "neutral";
}

function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function observedDay(observedAt = "") {
  return observedAt.split("·")[0].trim() || "recently";
}

function isNoBaselineChange(change = "") {
  return /\b(no changes?|unchanged|at baseline|stable)\b/i.test(change);
}

function nameInitials(name = "") {
  return name.trim().split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function ResidentInitials({ name }) {
  return <span className="resident-initials" aria-hidden="true">{nameInitials(name)}</span>;
}

function encounterMinutes(encounter) {
  if (!encounter?.time || encounter.time === "Now") return Number.POSITIVE_INFINITY;
  const [hours, minutes] = encounter.time.split(":").map(Number);
  const normalizedHours = encounter.meridiem === "PM" && hours !== 12 ? hours + 12 : encounter.meridiem === "AM" && hours === 12 ? 0 : hours;
  return (normalizedHours * 60) + (minutes || 0);
}

function displayTime(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return {
    time: `${hours % 12 || 12}:${String(minutes).padStart(2, "0")}`,
    meridiem: hours >= 12 ? "PM" : "AM",
  };
}

function distanceInMiles(origin, destination) {
  if (!origin || !Number.isFinite(destination?.latitude) || !Number.isFinite(destination?.longitude)) return null;
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(originLatitude) * Math.cos(destinationLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 3958.8 * (2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)));
}

function isAtFacility(location, facility) {
  if (location.status !== "ready") return false;
  const distance = distanceInMiles(location.coords, facility);
  const accuracyMiles = Math.max(0, location.accuracy ?? 0) / 1609.344;
  const arrivalRadius = Math.min(1.25, 0.75 + accuracyMiles);
  return distance !== null && distance <= arrivalRadius;
}

function SageMark() {
  return (
    <div className="sage-mark" aria-label="SAGE">
      <img src="/sage-logo.png" alt="" aria-hidden="true" />
      <span aria-hidden="true">S<span className="sage-inverted-a">Λ</span>GE</span>
    </div>
  );
}

function ScrollIndicator({ targetRef, className = "" }) {
  const [thumb, setThumb] = useState({ visible: false, height: 0, offset: 0 });
  const trackRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    const track = trackRef.current;
    if (!target || !track) return undefined;
    let animationFrame = 0;

    const update = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const viewportHeight = target.clientHeight;
        const scrollHeight = target.scrollHeight;
        const trackHeight = track.clientHeight;
        const maxScroll = Math.max(0, scrollHeight - viewportHeight);
        if (viewportHeight <= 0 || trackHeight <= 0 || maxScroll <= 2) {
          setThumb((current) => current.visible ? { visible: false, height: 0, offset: 0 } : current);
          return;
        }

        const height = Math.min(trackHeight, Math.max(36, Math.round(trackHeight * (viewportHeight / scrollHeight))));
        const availableTravel = Math.max(0, trackHeight - height);
        const scrollTop = Math.min(maxScroll, Math.max(0, target.scrollTop));
        const offset = Math.round((scrollTop / maxScroll) * availableTravel);
        setThumb((current) => current.visible && current.height === height && current.offset === offset
          ? current
          : { visible: true, height, offset });
      });
    };

    const resizeObserver = new ResizeObserver(update);
    const observeSize = () => {
      resizeObserver.disconnect();
      resizeObserver.observe(target);
      resizeObserver.observe(track);
      [...target.children].forEach((child) => resizeObserver.observe(child));
    };
    const mutationObserver = new MutationObserver(() => {
      observeSize();
      update();
    });

    target.addEventListener("scroll", update, { passive: true });
    mutationObserver.observe(target, { attributes: true, childList: true, characterData: true, subtree: true });
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    observeSize();
    update();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      target.removeEventListener("scroll", update);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, [targetRef]);

  return <div ref={trackRef} className={`custom-scrollbar ${className}${thumb.visible ? " visible" : ""}`.trim()} aria-hidden="true"><span style={{ height: `${thumb.height}px`, transform: `translate3d(0, ${thumb.offset}px, 0)` }} /></div>;
}

function AppHeader({ role, module, hidden, onBack, onAskSage }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [module?.title]);

  if (module) {
    const hasActions = Boolean(module.actions?.length || module.menuItems?.length);
    return (
      <header className={`app-header task-header${module.status ? " has-status" : ""}${hasActions ? " has-actions" : ""}${hidden ? " hidden" : ""}`}>
        <button className="header-back" type="button" onClick={onBack} aria-label="Go back">
          <ArrowLeft aria-hidden="true" />
        </button>
        <div className="task-header-copy">
          <strong>{module.title}</strong>
          {module.subtitle && <small>{module.subtitle}</small>}
        </div>
        {module.status && <small className={`task-header-status ${module.statusTone}`}>{module.status}</small>}
        {hasActions && <div className="task-header-actions">
          {module.actions?.map((action) => { const Icon = action.icon; return <button key={action.id} type="button" onClick={action.onClick} aria-label={action.label}><Icon aria-hidden="true" /></button>; })}
          {module.menuItems?.length > 0 && <div className="header-overflow">
            <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="More conversation options" aria-expanded={menuOpen}><Ellipsis aria-hidden="true" /></button>
            {menuOpen && <><button className="header-overflow-scrim" type="button" onClick={() => setMenuOpen(false)} aria-label="Close conversation options" /><div className="header-overflow-menu" role="menu">{module.menuItems.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" role="menuitem" onClick={() => { setMenuOpen(false); item.onClick(); }}><Icon aria-hidden="true" /><span>{item.label}</span></button>; })}</div></>}
          </div>}
        </div>}
      </header>
    );
  }

  return (
    <header className={`app-header${hidden ? " hidden" : ""}`}>
      <div className="header-row">
        <SageMark />
        <div className="header-context">
          <p>Mon, Jul 13</p>
          <span>{roleProfiles[role].label}</span>
        </div>
        <button className="ask-sage-button" type="button" onClick={onAskSage} aria-label="Ask SAGE">
          <Sparkles aria-hidden="true" />
          <span>Ask <b>SAGE</b></span>
        </button>
      </div>
    </header>
  );
}

function FacilityScopeCards({ role, activeFacilityId, encounters, location, onSelect }) {
  const currentFacility = facilities.find((facility) => isAtFacility(location, facility));
  const orderedFacilities = [...facilities].sort((first, second) =>
    Number(second.id === currentFacility?.id) - Number(first.id === currentFacility?.id)
    || first.shortName.localeCompare(second.shortName));
  const scopeCards = [{ id: "all", shortName: "All facilities" }, ...orderedFacilities];

  function scopeDetail(facility) {
    if (facility.id === "all") return role === "provider"
      ? `${encounters.filter((encounter) => encounter.date === TODAY && encounter.status === "submitted-to-billing").length}/${encounters.filter((encounter) => encounter.date === TODAY).length} complete`
      : `${facilities.length} locations`;
    if (role !== "provider") return `${residents.filter((resident) => resident.facilityId === facility.id).length} residents`;
    const visits = encounters.filter((encounter) => encounter.date === TODAY && residentById(encounter.residentId).facilityId === facility.id);
    return `${visits.filter((encounter) => encounter.status === "submitted-to-billing").length}/${visits.length} complete`;
  }

  return (
    <section className="facility-scope" aria-label="Facility workspace">
      <div className="facility-scope-rail">
        {scopeCards.map((facility) => {
          const isCurrent = facility.id === currentFacility?.id;
          const active = facility.id === activeFacilityId;
          return (
            <button
              key={facility.id}
              className={`facility-scope-card${active ? " active" : ""}${isCurrent ? " current" : ""}`}
              type="button"
              data-workspace-facility={facility.id}
              aria-pressed={active}
              onClick={() => onSelect(facility.id)}
            >
              <span className="facility-scope-kicker">{isCurrent && <MapPin />}{isCurrent ? "You’re here" : facility.id === "all" ? "Workspace" : "Facility"}</span>
              <strong>{facility.shortName}</strong>
              <small>{scopeDetail(facility)}</small>
              {active && <span className="facility-scope-check" aria-hidden="true"><Check /></span>}
            </button>
          );
        })}
      </div>
    </section>
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

function ProviderHome({ encounters, location, onStart, onOpenVisit, onMessage, onOpenReviews, onAddEncounter, onOpenSchedule }) {
  const today = encounters.filter((encounter) => encounter.date === TODAY);
  const completed = today.filter((encounter) => encounter.status === "submitted-to-billing").length;
  const open = today.filter((encounter) => encounter.status === "scheduled" || encounter.status === "provider-in-progress");
  const tomorrow = encounters.filter((encounter) => encounter.date === "2026-07-14" && encounter.status === "scheduled");
  const displayed = open.length ? open : tomorrow;
  const progressVisits = open.length ? today : tomorrow;
  const facilityGroups = [...new Set(progressVisits.map((encounter) => residentById(encounter.residentId).facilityId))]
    .map((facilityId) => {
      const facility = facilities.find((item) => item.id === facilityId);
      const facilityProgressVisits = progressVisits.filter((encounter) => residentById(encounter.residentId).facilityId === facilityId);
      const visits = displayed
        .filter((encounter) => residentById(encounter.residentId).facilityId === facilityId)
        .sort((a, b) => {
          const first = residentById(a.residentId);
          const second = residentById(b.residentId);
          return (deviationSeverityRank[a.deviationSeverity] ?? 4) - (deviationSeverityRank[b.deviationSeverity] ?? 4) || first.name.localeCompare(second.name);
        });
      return {
        facility,
        visits,
        total: facilityProgressVisits.length,
        completed: facilityProgressVisits.filter((encounter) => encounter.status === "submitted-to-billing").length,
        severityRank: Math.min(...(visits.length ? visits : facilityProgressVisits).map((encounter) => deviationSeverityRank[encounter.deviationSeverity] ?? 4)),
        isCurrentFacility: isAtFacility(location, facility),
      };
    })
    .sort((a, b) => Number(b.isCurrentFacility) - Number(a.isCurrentFacility) || a.severityRank - b.severityRank || a.facility.shortName.localeCompare(b.facility.shortName));
  const reviewCount = encounters.filter((encounter) => reviewableStatuses.has(encounter.status)).length;
  const scribeCount = encounters.filter((encounter) => scribeStatuses.has(encounter.status)).length;

  return (
    <section className="screen-content shift-screen" aria-labelledby="shift-title">
      <section className="shift-overview">
        <h1 id="shift-title">Your shift</h1>
        <Progress value={completed} total={today.length} label="visits complete" />
        <section className="up-next" aria-labelledby="up-next-title">
          <div className="section-title-row">
            <div><h2 id="up-next-title">{open.length ? "Changes to assess" : "Tomorrow’s changes"}</h2><p className="severity-order-note">Baseline deviations only · Highest acuity first.</p></div>
          </div>
          <button className="add-encounter-home" type="button" onClick={onAddEncounter}><Plus aria-hidden="true" />Add an Encounter</button>
        </section>
      </section>
      <div className="facility-shift-list">
          {facilityGroups.map((group) => (
            <section className="facility-shift-group" key={group.facility.id} data-facility-id={group.facility.id} aria-labelledby={`shift-facility-${group.facility.id}`}>
              <header className={`facility-card-heading${group.isCurrentFacility ? " current" : ""}`}>
                <strong id={`shift-facility-${group.facility.id}`}>{group.isCurrentFacility ? `At ${group.facility.shortName} · You’re here` : group.facility.shortName}</strong>
                <span aria-label={`${group.facility.shortName}: ${group.completed} of ${group.total} visits complete`}><strong>{group.total} visits</strong><small>{group.completed} complete</small></span>
              </header>
              <div className="patient-card-list">
                {group.visits.map((encounter) => {
                  const resident = residentById(encounter.residentId);
                  const initials = nameInitials(resident.name);
                  const latestUpdate = resident.reports?.[0]?.time?.replace("Today · ", "") ?? "this week";
                  const canContinueHere = group.isCurrentFacility && encounter.status === "provider-in-progress";
                  return (
                    <article key={encounter.id} className={`shift-patient-card ${statusTone(encounter.deviationSeverity)}${group.isCurrentFacility ? " current-facility" : ""}`}>
                      <button className="patient-card-person" type="button" onClick={() => onOpenVisit(encounter)}>
                        <span className="patient-card-initials">{initials}</span>
                        <span className="patient-card-copy"><strong>{resident.name}</strong><small>Room {resident.room} · last seen {latestUpdate}</small></span>
                        <span className={`patient-condition ${statusTone(encounter.deviationSeverity)}`}>{encounter.deviationSeverity}</span>
                      </button>
                      <div className="patient-card-reason"><small>Reason for visit</small><p>{encounter.reason}</p></div>
                      {isNoBaselineChange(encounter.change)
                        ? <div className="patient-card-change unchanged"><span><p>No changes since {observedDay(encounter.changeObservedAt)}</p></span></div>
                        : <div className="patient-card-change changed"><ArrowDown /><span><p><b>Since {observedDay(encounter.changeObservedAt)}:</b> {encounter.change}</p><em><Sparkles />Surfaced by Sage</em></span></div>}
                      {!group.isCurrentFacility && <p className="patient-card-away"><MapPin />Available when you’re at {group.facility.shortName}</p>}
                      <div className="patient-card-actions">
                        <button className={`patient-encounter-action${canContinueHere ? " started" : ""}`} type="button" disabled={!group.isCurrentFacility} onClick={() => onStart(encounter)}>
                          {canContinueHere ? "Continue Encounter" : "Start Encounter"}
                        </button>
                        <button className="patient-message-action" type="button" onClick={() => onMessage(resident)} aria-label={`Open ${resident.name}'s care room`}><MessageSquare /></button>
                      </div>
                    </article>
                  );
                })}
                {!group.visits.length && <div className="facility-complete"><CheckCircle2 />All visits complete</div>}
              </div>
            </section>
          ))}
          {!displayed.length && <div className="calm-empty"><CheckCircle2 /><strong>All visits are complete</strong><span>No visits are scheduled for tomorrow.</span></div>}
      </div>

      <button className="review-note" type="button" onClick={onOpenReviews}>
        <span className="review-icon"><FileText aria-hidden="true" /></span>
        <span>{scribeCount ? `${reviewCount} ready · ${scribeCount} sent to Scribe` : `${reviewCount} notes need your review`}</span>
        <strong>{reviewCount ? "Review" : "View"}</strong>
        <ChevronRight aria-hidden="true" />
      </button>
      <button className="quiet-wide" type="button" onClick={onOpenSchedule}><CalendarDays />See the full weekly schedule</button>
    </section>
  );
}

function DonHome({ residents: visibleResidents, actions, onOpenResident, onOpenActions, onSchedule }) {
  const priorityResidents = visibleResidents.filter((resident) => resident.status === "Declining" || resident.status === "Watchful");
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
              <ResidentInitials name={resident.name} />
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
              <ResidentInitials name={residentById(pending[0].residentId).name} />
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

function ResidentsScreen({ role, residents: visibleResidents, encounters, cnaResidentIds, onOpenResident }) {
  const [query, setQuery] = useState("");
  const roleResidents = role === "cna" ? visibleResidents.filter((resident) => cnaResidentIds.has(resident.id)) : visibleResidents;
  const filtered = roleResidents
    .filter((resident) => `${resident.name} ${resident.room} ${resident.latest}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (residentStatusRank[a.status] ?? 4) - (residentStatusRank[b.status] ?? 4) || a.name.localeCompare(b.name));
  return (
    <section className="screen-content secondary-screen" aria-labelledby="residents-title">
      <h1 id="residents-title">Residents</h1>
      <p className="screen-intro">Search by name, room, or concern.</p>
      <label className="search-field"><Search /><span className="sr-only">Search residents</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search residents" /></label>
      <div className="resident-list">
        {filtered.map((resident) => {
          const reviewCount = encounters.filter((encounter) => encounter.residentId === resident.id && reviewableStatuses.has(encounter.status)).length;
          return (
            <button key={resident.id} className="resident-row" type="button" onClick={() => onOpenResident(resident)}>
              <ResidentInitials name={resident.name} />
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

function MessagesScreen({ role, threads, people: availablePeople, filter, onFilter, onOpenThread, onOpenPerson, onCallPerson, onStartGroup, onNewMessage }) {
  const [query, setQuery] = useState("");
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState([]);
  const normalizedQuery = query.trim().toLowerCase();
  const residentRooms = threads.filter((thread) => thread.kind === "room" && thread.residentId && `${thread.title} ${thread.messages.map((message) => message.text).join(" ")}`.toLowerCase().includes(normalizedQuery));
  const groupThreads = threads.filter((thread) => thread.kind === "group" && `${thread.title} ${thread.messages.map((message) => message.text).join(" ")}`.toLowerCase().includes(normalizedQuery));
  const people = availablePeople
    .filter((person) => {
      const thread = threads.find((item) => item.kind === "person" && item.personId === person.id);
      return `${person.name} ${person.role} ${person.presence} ${thread?.messages.map((message) => message.text).join(" ") ?? ""}`.toLowerCase().includes(normalizedQuery);
    });
  function togglePerson(personId) {
    setSelected((items) => items.includes(personId) ? items.filter((id) => id !== personId) : [...items, personId]);
  }
  function finishGroup(kind) {
    if (selected.length < 2) return;
    onStartGroup(selected, kind);
    setSelected([]);
    setSelecting(false);
  }
  function roomRow(thread) {
    const last = thread.messages[thread.messages.length - 1];
    const resident = thread.residentId ? residentById(thread.residentId) : null;
    return (
      <button key={thread.id} className="thread-row" type="button" onClick={() => onOpenThread(thread)}>
        {resident ? <ResidentInitials name={resident.name} /> : <span className="thread-icon"><UsersRound /></span>}
        <span><strong>{thread.title}</strong><small>{last?.text}</small><em>{last?.time}</em></span><ChevronRight />
      </button>
    );
  }
  return (
    <section className={`screen-content secondary-screen messages-screen${selecting ? " selecting" : ""}`} aria-labelledby="messages-title">
      <div className="section-title-row"><div><h1 id="messages-title">Messages</h1><p className="screen-intro">Resident care rooms and people in one place.</p></div><button className="round-action" type="button" onClick={onNewMessage} aria-label="New message"><Plus /></button></div>
      <label className="search-field messages-search"><Search /><span className="sr-only">Search messages and people</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={filter === "rooms" ? "Search resident care rooms" : "Search people"} /></label>
      <div className="segmented" role="tablist" aria-label="Message type">
        <button className={filter === "rooms" ? "active" : ""} type="button" onClick={() => onFilter("rooms")}>Care rooms <span>{residentRooms.length}</span></button>
        <button className={filter === "people" ? "active" : ""} type="button" onClick={() => onFilter("people")}>People <span>{people.length}</span></button>
      </div>
      <div className="thread-list">
        {filter === "rooms" && residentRooms.length > 0 && <p className="message-list-label">Resident care rooms</p>}
        {filter === "rooms" && residentRooms.map(roomRow)}
        {filter === "people" && <div className="people-list-head"><span>{selecting ? `${selected.length} selected` : "Care-team directory"}</span><button type="button" onClick={() => { setSelecting((value) => !value); setSelected([]); }}>{selecting ? "Cancel" : "Select people"}</button></div>}
        {filter === "people" && groupThreads.length > 0 && <p className="message-list-label">Group conversations</p>}
        {filter === "people" && groupThreads.map((thread) => {
          const last = thread.messages[thread.messages.length - 1];
          return <button key={thread.id} className="thread-row" type="button" onClick={() => onOpenThread(thread)}><span className="thread-icon"><UsersRound /></span><span><strong>{thread.title}</strong><small>{last?.text || "Group conversation"}</small><em>{thread.members}</em></span><ChevronRight /></button>;
        })}
        {filter === "people" && groupThreads.length > 0 && <p className="message-list-label people-directory-label">People</p>}
        {filter === "people" && people.map((person) => {
          const directThread = threads.find((thread) => thread.kind === "person" && thread.personId === person.id);
          const last = directThread?.messages[directThread.messages.length - 1];
          return (
            <article key={person.id} className={`person-card${selected.includes(person.id) ? " selected" : ""}`}>
              <button className="person-card-main" type="button" onClick={() => selecting ? togglePerson(person.id) : onOpenPerson(person)}>
                {selecting && <span className="person-check">{selected.includes(person.id) && <Check />}</span>}
                <span className="staff-avatar placeholder"><CircleUserRound /><i className={`presence ${person.presence}`} /></span>
                <span><strong>{person.name}</strong><small>{person.role}</small><em>{person.presence === "online" ? "Online" : person.lastSeen ? `Last seen ${person.lastSeen}` : person.presence}</em>{last?.text && <small className="person-last-message">{last.text}</small>}</span>
              </button>
              {!selecting && <div className="person-card-actions"><button type="button" onClick={() => onCallPerson(person)}><Phone />Call</button><button type="button" onClick={() => onOpenPerson(person)}><MessageSquare />Message</button></div>}
            </article>
          );
        })}
        {filter === "rooms" && !residentRooms.length && <div className="calm-empty"><MessageSquare /><strong>No care rooms found</strong><span>Try another resident name, room, or message.</span></div>}
        {filter === "people" && !people.length && <div className="calm-empty"><UsersRound /><strong>No people found</strong><span>Try a name, role, or availability.</span></div>}
      </div>
      {filter === "people" && selecting && <div className="group-action-bar"><small>{selected.length < 2 ? "Select at least 2 people" : `${selected.length} people selected`}</small><div><button type="button" disabled={selected.length < 2} onClick={() => finishGroup("call")}><Phone />Start group call</button><button className="primary" type="button" disabled={selected.length < 2} onClick={() => finishGroup("chat")}><MessageSquare />Start group chat</button></div></div>}
    </section>
  );
}

function MoreScreen({ role, reviewCount, actionCount, onOpen, onLogout }) {
  const common = [
    { id: "schedule", label: "Schedule", helper: "Visits, huddles, orders, and follow-ups", icon: CalendarDays },
    { id: "sage", label: "Ask Sage", helper: "Get a plain-language clinical summary", icon: Sparkles },
  ];
  const roleItems = role === "provider"
    ? [
        { id: "reviews", label: "Encounter notes", helper: `${reviewCount} in the review workflow`, icon: FileCheck2 },
        { id: "actions", label: "My actions", helper: `${actionCount} assigned to you`, icon: ListChecks },
      ]
    : role === "don"
      ? [{ id: "actions", label: "Team actions", helper: `${actionCount} open across the team`, icon: ListChecks }]
      : [
          { id: "debrief", label: "Shift debrief", helper: "Capture resident-by-resident updates", icon: Mic },
          { id: "actions", label: "My care actions", helper: `${actionCount} still open`, icon: ClipboardCheck },
        ];
  const items = [...roleItems, ...common, { id: "settings", label: "Settings", helper: "Profile, notifications, and signature", icon: Settings }, { id: "help", label: "Help using SAGE", helper: "A simple guide to every section", icon: HelpCircle }];
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
      <button className="logout-row" type="button" onClick={onLogout}><LogOut /><strong>Log out</strong></button>
    </section>
  );
}

function BottomNav({ role, activeTab, hidden, onChange }) {
  const tabs = [
    { id: "home", label: roleProfiles[role].homeLabel, icon: role === "don" ? Activity : CalendarCheck2 },
    { id: "residents", label: "Residents", icon: UsersRound },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "more", label: "More", icon: Ellipsis },
  ];
  return (
    <nav className={`bottom-nav${hidden ? " hidden" : ""}`} aria-label="Primary navigation" aria-hidden={hidden || undefined}>
      {tabs.map(({ id, label, icon: Icon }) => (
        <button key={id} className={activeTab === id ? "active" : ""} type="button" tabIndex={hidden ? -1 : undefined} aria-current={activeTab === id ? "page" : undefined} onClick={() => onChange(id)}><Icon /><span>{label}</span></button>
      ))}
    </nav>
  );
}

function DesktopNav({ role, activeTab, onChange, onProfile }) {
  const tabs = [
    { id: "home", label: roleProfiles[role].homeLabel, icon: role === "don" ? Activity : CalendarCheck2 },
    { id: "residents", label: "Residents", icon: UsersRound },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "more", label: "More", icon: Ellipsis },
  ];
  return (
    <aside className="desktop-nav" aria-label="Desktop navigation">
      <div className="desktop-brand"><SageMark /><small>Care Simple</small></div>
      <nav aria-label="Primary navigation">
        {tabs.map(({ id, label, icon: Icon }) => <button key={id} className={activeTab === id ? "active" : ""} type="button" aria-current={activeTab === id ? "page" : undefined} onClick={() => onChange(id)}><Icon aria-hidden="true" /><span>{label}</span></button>)}
      </nav>
      <button className="desktop-profile" type="button" onClick={onProfile}><CircleUserRound aria-hidden="true" /><span><strong>{roleProfiles[role].name}</strong><small>{roleProfiles[role].label}</small></span><ChevronRight aria-hidden="true" /></button>
    </aside>
  );
}

function ResidentDetail({ resident, role, encounters, timelineEvents, careRoom, tab, onTab, onCareRoom, onAddEncounter, onAssignAction, onDebrief, canDebrief, onOpenReview }) {
  const residentEncounters = encounters.filter((encounter) => encounter.residentId === resident.id);
  return (
    <section className="task-content resident-detail">
      <div className="resident-hero">
        <ResidentInitials name={resident.name} /><span><strong>{resident.name}</strong><small>Room {resident.room} · {resident.age} years old</small></span><span className={`status-pill ${statusTone(resident.status)}`}>{resident.status}</span>
      </div>
      <div className="resident-actions">
        <button type="button" onClick={onCareRoom}><MessageSquare />Care room</button>
        {role === "provider" && <button className="resident-add-encounter" type="button" onClick={onAddEncounter}><Stethoscope />Add encounter</button>}
        {role === "don" && <button type="button" onClick={onAssignAction}><ListChecks />Assign action</button>}
        {role === "cna" && canDebrief && <button type="button" onClick={onDebrief}><Mic />Debrief</button>}
      </div>
      <div className="segmented resident-tabs" role="tablist">
        {[["summary", "Summary"], ["care-room", "Care room"], ["timeline", "Timeline"], ["notes", "Notes"]].map(([id, label]) => <button key={id} className={tab === id ? "active" : ""} type="button" onClick={() => onTab(id)}>{label}</button>)}
      </div>
      {tab === "summary" && (
        <div className="detail-stack">
          <section className="plain-section emphasis"><span className="eyebrow">What changed</span><h2>{resident.latest}</h2><p>{resident.summary}</p><div className="why-box"><ShieldCheck /><span><strong>Why it matters</strong>{resident.why}</span></div></section>
          <section className="plain-section"><h2>Vitals compared with baseline</h2><div className="vital-list">{resident.vitals.map((vital) => <div key={vital.label}><span><strong>{vital.label}</strong><small>Usual {vital.baseline}</small></span><b className={vital.tone}>{vital.value}</b></div>)}</div></section>
          <section className="plain-section"><h2>Care-team reports</h2><div className="report-list">{resident.reports.map((report) => <article key={report.id}><header><strong>{report.author} · {report.role}</strong><small>{report.time}</small></header><p>{report.text}</p><small><strong>Why it matters:</strong> {report.why}</small></article>)}</div></section>
        </div>
      )}
      {tab === "care-room" && (
        <section className="care-room-preview">
          <span className="care-room-icon"><MessageSquare /></span>
          <div><span className="eyebrow">Shared resident conversation</span><h2>{resident.name} care room</h2><p>Nursing, providers, CNAs, and coordination staff keep resident-specific updates together here.</p></div>
          <div className="care-room-recent">{careRoom?.messages.slice(-2).map((message) => <article key={message.id}><strong>{message.from}</strong><p>{message.text}</p><small>{message.time}</small></article>)}</div>
          <button className="primary-wide" type="button" onClick={onCareRoom}><MessageSquare />Open care room</button>
        </section>
      )}
      {tab === "timeline" && <div className="timeline-list live-timeline">{timelineEvents.map((event) => { const linkedEncounter = event.sourceType === "encounter" ? encounters.find((encounter) => encounter.id === event.sourceId) : null; const waitingForScribe = scribeStatuses.has(linkedEncounter?.status); return <article key={event.id} className={`timeline-event ${event.kind}`}><span /><div><small>{event.displayTime} · {event.actor}</small><strong>{event.title}</strong><p>{event.text}</p>{event.sourceType === "encounter" && (waitingForScribe ? <span className="timeline-scribe-wait"><Clock3 />Sent to Scribe · Review not available yet</span> : <button type="button" onClick={() => onOpenReview(linkedEncounter)}>View provider note<ChevronRight /></button>)}</div></article>; })}{!timelineEvents.length && <div className="calm-empty"><Clock3 /><strong>No timeline activity yet</strong><span>Care-team activity for this resident will appear here.</span></div>}</div>}
      {tab === "notes" && (
        <div className="note-history">
          {residentEncounters.map((encounter) => <button key={encounter.id} type="button" onClick={() => onOpenReview(encounter)}><span><strong>{encounter.reason}</strong><small>{formatDate(encounter.date)} · {encounter.type}</small></span><span className={`status-pill ${statusTone(prettyStatus(encounter.status))}`}>{prettyStatus(encounter.status)}</span><ChevronRight /></button>)}
          {!residentEncounters.length && <div className="calm-empty"><FileText /><strong>No encounter notes</strong><span>Notes created for this resident will appear here.</span></div>}
        </div>
      )}
    </section>
  );
}

function ReviewQueue({ encounters, filter, onFilter, onOpen }) {
  const filtered = encounters.filter((encounter) => {
    if (filter === "needs") return reviewQueueStatuses.has(encounter.status);
    return encounter.status === "submitted-to-billing";
  }).sort((a, b) => Number(scribeStatuses.has(b.status)) - Number(scribeStatuses.has(a.status)));
  const counts = { needs: encounters.filter((item) => reviewQueueStatuses.has(item.status)).length, done: encounters.filter((item) => item.status === "submitted-to-billing").length };
  return (
    <section className="task-content review-queue">
      <div className="segmented queue-filters" role="tablist">
        {["needs", "done"].map((id) => <button key={id} className={filter === id ? "active" : ""} type="button" onClick={() => onFilter(id)}>{id === "needs" ? "Needs review" : "Done"}<span>{counts[id]}</span></button>)}
      </div>
      <div className="queue-list">
        {filtered.map((encounter) => {
          const resident = residentById(encounter.residentId);
          const waitingForScribe = scribeStatuses.has(encounter.status);
          return <button key={encounter.id} className={waitingForScribe ? "scribe-pending" : ""} type="button" disabled={waitingForScribe} onClick={() => onOpen(encounter)}>
            <ResidentInitials name={resident.name} />
            <span className="queue-row-content">
              <span className="queue-row-heading"><strong>{resident.name}</strong><span className={`status-pill ${statusTone(prettyStatus(encounter.status))}`}>{prettyStatus(encounter.status)}</span></span>
              <small className="queue-row-reason">{encounter.reason}</small>
              <em className="queue-row-meta">{formatDate(encounter.date)} · {encounter.type}</em>
              {waitingForScribe && <span className="scribe-wait"><Clock3 /><span><strong>{encounter.assignedScribe}</strong>{encounter.status === "revision" ? " is editing the requested revision" : " is completing the required details"}</span></span>}
            </span>
            {!waitingForScribe && <ChevronRight />}
          </button>;
        })}
        {!filtered.length && <div className="calm-empty"><CheckCircle2 /><strong>Nothing in this list</strong><span>Choose another filter to see more notes.</span></div>}
      </div>
    </section>
  );
}

const reviewMedicationCatalog = [
  ["Ondansetron HCl Oral Tablet 4 MG", "Give 1 tablet by mouth every 6 hours as needed for nausea / vomiting · Q6H · since 04-24-2025"],
  ["Senna S Tablet 8.6-50 MG", "Give 1 tablet by mouth as needed for constipation, up to twice daily · PRN · since 04-24-2025"],
  ["Acetaminophen Oral Tablet 325 MG", "Give 2 tablets by mouth every 6 hours as needed for mild to moderate pain, 650 mg total · Q6H · since 04-24-2025"],
  ["Melatonin Oral Tablet 5 MG", "Give 5 mg by mouth as needed for insomnia · PRN · since 04-24-2025"],
  ["Loperamide HCl Oral Tablet 2 MG", "Give 1 tablet by mouth every 12 hours as needed for diarrhea / loose stools · Q12H · since 10-30-2025"],
  ["Amlodipine Besylate Oral Tablet 5 MG", "Give 1 tablet by mouth daily for hypertension · daily · since 04-24-2025"],
  ["Losartan Potassium Oral Tablet 25 MG", "Give 1 tablet by mouth daily for hypertension · daily · since 04-24-2025"],
  ["Spironolactone Oral Tablet 25 MG", "Give 1 tablet by mouth daily for edema and blood-pressure support · daily"],
  ["Isosorbide Mononitrate ER Oral Tablet 60 MG", "Give 1 tablet by mouth every morning for angina prevention · daily"],
  ["Pantoprazole Sodium Oral Tablet 40 MG", "Give 1 tablet by mouth before breakfast for reflux · daily"],
  ["Atorvastatin Calcium Oral Tablet 20 MG", "Give 1 tablet by mouth at bedtime for hyperlipidemia · nightly"],
  ["Aspirin Chewable Tablet 81 MG", "Give 1 tablet by mouth daily for cardiovascular protection · daily"],
  ["Vitamin D3 Oral Tablet 1000 IU", "Give 1 tablet by mouth daily as a supplement · daily"],
  ["Polyethylene Glycol Powder 17 GM", "Give 17 grams by mouth daily as needed for constipation · PRN"],
  ["Albuterol Sulfate Inhalation Solution", "Inhale one treatment every 6 hours as needed for wheezing · Q6H PRN"],
  ["Gabapentin Oral Capsule 100 MG", "Give 1 capsule by mouth three times daily for neuropathic pain · TID"],
  ["Sertraline HCl Oral Tablet 50 MG", "Give 1 tablet by mouth daily for depression · daily"],
  ["Levothyroxine Sodium Oral Tablet 50 MCG", "Give 1 tablet by mouth every morning for hypothyroidism · daily"],
  ["Furosemide Oral Tablet 20 MG", "Give 1 tablet by mouth daily for fluid management · daily"],
  ["Metoprolol Tartrate Oral Tablet 25 MG", "Give 1 tablet by mouth twice daily for rate control · BID"],
  ["Multivitamin Oral Tablet", "Give 1 tablet by mouth daily as a nutritional supplement · daily"],
];

function ClinicalSectionContent({ section, showAllMedications, onToggleMedications }) {
  if (section.id === "vitals") {
    const vitalOrder = ["Blood Pressure", "Heart Rate", "Respiratory Rate", "Temperature", "Oxygen Saturation", "Weight"];
    const displayedVitals = vitalOrder.map((label) => section.content.find((item) => item.label === label)).filter(Boolean);
    return <div className="review-vital-grid">{displayedVitals.map((item) => <div key={item.label} className={item.label === "Blood Pressure" ? "alert" : ""}><small>{item.label === "Oxygen Saturation" ? "O2 Saturation" : item.label}</small><strong>{item.text}</strong></div>)}</div>;
  }

  if (section.id === "medications") {
    const visibleMedications = showAllMedications ? reviewMedicationCatalog : reviewMedicationCatalog.slice(0, 5);
    return <div className="review-medication-list">{visibleMedications.map(([name, instructions]) => <div key={name}><strong>{name}</strong><p>{instructions}</p></div>)}<button type="button" onClick={onToggleMedications}>{showAllMedications ? "Show fewer medications" : "Show all 21 medications"}</button></div>;
  }

  if (section.id === "assessment") {
    return <div className="review-plan-list">{section.content.map((item, index) => {
      if (item.label === "Medical Decision Making") return <p className="review-plan-summary" key={`plan-${index}`}>{item.text}</p>;
      const [code, ...titleParts] = (item.label || "Care plan").split("·").map((part) => part.trim());
      const title = titleParts.join(" · ") || code;
      const hasCode = /^[A-Z]\d|^\d{3}/.test(code);
      return <div className={`review-plan-card${item.kind === "encounter-order" ? " order" : ""}`} key={`${item.label}-${index}`}><header>{hasCode && <span>{code}</span>}<strong>{hasCode ? title : item.label}</strong></header><p>{item.text}</p>{item.kind !== "encounter-order" && <ul><li><ArrowRight />Continue documented monitoring</li><li><ArrowRight />Notify the Provider for new or worsening symptoms</li></ul>}</div>;
    })}</div>;
  }

  if (section.id === "cpt") {
    const [code, description] = (section.content?.[0]?.text || "99309 - Supported by documentation").split(" - ");
    return <div className="review-cpt-row"><strong>{code}</strong><span>{description || "Supported by documentation"}</span></div>;
  }

  return <div className="clinical-data">{section.content?.map((item, index) => <div key={`${item.label ?? "text"}-${index}`} className={item.label ? "clinical-field" : "clinical-copy"}>{item.label && <strong>{item.label}</strong>}<p>{item.text}</p></div>) ?? <p>{section.text}</p>}</div>;
}

function ReviewDocument({ encounter, onRevision, onPlayVoice, canEdit = true, viewerRole = "provider" }) {
  const resident = residentById(encounter.residentId);
  const facility = facilities.find((item) => item.id === resident.facilityId);
  const completed = encounter.status === "submitted-to-billing";
  const readOnly = completed || !canEdit;
  const carriedForwardSectionIds = new Set(["code", "pmh", "psh", "social", "family", "immunizations", "allergies", "medications"]);
  const [showAllMedications, setShowAllMedications] = useState(false);
  return (
    <section className="task-content review-document">
      <section className="sage-encounter-summary" aria-labelledby="sage-summary-title">
        <header>
          <span><Sparkles aria-hidden="true" /></span>
          <div><small>SAGE summary</small><strong id="sage-summary-title">Encounter ready for review</strong></div>
        </header>
        <p>This encounter addresses {encounter.reason.toLowerCase()}. The note brings together the current clinical context, vital signs, medications, diagnoses, treatment plan, provider notes, and billing support.</p>
        <div className="sage-summary-check"><CheckCircle2 aria-hidden="true" />SAGE summarized all {encounter.sections.length} encounter sections</div>
        <p className="sage-summary-disclaimer">A reading aid, not part of the note — what you sign is the full note below, exactly as written.</p>
        {encounter.summaryRevisions?.map((revision) => <div key={revision.id} className="revision-note summary-revision"><small>Revision requested · {revision.createdAt}</small><p>{revision.text}</p>{revision.source === "voice" && <button type="button" onClick={() => onPlayVoice(revision)}><Play />Play voice revision · {revision.duration}s</button>}</div>)}
      </section>
      <section className="encounter-review-details" aria-label="Encounter details">
        <div><small>Service date</small><strong>{formatDate(encounter.date)}</strong></div>
        <div><small>Visit type</small><strong>{encounter.type}</strong></div>
        <div><small>Facility</small><strong>{facility.name}</strong></div>
        <div><small>Provider</small><strong>{roleProfiles.provider.name}</strong></div>
      </section>
      <div className="document-sections">
        {encounter.sections.map((section) => {
          const sectionState = carriedForwardSectionIds.has(section.id) ? "Carried forward" : "New this visit";
          return (
            <article key={section.id} className={`document-section document-section-${section.id}`}>
              <header className="document-section-head"><strong>{section.title}</strong><span className={sectionState === "Carried forward" ? "carried" : "new"}>{sectionState}</span></header>
              <div className="document-section-body">
                <ClinicalSectionContent section={section} showAllMedications={showAllMedications} onToggleMedications={() => setShowAllMedications((expanded) => !expanded)} />
                {section.revisions?.map((revision) => <div key={revision.id} className="revision-note"><small>Revision requested · {revision.createdAt}</small><p>{revision.text}</p>{revision.source === "voice" && <button type="button" onClick={() => onPlayVoice(revision)}><Play />Play voice revision · {revision.duration}s</button>}</div>)}
              </div>
              {!readOnly && section.id !== "notes" && <button className="section-revision-action" type="button" onClick={() => onRevision(section)}><MessageSquare aria-hidden="true" />Request revision</button>}
            </article>
          );
        })}
      </div>
      {completed ? <div className="signed-banner"><ShieldCheck /><span><strong>Signed by {encounter.signedSignature?.providerName ?? "Dr. Hannah Cole"}</strong><small>{encounter.signedSignature?.signedAt ?? encounter.signedAt}</small></span></div> : !canEdit && <div className="provider-note-readonly"><FileText /><span><strong>Provider note</strong><small>{prettyStatus(encounter.status)} · Read only for {roleProfiles[viewerRole].label}</small></span></div>}
    </section>
  );
}

function encounterVisitNote(encounter) {
  if (!encounter) return "";
  return [encounter.textNote, encounter.voiceTranscript].filter((note) => note?.trim()).map((note) => note.trim()).join("\n\n");
}

function EncounterWorkspace({ encounter, onUpdate, onEnd, recording, onRecord }) {
  const resident = residentById(encounter.residentId);
  const visitNote = encounterVisitNote(encounter);
  return (
    <section className="task-content encounter-workspace">
      <div className="document-patient"><ResidentInitials name={resident.name} /><span><strong>{resident.name}</strong><small>Room {resident.room} · {encounter.reason}</small></span><span className="status-pill warning">In progress</span></div>
      <section className="encounter-context"><span className="eyebrow">What changed</span><h2>{resident.latest}</h2><p>{resident.summary}</p><div className="why-box"><ShieldCheck /><span><strong>Why it matters</strong>{resident.why}</span></div></section>
      <section className={`visit-note-composer${recording ? " recording" : ""}`} aria-labelledby="visit-note-title">
        <label className="note-field visit-note-field"><span className="visit-note-heading"><strong id="visit-note-title">Visit note</strong><small>Type or record</small></span><textarea value={visitNote} onChange={(event) => onUpdate({ ...encounter, textNote: event.target.value, voiceTranscript: "", noteInputMethod: "typed" })} placeholder="Type what you assessed and decided…" /></label>
        <div className="voice-capture encounter-voice-capture"><span className="voice-capture-icon">{recording ? <Square /> : <Mic />}</span><span><strong>{recording ? "Recording into Visit note" : "Record into Visit note"}</strong><small>{recording ? "Your current note stays here until you stop and the transcription is ready." : visitNote ? "A new transcription will replace the current Visit note after confirmation." : "The transcription will appear in the same editable field above."}</small></span><button className={recording ? "recording" : ""} type="button" onClick={onRecord}>{recording ? <Square /> : <Mic />}{recording ? `Stop · ${recording.seconds}s` : visitNote ? "Replace with voice" : "Record voice note"}</button></div>
      </section>
      <button className="document-sign" type="button" disabled={!visitNote} onClick={onEnd}><CheckCircle2 />End visit and send to Scribe</button>
    </section>
  );
}

function ThreadView({ thread, onSend, onVoice, onPlayVoice, onTranscription }) {
  const [draft, setDraft] = useState("");
  function submit(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    onSend(draft.trim()); setDraft("");
  }
  return (
    <section className="task-content thread-view">
      <div className="message-stream">{thread.messages.map((message) => {
        if (message.kind === "system") return <article key={message.id} className="system-event"><p>{message.text}</p><small>{message.time}</small></article>;
        if (["voice-call", "video-call"].includes(message.kind)) {
          const videoCall = message.kind === "video-call";
          return <article key={message.id} className={`call-event ${message.mine ? "mine" : "theirs"}`}><small>{message.from} · {message.time}</small><div className="call-event-title">{videoCall ? <Video /> : <Phone />}<span><strong>{videoCall ? "Video call" : "Voice call"}</strong><small>{message.text}</small></span></div><button type="button" onClick={() => onTranscription(message)}>View transcription</button></article>;
        }
        return <article key={message.id} className={message.mine ? "mine" : "theirs"}><small>{message.from} · {message.time}</small>{message.kind === "voice" ? <button type="button" onClick={() => onPlayVoice(message)}><Play />Play voice message · {message.duration}s</button> : <p>{message.text}</p>}</article>;
      })}</div>
      <form className="message-composer" onSubmit={submit}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a clear update…" /><button type="button" onClick={onVoice} aria-label="Send mock voice message"><Mic /></button><button type="submit" aria-label="Send message"><Send /></button></form>
    </section>
  );
}

function ScheduleView({ events, encounters: scheduleEncounters, weekOffset, onWeekOffset, onOpenResident, onOpenEvent, onAdd, currentFacilityId }) {
  const days = useMemo(() => {
    const weekStart = new Date(`${TODAY}T12:00:00`);
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7) + (weekOffset * 7));
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return date.toISOString().slice(0, 10);
    });
  }, [weekOffset]);
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [expandedFacilityId, setExpandedFacilityId] = useState(currentFacilityId);
  const monday = new Date(`${days[0]}T12:00:00`);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const range = `${monday.toLocaleDateString([], { month: "short", day: "numeric" })} – ${sunday.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`;

  function eventFacilityId(event) {
    return event.residentId ? residentById(event.residentId)?.facilityId : event.facilityId;
  }

  function dayData(date) {
    const dayEvents = events.filter((event) => event.date === date);
    const dayEncounters = scheduleEncounters.filter((encounter) => encounter.date === date && ["scheduled", "provider-in-progress", "submitted-to-billing"].includes(encounter.status));
    const facilityIds = [...new Set([
      ...dayEvents.map(eventFacilityId),
      ...dayEncounters.map((encounter) => residentById(encounter.residentId)?.facilityId),
    ].filter(Boolean))];
    const dayFacilities = facilities
      .filter((facility) => facilityIds.includes(facility.id))
      .sort((first, second) => Number(second.id === currentFacilityId) - Number(first.id === currentFacilityId) || first.shortName.localeCompare(second.shortName));
    const patientCount = new Set([
      ...dayEvents.filter((event) => event.residentId).map((event) => event.residentId),
      ...dayEncounters.map((encounter) => encounter.residentId),
    ]).size;
    return { dayEvents, dayEncounters, dayFacilities, patientCount };
  }

  function requirementLabel(event) {
    const seededRequirement = { s6: "30-day required visit", s7: "60-day required visit" }[event.id];
    if (event.requirement || seededRequirement) return event.requirement ?? seededRequirement;
    const copy = `${event.title} ${event.detail}`.toLowerCase();
    if (copy.includes("60-day")) return "60-day required visit";
    if (copy.includes("30-day")) return "30-day required visit";
    if (copy.includes("admission")) return "Admission follow-up";
    return "Follow-up";
  }

  const selectedDay = dayData(selectedDate);
  const selectedFacilityKey = selectedDay.dayFacilities.map((facility) => facility.id).join("|");

  useEffect(() => {
    setSelectedDate(weekOffset === 0 ? TODAY : days[0]);
  }, [weekOffset, days]);

  useEffect(() => {
    const preferred = selectedDay.dayFacilities.find((facility) => facility.id === currentFacilityId) ?? selectedDay.dayFacilities[0];
    setExpandedFacilityId(preferred?.id ?? null);
  }, [selectedDate, selectedFacilityKey, currentFacilityId]);

  return (
    <section className="task-content schedule-view">
      <div className="schedule-title-row"><div><span className="eyebrow">{weekOffset === 0 ? "This week" : weekOffset < 0 ? "Earlier week" : "Upcoming week"}</span><h2>{range}</h2></div><button className="schedule-add" type="button" onClick={() => onAdd(selectedDate)}><Plus />Add</button></div>
      <div className="week-controls"><button type="button" onClick={() => onWeekOffset(weekOffset - 1)}><ChevronLeft />Previous</button><button type="button" disabled={weekOffset === 0} onClick={() => onWeekOffset(0)}>Today</button><button type="button" onClick={() => onWeekOffset(weekOffset + 1)}>Next<ChevronRight /></button></div>
      <div className="schedule-day-picker" role="tablist" aria-label="Days this week">{days.map((date) => { const summary = dayData(date); const dateValue = new Date(`${date}T12:00:00`); return <button key={date} className={`${selectedDate === date ? "active" : ""}${date === TODAY ? " today" : ""}`} data-schedule-date={date} type="button" role="tab" aria-label={`${dateValue.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })} · ${summary.patientCount} patients`} aria-selected={selectedDate === date} onClick={() => setSelectedDate(date)}><small>{dateValue.toLocaleDateString([], { weekday: "short" })}</small><strong>{dateValue.getDate()}</strong><span>{summary.patientCount || "–"}</span></button>; })}</div>
      <section className={`schedule-selected-day${selectedDate === TODAY ? " today" : ""}`}>
        <header><div><small>{selectedDate === TODAY ? "Today" : new Date(`${selectedDate}T12:00:00`).toLocaleDateString([], { weekday: "long" })}</small><strong>{new Date(`${selectedDate}T12:00:00`).toLocaleDateString([], { month: "long", day: "numeric" })}</strong></div><span>{selectedDay.dayFacilities.length} {selectedDay.dayFacilities.length === 1 ? "facility" : "facilities"} · {selectedDay.patientCount} {selectedDay.patientCount === 1 ? "patient" : "patients"}</span></header>
        <div className="schedule-facilities">
              {selectedDay.dayFacilities.map((facility) => {
                const key = `${selectedDate}:${facility.id}`;
                const expanded = expandedFacilityId === facility.id;
                const facilityEvents = selectedDay.dayEvents.filter((event) => eventFacilityId(event) === facility.id);
                const requiredVisits = facilityEvents.filter((event) => event.kind === "encounter" && event.residentId);
                const requiredResidentIds = new Set(requiredVisits.map((event) => event.residentId));
                const notesPlusVisits = selectedDay.dayEncounters.filter((encounter) => residentById(encounter.residentId)?.facilityId === facility.id && !requiredResidentIds.has(encounter.residentId));
                const facilityItems = facilityEvents.filter((event) => event.kind !== "encounter");
                const uniquePatientCount = new Set([...requiredVisits.map((event) => event.residentId), ...notesPlusVisits.map((encounter) => encounter.residentId)]).size;
                return (
                  <article className={`schedule-facility${expanded ? " expanded" : ""}`} key={key} data-schedule-facility={key}>
                    <button className="schedule-facility-toggle" type="button" aria-expanded={expanded} onClick={() => setExpandedFacilityId(expanded ? null : facility.id)}>
                      <span className={`schedule-facility-pin${facility.id === currentFacilityId ? " current" : ""}`}><MapPin /></span>
                      <span className="schedule-facility-copy"><small>{facility.id === currentFacilityId ? "You’re here" : "Provider rounds"}</small><strong>{facility.shortName}</strong><em>{facility.address}</em></span>
                      <span className="schedule-facility-count"><strong>{uniquePatientCount} {uniquePatientCount === 1 ? "visit" : "visits"}</strong><small>{requiredVisits.length} required</small></span>
                      <ChevronRight className="schedule-facility-chevron" />
                    </button>
                    {expanded && (
                      <div className="schedule-facility-details">
                        {requiredVisits.length > 0 && <section className="schedule-visit-group required"><header><span><ClipboardCheck /></span><div><strong>Required visits</strong><small>Follow-ups and regulatory visits due</small></div></header><div>{requiredVisits.map((event) => { const resident = residentById(event.residentId); return <button key={event.id} type="button" onClick={() => onOpenResident(resident)}><span><strong>{resident.name}</strong><small>Room {resident.room} · {event.detail}</small></span><em>{requirementLabel(event)}</em><ChevronRight /></button>; })}</div></section>}
                        <section className="schedule-visit-group notes-plus"><header><span><Sparkles /></span><div><strong>Daily visit list</strong><small>From Otangeles Notes+</small></div></header><div>{notesPlusVisits.map((encounter) => { const resident = residentById(encounter.residentId); return <button key={encounter.id} type="button" onClick={() => onOpenResident(resident)}><span><strong>{resident.name}</strong><small>Room {resident.room} · {encounter.reason}</small></span><em className={statusTone(prettyStatus(encounter.status))}>{prettyStatus(encounter.status)}</em><ChevronRight /></button>; })}{!notesPlusVisits.length && <p>No additional Notes+ visits for this facility.</p>}</div></section>
                        {facilityItems.length > 0 && <section className="schedule-visit-group facility-items"><header><span><CalendarCheck2 /></span><div><strong>Facility items</strong><small>Huddles and follow-up work</small></div></header><div>{facilityItems.map((event) => <button key={event.id} type="button" onClick={() => event.residentId ? onOpenResident(residentById(event.residentId)) : onOpenEvent(event, facility)}><span><strong>{event.title}</strong><small>{event.detail?.replace(`${facility.shortName} · `, "")}</small></span><ChevronRight /></button>)}</div></section>}
                      </div>
                    )}
                  </article>
                );
              })}
              {!selectedDay.dayFacilities.length && <div className="calm-empty schedule-empty"><CalendarDays /><strong>No facilities scheduled</strong><span>There are no visits or facility items for this day.</span><button type="button" onClick={() => onAdd(selectedDate)}><Plus />Add schedule item</button></div>}
        </div>
      </section>
    </section>
  );
}

function ActionsView({ role, actions, onUpdate, onAdd }) {
  const visible = role === "don" ? actions : actions.filter((action) => action.ownerRole === role);
  return (
    <section className="task-content actions-view">
      {role === "don" && <button className="primary-wide" type="button" onClick={onAdd}><Plus />Assign a new action</button>}
      <div className="action-list">{visible.map((action) => { const resident = residentById(action.residentId); return <article key={action.id}><header><ResidentInitials name={resident.name} /><span><strong>{action.title}</strong><small>{resident.name} · Room {resident.room}</small></span><span className={`status-pill ${statusTone(prettyStatus(action.status))}`}>{prettyStatus(action.status)}</span></header><p>{action.instructions}</p><div className="action-meta"><span>{action.owner}</span><span>{action.due}</span></div>{action.status !== "completed" && <div className="action-buttons"><button type="button" onClick={() => onUpdate({ ...action, status: "flagged" })}><AlertTriangle />Flag concern</button><button type="button" onClick={() => onUpdate({ ...action, status: "completed" })}><Check />Mark done</button></div>}</article>; })}</div>
    </section>
  );
}

function DebriefView({ assignments, selectedId, onSelect, draft, onDraft, recording, onRecord, onSave }) {
  const assignment = assignments.find((item) => item.id === selectedId) ?? assignments[0];
  const resident = residentById(assignment.residentId);
  return (
    <section className="task-content debrief-view">
      <div className="debrief-progress">{assignments.map((item) => <button key={item.id} className={`${item.id === assignment.id ? "active" : ""} ${item.status}`} type="button" onClick={() => onSelect(item.id)}><span>{item.status === "captured" ? <Check /> : assignments.indexOf(item) + 1}</span><small>{residentById(item.residentId).name.split(" ")[0]}</small></button>)}</div>
      <div className="document-patient"><ResidentInitials name={resident.name} /><span><strong>{resident.name}</strong><small>Room {resident.room} · {assignment.care}</small></span><span className={`status-pill ${statusTone(prettyStatus(assignment.status))}`}>{prettyStatus(assignment.status)}</span></div>
      <section className="debrief-prompt"><span className="eyebrow">Tell SAGE</span><h2>How was {resident.name.split(" ")[0]} today?</h2><p>Anything unusual with eating, movement, mood, pain, breathing, skin, or toileting?</p><button className={recording ? "recording" : ""} type="button" onClick={onRecord}>{recording ? <Square /> : <Mic />}{recording ? `Stop recording · ${recording.seconds}s` : "Start voice capture"}</button></section>
      <label className="note-field"><span>Captured update</span><textarea value={draft} onChange={(event) => onDraft(event.target.value)} placeholder="Speak or type what you noticed…" /></label>
      <div className="watch-reminder"><AlertTriangle /><span><strong>Watch for</strong>{assignment.watchFor}</span></div>
      <button className="document-sign" type="button" disabled={!draft.trim()} onClick={() => onSave(assignment, draft)}><CheckCircle2 />Save and go to next resident</button>
    </section>
  );
}

function SageView({ messages, onSend, onPrompt, recording, onRecord }) {
  const [draft, setDraft] = useState("");
  const prompts = ["Who needs attention first?", "Summarize Mary Lou", "What is still incomplete?"];
  function submit(event) { event.preventDefault(); if (!draft.trim()) return; onSend(draft.trim()); setDraft(""); }
  return (
    <section className="task-content sage-view">
      <div className="sage-intro"><span><Sparkles /></span><div><h2>Ask in plain language</h2><p>SAGE uses the resident and shift context already in this prototype.</p></div></div>
      <div className="prompt-chips">{prompts.map((prompt) => <button key={prompt} type="button" onClick={() => onPrompt(prompt)}>{prompt}</button>)}</div>
      <div className="sage-messages">{messages.map((message) => <article key={message.id} className={message.mine ? "mine" : "sage"}><p>{message.text}</p></article>)}</div>
      <form className="message-composer sage-composer" onSubmit={submit}>
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask SAGE…" />
        <button className={`sage-audio-record${recording ? " recording" : ""}`} type="button" onClick={onRecord} aria-label={recording ? "Stop recording" : "Record an audio question"}>{recording ? <Square /> : <Mic />}{recording && <span>Stop · {recording.seconds}s</span>}</button>
        <button type="submit" aria-label="Submit question"><Send /></button>
      </form>
    </section>
  );
}

function SignaturePreview({ signature }) {
  if (!signature) return <div className="signature-preview empty"><Signature /><span>No signature saved</span></div>;
  if (signature.method === "type") return <div className="signature-preview typed-signature" aria-label={`Signature for ${signature.typedName}`}>{signature.typedName}</div>;
  return <div className="signature-preview"><img src={signature.dataUrl} alt="Saved provider signature" /></div>;
}

function ProviderSignatureSetup({ signature, providerName, onSave, onRemove }) {
  const [method, setMethod] = useState(signature?.method ?? "draw");
  const [typedName, setTypedName] = useState(signature?.typedName ?? providerName);
  const [uploadDataUrl, setUploadDataUrl] = useState(signature?.method === "upload" ? signature.dataUrl : "");
  const [drawReady, setDrawReady] = useState(signature?.method === "draw");
  const [error, setError] = useState("");
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    if (method !== "draw" || signature?.method !== "draw" || !signature.dataUrl || !canvasRef.current) return;
    const image = new Image();
    image.onload = () => {
      const canvas = canvasRef.current;
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = signature.dataUrl;
  }, [method, signature]);

  function canvasPoint(event) {
    const canvas = canvasRef.current;
    const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * (canvas.width / bounds.width), y: (event.clientY - bounds.top) * (canvas.height / bounds.height) };
  }
  function beginDrawing(event) {
    const canvas = canvasRef.current;
    const point = canvasPoint(event);
    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    const context = canvas.getContext("2d");
    context.beginPath();
    context.moveTo(point.x, point.y);
    setDrawReady(true);
    setError("");
  }
  function draw(event) {
    if (!drawingRef.current) return;
    const point = canvasPoint(event);
    const context = canvasRef.current.getContext("2d");
    context.lineWidth = 4;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#241a38";
    context.lineTo(point.x, point.y);
    context.stroke();
  }
  function stopDrawing() { drawingRef.current = false; }
  function clearDrawing() {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setDrawReady(false);
    setError("");
  }
  function selectMethod(nextMethod) {
    setMethod(nextMethod);
    setError("");
  }
  function uploadSignature(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setUploadDataUrl("");
      setError("Choose a PNG, JPEG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadDataUrl("");
      setError("Choose an image smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setUploadDataUrl(reader.result); setError(""); };
    reader.readAsDataURL(file);
  }
  function saveSignature() {
    let nextSignature;
    if (method === "type") {
      if (!typedName.trim()) { setError("Type the name you want to use as your signature."); return; }
      nextSignature = { method, typedName: typedName.trim(), savedAt: "Today · now" };
    } else if (method === "draw") {
      if (!drawReady) { setError("Draw your signature before saving."); return; }
      nextSignature = { method, dataUrl: canvasRef.current.toDataURL("image/png"), savedAt: "Today · now" };
    } else {
      if (!uploadDataUrl) { setError("Choose a signature image before saving."); return; }
      nextSignature = { method, dataUrl: uploadDataUrl, savedAt: "Today · now" };
    }
    setError("");
    onSave(nextSignature);
  }

  return (
    <section className="settings-section provider-signature-card" id="provider-signature">
      <div className="settings-title-row"><span><h2>Provider signature</h2><p>Saved securely on this device for encounter signing.</p></span><Signature /></div>
      {signature && <div className="saved-signature"><small>Current signature · Saved {signature.savedAt}</small><SignaturePreview signature={signature} /></div>}
      <div className="signature-mode-tabs" role="tablist" aria-label="Signature method">
        {[['draw', 'Draw'], ['type', 'Type'], ['upload', 'Upload']].map(([id, label]) => <button key={id} className={method === id ? "active" : ""} type="button" onClick={() => selectMethod(id)}>{label}</button>)}
      </div>
      {method === "draw" && <div className="signature-draw"><canvas ref={canvasRef} width="620" height="180" onPointerDown={beginDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} aria-label="Draw signature" /><button type="button" onClick={clearDrawing}>Clear</button><small>Use your finger, stylus, or pointer.</small></div>}
      {method === "type" && <div className="signature-type"><label>Signature name<input value={typedName} onChange={(event) => { setTypedName(event.target.value); setError(""); }} placeholder="Type your full name" /></label><SignaturePreview signature={typedName.trim() ? { method: "type", typedName: typedName.trim() } : null} /></div>}
      {method === "upload" && <div className="signature-upload"><label><Upload /><span><strong>Choose signature image</strong><small>PNG, JPEG, or WebP · Maximum 2 MB</small></span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadSignature} /></label>{uploadDataUrl && <SignaturePreview signature={{ method: "upload", dataUrl: uploadDataUrl }} />}</div>}
      {error && <p className="signature-error" role="alert">{error}</p>}
      <div className="signature-actions"><button className="primary-wide" type="button" onClick={saveSignature}><Check />Save signature</button>{signature && <button className="danger-wide" type="button" onClick={onRemove}><Trash2 />Remove saved signature</button>}</div>
    </section>
  );
}

function SixDigitCodeInput({ value, onChange, autoFocus = false, label = "Six-digit verification code" }) {
  const inputRefs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");

  function replaceDigit(index, rawValue) {
    const numeric = rawValue.replace(/\D/g, "");
    if (numeric.length > 1) {
      const nextDigits = [...digits];
      numeric.slice(0, 6 - index).split("").forEach((digit, offset) => { nextDigits[index + offset] = digit; });
      onChange(nextDigits.join(""));
      inputRefs.current[Math.min(index + numeric.length, 5)]?.focus();
      return;
    }
    const nextDigits = [...digits];
    if (!numeric) nextDigits.fill("", index);
    else nextDigits[index] = numeric;
    onChange(nextDigits.join(""));
    if (numeric && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      const nextDigits = [...digits];
      nextDigits[index - 1] = "";
      onChange(nextDigits.join(""));
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handlePaste(event) {
    const numeric = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!numeric) return;
    event.preventDefault();
    onChange(numeric);
    inputRefs.current[Math.min(numeric.length, 5)]?.focus();
  }

  return <div className="verification-code-fields" role="group" aria-label={label}>{digits.map((digit, index) => <input key={index} ref={(element) => { inputRefs.current[index] = element; }} aria-label={`Digit ${index + 1} of 6`} autoFocus={autoFocus && index === 0} autoComplete={index === 0 ? "one-time-code" : "off"} inputMode="numeric" pattern="[0-9]*" maxLength={1} value={digit} onChange={(event) => replaceDigit(index, event.target.value)} onKeyDown={(event) => handleKeyDown(index, event)} onPaste={handlePaste} />)}</div>;
}

function ProviderTwoFactorSetup({ config, onSave }) {
  const [action, setAction] = useState(null);
  const [code, setCode] = useState("");
  const setupKey = config?.setupKey ?? "SAGE-DEMO-HANNAH";
  const validCode = /^\d{6}$/.test(code);

  function closeSetup() {
    setAction(null);
    setCode("");
  }

  function beginAction(nextAction) {
    setAction(nextAction);
    setCode("");
  }

  function confirmAction() {
    if (!validCode) return;
    if (action === "disable") {
      onSave({ ...config, enabled: false, configured: true, setupKey }, "Two-factor authentication turned off.");
    } else if (action === "enable") {
      onSave({ ...config, enabled: true, configured: true, setupKey }, "Two-factor authentication turned on.");
    } else {
      onSave({ enabled: true, configured: true, method: "Authenticator app", setupKey, savedAt: "Today · now" }, "Two-factor authentication set up.");
    }
    closeSetup();
  }

  return (
    <section className="settings-section two-factor-settings">
      <div className="settings-title-row"><span><h2>Two-factor authentication</h2><p>Add an extra verification step whenever you sign in.</p></span><ShieldCheck /></div>
      <div className={`two-factor-status${config?.enabled ? " enabled" : ""}`}><span><strong>{config?.enabled ? "Enabled" : config?.configured ? "Turned off" : "Not set up"}</strong><small>{config?.enabled ? `${config.method} · ${config.savedAt}` : config?.configured ? "Your authenticator setup is saved for when you turn 2FA on again." : "Scan a QR code with your authenticator app to begin."}</small></span><b>{config?.enabled ? "On" : "Off"}</b></div>
      {!action && <div className="two-factor-manage-actions">{config?.enabled
        ? <><button className="primary-wide two-factor-setup-button" type="button" onClick={() => beginAction("setup")}><ShieldCheck />Set up again</button><button className="two-factor-disable-button" type="button" onClick={() => beginAction("disable")}>Turn off 2FA</button></>
        : <><button className="primary-wide two-factor-setup-button" type="button" onClick={() => beginAction(config?.configured ? "enable" : "setup")}><ShieldCheck />{config?.configured ? "Turn on 2FA" : "Set up 2FA"}</button>{config?.configured && <button className="two-factor-secondary-button" type="button" onClick={() => beginAction("setup")}>Set up again</button>}</>}
      </div>}
      {action && <div className="two-factor-setup-panel">
        {action === "setup" ? <><div className="two-factor-qr"><img src="/sage-2fa-qr.svg" alt="Dummy QR code for SAGE authenticator setup" /><span><strong>Scan this QR code</strong><small>Open your authenticator app and add a new account.</small></span></div><ol><li>Scan the dummy QR code with your authenticator app.</li><li>If needed, use setup key <code>{setupKey}</code>.</li><li>Enter the current six-digit code.</li></ol></> : <div className="two-factor-confirm-copy"><strong>{action === "disable" ? "Confirm before turning off 2FA" : "Confirm with your saved authenticator"}</strong><p>{action === "disable" ? "Enter a current code from your authenticator app to turn off two-factor authentication." : "Your previous authenticator setup is still saved. Enter its current code to turn 2FA on again."}</p></div>}
        <label><span>Six-digit verification code</span><SixDigitCodeInput value={code} onChange={setCode} autoFocus label={`${action === "disable" ? "Turn off" : action === "enable" ? "Turn on" : "Set up"} two-factor authentication code`} /></label>
        <p>Prototype note: use any six digits.</p>
        <div className="two-factor-setup-actions"><button className="primary-wide" type="button" disabled={!validCode} onClick={confirmAction}><Check />{action === "disable" ? "Verify and turn off" : action === "enable" ? "Verify and turn on" : "Verify and finish setup"}</button><button type="button" onClick={closeSetup}>Cancel</button></div>
      </div>}
    </section>
  );
}

function SettingsView({ role, profileFields, assignedFacilities, fontSize, onFontSize, onSave, notify, onNotify, signature, onSaveSignature, onRemoveSignature, twoFactor, onSaveTwoFactor }) {
  const profile = roleProfiles[role];
  const [firstName, setFirstName] = useState(profileFields.firstName);
  const [lastName, setLastName] = useState(profileFields.lastName);
  return (
    <section className="task-content settings-view">
      {role === "provider" && <ProviderTwoFactorSetup config={twoFactor} onSave={onSaveTwoFactor} />}
      {role === "provider" && <ProviderSignatureSetup signature={signature} providerName={profile.name} onSave={onSaveSignature} onRemove={onRemoveSignature} />}
      <section className="settings-section">
        <h2>My profile</h2>
        <div className="profile-name-fields"><label>First name<input value={firstName} onChange={(event) => setFirstName(event.target.value)} /></label><label>Last name<input value={lastName} onChange={(event) => setLastName(event.target.value)} /></label></div>
        <label>Role<input value={profile.role} disabled /></label>
        <button className="primary-wide" type="button" disabled={!firstName.trim() || !lastName.trim()} onClick={() => onSave({ firstName: firstName.trim(), lastName: lastName.trim() })}><Check />Save profile</button>
      </section>
      <section className="settings-section assigned-facilities">
        <div className="settings-section-heading"><span><h2>Assigned facilities</h2><p>{assignedFacilities.length} facilities available to your account</p></span><MapPin /></div>
        <div className="assigned-facility-list">{assignedFacilities.map((facility) => <div key={facility.id}><MapPin /><span><strong>{facility.name}</strong><small>{facility.address}</small></span></div>)}</div>
      </section>
      <section className="settings-section">
        <h2>Preferences</h2>
        <label className="toggle-row"><span><strong>Push notifications</strong><small>Care-team and resident updates</small></span><input type="checkbox" checked={notify} onChange={(event) => onNotify(event.target.checked)} /></label>
        <div className="font-size-setting"><span><strong>Text size</strong><small>Adjust text throughout SAGE for easier reading.</small></span><div className="font-size-options" role="group" aria-label="Text size">{[["small", "Small"], ["default", "Default"], ["large", "Large"]].map(([id, label]) => <button key={id} className={fontSize === id ? "active" : ""} type="button" aria-pressed={fontSize === id} onClick={() => onFontSize(id)}><span>Aa</span><small>{label}</small></button>)}</div></div>
      </section>
    </section>
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

function SignedOutScreen({ onSignIn, fontSize, twoFactorSettings }) {
  const scrollRef = useRef(null);
  const [mode, setMode] = useState("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingRole, setPendingRole] = useState(null);
  const [pendingSource, setPendingSource] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setResetSent(false);
    setVerificationCode("");
    if (nextMode === "sign-in") setPendingRole(null);
  }

  function completeFirstFactor(accountRole, source) {
    if (!twoFactorSettings?.[accountRole]?.enabled) {
      onSignIn(accountRole);
      return;
    }
    setPendingRole(accountRole);
    setPendingSource(source);
    setVerificationCode("");
    setMode("two-factor");
    setError("");
  }

  function submitCredentials(event) {
    event.preventDefault();
    const accountRole = loginAccounts[email.trim().toLowerCase()];
    if (!accountRole || password !== "password") {
      setError("Email or password is incorrect.");
      return;
    }
    setError("");
    completeFirstFactor(accountRole, "password");
  }

  function submitPasswordReset(event) {
    event.preventDefault();
    setResetSent(true);
    setError("");
  }

  function submitNotesPlus(event) {
    event.preventDefault();
    const accountRole = loginAccounts[email.trim().toLowerCase()];
    if (!accountRole) {
      setError("No SAGE account is connected to that Otangeles Notes+ email.");
      return;
    }
    setError("");
    completeFirstFactor(accountRole, "notes-plus");
  }

  function submitTwoFactor(event) {
    event.preventDefault();
    if (!pendingRole || !/^\d{6}$/.test(verificationCode)) return;
    setError("");
    onSignIn(pendingRole);
  }

  let content;
  if (mode === "two-factor") {
    content = <><div className="signed-out-copy two-factor-copy"><span className="eyebrow">Two-factor authentication</span><h1>Verify it’s you</h1><p>Enter the six-digit code from your authenticator app for <strong>{email.trim()}</strong>.</p></div><form className="login-form two-factor-login-form" onSubmit={submitTwoFactor}><label><span>Six-digit verification code</span><SixDigitCodeInput value={verificationCode} onChange={(nextCode) => { setVerificationCode(nextCode); setError(""); }} autoFocus /></label><p className="prototype-auth-note">Prototype note: use any six digits.</p><button className="login-primary" type="submit" disabled={!/^\d{6}$/.test(verificationCode)}>Verify and continue</button><button className="auth-back" type="button" onClick={() => changeMode(pendingSource === "notes-plus" ? "notes-plus" : "sign-in")}><ArrowLeft />Back to sign in</button></form></>;
  } else if (mode === "forgot") {
    content = resetSent
      ? <div className="auth-confirmation" role="status"><span><Mail /></span><h2>Check your email</h2><p>If a SAGE account exists for <strong>{email.trim()}</strong>, password reset instructions have been sent.</p><button className="login-primary" type="button" onClick={() => changeMode("sign-in")}>Back to sign in</button></div>
      : <><div className="signed-out-copy"><span className="eyebrow">Password help</span><h1>Reset your password</h1><p>Enter your work email and we’ll send instructions to reset your SAGE password.</p></div><form className="login-form" onSubmit={submitPasswordReset}><label>Email address<span className="login-input"><Mail /><input autoFocus type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@sage.com" required /></span></label><button className="login-primary" type="submit">Send reset link</button><button className="auth-back" type="button" onClick={() => changeMode("sign-in")}><ArrowLeft />Back to sign in</button></form></>;
  } else if (mode === "notes-plus") {
    content = <><div className="signed-out-copy"><span className="eyebrow">Connected account</span><h1>Otangeles Notes+</h1><p>Use the work email connected to both Otangeles Notes+ and SAGE.</p></div><form className="login-form" onSubmit={submitNotesPlus}><label>Email address<span className="login-input"><Mail /><input autoFocus type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} placeholder="name@sage.com" required /></span></label>{error && <p className="login-error" role="alert">{error}</p>}<button className="login-primary notes-plus-primary" type="submit">Continue with Notes+</button><button className="auth-back" type="button" onClick={() => changeMode("sign-in")}><ArrowLeft />Back to sign in</button></form></>;
  } else {
    content = <><div className="signed-out-copy"><span className="eyebrow">Welcome back</span><h1>Sign in to SAGE</h1><p>Enter your account details to securely access your assigned residents and work.</p></div><form className="login-form" onSubmit={submitCredentials}><label>Email address<span className="login-input"><Mail /><input autoFocus type="email" autoComplete="username" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} placeholder="name@sage.com" required /></span></label><label>Password<span className="login-input"><LockKeyhole /><input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} placeholder="Enter your password" required /><button className="password-visibility" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button></span></label><button className="forgot-link" type="button" onClick={() => changeMode("forgot")}>Forgot password?</button>{error && <p className="login-error" role="alert">{error}</p>}<button className="login-primary" type="submit">Sign in</button><div className="auth-divider"><span>or</span></div><button className="notes-plus-button" type="button" onClick={() => changeMode("notes-plus")}><FileText />Sign in with Otangeles Notes+</button></form></>;
  }
  return (
    <main className="prototype-stage"><div className={`mobile-prototype signed-out-shell font-size-${fontSize}`}><div ref={scrollRef} className="signed-out-app"><section className="signed-out-screen"><div className="signed-out-brand"><SageMark /><span>Care Simple</span></div>{content}<small className="signed-out-note">Secure access for authorized SAGE care-team members</small></section></div><ScrollIndicator targetRef={scrollRef} className="auth-scrollbar" /></div></main>
  );
}

function Sheet({ title, children, onClose }) {
  const scrollRef = useRef(null);
  return <div className="sheet-scrim" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="sheet-frame"><section ref={scrollRef} className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title"><div className="sheet-handle" /><header><h2 id="sheet-title">{title}</h2><button type="button" onClick={onClose} aria-label="Close"><X /></button></header>{children}</section><ScrollIndicator targetRef={scrollRef} className="sheet-scrollbar" /></div></div>;
}

export function App() {
  const [role, setRole] = useStoredState("role", "provider");
  const [signedIn, setSignedIn] = useState(false);
  const [facilityId, setFacilityId] = useStoredState("facility", "all");
  const [encounters, setEncounters] = useStoredState("encounters", initialEncounters);
  const [actions, setActions] = useStoredState("actions", initialActions);
  const [assignments, setAssignments] = useStoredState("assignments", initialAssignments);
  const [timelineEvents, setTimelineEvents] = useStoredState("timeline-events", initialTimelineEvents);
  const [threads, setThreads] = useStoredState("threads", initialThreads);
  const [schedule, setSchedule] = useStoredState("schedule", initialSchedule);
  const [notify, setNotify] = useStoredState("notify", true);
  const [fontSize, setFontSize] = useStoredState("font-size", "default");
  const [profileFields, setProfileFields] = useStoredState("profile-fields", initialProfileFields);
  const [providerSignatures, setProviderSignatures] = useStoredState("signatures", {});
  const [twoFactorSettings, setTwoFactorSettings] = useStoredState("two-factor", initialTwoFactorSettings);
  const [activeTab, setActiveTab] = useState("home");
  const [module, setModule] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [messageFilter, setMessageFilter] = useState("rooms");
  const [residentTab, setResidentTab] = useState("summary");
  const [reviewFilter, setReviewFilter] = useState("needs");
  const [scheduleWeekOffset, setScheduleWeekOffset] = useState(0);
  const [sheet, setSheet] = useState(null);
  const [notice, setNotice] = useState("");
  const [bottomNavHidden, setBottomNavHidden] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const providerLocation = DEMO_PROVIDER_LOCATION;
  const noticeTimer = useRef(null);
  const scrollRegionRef = useRef(null);
  const lastScrollTop = useRef(0);
  const scrollDirection = useRef(null);
  const scrollDirectionDistance = useRef(0);
  const scrollFrame = useRef(null);
  const [recording, setRecording] = useState(null);
  const [debriefDraft, setDebriefDraft] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(initialAssignments[0].id);
  const [sageMessages, setSageMessages] = useState([{ id: "sage-welcome", mine: false, text: "Ask me who needs attention, what changed, or what is still incomplete." }]);

  useEffect(() => {
    window.localStorage.removeItem(`${STORAGE_VERSION}.signed-in`);
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem(SHIFT_DEVIATION_MIGRATION)) return;
    setEncounters((items) => items.map((encounter) => providerShiftDeviationUpdates[encounter.id]
      ? { ...encounter, ...providerShiftDeviationUpdates[encounter.id] }
      : encounter));
    window.localStorage.setItem(SHIFT_DEVIATION_MIGRATION, "complete");
  }, []);

  useEffect(() => {
    if (!recording) return undefined;
    const timer = window.setInterval(() => setRecording((current) => current ? { ...current, seconds: current.seconds + 1 } : current), 1000);
    return () => window.clearInterval(timer);
  }, [Boolean(recording)]);

  const visibleResidents = useMemo(() => facilityId === "all" ? residents : residents.filter((resident) => resident.facilityId === facilityId), [facilityId]);
  const visibleResidentIds = useMemo(() => new Set(visibleResidents.map((resident) => resident.id)), [visibleResidents]);
  const visibleEncounters = useMemo(() => encounters.filter((encounter) => visibleResidentIds.has(encounter.residentId)), [encounters, visibleResidentIds]);
  const visibleActions = useMemo(() => actions.filter((action) => visibleResidentIds.has(action.residentId)), [actions, visibleResidentIds]);
  const visibleAssignments = useMemo(() => assignments.filter((assignment) => visibleResidentIds.has(assignment.residentId)), [assignments, visibleResidentIds]);
  const cnaResidentIds = useMemo(() => new Set(assignments.map((assignment) => assignment.residentId)), [assignments]);
  const visiblePeople = useMemo(() => staffDirectory.filter((person) => person.name !== roleProfiles[role].name && (facilityId === "all" || person.facilityIds?.includes(facilityId))), [facilityId, role]);
  const visiblePersonIds = useMemo(() => new Set(visiblePeople.map((person) => person.id)), [visiblePeople]);
  const visibleThreads = useMemo(() => threads.filter((thread) => thread.kind === "room" ? visibleResidentIds.has(thread.residentId) : thread.kind === "person" ? visiblePersonIds.has(thread.personId) : thread.participantIds?.some((id) => visiblePersonIds.has(id))), [threads, visibleResidentIds, visiblePersonIds]);
  const visibleSchedule = useMemo(() => schedule.filter((item) => item.residentId ? visibleResidentIds.has(item.residentId) : facilityId === "all" || !item.facilityId || item.facilityId === facilityId), [schedule, facilityId, visibleResidentIds]);
  const currentStaffId = { provider: "hannah", don: "jamie", cna: "nina" }[role];
  const assignedFacilityIds = staffDirectory.find((person) => person.id === currentStaffId)?.facilityIds ?? [];
  const assignedFacilities = facilities.filter((facility) => assignedFacilityIds.includes(facility.id));
  const currentProviderSignature = providerSignatures.hannah ?? null;

  function toast(message) {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => {
      setNotice("");
      noticeTimer.current = null;
    }, 2600);
  }
  function appendTimelineEvent(event) {
    const occurredAt = new Date().toISOString();
    setTimelineEvents((items) => [{ id: `timeline-${Date.now()}-${items.length}`, displayTime: "Today · now", occurredAt, ...event }, ...items]);
  }
  function updateEncounter(next) { setEncounters((items) => items.map((item) => item.id === next.id ? next : item)); }
  function updateAction(next) {
    const previous = actions.find((item) => item.id === next.id);
    setActions((items) => items.map((item) => item.id === next.id ? { ...next, updatedAt: new Date().toISOString(), updatedBy: roleProfiles[role].name } : item));
    if (previous?.status !== next.status && ["flagged", "completed"].includes(next.status)) {
      appendTimelineEvent({ residentId: next.residentId, kind: "don-action", title: next.status === "completed" ? "Care action completed" : "Care action flagged", text: `${next.title} — ${next.status === "completed" ? "marked complete" : "flagged for follow-up"} by ${roleProfiles[role].name}.`, actor: roleProfiles[role].name, sourceType: "action", sourceId: next.id, status: next.status });
    }
    toast(next.status === "completed" ? "Action marked done." : "Concern flagged for follow-up.");
  }
  function openTask(type, payload = {}) {
    setNavigationHistory((items) => [...items, { activeTab, module, residentTab, messageFilter, reviewFilter, scheduleWeekOffset }]);
    setModule({ type, ...payload });
    setSheet(null);
  }
  function replaceTask(type, payload = {}) {
    setModule({ type, ...payload });
    setSheet(null);
    setRecording(null);
  }
  function closeTask() {
    const previous = navigationHistory[navigationHistory.length - 1];
    if (previous) {
      setActiveTab(previous.activeTab);
      setModule(previous.module);
      if (previous.residentTab) setResidentTab(previous.residentTab);
      if (previous.messageFilter) setMessageFilter(previous.messageFilter);
      if (previous.reviewFilter) setReviewFilter(previous.reviewFilter);
      if (Number.isFinite(previous.scheduleWeekOffset)) setScheduleWeekOffset(previous.scheduleWeekOffset);
      setNavigationHistory((items) => items.slice(0, -1));
    } else {
      setModule(null);
    }
    setSheet(null);
    setRecording(null);
  }
  function goToRootTab(nextTab) {
    setActiveTab(nextTab);
    setModule(null);
    setNavigationHistory([]);
    setSheet(null);
    setRecording(null);
    setBottomNavHidden(false);
    setHeaderHidden(false);
    lastScrollTop.current = 0;
    scrollDirection.current = null;
    scrollDirectionDistance.current = 0;
    scrollRegionRef.current?.scrollTo({ top: 0 });
  }
  function signInAs(nextRole) {
    setRole(nextRole);
    setFacilityId("all");
    setSignedIn(true);
    setActiveTab("home");
    setModule(null);
    setNavigationHistory([]);
    setSheet(null);
    setRecording(null);
    setBottomNavHidden(false);
    setHeaderHidden(false);
  }
  function logout() {
    setSignedIn(false);
    setActiveTab("home");
    setModule(null);
    setNavigationHistory([]);
    setSheet(null);
    setRecording(null);
    setBottomNavHidden(false);
    setHeaderHidden(false);
  }
  function openResident(resident) { setResidentTab("summary"); openTask("resident", { residentId: resident.id }); }
  function openReview(encounter) {
    if (scribeStatuses.has(encounter?.status)) {
      setReviewFilter("needs");
      openTask("reviews");
      toast("This encounter was sent to the Scribe. Review stays locked until the Scribe returns it.");
      return;
    }
    openTask("review", { encounterId: encounter.id });
  }
  function startEncounter(encounter) {
    const resident = residentById(encounter.residentId);
    const facility = facilities.find((item) => item.id === resident.facilityId);
    if (!isAtFacility(providerLocation, facility)) {
      toast(`Start Encounter is available when you’re at ${facility.shortName}.`);
      return;
    }
    const next = { ...encounter, status: "provider-in-progress", startedAt: encounter.startedAt ?? "Today · now" };
    updateEncounter(next);
    openTask("encounter", { encounterId: next.id });
  }
  function openThread(thread) { openTask("thread", { threadId: thread.id }); }
  function openCareRoom(resident) {
    const existing = threads.find((thread) => thread.kind === "room" && thread.residentId === resident.id);
    if (existing) { openThread(existing); return; }
    const room = createCareRoomThread(resident, residents.indexOf(resident));
    setThreads((items) => [...items, room]);
    openThread(room);
  }
  function openPerson(person) {
    const existing = threads.find((thread) => thread.kind === "person" && thread.personId === person.id);
    if (existing) { openThread(existing); return; }
    const thread = { id: `person-${person.id}`, title: person.name, personId: person.id, residentId: null, kind: "person", purpose: "direct", memberIds: [currentStaffId, person.id], members: "Direct message", messages: [] };
    setThreads((items) => [...items, thread]);
    openThread(thread);
  }
  function createCallEvent(thread, kind) {
    const isVideo = kind === "video";
    const resident = thread.residentId ? residentById(thread.residentId) : null;
    const label = isVideo ? "Video call" : "Voice call";
    const currentPerson = staffDirectory.find((person) => person.id === currentStaffId) ?? { id: currentStaffId, name: roleProfiles[role].name };
    const participantIds = [...new Set([currentStaffId, ...(thread.memberIds ?? []), ...(thread.personId ? [thread.personId] : [])])];
    const otherPeople = participantIds
      .filter((id) => id !== currentStaffId)
      .map((id) => staffDirectory.find((person) => person.id === id))
      .filter(Boolean);
    const fallbackPerson = otherPeople[0] ?? { id: thread.personId ?? "care-team", name: thread.title };
    const secondPerson = otherPeople[1] ?? fallbackPerson;
    const thirdPerson = otherPeople[2] ?? secondPerson;
    const offsets = ["0:03", "0:18", "0:36", "0:58", "1:19", "1:46"];
    const turn = (person, index, text) => ({ speakerId: person.id, speakerName: person.name, offset: offsets[index], text });
    const latestThreadMessage = [...(thread.messages ?? [])].reverse().find((message) => message.text && !["voice-call", "video-call"].includes(message.kind))?.text;
    const transcript = thread.kind === "person"
      ? [
        turn(currentPerson, 0, `Hi ${fallbackPerson.name.split(" ")[0]}, do you have a minute to review the latest update?`),
        turn(fallbackPerson, 1, `Yes, I have it open now. ${latestThreadMessage ?? "I’m ready to go through the details."}`),
        turn(currentPerson, 2, "I want to make sure we agree on what changed and who is following up."),
        turn(fallbackPerson, 3, "Agreed. I’ll confirm the current findings with the care team and document the update."),
        turn(currentPerson, 4, "Please message me here if anything changes before the next assessment."),
        turn(fallbackPerson, 5, "Will do. I’ll send the follow-up as soon as it is completed."),
      ]
      : resident
        ? [
          turn(currentPerson, 0, `Let’s review ${resident.name} before the next round. What are you seeing now?`),
          turn(fallbackPerson, 1, `The team first noticed ${resident.latest.toLowerCase()}. I reviewed the bedside update with nursing.`),
          turn(secondPerson, 2, `I checked the chart and the current concern is documented. ${resident.summary}`),
          turn(currentPerson, 3, "Please continue the documented monitoring and escalate any new or worsening change."),
          turn(fallbackPerson, 4, "I’ll repeat the assessment and post the findings in this care room."),
          turn(thirdPerson, 5, "I’ll make sure the incoming team sees the same plan during handoff."),
        ]
        : [
          turn(currentPerson, 0, "Thanks for joining. Let’s confirm the latest care-team updates and today’s follow-up."),
          turn(fallbackPerson, 1, `I reviewed the thread. ${latestThreadMessage ?? "The latest details are ready for discussion."}`),
          turn(secondPerson, 2, "I can take the next check and document what I find."),
          turn(currentPerson, 3, "That works. Please flag any change that needs Provider review."),
          turn(fallbackPerson, 4, "I’ll keep the group updated as soon as the check is complete."),
          turn(secondPerson, 5, "I’ll also make sure the handoff reflects the agreed plan."),
        ];
    const duration = isVideo ? "3m 08s" : "2m 24s";
    return {
      id: `call-${Date.now()}`,
      kind: isVideo ? "video-call" : "voice-call",
      from: roleProfiles[role].name,
      mine: true,
      time: "Now",
      text: `${label} completed · ${duration}`,
      duration,
      participantIds,
      transcript,
    };
  }
  function startThreadCall(thread, kind) {
    const callEvent = createCallEvent(thread, kind);
    setThreads((items) => items.map((item) => item.id === thread.id ? { ...item, messages: [...item.messages, callEvent] } : item));
    toast(`${kind === "video" ? "Video" : "Voice"} call added to ${thread.title}.`);
  }
  function callPerson(person) {
    const existing = threads.find((thread) => thread.kind === "person" && thread.personId === person.id);
    const thread = existing ?? { id: `person-${person.id}`, title: person.name, personId: person.id, residentId: null, kind: "person", purpose: "direct", memberIds: [currentStaffId, person.id], members: "Direct message", messages: [] };
    const callMessage = createCallEvent(thread, "voice");
    setThreads((items) => existing ? items.map((item) => item.id === existing.id ? { ...item, messages: [...item.messages, callMessage] } : item) : [...items, { ...thread, messages: [callMessage] }]);
    openTask("thread", { threadId: thread.id });
    toast(`Voice call added with ${person.name}.`);
  }
  function startGroup(personIds, kind) {
    const selectedPeople = staffDirectory.filter((person) => personIds.includes(person.id));
    if (selectedPeople.length < 2) return;
    const title = selectedPeople.length === 2 ? selectedPeople.map((person) => person.name.split(" ")[0]).join(" and ") : `${selectedPeople.slice(0, 2).map((person) => person.name.split(" ")[0]).join(", ")} + ${selectedPeople.length - 2}`;
    const thread = { id: `group-${Date.now()}`, title, participantIds: personIds, memberIds: [currentStaffId, ...personIds], residentId: null, kind: "group", purpose: "staff-group", members: `${selectedPeople.length + 1} people`, messages: [] };
    if (kind === "call") thread.messages.push(createCallEvent(thread, "voice"));
    setThreads((items) => [...items, thread]);
    openTask("thread", { threadId: thread.id });
    toast(kind === "call" ? "Group call started." : "Group conversation created.");
  }
  function switchFacility(nextFacilityId) {
    setFacilityId(nextFacilityId);
    setSheet(null);
    setBottomNavHidden(false);
    setHeaderHidden(false);
    lastScrollTop.current = 0;
    scrollDirection.current = null;
    scrollDirectionDistance.current = 0;
    scrollRegionRef.current?.scrollTo({ top: 0 });
    const next = facilities.find((item) => item.id === nextFacilityId);
    toast(next ? `Switched to ${next.shortName}.` : "Showing all facilities.");
  }

  function handleAppScroll(event) {
    if (module && module.type !== "review") return;
    const scrollElement = event.currentTarget;
    if (scrollFrame.current) window.cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = window.requestAnimationFrame(() => {
      const nextScrollTop = Math.max(0, scrollElement.scrollTop);
      const delta = nextScrollTop - lastScrollTop.current;
      lastScrollTop.current = nextScrollTop;

      if (nextScrollTop <= 8) {
        setBottomNavHidden(false);
        setHeaderHidden(false);
        scrollDirection.current = null;
        scrollDirectionDistance.current = 0;
        return;
      }

      if (Math.abs(delta) < 1) return;
      const nextDirection = delta > 0 ? "down" : "up";
      if (scrollDirection.current !== nextDirection) {
        scrollDirection.current = nextDirection;
        scrollDirectionDistance.current = 0;
      }
      scrollDirectionDistance.current += Math.abs(delta);

      const threshold = nextDirection === "down" ? 30 : 22;
      if (scrollDirectionDistance.current < threshold) return;
      const hideChrome = nextDirection === "down";
      setBottomNavHidden(hideChrome);
      setHeaderHidden(hideChrome);
      scrollDirectionDistance.current = 0;
    });
  }
  function saveProviderSignature(signature) {
    setProviderSignatures((items) => ({ ...items, hannah: signature }));
    toast("Provider signature saved.");
  }
  function removeProviderSignature() {
    setProviderSignatures((items) => { const next = { ...items }; delete next.hannah; return next; });
    toast("Saved signature removed.");
  }
  function requestEncounterSignature(encounter) {
    setSheet({ type: currentProviderSignature ? "signature-confirm" : "signature-required", encounterId: encounter.id });
  }
  function confirmEncounterSignature() {
    const encounter = encounters.find((item) => item.id === sheet.encounterId);
    if (!encounter || !currentProviderSignature) return;
    const signedAt = "Today · now";
    updateEncounter({ ...encounter, status: "submitted-to-billing", signedAt, signedSignature: { ...currentProviderSignature, providerId: "hannah", providerName: roleProfiles.provider.name, signedAt } });
    appendTimelineEvent({ residentId: encounter.residentId, kind: "provider-note", title: "Provider note signed and submitted", text: `${encounter.type}: ${encounter.reason}. The encounter note was reviewed, signed by ${roleProfiles.provider.name}, and submitted for billing.`, actor: roleProfiles.provider.name, sourceType: "encounter", sourceId: encounter.id, status: "submitted-to-billing" });
    setSheet(null);
    toast("Encounter signed and submitted for billing.");
    closeTask();
  }
  function addCareRoomMembers() {
    const thread = threads.find((item) => item.id === sheet.threadId);
    const selectedIds = sheet.selectedIds ?? [];
    if (!thread || !selectedIds.length) return;
    const addedPeople = staffDirectory.filter((person) => selectedIds.includes(person.id));
    setThreads((items) => items.map((item) => {
      if (item.id !== thread.id) return item;
      const memberIds = [...new Set([...(item.memberIds ?? []), ...selectedIds])];
      return { ...item, memberIds, members: `${memberIds.length} members`, messages: [...item.messages, { id: `membership-${Date.now()}`, kind: "system", from: "SAGE", mine: false, time: "Now", text: `${roleProfiles[role].name} added ${addedPeople.map((person) => person.name).join(", ")} to the care room.` }] };
    }));
    setSheet(null);
    toast(`${addedPeople.length} ${addedPeople.length === 1 ? "person" : "people"} added to the care room.`);
  }

  function stopRecording() {
    if (!recording) return;
    if (recording.kind === "encounter") {
      const encounter = encounters.find((item) => item.id === recording.id);
      updateEncounter({ ...encounter, textNote: "Resident assessed at bedside. Current symptoms, vital signs, and change from baseline reviewed with nursing.", voiceTranscript: "", noteInputMethod: "voice" });
      toast("Voice transcript replaced the Visit note.");
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
    if (recording.kind === "sage") {
      sageResponse("Who needs attention first based on today’s changes?");
      toast("Audio question transcribed and sent.");
    }
    setRecording(null);
  }

  function toggleRecording(kind, id) {
    if (recording?.kind === kind && recording?.id === id) stopRecording();
    else setRecording({ kind, id, seconds: 0 });
  }

  function requestEncounterRecording(encounter) {
    if (recording?.kind === "encounter" && recording.id === encounter.id) {
      stopRecording();
      return;
    }
    if (encounterVisitNote(encounter)) {
      setSheet({ type: "voice-note-overwrite", encounterId: encounter.id });
      return;
    }
    setRecording({ kind: "encounter", id: encounter.id, seconds: 0 });
  }

  const reviewCount = visibleEncounters.filter((encounter) => reviewQueueStatuses.has(encounter.status)).length;
  const roleActionCount = role === "don" ? visibleActions.filter((action) => action.status !== "completed").length : visibleActions.filter((action) => action.ownerRole === role && action.status !== "completed").length;
  const activeReviewEncounter = module?.type === "review" ? encounters.find((item) => item.id === module.encounterId) : null;
  const activeReviewResident = activeReviewEncounter ? residentById(activeReviewEncounter.residentId) : null;
  const activeThread = module?.type === "thread" ? threads.find((item) => item.id === module.threadId) : null;
  const activeThreadMemberCount = new Set(activeThread?.memberIds ?? []).size;
  const currentScheduleFacilityId = role === "provider" ? facilities.find((facility) => isAtFacility(providerLocation, facility))?.id : null;
  const activeModuleMeta = module ? {
    resident: { title: residentById(module.residentId)?.name, subtitle: `Room ${residentById(module.residentId)?.room}` },
    reviews: { title: "Encounter notes", subtitle: `${reviewCount} in review workflow` },
    review: activeReviewEncounter?.status === "submitted-to-billing"
      ? { title: "Encounter note", subtitle: `${activeReviewResident?.name} · completed by ${activeReviewEncounter.assignedScribe ?? "Mark Rivera"}`, status: prettyStatus(activeReviewEncounter.status), statusTone: statusTone(prettyStatus(activeReviewEncounter.status)) }
      : { title: "Review and Sign", subtitle: activeReviewEncounter ? `${activeReviewResident?.name} · completed by ${activeReviewEncounter.assignedScribe ?? "Mark Rivera"}` : "", status: activeReviewEncounter ? prettyStatus(activeReviewEncounter.status) : "", statusTone: activeReviewEncounter ? statusTone(prettyStatus(activeReviewEncounter.status)) : "neutral" },
    encounter: { title: "Encounter", subtitle: residentById(encounters.find((item) => item.id === module.encounterId)?.residentId)?.name },
    thread: activeThread ? {
      title: activeThread.title,
      subtitle: activeThread.kind === "person" ? "Direct message" : `${activeThreadMemberCount} ${activeThreadMemberCount === 1 ? "member" : "members"}`,
      actions: [
        { id: "voice-call", label: "Start voice call", icon: Phone, onClick: () => startThreadCall(activeThread, "voice") },
        { id: "video-call", label: "Start video call", icon: Video, onClick: () => startThreadCall(activeThread, "video") },
      ],
      menuItems: activeThread.kind === "room" && activeThread.residentId ? [
        { id: "add-people", label: "Add people", icon: UserPlus, onClick: () => setSheet({ type: "care-room-members", threadId: activeThread.id, query: "", selectedIds: [] }) },
        { id: "view-resident", label: "View resident profile", icon: UserRound, onClick: () => openResident(residentById(activeThread.residentId)) },
      ] : [],
    } : null,
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
    const latestMinutes = encounters
      .filter((item) => item.date === TODAY && Number.isFinite(encounterMinutes(item)))
      .reduce((latest, item) => Math.max(latest, encounterMinutes(item)), (11 * 60) + 15);
    const nextMinutes = Math.min(latestMinutes + 45, (23 * 60) + 45);
    setSheet({ type: "add-encounter", residentId, residentQuery: residentId ? residentById(residentId).name : "", visitType: "Acute", reason: "", change: "", changeObservedAt: "", deviationSeverity: "High", time: `${String(Math.floor(nextMinutes / 60)).padStart(2, "0")}:${String(nextMinutes % 60).padStart(2, "0")}` });
  }
  function createEncounter() {
    if (!sheet.residentId) return;
    const resident = residentById(sheet.residentId);
    const activeEncounter = encounters.find((item) => item.residentId === resident.id && item.date === TODAY && item.status === "provider-in-progress");
    if (activeEncounter) {
      setSheet(null);
      toast("This resident already has an encounter in progress.");
      return;
    }
    const scheduledEncounter = encounters.find((item) => item.residentId === resident.id && item.date === TODAY && item.status === "scheduled");
    if (scheduledEncounter) {
      setSheet(null);
      toast("This resident is already on today’s shift.");
      return;
    }
    const scheduledTime = displayTime(sheet.time || "12:00");
    const encounter = { id: `enc-${Date.now()}`, residentId: resident.id, date: TODAY, ...scheduledTime, type: sheet.visitType, status: "scheduled", priority: sheet.deviationSeverity, deviationSeverity: sheet.deviationSeverity, reason: sheet.reason.trim(), change: sheet.change.trim(), changeObservedAt: sheet.changeObservedAt, textNote: "", voiceTranscript: "", sections: documentSections(resident.id, sheet.reason.trim()) };
    setEncounters((items) => [...items, encounter]); goToRootTab("home"); toast("Encounter added to today’s shift.");
  }
  function addAction() {
    if (!sheet.residentId || !sheet.title?.trim()) return;
    const action = { id: `a-${Date.now()}`, residentId: sheet.residentId, title: sheet.title.trim(), ownerRole: sheet.ownerRole, owner: sheet.ownerRole === "cna" ? "Nina Alvarez" : "Dr. Hannah Cole", priority: sheet.priority, due: sheet.due || "Today", instructions: sheet.instructions || "Follow up and report the result.", status: "open", createdBy: roleProfiles[role].name, createdAt: new Date().toISOString() };
    setActions((items) => [...items, action]);
    appendTimelineEvent({ residentId: action.residentId, kind: "don-action", title: "Care action assigned", text: `${action.title} — assigned to ${action.owner}. ${action.instructions}`, actor: roleProfiles[role].name, sourceType: "action", sourceId: action.id, status: action.status });
    setSheet(null); toast("Action assigned.");
  }
  function addScheduleItem() {
    if (!sheet.title?.trim()) return;
    const itemFacilityId = sheet.residentId ? residentById(sheet.residentId)?.facilityId : sheet.facilityId;
    setSchedule((items) => [...items, { id: `s-${Date.now()}`, date: sheet.date, time: sheet.time || "Facility rounds", kind: sheet.kind, title: sheet.title.trim(), detail: sheet.detail || "Scheduled in SAGE", requirement: sheet.kind === "encounter" ? "Follow-up" : undefined, residentId: sheet.residentId || null, facilityId: itemFacilityId }]); setSheet(null); toast("Facility schedule updated.");
  }
  function addRevision() {
    if (!sheet.sectionId || !sheet.text?.trim()) return;
    const encounter = encounters.find((item) => item.id === sheet.encounterId);
    const requestedAt = new Date().toISOString();
    const revision = { id: `r-${Date.now()}`, text: sheet.text.trim(), source: sheet.source ?? "text", duration: sheet.duration, createdAt: "Now" };
    updateEncounter({
      ...encounter,
      status: "revision",
      assignedScribe: encounter.assignedScribe ?? "Mark Rivera",
      sentToScribeAt: requestedAt,
      scribeCompletedAt: null,
      revisionRequestedAt: requestedAt,
      summaryRevisions: sheet.sectionId === "summary" ? [...(encounter.summaryRevisions ?? []), revision] : encounter.summaryRevisions,
      sections: encounter.sections.map((section) => section.id === sheet.sectionId ? { ...section, revisions: [...(section.revisions ?? []), revision] } : section),
    });
    appendTimelineEvent({ residentId: encounter.residentId, kind: "provider-note", title: "Revision sent to Scribe", text: `${sheet.sectionTitle}: ${sheet.text.trim()}`, actor: roleProfiles.provider.name, sourceType: "encounter", sourceId: encounter.id, status: "revision" });
    setSheet(null);
    toast("Revision sent to Scribe for edit.");
    closeTask();
  }
  function saveDebrief(assignment, draft) {
    const capturedAt = new Date().toISOString();
    const capture = { id: `capture-${Date.now()}`, text: draft.trim(), author: roleProfiles.cna.name, capturedAt };
    setAssignments((items) => items.map((item) => item.id === assignment.id ? { ...item, status: "captured", transcript: draft.trim(), capturedAt, capturedBy: roleProfiles.cna.name, captures: [...(item.captures ?? []), capture] } : item));
    appendTimelineEvent({ residentId: assignment.residentId, kind: "cna-debrief", title: "CNA shift debrief captured", text: draft.trim(), actor: roleProfiles.cna.name, sourceType: "debrief", sourceId: capture.id, status: "captured" });
    const remaining = visibleAssignments.filter((item) => item.id !== assignment.id && item.status !== "captured");
    if (remaining[0]) { setSelectedAssignmentId(remaining[0].id); setDebriefDraft(remaining[0].transcript || ""); }
    toast("Resident update saved.");
  }
  function sendThreadMessage(threadId, text) { setThreads((items) => items.map((thread) => thread.id === threadId ? { ...thread, messages: [...thread.messages, { id: `m-${Date.now()}`, from: roleProfiles[role].name, mine: true, time: "Now", text }] } : thread)); }
  function startConversation() {
    const person = staffDirectory.find((item) => item.id === sheet.personId);
    if (!person) return;
    const existing = threads.find((thread) => thread.kind === "person" && thread.personId === person.id);
    const thread = existing ?? { id: `person-${person.id}`, title: person.name, personId: person.id, residentId: null, kind: "person", purpose: "direct", memberIds: [currentStaffId, person.id], members: "Direct message", messages: [] };
    const message = sheet.text.trim() ? { id: `m-${Date.now()}`, from: roleProfiles[role].name, mine: true, time: "Now", text: sheet.text.trim() } : null;
    if (existing) {
      if (message) setThreads((items) => items.map((item) => item.id === existing.id ? { ...item, messages: [...item.messages, message] } : item));
    } else {
      setThreads((items) => [...items, message ? { ...thread, messages: [message] } : thread]);
    }
    setSheet(null);
    openTask("thread", { threadId: thread.id });
    toast(message ? "Message sent." : "Conversation opened.");
  }
  function sageResponse(prompt) {
    let response = "I can help summarize residents, priorities, notes, and unfinished work.";
    if (prompt.toLowerCase().includes("attention")) response = "Mary Lou Smith needs attention first. Her confusion increased overnight and her temperature is 100.4°F, which may indicate infection.";
    if (prompt.toLowerCase().includes("mary")) response = "Mary Lou is more confused than baseline, has a low-grade temperature and mild tachycardia, and has a urine sample action still open.";
    if (prompt.toLowerCase().includes("incomplete")) response = `${reviewCount} encounter notes need review and ${roleActionCount} actions are still open for this workspace.`;
    setSageMessages((items) => [...items, { id: `q-${Date.now()}`, mine: true, text: prompt }, { id: `a-${Date.now() + 1}`, mine: false, text: response }]);
  }

  if (!signedIn) return <SignedOutScreen onSignIn={signInAs} fontSize={fontSize} twoFactorSettings={twoFactorSettings} />;

  const rootContent = activeTab === "home"
    ? role === "provider" ? <ProviderHome encounters={visibleEncounters} location={providerLocation} onStart={startEncounter} onOpenVisit={(encounter) => setSheet({ type: "visit-details", encounterId: encounter.id })} onMessage={openCareRoom} onOpenReviews={() => openTask("reviews")} onAddEncounter={() => openAddEncounter()} onOpenSchedule={() => openTask("schedule")} />
      : role === "don" ? <DonHome residents={visibleResidents} actions={visibleActions} onOpenResident={openResident} onOpenActions={() => openTask("actions")} onSchedule={() => openTask("schedule")} />
        : <CnaHome assignments={visibleAssignments} actions={visibleActions} onDebrief={(assignment) => { setSelectedAssignmentId(assignment.id); setDebriefDraft(assignment.transcript || ""); openTask("debrief"); }} onOpenResident={openResident} onOpenActions={() => openTask("actions")} />
    : activeTab === "residents" ? <ResidentsScreen role={role} residents={visibleResidents} encounters={visibleEncounters} cnaResidentIds={cnaResidentIds} onOpenResident={openResident} />
      : activeTab === "messages" ? <MessagesScreen role={role} threads={visibleThreads} people={visiblePeople} filter={messageFilter} onFilter={setMessageFilter} onOpenThread={openThread} onOpenPerson={openPerson} onCallPerson={callPerson} onStartGroup={startGroup} onNewMessage={() => setSheet({ type: "new-message", personQuery: "", personId: "", text: "" })} />
        : <MoreScreen role={role} reviewCount={reviewCount} actionCount={roleActionCount} onOpen={handleMore} onLogout={() => setSheet({ type: "logout" })} />;

  let moduleContent = null;
  if (module?.type === "resident") {
    const resident = residentById(module.residentId);
    const careRoom = threads.find((item) => item.kind === "room" && item.residentId === resident.id);
    const residentTimeline = timelineEvents.filter((event) => event.residentId === resident.id).sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
    const residentAssignment = assignments.find((item) => item.residentId === resident.id);
    moduleContent = <ResidentDetail resident={resident} role={role} encounters={encounters} timelineEvents={residentTimeline} careRoom={careRoom} tab={residentTab} onTab={setResidentTab} onCareRoom={() => openCareRoom(resident)} onAddEncounter={() => openAddEncounter(resident.id)} onAssignAction={() => setSheet({ type: "action", residentId: resident.id, ownerRole: "cna", title: "", priority: "High", instructions: "" })} canDebrief={Boolean(residentAssignment)} onDebrief={() => { if (residentAssignment) { setSelectedAssignmentId(residentAssignment.id); setDebriefDraft(residentAssignment.transcript || ""); openTask("debrief"); } }} onOpenReview={openReview} />;
  }
  if (module?.type === "reviews") moduleContent = <ReviewQueue encounters={visibleEncounters} filter={reviewFilter} onFilter={setReviewFilter} onOpen={openReview} />;
  if (module?.type === "review") {
    const encounter = encounters.find((item) => item.id === module.encounterId);
    moduleContent = <ReviewDocument encounter={encounter} onRevision={(target) => setSheet({ type: "revision", encounterId: encounter.id, sectionId: target.id, sectionTitle: target.title, text: "", source: "text", duration: 0 })} onPlayVoice={(revision) => toast(`Playing ${revision.duration || 1}-second voice revision.`)} canEdit={role === "provider"} viewerRole={role} />;
  }
  if (module?.type === "encounter") {
    const encounter = encounters.find((item) => item.id === module.encounterId);
    moduleContent = <EncounterWorkspace encounter={encounter} onUpdate={updateEncounter} onEnd={() => {
      const finalVisitNote = encounterVisitNote(encounter);
      const providerNotes = finalVisitNote ? [{ label: "Provider Visit Note", text: finalVisitNote }] : [];
      const next = {
        ...encounter,
        status: "scribe-in-progress",
        endedAt: "Today · now",
        assignedScribe: "Mark Rivera",
        sentToScribeAt: new Date().toISOString(),
        scribeCompletedAt: null,
        sections: encounter.sections.map((section) => {
          if (section.id === "notes") return { ...section, content: providerNotes };
          return section;
        }),
      };
      updateEncounter(next);
      appendTimelineEvent({ residentId: encounter.residentId, kind: "provider-note", title: "Provider note sent to Scribe", text: providerNotes.map((note) => `${note.label}: ${note.text}`).join(" "), actor: roleProfiles.provider.name, sourceType: "encounter", sourceId: encounter.id, status: "scribe-in-progress" });
      toast("Visit sent to Scribe. Review will be available after the Scribe returns the completed encounter.");
      replaceTask("reviews");
    }} recording={recording?.kind === "encounter" && recording.id === encounter.id ? recording : null} onRecord={() => requestEncounterRecording(encounter)} />;
  }
  if (module?.type === "thread") {
    const thread = threads.find((item) => item.id === module.threadId);
    moduleContent = <ThreadView thread={thread} onSend={(text) => sendThreadMessage(thread.id, text)} onVoice={() => toggleRecording("message", thread.id)} onPlayVoice={(message) => toast(`Playing ${message.duration || 1}-second voice message.`)} onTranscription={(message) => setSheet({ type: "call-transcription", threadId: thread.id, messageId: message.id })} />;
  }
  if (module?.type === "schedule") moduleContent = <ScheduleView events={visibleSchedule} encounters={visibleEncounters} weekOffset={scheduleWeekOffset} onWeekOffset={setScheduleWeekOffset} onOpenResident={openResident} onOpenEvent={(event, facility) => toast(`${event.title} is scheduled at ${facility.shortName}.`)} onAdd={(date) => setSheet({ type: "schedule", date, kind: "huddle", title: "", detail: "", facilityId: facilityId === "all" ? currentScheduleFacilityId ?? assignedFacilities[0]?.id : facilityId, residentId: "" })} currentFacilityId={currentScheduleFacilityId} />;
  if (module?.type === "actions") moduleContent = <ActionsView role={role} actions={visibleActions} onUpdate={updateAction} onAdd={() => setSheet({ type: "action", residentId: visibleResidents[0]?.id ?? "", ownerRole: "cna", title: "", priority: "High", instructions: "" })} />;
  if (module?.type === "debrief" && visibleAssignments.length) {
    const activeAssignmentId = visibleAssignments.some((item) => item.id === selectedAssignmentId) ? selectedAssignmentId : visibleAssignments[0].id;
    moduleContent = <DebriefView assignments={visibleAssignments} selectedId={activeAssignmentId} onSelect={(id) => { setSelectedAssignmentId(id); setDebriefDraft(assignments.find((item) => item.id === id)?.transcript || ""); }} draft={debriefDraft} onDraft={setDebriefDraft} recording={recording?.kind === "debrief" ? recording : null} onRecord={() => toggleRecording("debrief", activeAssignmentId)} onSave={saveDebrief} />;
  }
  if (module?.type === "debrief" && !visibleAssignments.length) moduleContent = <section className="task-content"><div className="calm-empty"><CheckCircle2 /><strong>No residents assigned here</strong><span>Choose another facility to view CNA assignments.</span></div></section>;
  if (module?.type === "sage") moduleContent = <SageView messages={sageMessages} onSend={sageResponse} onPrompt={sageResponse} recording={recording?.kind === "sage" ? recording : null} onRecord={() => toggleRecording("sage", "assistant")} />;
  if (module?.type === "settings") moduleContent = <SettingsView role={role} profileFields={profileFields[role] ?? initialProfileFields[role]} assignedFacilities={assignedFacilities} fontSize={fontSize} onFontSize={(nextSize) => { setFontSize(nextSize); toast(`Text size changed to ${nextSize}.`); }} notify={notify} onNotify={setNotify} signature={currentProviderSignature} onSaveSignature={saveProviderSignature} onRemoveSignature={removeProviderSignature} twoFactor={twoFactorSettings[role]} onSaveTwoFactor={(nextSettings, message) => { setTwoFactorSettings((items) => ({ ...items, [role]: nextSettings })); toast(message); }} onSave={(nextFields) => { setProfileFields((items) => ({ ...items, [role]: nextFields })); toast("Profile saved."); }} />;
  if (module?.type === "help") moduleContent = <HelpView />;

  const showReviewSignDock = role === "provider" && activeReviewEncounter && reviewableStatuses.has(activeReviewEncounter.status) && !sheet;
  const reviewChromeHidden = module?.type === "review" && headerHidden;
  const showFacilityScope = !module || facilityScopedModuleTypes.has(module.type);
  const appScrollbarClass = [
    "app-scrollbar",
    module ? "task-scrollbar" : "root-scrollbar",
    module?.type === "review" ? "review-scrollbar" : "",
    ((!module && headerHidden) || reviewChromeHidden) ? "header-released" : "",
    ((!module && bottomNavHidden) || reviewChromeHidden) ? "bottom-released" : "",
    showReviewSignDock && !reviewChromeHidden ? "review-dock-visible" : "",
  ].filter(Boolean).join(" ");

  return (
    <main className="prototype-stage"><div className={`mobile-prototype full-app font-size-${fontSize}`}>
      <DesktopNav role={role} activeTab={activeTab} onChange={goToRootTab} onProfile={() => openTask("settings")} />
      <AppHeader role={role} module={activeModuleMeta} hidden={(!module || module.type === "review") && headerHidden} onBack={closeTask} onAskSage={() => openTask("sage")} />
      <div ref={scrollRegionRef} className={`app-scroll-region${module ? " task-region" : ""}${showReviewSignDock ? " review-sign-active" : ""}${!module && bottomNavHidden ? " nav-hidden" : ""}${(!module && headerHidden) || reviewChromeHidden ? " header-hidden" : ""}`} onScroll={handleAppScroll}>
        {showFacilityScope && <FacilityScopeCards role={role} activeFacilityId={facilityId} encounters={encounters} location={providerLocation} onSelect={switchFacility} />}
        {module ? moduleContent : rootContent}
      </div>
      <ScrollIndicator targetRef={scrollRegionRef} className={appScrollbarClass} />
      {!module && <BottomNav role={role} activeTab={activeTab} hidden={bottomNavHidden} onChange={goToRootTab} />}
      {showReviewSignDock && <div className={`review-sign-dock${reviewChromeHidden ? " hidden" : ""}`}><button type="button" onClick={() => requestEncounterSignature(activeReviewEncounter)}><ShieldCheck aria-hidden="true" />Sign and Submit for billing</button></div>}

      {sheet?.type === "logout" && <Sheet title="Log out of SAGE?" onClose={() => setSheet(null)}><div className="logout-confirm"><span><LogOut /></span><p>Your SAGE session will end. You’ll need to enter your email and password to sign in again. Clinical records and activity will remain saved.</p><button className="sheet-primary logout-confirm-button" type="button" onClick={logout}>Log out</button><button className="sheet-secondary" type="button" onClick={() => setSheet(null)}>Cancel</button></div></Sheet>}
      {sheet?.type === "visit-details" && (() => { const encounter = encounters.find((item) => item.id === sheet.encounterId); const resident = residentById(encounter.residentId); const facility = facilities.find((item) => item.id === resident.facilityId); const canStartHere = isAtFacility(providerLocation, facility); const canContinueHere = canStartHere && encounter.status === "provider-in-progress"; return <Sheet title="Visit details" onClose={() => setSheet(null)}><div className="sheet-person"><ResidentInitials name={resident.name} /><span><strong>{resident.name}</strong><small>{facility.shortName} · Room {resident.room}</small></span></div><div className="detail-lines"><p><Clock3 /><span><small>Scheduled</small><strong>{encounter.time} {encounter.meridiem}</strong></span></p><p className="facility-detail"><MapPin /><span><small>Facility</small><strong>{facility.name}</strong><em>{facility.address}</em></span></p><p><FileText /><span><small>Reason for visit</small><strong>{encounter.reason}</strong></span></p><p><Activity /><span><small>Change from baseline</small><strong>{encounter.change || "No new change documented"}</strong><em>First observed {encounter.changeObservedAt || "time not documented"}</em></span></p></div><p className="sheet-summary">{resident.summary}</p><p className={`encounter-location-lock${canStartHere ? " ready" : ""}`}><MapPin />{canStartHere ? "You’re at this facility. This encounter is ready." : providerLocation.status === "ready" ? "This encounter unlocks when you arrive at this facility." : "Confirm your location from Shift to enable this encounter."}</p><button className="sheet-primary" type="button" disabled={!canStartHere} onClick={() => { setSheet(null); startEncounter(encounter); }}>{canContinueHere ? "Continue Encounter" : "Start Encounter"}</button></Sheet>; })()}
      {sheet?.type === "add-encounter" && (() => {
        const selectedResident = visibleResidents.find((resident) => resident.id === sheet.residentId);
        const residentMatches = visibleResidents.filter((resident) => `${resident.name} ${resident.room} ${resident.facility}`.toLowerCase().includes((sheet.residentQuery ?? "").trim().toLowerCase()));
        return (
          <Sheet title="Add an encounter" onClose={() => setSheet(null)}>
            <div className="sheet-form add-encounter-form">
              <p className="sheet-form-intro">Shift is for a specific change from baseline that needs Provider assessment. Document that change before adding the encounter.</p>
              <div className="form-field">
                <span>Resident</span>
                <label className="person-search-field resident-search-field"><Search /><span className="sr-only">Search residents</span><input autoFocus value={sheet.residentQuery ?? ""} onChange={(event) => setSheet({ ...sheet, residentQuery: event.target.value, residentId: "" })} placeholder="Search by name, room, or facility" /></label>
              </div>
              <div className="person-search-results resident-search-results">
                {selectedResident
                  ? <button className="selected" type="button" onClick={() => setSheet({ ...sheet, residentId: "", residentQuery: "" })}><ResidentInitials name={selectedResident.name} /><span><strong>{selectedResident.name}</strong><small>Room {selectedResident.room} · {selectedResident.facility}</small></span><Check /></button>
                  : residentMatches.slice(0, 8).map((resident) => <button key={resident.id} type="button" onClick={() => setSheet({ ...sheet, residentId: resident.id, residentQuery: resident.name })}><ResidentInitials name={resident.name} /><span><strong>{resident.name}</strong><small>Room {resident.room} · {resident.facility}</small></span><ChevronRight /></button>)}
                {!selectedResident && !residentMatches.length && <p className="resident-search-empty">No residents match this search.</p>}
              </div>
              <label>Encounter type<select value={sheet.visitType} onChange={(event) => setSheet({ ...sheet, visitType: event.target.value })}>{visitTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
              <label>Reason for visit<input value={sheet.reason} onChange={(event) => setSheet({ ...sheet, reason: event.target.value })} placeholder="What needs Provider assessment?" /></label>
              <label>Deviation severity<select value={sheet.deviationSeverity} onChange={(event) => setSheet({ ...sheet, deviationSeverity: event.target.value })}><option>Urgent</option><option>High</option><option>Moderate</option><option>Mild</option></select></label>
              <label>What changed from baseline<textarea value={sheet.change} onChange={(event) => setSheet({ ...sheet, change: event.target.value })} placeholder="Describe the new symptom, measurement, or functional change…" /></label>
              <label>When was it first observed?<select className="change-observed-select" value={sheet.changeObservedAt} onChange={(event) => setSheet({ ...sheet, changeObservedAt: event.target.value })}><option value="" disabled>Choose a day</option><option>Monday · Today</option><option>Sunday · Yesterday</option><option>Saturday</option><option>Friday or earlier</option></select></label>
              <label>Visit time<input type="time" value={sheet.time} onChange={(event) => setSheet({ ...sheet, time: event.target.value })} /></label>
              <button className="sheet-primary" type="button" disabled={!sheet.residentId || !sheet.reason.trim() || !sheet.change.trim() || !sheet.changeObservedAt || !sheet.time} onClick={createEncounter}>Add to shift</button>
            </div>
          </Sheet>
        );
      })()}
      {sheet?.type === "revision" && (() => {
        const revisionRecording = recording?.kind === "revision";
        return (
          <Sheet title={`Request revision · ${sheet.sectionTitle}`} onClose={() => { setRecording(null); setSheet(null); }}>
            <p className="sheet-summary revision-summary">This request applies only to {sheet.sectionTitle}. The encounter will be locked while the Scribe makes the edit.</p>
            <div className="revision-mode"><button className={sheet.source === "text" ? "active" : ""} type="button" onClick={() => setSheet({ ...sheet, source: "text" })}>Type</button><button className={sheet.source === "voice" ? "active" : ""} type="button" onClick={() => setSheet({ ...sheet, source: "voice" })}>Voice</button></div>
            {sheet.source === "voice" && <button className={`record-revision${revisionRecording ? " recording" : ""}`} type="button" onClick={() => toggleRecording("revision", sheet.encounterId)}>{revisionRecording ? <><span className="revision-recording-state"><i />Recording · {recording.seconds}s</span><span className="revision-recording-stop"><Square />Stop</span></> : <span className="revision-recording-state"><Mic />{sheet.duration ? `Record again · ${sheet.duration}s captured` : "Record revision request"}</span>}</button>}
            <label className="note-field revision-note-field"><span>{sheet.source === "voice" ? "Editable transcript" : "Revision request"}</span><textarea value={sheet.text} onChange={(event) => setSheet({ ...sheet, text: event.target.value })} placeholder="Explain exactly what should change…" /></label>
            <button className="sheet-primary" type="button" disabled={!sheet.text.trim()} onClick={addRevision}>Send revision to Scribe</button>
          </Sheet>
        );
      })()}
      {sheet?.type === "voice-note-overwrite" && (() => {
        const encounter = encounters.find((item) => item.id === sheet.encounterId);
        return <Sheet title="Replace Visit note?" onClose={() => setSheet(null)}><div className="voice-overwrite-warning"><span><AlertTriangle /></span><div><strong>Your current note will be replaced</strong><p>When you stop recording, the new transcription will overwrite everything currently in the Visit note. This can’t be undone.</p></div></div><div className="voice-overwrite-preview"><small>Current Visit note</small><p>{encounterVisitNote(encounter)}</p></div><button className="sheet-primary" type="button" onClick={() => { setSheet(null); setRecording({ kind: "encounter", id: encounter.id, seconds: 0 }); }}><Mic />Record and replace</button><button className="sheet-secondary" type="button" onClick={() => setSheet(null)}>Keep current note</button></Sheet>;
      })()}
      {sheet?.type === "action" && <Sheet title="Assign an action" onClose={() => setSheet(null)}><div className="sheet-form"><label>Resident<select value={sheet.residentId} onChange={(event) => setSheet({ ...sheet, residentId: event.target.value })}>{visibleResidents.map((resident) => <option key={resident.id} value={resident.id}>{resident.name}</option>)}</select></label><label>Action<input value={sheet.title} onChange={(event) => setSheet({ ...sheet, title: event.target.value })} placeholder="What needs to be done?" /></label><label>Assign to<select value={sheet.ownerRole} onChange={(event) => setSheet({ ...sheet, ownerRole: event.target.value })}><option value="cna">CNA · Nina Alvarez</option><option value="provider">Provider · Dr. Hannah Cole</option></select></label><label>Priority<select value={sheet.priority} onChange={(event) => setSheet({ ...sheet, priority: event.target.value })}><option>Routine</option><option>High</option><option>Urgent</option></select></label><label>Instructions<textarea value={sheet.instructions} onChange={(event) => setSheet({ ...sheet, instructions: event.target.value })} placeholder="Add a simple instruction…" /></label><button className="sheet-primary" type="button" disabled={!sheet.title.trim()} onClick={addAction}>Assign action</button></div></Sheet>}
      {sheet?.type === "schedule" && (() => {
        const facilityResidents = visibleResidents.filter((resident) => resident.facilityId === sheet.facilityId);
        return (
          <Sheet title="Add to facility schedule" onClose={() => setSheet(null)}>
            <div className="sheet-form">
              <p className="sheet-form-intro">Schedule the facility first. Patient visits appear inside that facility’s daily accordion.</p>
              <label>Type<select value={sheet.kind} onChange={(event) => setSheet({ ...sheet, kind: event.target.value, residentId: event.target.value === "encounter" ? sheet.residentId : "" })}><option value="huddle">Facility huddle</option><option value="encounter">Required follow-up</option><option value="order">Clinical order</option></select></label>
              <label>Facility<select value={sheet.facilityId} onChange={(event) => setSheet({ ...sheet, facilityId: event.target.value, residentId: "" })}>{assignedFacilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.shortName}</option>)}</select></label>
              <label>Date<input type="date" value={sheet.date} onChange={(event) => setSheet({ ...sheet, date: event.target.value })} /></label>
              {sheet.kind === "encounter" && <label>Resident<select value={sheet.residentId} onChange={(event) => { const resident = residentById(event.target.value); setSheet({ ...sheet, residentId: event.target.value, title: sheet.title || resident?.name || "" }); }}><option value="" disabled>Choose a resident</option>{facilityResidents.map((resident) => <option key={resident.id} value={resident.id}>{resident.name} · Room {resident.room}</option>)}</select></label>}
              <label>Title<input value={sheet.title} onChange={(event) => setSheet({ ...sheet, title: event.target.value })} placeholder={sheet.kind === "encounter" ? "Follow-up or required visit" : "What is being scheduled?"} /></label>
              <button className="sheet-primary" type="button" disabled={!sheet.facilityId || !sheet.title.trim() || (sheet.kind === "encounter" && !sheet.residentId)} onClick={addScheduleItem}>Add facility item</button>
            </div>
          </Sheet>
        );
      })()}
      {sheet?.type === "new-message" && (() => { const matches = visiblePeople.filter((person) => `${person.name} ${person.role}`.toLowerCase().includes(sheet.personQuery.trim().toLowerCase())); const selectedPerson = visiblePeople.find((person) => person.id === sheet.personId); return <Sheet title="New message" onClose={() => setSheet(null)}><div className="sheet-form"><div className="form-field"><span>Person</span><label className="person-search-field"><Search /><input autoFocus value={sheet.personQuery} onChange={(event) => setSheet({ ...sheet, personQuery: event.target.value, personId: "" })} placeholder="Search by name or role" /></label></div><div className="person-search-results">{selectedPerson ? <button className="selected" type="button" onClick={() => setSheet({ ...sheet, personId: "", personQuery: "" })}><CircleUserRound /><span><strong>{selectedPerson.name}</strong><small>{selectedPerson.role}</small></span><Check /></button> : matches.slice(0, 6).map((person) => <button key={person.id} type="button" onClick={() => setSheet({ ...sheet, personId: person.id, personQuery: person.name })}><CircleUserRound /><span><strong>{person.name}</strong><small>{person.role}</small></span><ChevronRight /></button>)}</div><label>Message <small>(optional)</small><textarea value={sheet.text} onChange={(event) => setSheet({ ...sheet, text: event.target.value })} placeholder="Write an update now, or open the conversation first…" /></label><button className="sheet-primary" type="button" disabled={!sheet.personId} onClick={startConversation}>{sheet.text.trim() ? "Send message" : "Open conversation"}</button></div></Sheet>; })()}
      {sheet?.type === "signature-required" && <Sheet title="Set up your signature first" onClose={() => setSheet(null)}><div className="signature-required"><span><Signature /></span><p>Add your provider signature before signing this encounter. Your review will stay open while you visit Settings.</p><button className="sheet-primary" type="button" onClick={() => openTask("settings", { focusSignature: true })}>Set up signature</button><button className="sheet-secondary" type="button" onClick={() => setSheet(null)}>Not now</button></div></Sheet>}
      {sheet?.type === "signature-confirm" && (() => { const encounter = encounters.find((item) => item.id === sheet.encounterId); const resident = residentById(encounter.residentId); return <Sheet title="Submit for billing" onClose={() => setSheet(null)}><div className="signature-confirm"><SignaturePreview signature={currentProviderSignature} /><div className="signature-confirm-details"><p><small>Provider</small><strong>{roleProfiles.provider.name}</strong></p><p><small>Resident</small><strong>{resident.name}</strong></p><p><small>Visit type</small><strong>{encounter.type}</strong></p><p><small>Sections reviewed</small><strong>{encounter.sections.length}</strong></p></div><p className="signature-attestation">By confirming, you attest that this encounter is accurate and ready to submit for billing.</p><button className="sheet-primary" type="button" onClick={confirmEncounterSignature}>Sign and submit for billing</button></div></Sheet>; })()}
      {sheet?.type === "care-room-members" && (() => { const thread = threads.find((item) => item.id === sheet.threadId); const resident = residentById(thread.residentId); const currentMembers = staffDirectory.filter((person) => (thread.memberIds ?? []).includes(person.id)); const availablePeople = staffDirectory.filter((person) => person.facilityIds?.includes(resident.facilityId) && !(thread.memberIds ?? []).includes(person.id) && `${person.name} ${person.role}`.toLowerCase().includes(sheet.query.trim().toLowerCase())); return <Sheet title="Add people to care room" onClose={() => setSheet(null)}><div className="care-room-members"><p className="sheet-summary">Only care-team staff assigned to {resident.facility} are shown.</p><div className="current-member-list"><small>Current members · {currentMembers.length}</small><p>{currentMembers.map((person) => person.name).join(" · ")}</p></div><label className="person-search-field"><Search /><span className="sr-only">Search available people</span><input autoFocus value={sheet.query} onChange={(event) => setSheet({ ...sheet, query: event.target.value })} placeholder="Search staff by name or role" /></label><div className="person-search-results member-picker">{availablePeople.map((person) => { const selected = sheet.selectedIds.includes(person.id); return <button key={person.id} className={selected ? "selected" : ""} type="button" onClick={() => setSheet({ ...sheet, selectedIds: selected ? sheet.selectedIds.filter((id) => id !== person.id) : [...sheet.selectedIds, person.id] })}><CircleUserRound /><span><strong>{person.name}</strong><small>{person.role}</small></span><span className="person-check">{selected && <Check />}</span></button>; })}{!availablePeople.length && <p className="member-picker-empty">No other facility-assigned staff match this search.</p>}</div><button className="sheet-primary" type="button" disabled={!sheet.selectedIds.length} onClick={addCareRoomMembers}>Add {sheet.selectedIds.length || "selected"} {sheet.selectedIds.length === 1 ? "person" : "people"}</button></div></Sheet>; })()}
      {sheet?.type === "call-transcription" && (() => {
        const thread = threads.find((item) => item.id === sheet.threadId);
        const message = thread.messages.find((item) => item.id === sheet.messageId);
        const videoCall = message.kind === "video-call";
        const fallbackIds = [...new Set([currentStaffId, ...(thread.memberIds ?? []), ...(thread.personId ? [thread.personId] : [])])];
        const transcript = (message.transcript ?? []).map((entry, index) => {
          if (typeof entry !== "string") return entry;
          const speakerId = fallbackIds[index % Math.max(fallbackIds.length, 1)] ?? currentStaffId;
          const person = staffDirectory.find((item) => item.id === speakerId);
          return { speakerId, speakerName: person?.name ?? (speakerId === currentStaffId ? roleProfiles[role].name : thread.title), offset: `0:${String((index * 16) + 3).padStart(2, "0")}`, text: entry };
        });
        return <Sheet title={`${videoCall ? "Video" : "Voice"} call transcription`} onClose={() => setSheet(null)}><div className="call-transcription"><div className="call-transcription-head">{videoCall ? <Video /> : <Phone />}<span><strong>{videoCall ? "Video call" : "Voice call"}</strong><small>{new Set(transcript.map((turn) => turn.speakerId)).size} participants · {message.duration ?? message.time}</small></span></div><div className="transcript-lines">{transcript.map((turn, index) => { const mine = turn.speakerId === currentStaffId; return <article className={mine ? "mine" : ""} key={`${message.id}-${index}`}><header><strong>{mine ? "You" : turn.speakerName}</strong><small>{turn.offset}</small></header><p>{turn.text}</p></article>; })}</div><button className="sheet-primary" type="button" onClick={() => setSheet(null)}>Done</button></div></Sheet>;
      })()}
      {recording && !["encounter", "sage", "revision"].includes(recording.kind) && <div className="recording-banner" role="status"><span><i />Recording · {recording.seconds}s</span><button type="button" onClick={stopRecording}><Square />Stop</button></div>}
      {notice && <div className="toast" role="status"><Check />{notice}</div>}
    </div></main>
  );
}
