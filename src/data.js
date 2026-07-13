export const TODAY = "2026-07-13";

export const roleProfiles = {
  provider: {
    label: "Provider",
    name: "Dr. Hannah Cole",
    role: "Physician",
    homeLabel: "Shift",
  },
  don: {
    label: "Director of Nursing",
    name: "Jamie Patel, MSN, RN",
    role: "Director of Nursing",
    homeLabel: "Today",
  },
  cna: {
    label: "CNA",
    name: "Nina Alvarez",
    role: "Certified Nursing Assistant",
    homeLabel: "Shift",
  },
};

export const residents = [
  {
    id: "mary",
    name: "Mary Lou Smith",
    room: "204B",
    age: 82,
    sex: "Female",
    facility: "Otangeles Care Center",
    image: "/residents/resident-1.png",
    status: "Declining",
    codeStatus: "DNR / DNI",
    latest: "More confused overnight; possible UTI",
    summary: "Mary Lou is more confused and restless than her usual baseline. CNA reported strong urine odor and reduced intake.",
    why: "Confusion plus a rising temperature may be an early sign of infection and needs prompt review.",
    concerns: ["Possible UTI / delirium", "Reduced fluid intake"],
    vitals: [
      { label: "Temperature", value: "100.4°F", baseline: "98.6°F", tone: "high" },
      { label: "Heart rate", value: "104", baseline: "88", tone: "watch" },
      { label: "Blood pressure", value: "96/58", baseline: "108/62", tone: "watch" },
    ],
    reports: [
      { id: "mr1", author: "Nina Alvarez", role: "CNA", time: "7:18 AM", text: "More confused during morning care and urine had a strong odor.", why: "This is a new change from Mary Lou’s usual behavior." },
      { id: "mr2", author: "Tessa Morgan", role: "RN", time: "7:42 AM", text: "Low-grade temperature and mild tachycardia confirmed.", why: "The combination raises concern for infection." },
    ],
    timeline: [
      { time: "Today · 7:42 AM", title: "Nurse assessment", text: "Temperature 100.4°F; provider notified." },
      { time: "Today · 7:18 AM", title: "CNA observation", text: "Confusion increased during morning care." },
      { time: "Yesterday · 8:00 PM", title: "Evening vitals", text: "Temperature 99.3°F; oral intake fair." },
    ],
  },
  {
    id: "beatrice",
    name: "Beatrice Holloway",
    room: "208",
    age: 79,
    sex: "Female",
    facility: "Otangeles Care Center",
    image: "/residents/resident-2.png",
    status: "Declining",
    codeStatus: "Full Code",
    latest: "New chest tightness after breakfast",
    summary: "Beatrice reported brief chest tightness after breakfast. Symptoms resolved with rest, but this is new for her.",
    why: "New chest symptoms require clinical review even when they improve quickly.",
    concerns: ["New chest tightness", "Cardiac history"],
    vitals: [
      { label: "Blood pressure", value: "146/86", baseline: "132/78", tone: "watch" },
      { label: "Heart rate", value: "92", baseline: "76", tone: "watch" },
      { label: "Oxygen", value: "95%", baseline: "96%", tone: "normal" },
    ],
    reports: [
      { id: "bh1", author: "Tessa Morgan", role: "RN", time: "8:28 AM", text: "Chest tightness lasted about five minutes and resolved with rest.", why: "A new symptom may need an ECG or medication review." },
    ],
    timeline: [
      { time: "Yesterday · 9:10 AM", title: "Acute visit", text: "Provider evaluated transient chest tightness." },
      { time: "Yesterday · 8:28 AM", title: "Nurse assessment", text: "Symptoms resolved; provider contacted." },
    ],
  },
  {
    id: "hiroshi",
    name: "Hiroshi Tanaka",
    room: "112A",
    age: 76,
    sex: "Male",
    facility: "Otangeles Care Center",
    image: "/residents/resident-3.png",
    status: "Stable",
    codeStatus: "Full Code",
    latest: "Due for 30-day follow-up",
    summary: "Mobility and pain control have remained stable since the last provider visit.",
    why: "Routine follow-up keeps the care plan and medications current.",
    concerns: ["Chronic knee pain"],
    vitals: [
      { label: "Blood pressure", value: "128/74", baseline: "130/76", tone: "normal" },
      { label: "Pain", value: "2/10", baseline: "3/10", tone: "normal" },
    ],
    reports: [
      { id: "ht1", author: "Nina Alvarez", role: "CNA", time: "Yesterday", text: "Walking with his usual assistance and eating well.", why: "No new change was reported before the routine visit." },
    ],
    timeline: [
      { time: "Jul 10 · 10:00 AM", title: "Therapy update", text: "Maintaining baseline transfer assistance." },
    ],
  },
  {
    id: "reginald",
    name: "Reginald Thompson",
    room: "220A",
    age: 84,
    sex: "Male",
    facility: "Otangeles Care Center",
    image: "/residents/resident-4.png",
    status: "New admission",
    codeStatus: "DNR",
    latest: "New admission after CHF exacerbation",
    summary: "Reginald is settling in after hospitalization for CHF exacerbation and needs close weight and symptom monitoring.",
    why: "The first days after a CHF admission carry higher risk for fluid overload and readmission.",
    concerns: ["Daily weights", "Shortness of breath monitoring"],
    vitals: [
      { label: "Weight", value: "178.2 lb", baseline: "177.0 lb", tone: "watch" },
      { label: "Oxygen", value: "94%", baseline: "95%", tone: "normal" },
    ],
    reports: [
      { id: "rt1", author: "Amina Brooks", role: "RN", time: "7:30 AM", text: "No dyspnea at rest; morning weight is up 1.2 lb from admission.", why: "Weight trends help identify fluid gain before symptoms worsen." },
    ],
    timeline: [
      { time: "Yesterday · 4:30 PM", title: "Admission completed", text: "Medication reconciliation and baseline assessment completed." },
    ],
  },
  {
    id: "walter",
    name: "Walter Jefferson",
    room: "211",
    age: 81,
    sex: "Male",
    facility: "Otangeles Care Center",
    image: "/residents/resident-5.png",
    status: "Watchful",
    codeStatus: "DNR",
    latest: "Hip pain after evening fall",
    summary: "Walter had a low-impact fall yesterday evening and reports increased left hip pain today.",
    why: "Persistent pain after a fall may need imaging or a change in the mobility plan.",
    concerns: ["Post-fall pain", "Fall risk"],
    vitals: [{ label: "Pain", value: "6/10", baseline: "2/10", tone: "high" }],
    reports: [
      { id: "wj1", author: "Amina Brooks", role: "RN", time: "6:50 AM", text: "Pain increased with weight bearing; no shortening or rotation seen.", why: "Pain with weight bearing can indicate injury even without obvious deformity." },
    ],
    timeline: [{ time: "Yesterday · 7:45 PM", title: "Fall report", text: "Found seated on floor beside bed; neuro checks initiated." }],
  },
  {
    id: "elena",
    name: "Elena Vasquez",
    room: "106",
    age: 73,
    sex: "Female",
    facility: "Otangeles Care Center",
    image: "/residents/resident-6.png",
    status: "Stable",
    codeStatus: "Full Code",
    latest: "Diabetes follow-up completed",
    summary: "Glucose readings remain within the ordered range and no hypoglycemic events were reported.",
    why: "Consistent readings support continuing the current plan.",
    concerns: ["Diabetes monitoring"],
    vitals: [{ label: "Glucose", value: "142", baseline: "145", tone: "normal" }],
    reports: [{ id: "ev1", author: "Nina Alvarez", role: "CNA", time: "7:05 AM", text: "Breakfast intake 100%; no dizziness or shakiness.", why: "No symptoms of low blood sugar were reported." }],
    timeline: [{ time: "Today · 7:30 AM", title: "Follow-up completed", text: "Current diabetic plan continued." }],
  },
  {
    id: "eduardo",
    name: "Eduardo Salinas",
    room: "222",
    age: 88,
    sex: "Male",
    facility: "Otangeles Care Center",
    image: "/residents/resident-7.png",
    status: "Declining",
    codeStatus: "DNR / DNI",
    latest: "Reduced intake and fatigue",
    summary: "Eduardo has eaten less than half of meals for two days and is more fatigued.",
    why: "Continued poor intake can quickly lead to dehydration and functional decline.",
    concerns: ["Poor oral intake", "Fatigue"],
    vitals: [{ label: "Weight", value: "151.4 lb", baseline: "154.0 lb", tone: "watch" }],
    reports: [{ id: "es1", author: "Nina Alvarez", role: "CNA", time: "8:00 AM", text: "Only a few bites at breakfast; accepted fluids with encouragement.", why: "This continues a two-day decline in intake." }],
    timeline: [{ time: "Today · 8:00 AM", title: "Meal observation", text: "Less than 25% of breakfast eaten." }],
  },
  {
    id: "rosalind",
    name: "Rosalind Mercado",
    room: "118",
    age: 77,
    sex: "Female",
    facility: "Otangeles Care Center",
    image: "/residents/resident-8.png",
    status: "Stable",
    codeStatus: "Full Code",
    latest: "Wound care follow-up completed",
    summary: "The lower-leg wound is improving without drainage or new redness.",
    why: "Steady healing supports continuing the current wound-care plan.",
    concerns: ["Lower-leg wound"],
    vitals: [{ label: "Temperature", value: "98.2°F", baseline: "98.4°F", tone: "normal" }],
    reports: [{ id: "rm1", author: "Tessa Morgan", role: "RN", time: "7:55 AM", text: "Dressing changed; wound bed clean and smaller than last week.", why: "No new signs of infection were seen." }],
    timeline: [{ time: "Today · 8:00 AM", title: "Wound visit completed", text: "Continue current dressing order." }],
  },
];

