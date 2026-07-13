const endpoint = process.env.CDP_ENDPOINT ?? "http://127.0.0.1:9226";
const appUrl = process.env.APP_URL ?? "http://127.0.0.1:5178/";
const pages = await fetch(`${endpoint}/json`).then((response) => response.json());
const page = pages.find((item) => item.type === "page");

if (!page) throw new Error("No Chrome page is available for functional smoke tests.");

const socket = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();
const browserErrors = [];

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  } else if (message.method === "Runtime.exceptionThrown") {
    browserErrors.push(message.params.exceptionDetails.text);
  } else if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
    browserErrors.push(message.params.entry.text);
  }
};

await new Promise((resolve) => { socket.onopen = resolve; });

function send(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve) => pending.set(id, resolve));
}

async function evaluate(expression) {
  const message = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (message.result.exceptionDetails) throw new Error(message.result.exceptionDetails.text);
  return message.result.result.value;
}

const wait = (milliseconds = 180) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function assertion(condition, message) {
  if (!condition) throw new Error(`Smoke assertion failed: ${message}`);
  console.log(`✓ ${message}`);
}

async function text() {
  return evaluate("document.body.innerText");
}

async function clickText(label, exact = false) {
  const clicked = await evaluate(`(() => {
    const wanted = ${JSON.stringify(label)};
    const button = [...document.querySelectorAll("button")].find((item) => {
      const copy = item.innerText.trim().replace(/\\s+/g, " ");
      return ${exact ? "copy === wanted" : "copy.includes(wanted)"};
    });
    if (!button) return false;
    button.click();
    return true;
  })()`);
  assertion(clicked, `control “${label}” is available`);
  await wait();
}

async function clickSelector(selector, label = selector) {
  const clicked = await evaluate(`(() => { const item = document.querySelector(${JSON.stringify(selector)}); if (!item) return false; item.click(); return true; })()`);
  assertion(clicked, `${label} is available`);
  await wait();
}

async function setControl(selector, value) {
  const changed = await evaluate(`(() => {
    const control = document.querySelector(${JSON.stringify(selector)});
    if (!control) return false;
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(control), "value")?.set;
    if (setter) setter.call(control, ${JSON.stringify(value)}); else control.value = ${JSON.stringify(value)};
    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  })()`);
  assertion(changed, `${selector} accepts input`);
  await wait(80);
}

async function resetApp(width = 390, height = 844) {
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: true });
  const url = new URL(appUrl);
  url.searchParams.set("functional-smoke", "1");
  await send("Page.navigate", { url: url.toString() });
  await wait(450);
  await evaluate("localStorage.clear(); location.reload()");
  await wait(500);
}

await resetApp();

let copy = await text();
assertion(copy.includes("Your shift") && copy.includes("Add an Encounter"), "Provider home loads with a clear next action");
assertion(copy.includes("3 notes need your review"), "Provider home shows the full multi-note review count");
const dimensions = await evaluate(`({ viewport: [innerWidth, innerHeight], bodyWidth: document.body.scrollWidth, appWidth: document.querySelector(".mobile-prototype").clientWidth })`);
assertion(dimensions.viewport[0] === 390 && dimensions.bodyWidth === 390 && dimensions.appWidth === 390, "390px mobile layout has no page-level horizontal overflow");

await clickText("notes need your review");
assertion((await evaluate("document.querySelector('.queue-count')?.innerText")) === "3", "Review queue shows three independent pending encounters");
assertion((await evaluate("document.querySelectorAll('.queue-list > button').length")) === 3, "Needs Review filter lists every pending encounter");
await clickText("Beatrice Holloway");
await clickText("Verify all", true);
await clickText("Sign and mark done", true);
assertion((await evaluate("document.querySelector('.queue-count')?.innerText")) === "2", "Signing one note leaves the other encounters in the queue");

