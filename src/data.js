export const TODAY = "2026-07-13";

export const facilities = [
  { id: "elkhart", name: "Brickyard Healthcare – Elkhart Care Center", shortName: "Brickyard Elkhart", address: "1001 W Hively Ave, Elkhart, IN 46517", latitude: 41.659507, longitude: -85.980714, phone: "(574) 294-7641", fax: "(574) 293-0671" },
  { id: "merrillville", name: "Brickyard Healthcare – Merrillville Care Center", shortName: "Brickyard Merrillville", address: "8800 Virginia Pl, Merrillville, IN 46410", latitude: 41.457107, longitude: -87.329833, phone: "(219) 736-1310", fax: "(219) 736-1345" },
  { id: "casa-hobart", name: "Casa of Hobart", shortName: "Casa of Hobart", address: "4410 W 49th Ave, Hobart, IN 46342", latitude: 41.5300932, longitude: -87.3120177, phone: "(219) 947-1507", fax: "(219) 947-5884" },
  { id: "niles", name: "Niles Care Center", shortName: "Niles Care Center", address: "1380 E Main St, Niles, MI 49120", latitude: 41.8245579, longitude: -86.2430064, phone: "(269) 684-4320", fax: "(269) 684-0136" },
];

export const visitTypes = [
  "30-Day Follow Up", "60-Day Follow Up", "Acute", "Admission - Telemed", "Advanced Care Planning (ACP)",
  "Annual Wellness Visit", "Chronic Pain Management", "Discharge", "Follow-Up", "GDR (Gradual Dose Reduction) Visit",
  "History and Physical", "Lab", "Others", "PM&R (Physical Medicine & Rehabilitation) Up", "Psychiatry",
  "Psychiatry Follow Up", "Remote Patient Monitoring (RPM) - Enrollment", "Remote Patient Monitoring (RPM) - Follow-Up",
  "Telehealth", "Telehealth - Asynchronous", "Telemed - Fall Assessment", "Transitional Care Management",
  "Transitional Care Management - Telemed", "Wound Care",
  "ACO Reach Sig Date",
  "Acute PsychMed Visit",
  "Acute Psychotherapy Visit",
  "Admission (Physician)",
  "APCM Monthly Record",
  "AWV Initial",
  "AWV Subsequent",
  "Care Coordination",
  "Chronic Care Visit",
  "Chronic Psych Visit",
  "Chronic PsychMed Visit w/ PRN Med Review",
  "Chronic Psychotherapy Visit",
  "Cognitive Screening and Assessment",
  "Dermatology Follow Up",
  "Dermatology Initial Visit",
  "Discharge Visit",
  "Establish New PCP",
  "Follow-up to Cognitive Screening",
  "Pain Management Visit",
  "Palliative Care",
  "Palliative Care Follow Up",
  "Palliative Care Interprofessional Consult",
  "Palliative Care New Patient",
  "PC Acute Visit",
  "PC Attending Visit",
  "PC Med Change Visit",
  "PC New Patient",
  "Podiatry New Patient",
  "Podiatry Visit",
  "Post Acute Care Visit 1",
  "Post Acute Care Visit 2",
  "Post Acute Care Visit 3",
  "Post Acute Care Visit 4",
  "Post Acute Care Visit 5",
  "Post Acute Care Visit 6",
  "Post Acute Care Visit Week 3",
  "PsychMed attending physician visit",
  "PsychMed chronic visit w/ lab f/u",
  "PsychMed chronic visit w/ med change f/u",
  "PsychMed med change f/u visit",
  "PsychMed new pt visit",
  "PsychMed PRN med review w/ med change f/u",
  "PsychMed PRN med visit",
  "Psychotherapy new pt visit",
  "Psychotherapy treatment plan update",
  "Quality Metrics Review",
  "Regulatory",
  "Regulatory – 30 days",
  "Regulatory – 60 days",
  "Regulatory – 90 days",
  "Schizophrenia Audit",
  "Transition of Care",
  "Wound Care Visit",
];

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

export const staffDirectory = [
  { id: "jamie", name: "Jamie Patel, MSN, RN", role: "Director of Nursing", presence: "online", facilityIds: ["elkhart", "merrillville", "casa-hobart", "niles"] },
  { id: "hannah", name: "Dr. Hannah Cole", role: "Physician", presence: "online", facilityIds: ["elkhart", "merrillville", "casa-hobart", "niles"] },
  { id: "nina", name: "Nina Alvarez", role: "CNA", presence: "online", facilityIds: ["elkhart", "merrillville", "casa-hobart", "niles"] },
  { id: "sarah", name: "Sarah Jenkins", role: "RN, Charge", presence: "online", facilityIds: ["elkhart"] },
  { id: "tessa", name: "Tessa Morgan", role: "RN", presence: "online", facilityIds: ["elkhart", "merrillville"] },
  { id: "amina", name: "Amina Brooks", role: "RN", presence: "away", lastSeen: "5m ago", facilityIds: ["merrillville"] },
  { id: "nathaniel", name: "Dr. Nathaniel Brooks", role: "Medical Director", presence: "away", lastSeen: "20m ago", facilityIds: ["casa-hobart", "niles"] },
  { id: "nora", name: "Nora Whitfield, NP", role: "Nurse Practitioner", presence: "online", facilityIds: ["casa-hobart"] },
  { id: "maya", name: "Maya Chen", role: "CNA", presence: "online", facilityIds: ["merrillville"] },
  { id: "gloria", name: "Gloria Fields", role: "Unit Manager", presence: "online", facilityIds: ["niles"] },
  { id: "samira", name: "Samira Nassar", role: "Social Services", presence: "offline", lastSeen: "Yesterday", facilityIds: ["elkhart", "casa-hobart"] },
  { id: "owen", name: "Owen Miller", role: "Therapy Lead", presence: "away", lastSeen: "30m ago", facilityIds: ["merrillville", "niles"] },
  { id: "alicia", name: "Alicia Grant", role: "Scheduler", presence: "online", facilityIds: ["elkhart", "merrillville", "casa-hobart", "niles"] },
];