function documentSections(residentId, reason) {
  const resident = residents.find((item) => item.id === residentId);
  return [
    { id: "code", title: "Code Status", text: resident?.codeStatus ?? "Unknown", verified: false, revisions: [] },
    { id: "chief", title: "Chief Complaint", text: `${reason}. ${resident?.summary ?? ""}`, verified: false, revisions: [] },
    { id: "hpi", title: "History of Present Illness", text: `${resident?.name} presents with ${reason.toLowerCase()}. Available staff observations, current symptoms, vital signs, and recent changes from baseline were reviewed.`, verified: false, revisions: [] },
    { id: "vitals", title: "Vital Signs", text: resident?.vitals.map((vital) => `${vital.label}: ${vital.value} (baseline ${vital.baseline})`).join(" · ") ?? "No vitals available", verified: false, revisions: [] },
    { id: "assessment", title: "Assessment & Plan", text: `Evaluate and monitor ${reason.toLowerCase()}. Continue facility observation and escalate for worsening symptoms or additional change from baseline.`, verified: false, revisions: [] },
    { id: "notes", title: "Provider Notes", text: "Facility context and care-team reports reviewed. Follow-up plan discussed with nursing.", verified: false, revisions: [] },
  ];
}

export const initialEncounters = [
  { id: "today-elena", residentId: "elena", date: TODAY, time: "7:30", meridiem: "AM", type: "Follow-up", status: "submitted-to-billing", priority: "Routine", reason: "Diabetes follow-up", change: "No material change", sections: documentSections("elena", "Diabetes follow-up"), signedAt: "Today · 8:02 AM" },
  { id: "today-rosalind", residentId: "rosalind", date: TODAY, time: "8:00", meridiem: "AM", type: "Wound care", status: "submitted-to-billing", priority: "Routine", reason: "Wound care follow-up", change: "Wound improving", sections: documentSections("rosalind", "Wound care follow-up"), signedAt: "Today · 8:24 AM" },
  { id: "today-mary", residentId: "mary", date: TODAY, time: "8:40", meridiem: "AM", type: "Acute", status: "scheduled", priority: "Urgent", reason: "Possible UTI / confusion", change: "More confused overnight", textNote: "", voiceTranscript: "", orders: [], sections: documentSections("mary", "Possible UTI / confusion") },
  { id: "today-hiroshi", residentId: "hiroshi", date: TODAY, time: "10:00", meridiem: "AM", type: "30-day follow-up", status: "scheduled", priority: "Routine", reason: "30-day follow-up", change: "Stable", textNote: "", voiceTranscript: "", orders: [], sections: documentSections("hiroshi", "30-day follow-up") },
  { id: "today-reginald", residentId: "reginald", date: TODAY, time: "11:15", meridiem: "AM", type: "Admission follow-up", status: "scheduled", priority: "High", reason: "New admission follow-up", change: "New admission after CHF exacerbation", textNote: "", voiceTranscript: "", orders: [], sections: documentSections("reginald", "New admission follow-up") },
  { id: "review-beatrice", residentId: "beatrice", date: "2026-07-12", time: "9:10", meridiem: "AM", type: "Acute", status: "needs-review", priority: "Urgent", reason: "Chest tightness", change: "New symptom", sections: documentSections("beatrice", "Chest tightness"), revisions: [] },
  { id: "review-walter", residentId: "walter", date: "2026-07-12", time: "4:15", meridiem: "PM", type: "Fall assessment", status: "needs-review", priority: "High", reason: "Post-fall hip pain", change: "Pain increased after fall", sections: documentSections("walter", "Post-fall hip pain"), revisions: [] },
  { id: "review-eduardo", residentId: "eduardo", date: "2026-07-11", time: "1:30", meridiem: "PM", type: "Acute", status: "needs-review", priority: "High", reason: "Reduced intake", change: "Intake below 50% for two days", sections: documentSections("eduardo", "Reduced intake"), revisions: [] },
  { id: "done-mary", residentId: "mary", date: "2026-07-05", time: "10:30", meridiem: "AM", type: "Follow-up", status: "submitted-to-billing", priority: "Routine", reason: "Medication follow-up", change: "Stable", sections: documentSections("mary", "Medication follow-up"), signedAt: "Jul 5 · 11:02 AM" },
  { id: "tomorrow-beatrice", residentId: "beatrice", date: "2026-07-14", time: "8:30", meridiem: "AM", type: "Follow-up", status: "scheduled", priority: "High", reason: "Chest symptom follow-up", change: "Follow-up requested", sections: documentSections("beatrice", "Chest symptom follow-up") },
  { id: "tomorrow-eduardo", residentId: "eduardo", date: "2026-07-14", time: "10:00", meridiem: "AM", type: "Acute", status: "scheduled", priority: "High", reason: "Nutrition follow-up", change: "Poor intake", sections: documentSections("eduardo", "Nutrition follow-up") },
];