await clickSelector('[aria-label="Go back"]', "review queue Back button");
await clickText("Add an Encounter", true);
await setControl('.sheet-form select', "mary");
const encounterCountBefore = await evaluate("JSON.parse(localStorage.getItem('sage.simple.functional.v2.encounters')).length");
await clickText("Start encounter now", true);
assertion((await text()).includes("Encounter") && (await text()).includes("In progress"), "Add Encounter starts the selected resident workflow");
await wait(250);
const encounterCountAfter = await evaluate("JSON.parse(localStorage.getItem('sage.simple.functional.v2.encounters')).length");
assertion(encounterCountAfter === encounterCountBefore, "A same-day scheduled encounter is reused instead of duplicated");
await clickText("Record", true);
await wait(1100);
await clickSelector('.recording-banner button', "recording Stop button");
assertion((await text()).includes("Resident assessed at bedside"), "Encounter voice capture creates an editable mock transcript");
await clickText("Add an order", true);
await setControl('.sheet-form input', "Urinalysis");
await setControl('.sheet-form textarea', "Collect today and notify provider of results.");
await clickText("Add order", true);
assertion((await text()).includes("Urinalysis"), "Orders can be added inside an encounter");
await clickText("End visit and send for review", true);
assertion((await evaluate("document.querySelector('.queue-count')?.innerText")) === "3", "Ending a visit adds it to the existing multi-encounter review queue");

await clickSelector('[aria-label="Go back"]', "queue Back button");
await clickText("Messages", true);
await clickText("Mary Lou Smith care team");
await clickSelector('[aria-label="Start voice call"]', "voice call button");
assertion((await text()).includes("Voice call started"), "Voice-call control gives clear feedback");
await clickSelector('[aria-label="Send mock voice message"]', "voice message control");
await wait(1050);
await clickSelector('.recording-banner button', "voice message Stop button");
assertion((await evaluate("document.querySelectorAll('.message-stream article > button').length")) >= 1, "Voice message appears in the conversation");
await setControl('.message-composer input', "Please recheck her temperature at 10 AM.");
await clickSelector('.message-composer button[type="submit"]', "message Send button");
assertion((await text()).includes("Please recheck her temperature at 10 AM."), "Typed care-team message is sent");

await clickSelector('[aria-label="Go back"]', "message Back button");
await clickText("More", true);
await clickText("Schedule");
assertion((await text()).includes("Previous") && (await text()).includes("Next"), "Weekly schedule includes week navigation");
await clickText("Morning clinical huddle");
await wait(300);
assertion((await text()).includes("scheduled for 9:30 AM"), "Schedule rows without residents still respond");
await clickText("Next", true);
assertion((await evaluate("document.querySelector('.schedule-view .eyebrow')?.textContent")) === "Upcoming week", "Next-week schedule navigation works");
await clickText("Previous", false);
assertion((await evaluate("document.querySelector('.schedule-view .eyebrow')?.textContent")) === "This week", "Previous-week navigation returns to the current week");

await clickSelector('[aria-label="Go back"]', "schedule Back button");
await clickText("More", true);
await clickText("Ask Sage");
await clickText("Who needs attention first?", true);
assertion((await text()).includes("Mary Lou Smith needs attention first"), "Sage returns a context-aware plain-language answer");

await clickSelector('[aria-label="Go back"]', "Sage Back button");
await clickText("More", true);
await clickText("Settings and workspace");
await clickText("Director of Nursing");
assertion((await text()).includes("Today’s priorities"), "Workspace switches to the Director of Nursing home");
await clickText("team actions are open");
await clickText("Mark done", true);
assertion((await text()).includes("Action marked done"), "DON can complete a team action");

await clickSelector('[aria-label="Go back"]', "actions Back button");
await clickText("More", true);
await clickText("Settings and workspace");
await clickText("CNA");
assertion((await text()).includes("resident updates captured"), "Workspace switches to the CNA home");
await clickText("Capture resident update", true);
await clickText("Start voice capture", true);
await wait(1050);
await clickSelector('.recording-banner button', "debrief Stop button");
assertion((await evaluate("document.querySelector('.note-field textarea')?.value.includes('Resident completed morning care')")), "CNA voice capture produces a reviewable update");
await clickText("Save and go to next resident", true);
assertion((await text()).includes("Resident update saved"), "CNA debrief saves and advances to the next resident");

await send("Emulation.setDeviceMetricsOverride", { width: 320, height: 700, deviceScaleFactor: 1, mobile: true });
await wait(250);
const narrow = await evaluate(`({ viewport: innerWidth, body: document.body.scrollWidth, app: document.querySelector(".mobile-prototype").clientWidth, region: document.querySelector(".app-scroll-region").scrollWidth })`);
assertion(narrow.viewport === 320 && narrow.body === 320 && narrow.app === 320 && narrow.region === 320, "320px narrow-mobile layout has no horizontal overflow");

if (browserErrors.length) console.log("Browser errors:", browserErrors);
assertion(browserErrors.length === 0, "No browser exceptions or console errors were reported");
console.log("\nFunctional SAGE Simple smoke test passed.");
socket.close();