const extraResidentSeeds = [
  ["frank", "Frank O'Donnell", "220", 76, "Male", "elkhart", "Full Code", "Stable after morning exercise", "Stable"],
  ["doris", "Doris Whitfield", "203", 88, "Female", "elkhart", "Comfort Measures Only (CMO)", "Quiet morning; eating with assistance", "Stable"],
  ["raymond", "Raymond Cho", "212A", 74, "Male", "merrillville", "Full Code", "Lower-leg wound continues to heal", "Stable"],
  ["ingrid", "Ingrid Larsson", "216", 83, "Female", "merrillville", "DNR (Do Not Resuscitate)", "Cheerful and near usual baseline", "Stable"],
  ["otis", "Otis McKenna", "219B", 80, "Male", "merrillville", "Full Code", "Irregular pulse noted with known AFib", "Watchful"],
  ["constance", "Constance Webb", "201A", 92, "Female", "casa-hobart", "Comfort Measures Only (CMO)", "Comfort plan remains effective", "Stable"],
  ["margaret", "Margaret O'Sullivan", "205A", 86, "Female", "casa-hobart", "DNR (Do Not Resuscitate)", "Mild dehydration after poor intake", "Declining"],
  ["henry", "Henry Brennan", "207", 73, "Male", "casa-hobart", "Full Code", "Recovering after knee replacement", "Stable"],
  ["yolanda", "Yolanda Pierce", "210B", 91, "Female", "casa-hobart", "DNR (Do Not Resuscitate)", "Pressure injury needs weekly review", "Watchful"],
  ["clarence", "Clarence Boudreaux", "212", 82, "Male", "niles", "DNR (Do Not Resuscitate)", "COPD symptoms remain at baseline", "Stable"],
  ["pearl", "Pearl Robinson", "214A", 89, "Female", "niles", "DNR (Do Not Resuscitate)", "Stable with current care plan", "Stable"],
  ["vincent", "Vincent Kowalski", "216B", 76, "Male", "niles", "Full Code", "Post-stroke therapy progressing", "Stable"],
];

function makeResident([id, name, room, age, sex, facilityId, codeStatus, latest, status], index) {
  const facility = facilities.find((item) => item.id === facilityId)?.name;
  return {
    id, name, room, age, sex, facilityId, facility, codeStatus, latest, status,
    image: `/residents/resident-${index + 9}.png`,
    summary: `${name.split(" ")[0]} was reviewed by the care team. ${latest}.`,
    why: "A shared baseline and timely follow-up help the whole care team respond consistently.",
    concerns: [latest],
    vitals: [{ label: "Blood pressure", value: `${118 + index}/${70 + (index % 8)}`, baseline: "120/74", tone: status === "Declining" ? "watch" : "normal" }],
    reports: [{ id: `${id}-report`, author: index % 2 ? "Tessa Morgan" : "Sarah Jenkins", role: "RN", time: index % 2 ? "Yesterday" : "Today · 8:10 AM", text: `${latest}. Care plan and monitoring needs reviewed.`, why: "This update documents the resident's current status for the next shift." }],
    timeline: [
      { time: "Today · 8:10 AM", title: "Care-team update", text: `${latest}.` },
      { time: "Jul 11 · 2:30 PM", title: "Nursing review", text: "Care plan and current orders reviewed." },
      { time: "Jul 8 · 10:00 AM", title: "Provider follow-up", text: "No urgent change documented." },
    ],
  };
}

export const residents = [
  {
    id: "mary",
    name: "Mary Lou Smith",
    room: "204B",
    age: 84,
    sex: "Female",
    facilityId: "elkhart",
    facility: "Brickyard Healthcare – Elkhart Care Center",
    image: "/residents/resident-1.png",
    status: "Declining",
    codeStatus: "DNR (Do Not Resuscitate)",
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
    facilityId: "elkhart",
    facility: "Brickyard Healthcare – Elkhart Care Center",
    image: "/residents/resident-2.png",
    status: "Declining",
    codeStatus: "DNR / DNI",
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
    room: "215B",
    age: 81,
    sex: "Male",
    facilityId: "merrillville",
    facility: "Brickyard Healthcare – Merrillville Care Center",
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
    age: 80,
    sex: "Male",
    facilityId: "merrillville",
    facility: "Brickyard Healthcare – Merrillville Care Center",
    image: "/residents/resident-4.png",
    status: "New admission",
    codeStatus: "Full Code",
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
    age: 78,
    sex: "Male",
    facilityId: "casa-hobart",
    facility: "Casa of Hobart",
    image: "/residents/resident-5.png",
    status: "Watchful",
    codeStatus: "Full Code",
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
    room: "207A",
    age: 89,
    sex: "Female",
    facilityId: "casa-hobart",
    facility: "Casa of Hobart",
    image: "/residents/resident-6.png",
    status: "Stable",
    codeStatus: "DNR / DNI",
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
    age: 81,
    sex: "Male",
    facilityId: "niles",
    facility: "Niles Care Center",
    image: "/residents/resident-7.png",
    status: "Declining",
    codeStatus: "Full Code",
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
    room: "228",
    age: 85,
    sex: "Female",
    facilityId: "niles",
    facility: "Niles Care Center",
    image: "/residents/resident-8.png",
    status: "Stable",
    codeStatus: "DNR (Do Not Resuscitate)",
    latest: "Wound care follow-up completed",
    summary: "The lower-leg wound is improving without drainage or new redness.",
    why: "Steady healing supports continuing the current wound-care plan.",
    concerns: ["Lower-leg wound"],
    vitals: [{ label: "Temperature", value: "98.2°F", baseline: "98.4°F", tone: "normal" }],
    reports: [{ id: "rm1", author: "Tessa Morgan", role: "RN", time: "7:55 AM", text: "Dressing changed; wound bed clean and smaller than last week.", why: "No new signs of infection were seen." }],
    timeline: [{ time: "Today · 8:00 AM", title: "Wound visit completed", text: "Continue current dressing order." }],
  },
  ...extraResidentSeeds.map(makeResident),
];