export const initialActions = [
  { id: "a1", residentId: "mary", title: "Collect urine sample", ownerRole: "cna", owner: "Nina Alvarez", priority: "High", due: "Now", instructions: "Collect per standing order and notify nurse when sent.", status: "open" },
  { id: "a2", residentId: "reginald", title: "Recheck weight", ownerRole: "cna", owner: "Nina Alvarez", priority: "Routine", due: "Before lunch", instructions: "Use the same scale and report a gain above 2 lb.", status: "open" },
  { id: "a3", residentId: "walter", title: "Review need for imaging", ownerRole: "provider", owner: "Dr. Hannah Cole", priority: "High", due: "Today", instructions: "Assess pain with weight bearing and consider hip imaging.", status: "in-progress" },
  { id: "a4", residentId: "eduardo", title: "Offer fluids and record intake", ownerRole: "cna", owner: "Nina Alvarez", priority: "High", due: "Each round", instructions: "Offer preferred fluids and document acceptance.", status: "open" },
];

export const initialAssignments = [
  { id: "as1", residentId: "mary", reminder: "Use short, calm instructions", watchFor: "Worsening confusion or chills", care: "Morning care and intake", status: "pending", transcript: "" },
  { id: "as2", residentId: "reginald", reminder: "Allow rest between activities", watchFor: "Shortness of breath or swelling", care: "Weight and morning care", status: "pending", transcript: "" },
  { id: "as3", residentId: "eduardo", reminder: "Offer preferred drinks often", watchFor: "Refusing fluids or increased fatigue", care: "Meal and hydration support", status: "pending", transcript: "" },
  { id: "as4", residentId: "hiroshi", reminder: "Use gait belt for transfers", watchFor: "New knee pain", care: "Mobility and morning care", status: "pending", transcript: "" },
];