export function documentSections(residentId, reason, providerNotes = {}) {
  const resident = residents.find((item) => item.id === residentId);
  const codeDescriptions = {
    "Full Code": "All life-sustaining measures are permitted, including CPR, intubation, defibrillation, and advanced life support.",
    "DNI (Do Not Intubate)": "Endotracheal intubation and mechanical ventilation are not permitted; other treatments may be provided.",
    "Limited Interventions": "Selected medical treatments are allowed, but no CPR, intubation, or intensive life-sustaining measures.",
    "Comfort Measures Only (CMO)": "Care is focused exclusively on comfort and symptom relief; no life-prolonging treatments are provided.",
    "DNR - Comfort Care Only (DNR-CC)": "Only comfort-focused care is provided at all times; no resuscitative or life-prolonging interventions are used.",
    "Hospice / Palliative Focus": "Care emphasizes symptom control and quality of life, typically aligned with DNR and comfort-focused goals.",
    "DNR (Do Not Resuscitate)": "No CPR is performed if the resident experiences cardiac or respiratory arrest.",
    "DNR / DNI": "Neither CPR nor intubation is performed in the event of cardiac or respiratory arrest.",
    "Selective Treatment": "Hospital transfer and medical treatment are permitted; ICU-level care and aggressive life support are avoided.",
    "DNR - Comfort Care Arrest (DNR-CCA)": "Full medical treatment is provided until cardiac or respiratory arrest occurs; no CPR is performed after arrest.",
    "Allow Natural Death (AND)": "Natural death is allowed without resuscitative efforts; clinically equivalent to DNR using patient-centered language.",
    "Unknown / Pending Documentation": "Code status has not yet been confirmed or documented and requires prompt clarification.",
  };
  const primary = reason || resident?.concerns?.[0] || "Clinical follow-up";
  const utiConcern = primary.toLowerCase().includes("uti") || primary.toLowerCase().includes("urinary");
  const fallConcern = primary.toLowerCase().includes("fall");
  const painConcern = primary.toLowerCase().includes("pain");
  const diagnosis = utiConcern ? ["R41.0", "Disorientation, unspecified"] : fallConcern ? ["W19.XXXA", "Unspecified fall, initial encounter"] : painConcern ? ["R52", "Pain, unspecified"] : ["R69", "Illness, unspecified"];
  const currentVital = (label, fallback) => resident?.vitals?.find((item) => item.label.toLowerCase().includes(label))?.value ?? fallback;
  const section = (id, title, content) => ({ id, title, content, revisions: [] });
  const capturedProviderNotes = [
    providerNotes.text?.trim() ? { label: "Provider Text Note", text: providerNotes.text.trim() } : null,
    providerNotes.voice?.trim() ? { label: "Provider Voice Note Transcript", text: providerNotes.voice.trim() } : null,
  ].filter(Boolean);
  return [
    section("code", "Code Status", [{ label: resident?.codeStatus ?? "Unknown / Pending Documentation", text: codeDescriptions[resident?.codeStatus] ?? codeDescriptions["Unknown / Pending Documentation"] }]),
    section("chief", "Chief Complaint", [
      { label: "Medical necessity", text: "Patient Request" },
      { label: "Reason for visit", text: primary },
      { label: "Resident situation", text: resident?.summary ?? "No additional situation summary documented." },
    ]),
    section("hpi", "History of Present Illness", [
      { text: `${resident?.name}, a ${resident?.age}-year-old ${resident?.sex?.toLowerCase()}, was evaluated for ${primary.toLowerCase()}.` },
      { label: "Current symptoms", text: resident?.latest },
      { label: "Clinical context", text: resident?.summary },
      { label: "Relevant history", text: resident?.concerns?.join("; ") || "No additional relevant history documented." },
      { label: "Severity", text: "Mild to moderate; requires provider assessment and continued facility monitoring." },
    ]),
    section("pmh", "Past Medical History", [
      { text: "• Type 2 diabetes mellitus\n• Hypertension\n• " + primary + "\n• " + (resident?.concerns?.[1] ?? "No additional active concern") },
    ]),
    section("psh", "Past Surgical History", [{ text: "No Prior Surgeries" }]),
    section("social", "Social History", [
      { label: "Alcohol Use", text: "Unknown" }, { label: "Drugs/Substance Use", text: "Unknown" },
      { label: "Tobacco/Nicotine Use", text: "Unknown" }, { label: "Drinking Type", text: "Unknown" },
      { label: "Marital Status", text: "Unknown" }, { label: "Sexual Activity", text: "Not currently sexually active" },
      { label: "Sex at Birth", text: resident?.sex }, { label: "Residence", text: "Skilled nursing facility" },
    ]),
    section("family", "Family History", [
      { label: "Father", text: "Condition: Stroke · Deceased: Yes · Age of onset: 70" },
      { label: "Mother", text: "Condition: Heart Disease · Deceased: Yes · Age of onset: 60" },
    ]),
    section("immunizations", "Immunizations", [
      { label: "Document Vaccines", text: "Present" }, { label: "Influenza", text: "10/12/2025" },
      { label: "Pneumococcal", text: "Documented in facility record" }, { label: "COVID-19", text: "Primary series documented" },
    ]),
    section("vitals", "Vital Signs", [
      { label: "Blood Pressure", text: currentVital("blood", "119/78 mmHg") }, { label: "Pain Scale", text: currentVital("pain", "0/10") },
      { label: "Heart Rate", text: `${currentVital("heart", "82")} bpm` }, { label: "Blood Glucose", text: currentVital("glucose", "145 mg/dL") },
      { label: "Respiratory Rate", text: "21 /min" }, { label: "Weight", text: currentVital("weight", "170 lb") },
      { label: "Temperature", text: currentVital("temperature", "98.9°F") }, { label: "Height", text: "68 in" },
      { label: "Oxygen Saturation", text: currentVital("oxygen", "96%") }, { label: "Calculated BMI", text: "25.8 kg/m²" },
    ]),
    section("allergies", "Allergies", [{ label: "Reported", text: "Metformin" }, { label: "Reaction", text: "Diarrhea" }]),
    section("medications", "Medications", [{ text: "Medication reviewed. No medication changes made during this encounter." }]),
    section("ros", "Review of Systems", [
      { label: "General", text: "Denies excessive daytime sleepiness, fever, weight gain, malaise, fatigue, low energy, and weight loss unless noted in HPI." },
      { label: "Eyes", text: "Denies discharge, eye pain, photophobia, itching, redness, and visual disturbance." },
      { label: "ENT", text: "Denies ear pain, hearing change, rhinorrhea, sore throat, and difficulty swallowing." },
      { label: "Cardiovascular", text: "Denies chest pain, palpitations, temperature changes to distal extremities, tightness, and swelling unless noted in HPI." },
      { label: "Respiratory", text: "Denies cough, dyspnea, hemoptysis, orthopnea, and wheezing." },
      { label: "Gastrointestinal", text: "Denies abdominal pain, constipation, diarrhea, nausea, and vomiting." },
      { label: "Genitourinary", text: utiConcern ? "Reports: Urinary change documented by facility staff · Patient denies flank pain and gross hematuria." : "Denies dysuria, frequency, urgency, and hematuria." },
      { label: "Musculoskeletal", text: "Denies joint pain, limited range of motion, muscle weakness, and joint swelling unless otherwise documented." },
      { label: "Skin", text: "Denies hair or nail changes, scaling, bruising, ulcers, rash, and skin color changes." },
      { label: "Neurologic", text: `Reports: ${resident?.latest} · Patient denies seizure, tremor, and syncope.` },
      { label: "Psychiatric", text: "Denies depressed mood, memory loss, anxiety, hallucinations, and suicidal ideation unless documented." },
      { label: "Endocrine", text: "Denies heat or cold intolerance, hair loss, thirst, and increased urination." },
      { label: "Hematologic/Lymphatic", text: "Denies anemia, bruising, bleeding, and enlarged nodes." },
      { label: "Allergy/Immunology", text: "Denies environmental allergies, hives, and recurrent infections." },
    ]),
    section("exam", "Physical Exam", [
      { label: "General", text: "Awake: Yes · Alert: Yes · Engaged: Yes" },
      { label: "ENT", text: "Voice appearance: Normal · External ear: Normal · Hearing: Adequate" },
      { label: "Eyes", text: "Conjunctiva: Normal · Sclera: Clear · Extraocular movements: Intact" },
      { label: "Neck", text: "Trachea: Midline · Range of motion: Normal · Visible mass: Absent" },
      { label: "Cardiovascular", text: "Rate: Normal · Rhythm: Regular · Distal pulses: Present · Edema: Absent" },
      { label: "Respiratory", text: "Effort: Normal · Breath sounds: Normal · Respiratory distress: Absent" },
      { label: "Gastrointestinal", text: "Bowel sounds: Present · Abdomen: Soft · Tenderness: Absent · Distention: Absent" },
      { label: "Genitourinary", text: "Flank tenderness: Absent · Urinary catheter: Absent" },
      { label: "Musculoskeletal", text: "Posture: Normal · Range of motion: Functional · Focal swelling: Absent" },
      { label: "Skin", text: "Texture: Normal · Warm: Yes · Rash: Absent · Ulceration: Absent unless noted" },
      { label: "Neurologic", text: "Mental status: Baseline · Tremor: Absent · Focal deficit: Absent" },
      { label: "Psychiatric", text: "Cooperative: Yes · Mood: Appropriate · Affect: Normal · Behavior: Normal" },
      { label: "Hematologic", text: "Bruising: Absent · Active bleeding: Absent" },
    ]),
    section("assessment", "Assessment & Plan", [
      { label: "Medical Decision Making", text: `${resident?.summary} Findings were considered with the resident's baseline, facility observations, current vital signs, and risks related to ${primary.toLowerCase()}.` },
      { label: `${diagnosis[0]} · ${diagnosis[1]}`, text: `Evaluate and monitor ${primary.toLowerCase()}. Notify the provider for new or worsening symptoms.` },
      { label: "I10 · Essential (primary) hypertension", text: "Continue current treatment and facility blood-pressure monitoring." },
      { label: "E11.9 · Type 2 diabetes mellitus without complications", text: "Continue current diabetic plan and facility glucose monitoring." },
      { label: "Follow-up", text: "Continue facility monitoring. Follow up at the next scheduled visit or sooner for any change from baseline." },
    ]),
    section("notes", "Notes", capturedProviderNotes.length ? capturedProviderNotes : [{ text: "No provider text or voice note has been captured in SAGE for this encounter." }]),
    section("cpt", "CPT Codes", [{ text: "99309 - Supported by documentation" }]),
  ];
}