export const initialThreads = [
  {
    id: "t1",
    title: "Mary Lou Smith care team",
    residentId: "mary",
    kind: "room",
    members: "5 members",
    messages: [
      { id: "m1", from: "Nina Alvarez", mine: false, time: "8:12 AM", text: "Mary Lou was more confused during morning care. I also noticed a strong urine odor." },
      { id: "m2", from: "Dr. Hannah Cole", mine: true, time: "8:18 AM", text: "Thank you. Please collect a urine sample per the standing order and keep pushing fluids." },
    ],
  },
  {
    id: "t2",
    title: "West Hall care team",
    residentId: null,
    kind: "room",
    members: "12 members",
    messages: [
      { id: "m3", from: "Jamie Patel, RN", mine: false, time: "Yesterday", text: "Morning huddle moved to 9:30 AM. Please review new admissions first." },
    ],
  },
  {
    id: "t3",
    title: "Jamie Patel, MSN, RN",
    residentId: null,
    kind: "person",
    members: "Direct message",
    messages: [
      { id: "m4", from: "Jamie Patel, RN", mine: false, time: "Yesterday", text: "Can you review Walter’s fall note when you have a moment?" },
    ],
  },
];

export const initialSchedule = [
  { id: "s1", date: TODAY, time: "9:30 AM", kind: "huddle", title: "Morning clinical huddle", detail: "West Hall · 20 minutes", residentId: null },
  { id: "s2", date: TODAY, time: "11:15 AM", kind: "encounter", title: "Reginald Thompson", detail: "New admission follow-up", residentId: "reginald" },
  { id: "s3", date: "2026-07-14", time: "8:30 AM", kind: "encounter", title: "Beatrice Holloway", detail: "Chest symptom follow-up", residentId: "beatrice" },
  { id: "s4", date: "2026-07-14", time: "10:00 AM", kind: "encounter", title: "Eduardo Salinas", detail: "Nutrition follow-up", residentId: "eduardo" },
  { id: "s5", date: "2026-07-15", time: "9:00 AM", kind: "order", title: "Walter Jefferson imaging", detail: "Hip X-ray follow-up", residentId: "walter" },
];

export function residentById(id) {
  return residents.find((resident) => resident.id === id);
}

export function deepCopy(value) {
  return JSON.parse(JSON.stringify(value));
}