function completedDocumentSections(residentId, reason) {
  const resident = residents.find((item) => item.id === residentId);
  const firstName = resident?.name?.split(" ")[0] ?? "Resident";
  return documentSections(residentId, reason, {
    text: `${resident?.name} was evaluated for ${reason.toLowerCase()}. Current findings, facility observations, and the plan of care were reviewed with nursing. Continue ordered monitoring and notify the provider for any change from baseline.`,
    voice: `${firstName} was seen at bedside. The assessment and follow-up plan were discussed with the care team, and questions were answered.`,
  });
}

function providerSignatureSnapshot(signedAt) {
  return { method: "type", typedName: "Dr. Hannah Cole", savedAt: signedAt, providerId: "hannah", providerName: "Dr. Hannah Cole", signedAt };
}

export const initialEncounters = [
  { id: "today-elena", residentId: "elena", date: TODAY, time: "7:30", meridiem: "AM", type: "Follow-up", status: "submitted-to-billing", priority: "High", deviationSeverity: "High", reason: "New fasting-glucose elevation", change: "Fasting glucose rose to 248 mg/dL, above her usual 130–160 mg/dL range.", changeObservedAt: "Monday · 6:45 AM", sections: completedDocumentSections("elena", "New fasting-glucose elevation"), signedAt: "Today · 8:02 AM", signedSignature: providerSignatureSnapshot("Today · 8:02 AM") },
  { id: "today-rosalind", residentId: "rosalind", date: TODAY, time: "8:00", meridiem: "AM", type: "Wound care", status: "submitted-to-billing", priority: "High", deviationSeverity: "High", reason: "New wound drainage", change: "New serous drainage and increased redness were documented compared with the prior wound check.", changeObservedAt: "Sunday · 7:55 PM", sections: completedDocumentSections("rosalind", "New wound drainage"), signedAt: "Today · 8:24 AM", signedSignature: providerSignatureSnapshot("Today · 8:24 AM") },
  { id: "today-mary", residentId: "mary", date: TODAY, time: "8:40", meridiem: "AM", type: "Acute", status: "scheduled", priority: "Urgent", deviationSeverity: "Urgent", reason: "Possible UTI with acute confusion", change: "New confusion, 100.4°F temperature, and reduced intake developed overnight.", changeObservedAt: "Monday · 7:18 AM", textNote: "", voiceTranscript: "", orders: [], sections: documentSections("mary", "Possible UTI with acute confusion") },
  { id: "today-hiroshi", residentId: "hiroshi", date: TODAY, time: "10:00", meridiem: "AM", type: "30-day follow-up", status: "scheduled", priority: "Moderate", deviationSeverity: "Moderate", reason: "New knee swelling and mobility decline", change: "New right-knee swelling and slower transfers were reported compared with his usual mobility.", changeObservedAt: "Sunday · 3:20 PM", textNote: "", voiceTranscript: "", orders: [], sections: documentSections("hiroshi", "New knee swelling and mobility decline") },
  { id: "today-reginald", residentId: "reginald", date: TODAY, time: "11:15", meridiem: "AM", type: "Admission follow-up", status: "scheduled", priority: "High", deviationSeverity: "High", reason: "Weight gain and edema after CHF admission", change: "Weight increased 3.2 lb with new bilateral ankle edema since his admission baseline.", changeObservedAt: "Monday · 7:30 AM", textNote: "", voiceTranscript: "", orders: [], sections: documentSections("reginald", "Weight gain and edema after CHF admission") },
  { id: "today-frank", residentId: "frank", date: TODAY, time: "12:30", meridiem: "PM", type: "Chronic Care Visit", status: "scheduled", priority: "High", deviationSeverity: "High", reason: "New dizziness with mobility", change: "New dizziness and unsteady gait followed morning exercise; he needed more transfer support than usual.", changeObservedAt: "Monday · 11:50 AM", textNote: "", voiceTranscript: "", orders: [], sections: documentSections("frank", "New dizziness with mobility") },
  { id: "today-doris", residentId: "doris", date: TODAY, time: "3:15", meridiem: "PM", type: "Palliative Care Follow Up", status: "scheduled", priority: "Moderate", deviationSeverity: "Moderate", reason: "Breakthrough discomfort and poor intake", change: "New grimacing during turns and intake below 25% of breakfast despite her usual comfort plan.", changeObservedAt: "Monday · 8:05 AM", textNote: "", voiceTranscript: "", orders: [], sections: documentSections("doris", "Breakthrough discomfort and poor intake") },
  { id: "today-otis", residentId: "otis", date: TODAY, time: "2:00", meridiem: "PM", type: "Chronic Care Visit", status: "scheduled", priority: "Urgent", deviationSeverity: "Urgent", reason: "Irregular pulse with new dizziness", change: "New dizziness accompanied an irregular pulse of 118, above his usual heart-rate baseline.", changeObservedAt: "Monday · 7:05 AM", textNote: "", voiceTranscript: "", orders: [], sections: documentSections("otis", "Irregular pulse with new dizziness") },
  { id: "today-margaret", residentId: "margaret", date: TODAY, time: "9:40", meridiem: "AM", type: "Acute", status: "scheduled", priority: "Urgent", deviationSeverity: "Urgent", reason: "Acute intake and hydration decline", change: "Oral intake fell below half of usual with dry mucosa and new orthostatic dizziness.", changeObservedAt: "Sunday · 6:10 PM", textNote: "", voiceTranscript: "", orders: [], sections: documentSections("margaret", "Acute intake and hydration decline") },
  { id: "today-henry", residentId: "henry", date: TODAY, time: "1:30", meridiem: "PM", type: "Post Acute Care Visit 2", status: "scheduled", priority: "High", deviationSeverity: "High", reason: "Post-operative pain and mobility decline", change: "Knee pain increased and therapy distance decreased from his post-operative baseline.", changeObservedAt: "Sunday · 2:15 PM", textNote: "", voiceTranscript: "", orders: [], sections: documentSections("henry", "Post-operative pain and mobility decline") },
  { id: "today-clarence", residentId: "clarence", date: TODAY, time: "10:30", meridiem: "AM", type: "Chronic Care Visit", status: "scheduled", priority: "Urgent", deviationSeverity: "Urgent", reason: "New hypoxia and increased dyspnea", change: "Oxygen saturation fell to 89% with new exertional dyspnea compared with his respiratory baseline.", changeObservedAt: "Monday · 9:50 AM", textNote: "", voiceTranscript: "", orders: [], sections: documentSections("clarence", "New hypoxia and increased dyspnea") },
  { id: "today-vincent", residentId: "vincent", date: TODAY, time: "2:45", meridiem: "PM", type: "Transition of Care", status: "scheduled", priority: "High", deviationSeverity: "High", reason: "New swallowing and speech change", change: "New coughing with thin liquids and slower speech were observed during therapy.", changeObservedAt: "Monday · 1:40 PM", textNote: "", voiceTranscript: "", orders: [], sections: documentSections("vincent", "New swallowing and speech change") },
  { id: "review-beatrice", residentId: "beatrice", date: "2026-07-12", time: "9:10", meridiem: "AM", type: "Acute", status: "needs-review", priority: "Urgent", reason: "Chest tightness", change: "New symptom", sections: completedDocumentSections("beatrice", "Chest tightness"), revisions: [], assignedScribe: "Mark Rivera", scribeCompletedAt: "Jul 12 · 9:34 AM" },
  { id: "review-walter", residentId: "walter", date: "2026-07-12", time: "4:15", meridiem: "PM", type: "Fall assessment", status: "needs-review", priority: "High", reason: "Post-fall hip pain", change: "Pain increased after fall", sections: completedDocumentSections("walter", "Post-fall hip pain"), revisions: [], assignedScribe: "Mark Rivera", scribeCompletedAt: "Jul 12 · 4:39 PM" },
  { id: "review-eduardo", residentId: "eduardo", date: "2026-07-11", time: "1:30", meridiem: "PM", type: "Acute", status: "needs-review", priority: "High", reason: "Reduced intake", change: "Intake below 50% for two days", sections: completedDocumentSections("eduardo", "Reduced intake"), revisions: [], assignedScribe: "Mark Rivera", scribeCompletedAt: "Jul 11 · 1:56 PM" },
  { id: "done-mary", residentId: "mary", date: "2026-07-05", time: "10:30", meridiem: "AM", type: "Follow-up", status: "submitted-to-billing", priority: "Routine", reason: "Medication follow-up", change: "Stable", sections: completedDocumentSections("mary", "Medication follow-up"), signedAt: "Jul 5 · 11:02 AM", signedSignature: providerSignatureSnapshot("Jul 5 · 11:02 AM") },
  { id: "tomorrow-beatrice", residentId: "beatrice", date: "2026-07-14", time: "8:30", meridiem: "AM", type: "Follow-up", status: "scheduled", priority: "High", deviationSeverity: "High", reason: "Recurrent chest tightness", change: "Chest tightness recurred during morning care after being absent at baseline.", changeObservedAt: "Tuesday · 7:45 AM", sections: documentSections("beatrice", "Recurrent chest tightness") },
  { id: "tomorrow-eduardo", residentId: "eduardo", date: "2026-07-14", time: "10:00", meridiem: "AM", type: "Acute", status: "scheduled", priority: "High", deviationSeverity: "High", reason: "Acute nutrition and intake decline", change: "Meal intake remained below 50% for two days, down from his usual intake.", changeObservedAt: "Sunday · 8:00 AM", sections: documentSections("eduardo", "Acute nutrition and intake decline") },
  { id: "review-margaret", residentId: "margaret", date: "2026-07-12", time: "11:20", meridiem: "AM", type: "Acute", status: "clarification-requested", priority: "High", reason: "Mild dehydration", change: "Poor intake", sections: completedDocumentSections("margaret", "Mild dehydration"), revisions: [], assignedScribe: "Mark Rivera", scribeCompletedAt: null, clarificationRequest: { id: "clarification-review-margaret", sectionId: "medications", sectionLabel: "Medications", prompt: "Which furosemide dose should the Scribe use?", conflictReason: "The active medication record and the newest signed Provider plan do not match.", question: "Please confirm whether furosemide should remain 20 mg daily or change to 40 mg daily. The current eMAR and most recent provider plan conflict.", requestedBy: "Mark Rivera", requestedAt: "Today · 9:12 AM", routedVia: "Otangeles Operations", evidence: [{ id: "emar-current", label: "Current medication record", status: "Current administration record", value: "Furosemide 20 mg by mouth daily", detail: "The active PCC eMAR still lists the existing daily dose.", recordedAt: "Reviewed Jul 12 · 8:58 AM" }, { id: "provider-plan", label: "Newest signed Provider plan", status: "Newer signed instruction", value: "Increase furosemide to 40 mg daily", detail: "The latest signed progress note has a higher dose, but the eMAR was not updated.", recordedAt: "Signed Jul 11 · 4:22 PM" }], responseOptions: [{ id: "keep-current", label: "Keep 20 mg daily", detail: "Use the current medication record", answer: "Keep furosemide at 20 mg by mouth daily. Confirmed against the active eMAR." }, { id: "use-plan", label: "Change to 40 mg daily", detail: "Use the newest signed Provider plan", answer: "Change furosemide to 40 mg by mouth daily. Confirmed against the latest signed Provider plan." }, { id: "unable", label: "Unable to confirm", detail: "Send back for further reconciliation", answer: "I am unable to confirm the correct furosemide dose from the available records. Please route this to the facility clinical team for reconciliation." }, { id: "other", label: "Other", detail: "Type or record a different answer", answer: "" }], response: "", respondedAt: null, respondedBy: null } },
  { id: "review-yolanda", residentId: "yolanda", date: "2026-07-11", time: "2:45", meridiem: "PM", type: "Wound Care", status: "needs-review", priority: "Routine", reason: "Pressure injury follow-up", change: "Weekly review", sections: completedDocumentSections("yolanda", "Pressure injury follow-up"), revisions: [], assignedScribe: "Mark Rivera", scribeCompletedAt: "Jul 11 · 3:12 PM" },
  { id: "done-frank", residentId: "frank", date: "2026-07-10", time: "9:00", meridiem: "AM", type: "30-Day Follow Up", status: "submitted-to-billing", priority: "Routine", reason: "30-day follow-up", change: "Stable", sections: completedDocumentSections("frank", "30-day follow-up"), signedAt: "Jul 10 · 9:34 AM", signedSignature: providerSignatureSnapshot("Jul 10 · 9:34 AM") },
  { id: "done-raymond", residentId: "raymond", date: "2026-07-09", time: "10:30", meridiem: "AM", type: "Wound Care", status: "submitted-to-billing", priority: "Routine", reason: "Wound follow-up", change: "Improving", sections: completedDocumentSections("raymond", "Wound follow-up"), signedAt: "Jul 9 · 11:02 AM", signedSignature: providerSignatureSnapshot("Jul 9 · 11:02 AM") },
  { id: "done-clarence", residentId: "clarence", date: "2026-07-08", time: "1:15", meridiem: "PM", type: "60-Day Follow Up", status: "submitted-to-billing", priority: "Routine", reason: "COPD follow-up", change: "At baseline", sections: completedDocumentSections("clarence", "COPD follow-up"), signedAt: "Jul 8 · 1:48 PM", signedSignature: providerSignatureSnapshot("Jul 8 · 1:48 PM") },
  { id: "future-otis", residentId: "otis", date: "2026-07-15", time: "9:45", meridiem: "AM", type: "Follow-Up", status: "scheduled", priority: "High", reason: "AFib follow-up", change: "Irregular pulse", sections: documentSections("otis", "AFib follow-up") },
  { id: "future-henry", residentId: "henry", date: "2026-07-16", time: "10:15", meridiem: "AM", type: "PM&R (Physical Medicine & Rehabilitation) Up", status: "scheduled", priority: "Routine", reason: "Post-operative mobility", change: "Therapy progressing", sections: documentSections("henry", "Post-operative mobility") },
  { id: "future-vincent", residentId: "vincent", date: "2026-07-17", time: "2:00", meridiem: "PM", type: "Telehealth", status: "scheduled", priority: "Routine", reason: "Post-stroke follow-up", change: "Therapy progressing", sections: documentSections("vincent", "Post-stroke follow-up") },
];

export const providerShiftDeviationUpdates = Object.fromEntries(
  initialEncounters
    .filter((encounter) => encounter.deviationSeverity)
    .map((encounter) => [encounter.id, {
      reason: encounter.reason,
      change: encounter.change,
      changeObservedAt: encounter.changeObservedAt,
      priority: encounter.priority,
      deviationSeverity: encounter.deviationSeverity,
    }]),
);

const actionSeeds = [
  { id: "a1", residentId: "mary", title: "Collect urine sample", ownerRole: "cna", owner: "Nina Alvarez", priority: "High", due: "Now", instructions: "Collect per standing order and notify nurse when sent.", status: "open" },
  { id: "a2", residentId: "reginald", title: "Recheck weight", ownerRole: "cna", owner: "Nina Alvarez", priority: "Routine", due: "Before lunch", instructions: "Use the same scale and report a gain above 2 lb.", status: "open" },
  { id: "a3", residentId: "walter", title: "Review need for imaging", ownerRole: "provider", owner: "Dr. Hannah Cole", priority: "High", due: "Today", instructions: "Assess pain with weight bearing and consider hip imaging.", status: "in-progress" },
  { id: "a4", residentId: "eduardo", title: "Offer fluids and record intake", ownerRole: "cna", owner: "Nina Alvarez", priority: "High", due: "Each round", instructions: "Offer preferred fluids and document acceptance.", status: "open" },
  { id: "a5", residentId: "margaret", title: "Record meal and fluid intake", ownerRole: "cna", owner: "Maya Chen", priority: "High", due: "Each meal", instructions: "Document percentage eaten and total fluids offered.", status: "open" },
  { id: "a6", residentId: "otis", title: "Recheck apical pulse", ownerRole: "provider", owner: "Dr. Hannah Cole", priority: "High", due: "Today", instructions: "Review rhythm and notify medical director for sustained symptoms.", status: "open" },
  { id: "a7", residentId: "yolanda", title: "Upload weekly wound measurement", ownerRole: "cna", owner: "Maya Chen", priority: "Routine", due: "Today", instructions: "Include length, width, depth, drainage, and a facility-approved image.", status: "in-progress" },
  { id: "a8", residentId: "henry", title: "Confirm therapy follow-up", ownerRole: "provider", owner: "Dr. Hannah Cole", priority: "Routine", due: "Tomorrow", instructions: "Review therapy note before the scheduled follow-up.", status: "open" },
  { id: "a9", residentId: "beatrice", title: "Repeat chest-symptom check", ownerRole: "cna", owner: "Nina Alvarez", priority: "High", due: "Before lunch", instructions: "Ask about recurrent tightness and report any new symptoms immediately.", status: "open" },
  { id: "a10", residentId: "clarence", title: "Document oxygen use", ownerRole: "cna", owner: "Nina Alvarez", priority: "Routine", due: "This shift", instructions: "Record oxygen flow and saturation with the next respiratory check.", status: "open" },
];

export const initialActions = actionSeeds.map((action, index) => ({
  ...action,
  createdBy: "Jamie Patel, MSN, RN",
  createdAt: new Date(Date.UTC(2026, 6, 13, 6, 30 + (index * 6))).toISOString(),
}));

export const initialAssignments = [
  { id: "as1", residentId: "mary", reminder: "Use short, calm instructions", watchFor: "Worsening confusion or chills", care: "Morning care and intake", status: "pending", transcript: "" },
  { id: "as2", residentId: "reginald", reminder: "Allow rest between activities", watchFor: "Shortness of breath or swelling", care: "Weight and morning care", status: "pending", transcript: "" },
  { id: "as3", residentId: "eduardo", reminder: "Offer preferred drinks often", watchFor: "Refusing fluids or increased fatigue", care: "Meal and hydration support", status: "pending", transcript: "" },
  { id: "as4", residentId: "hiroshi", reminder: "Use gait belt for transfers", watchFor: "New knee pain", care: "Mobility and morning care", status: "pending", transcript: "" },
  { id: "as5", residentId: "frank", reminder: "Encourage independent steps", watchFor: "Dizziness after exercise", care: "Mobility and breakfast", status: "pending", transcript: "" },
  { id: "as6", residentId: "doris", reminder: "Follow comfort-focused plan", watchFor: "Nonverbal signs of discomfort", care: "Comfort care and meals", status: "pending", transcript: "" },
  { id: "as7", residentId: "walter", reminder: "Use two-person support for transfers", watchFor: "Increased hip pain or reduced weight bearing", care: "Mobility and safety rounds", status: "pending", transcript: "" },
  { id: "as8", residentId: "margaret", reminder: "Offer preferred fluids in small amounts", watchFor: "Dry mouth, dizziness, or continued poor intake", care: "Hydration and meal support", status: "pending", transcript: "" },
  { id: "as9", residentId: "rosalind", reminder: "Protect the wound dressing during care", watchFor: "Drainage, odor, redness, or increased pain", care: "Morning care and wound observation", status: "pending", transcript: "" },
];

function seededTimestamp(label, fallbackIndex = 0) {
  const dayMatch = label.match(/Jul\s+(\d{1,2})/);
  const day = label.startsWith("Today") ? 13 : label.startsWith("Yesterday") ? 12 : dayMatch ? Number(dayMatch[1]) : 10 - fallbackIndex;
  const clockMatch = label.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  let hour = clockMatch ? Number(clockMatch[1]) : Math.max(7, 12 - fallbackIndex);
  const minute = clockMatch ? Number(clockMatch[2]) : 0;
  if (clockMatch?.[3].toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (clockMatch?.[3].toUpperCase() === "AM" && hour === 12) hour = 0;
  return new Date(Date.UTC(2026, 6, day, hour, minute)).toISOString();
}

function encounterTimestamp(encounter) {
  let hour = Number(encounter.time.split(":")[0]);
  const minute = Number(encounter.time.split(":")[1] ?? 0);
  if (encounter.meridiem === "PM" && hour !== 12) hour += 12;
  if (encounter.meridiem === "AM" && hour === 12) hour = 0;
  return new Date(`${encounter.date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`).toISOString();
}

function providerNoteText(encounter) {
  const notes = encounter.sections?.find((section) => section.id === "notes")?.content ?? [];
  return notes.map((item) => `${item.label ? `${item.label}: ` : ""}${item.text}`).join(" ");
}

export const initialTimelineEvents = [
  ...residents.flatMap((resident) => resident.timeline.map((event, index) => ({
    id: `clinical-${resident.id}-${index + 1}`,
    residentId: resident.id,
    kind: "clinical",
    title: event.title,
    text: event.text,
    actor: "Care team",
    displayTime: event.time,
    occurredAt: seededTimestamp(event.time, index),
    sourceType: "clinical",
    sourceId: `${resident.id}-${index + 1}`,
  }))),
  ...initialActions.map((action) => ({
    id: `action-created-${action.id}`,
    residentId: action.residentId,
    kind: "don-action",
    title: "Care action assigned",
    text: `${action.title} — assigned to ${action.owner}. ${action.instructions}`,
    actor: action.createdBy,
    displayTime: "Today · earlier",
    occurredAt: action.createdAt,
    sourceType: "action",
    sourceId: action.id,
    status: action.status,
  })),
  ...initialEncounters
    .filter((encounter) => ["needs-review", "clarification-requested", "revision", "clarification-response-sent", "submitted-to-billing"].includes(encounter.status))
    .map((encounter) => ({
      id: `provider-note-${encounter.id}`,
      residentId: encounter.residentId,
      kind: "provider-note",
      title: encounter.status === "submitted-to-billing" ? "Provider note signed" : encounter.status === "revision" ? "Provider note revision requested" : encounter.status === "clarification-requested" ? "Scribe clarification requested" : encounter.status === "clarification-response-sent" ? "Clarification response sent" : "Provider note ready for review",
      text: encounter.clarificationRequest?.question ?? providerNoteText(encounter),
      actor: encounter.status === "clarification-requested" ? encounter.clarificationRequest.requestedBy : "Dr. Hannah Cole",
      displayTime: encounter.signedAt ?? encounter.scribeCompletedAt ?? `${encounter.date} · ${encounter.time} ${encounter.meridiem}`,
      occurredAt: encounterTimestamp(encounter),
      sourceType: "encounter",
      sourceId: encounter.id,
      status: encounter.status,
    })),
].sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));

export function createCareRoomThread(resident, index = 0) {
  const firstReport = resident.reports?.[0];
  const memberIds = staffDirectory
    .filter((person) => person.facilityIds?.includes(resident.facilityId))
    .slice(0, 5)
    .map((person) => person.id);
  return {
    id: `room-${resident.id}`,
    title: `${resident.name} care room`,
    residentId: resident.id,
    kind: "room",
    purpose: "resident-room",
    memberIds,
    members: `${memberIds.length} members`,
    messages: [
      { id: `room-${resident.id}-1`, from: firstReport?.author ?? "Care team", mine: false, time: firstReport?.time ?? "7:30 AM", text: firstReport?.text ?? resident.summary },
      { id: `room-${resident.id}-2`, from: "Dr. Hannah Cole", mine: index % 2 === 0, time: "8:18 AM", text: `Keep updates about ${resident.name.split(" ")[0]} here so nursing, the provider, and the care team share the same plan. Current focus: ${resident.latest}.` },
    ],
  };
}

export const initialThreads = [
  ...residents.map((resident, index) => createCareRoomThread(resident, index)),
  {
    id: "person-jamie",
    title: "Jamie Patel, MSN, RN",
    residentId: null,
    kind: "person",
    personId: "jamie",
    purpose: "direct",
    memberIds: ["hannah", "jamie"],
    members: "Direct message",
    messages: [
      { id: "m4", from: "Jamie Patel, RN", mine: false, time: "Yesterday", text: "Can you review Walter’s fall note when you have a moment?" },
    ],
  },
];

export const initialSchedule = [
  { id: "s1", date: TODAY, time: "9:30 AM", kind: "huddle", title: "Morning clinical huddle", detail: "Brickyard Elkhart · 20 minutes", residentId: null, facilityId: "elkhart" },
  { id: "s2", date: TODAY, time: "11:15 AM", kind: "encounter", title: "Reginald Thompson", detail: "New admission follow-up", requirement: "Admission follow-up", residentId: "reginald" },
  { id: "s3", date: "2026-07-14", time: "8:30 AM", kind: "encounter", title: "Beatrice Holloway", detail: "Chest symptom follow-up", requirement: "Follow-up", residentId: "beatrice" },
  { id: "s4", date: "2026-07-14", time: "10:00 AM", kind: "encounter", title: "Eduardo Salinas", detail: "Nutrition follow-up", requirement: "Follow-up", residentId: "eduardo" },
  { id: "s5", date: "2026-07-15", time: "9:00 AM", kind: "order", title: "Walter Jefferson imaging", detail: "Hip X-ray follow-up", residentId: "walter" },
  { id: "s6", date: "2026-07-15", time: "9:45 AM", kind: "encounter", title: "Otis McKenna", detail: "AFib follow-up", requirement: "30-day required visit", residentId: "otis" },
  { id: "s7", date: "2026-07-16", time: "10:15 AM", kind: "encounter", title: "Henry Brennan", detail: "Post-operative mobility", requirement: "60-day required visit", residentId: "henry" },
  { id: "s8", date: "2026-07-16", time: "1:30 PM", kind: "huddle", title: "Casa care-plan huddle", detail: "Casa of Hobart · 30 minutes", residentId: null, facilityId: "casa-hobart" },
  { id: "s9", date: "2026-07-17", time: "2:00 PM", kind: "encounter", title: "Vincent Kowalski", detail: "Post-stroke telehealth follow-up", requirement: "Follow-up", residentId: "vincent" },
  { id: "s10", date: "2026-07-17", time: "3:15 PM", kind: "order", title: "Yolanda Pierce wound review", detail: "Weekly measurement due", residentId: "yolanda" },
];

export function residentById(id) {
  return residents.find((resident) => resident.id === id);
}

export function deepCopy(value) {
  return JSON.parse(JSON.stringify(value));
}
