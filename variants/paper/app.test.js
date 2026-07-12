const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const SUBJECTS_PATH = path.join(__dirname, "subjects.js");

test("subjects.js provides the approved 24-question contract", () => {
  assert.equal(fs.existsSync(SUBJECTS_PATH), true, "subjects.js must exist");
  const data = require(SUBJECTS_PATH);
  const items = data.dimensions.flatMap((dimension) => dimension.items);

  assert.equal(data.dimensions.length, 6);
  assert.equal(items.length, 24);
  assert.equal(new Set(items.map((item) => item.id)).size, 24);
  data.dimensions.forEach((dimension) => {
    assert.equal(dimension.items.length, 4, `${dimension.code} must contain four items`);
    assert.equal(data.plans[dimension.code].days.length, 7, `${dimension.code} must contain seven days`);
    assert.deepEqual(data.plans[dimension.code].days.map((day) => day.day), [1, 2, 3, 4, 5, 6, 7]);
    assert.ok(data.plans[dimension.code].days.every((day) => day.minutes <= 5));
  });
  items.forEach((item) => {
    assert.deepEqual(item.options.map((option) => option.value), [2, 1, 0]);
    assert.equal(new Set(item.options.map((option) => option.text)).size, 3);
  });

  const canonicalDimensions = data.dimensions.map((dimension) => ({
    code: dimension.code,
    name: dimension.name,
    module: dimension.module,
    items: dimension.items.map((item) => ({
      text: item.text,
      options: item.options.map((option) => option.text),
      source: item.source
    })),
    insight_low: dimension.insight_low,
    training_direction: dimension.training_direction
  }));
  const digest = crypto
    .createHash("sha256")
    .update(JSON.stringify(canonicalDimensions))
    .digest("hex");
  assert.equal(digest, "4cf7763e8a7e03cf27d92a3dafb072424e3c4eee0acc9724e364470f8462c906");

  assert.deepEqual(
    items.filter((item) => item.hazard).map((item) => item.id),
    ["A3-2", "A3-3", "B2-2", "B3-4"]
  );
  assert.deepEqual(data.grades.map((grade) => grade.min), [85, 70, 55, 0]);
});

test("existing PERMA scoring remains unchanged", () => {
  const app = require("./app.js");
  assert.equal(app.STORAGE_KEY, "happiness-self-check:paper:v1");
  assert.equal(app.scoreDimension([1, 1, 1]), 0);
  assert.equal(app.scoreDimension([4, 4, 4]), 50);
  assert.equal(app.scoreDimension([7, 7, 7]), 100);
  assert.deepEqual(app.calculateResults(Array(15).fill(4)), {
    total: 50,
    scores: { P: 50, E: 50, R: 50, M: 50, A: 50 }
  });
});

test("option orders are semantic permutations and stored orders stay fixed", () => {
  const app = require("./app.js");
  const rolls = [0, 0.9, 0.2, 0.7, 0.4, 0.6];
  let rollIndex = 0;
  const orders = app.createOptionOrders(3, () => rolls[rollIndex++]);

  assert.equal(orders.length, 3);
  orders.forEach((order) => assert.deepEqual([...order].sort(), [0, 1, 2]));

  const storedOrders = [...orders, ...Array.from({ length: 9 }, () => [2, 1, 0])];
  const state = app.normalizeDrivingState({ optionOrders: storedOrders }, "s2", () => {
    throw new Error("valid stored orders must not be randomized again");
  });
  assert.deepEqual(state.optionOrders.slice(0, 3), orders);
});

test("driving state repairs invalid answers and recalculates completed results", () => {
  const app = require("./app.js");
  const invalid = app.normalizeDrivingState({
    answers: [2, "2", -1, 1, 0, null, 3],
    currentQuestion: 9,
    results: { total: 999 },
    completedAt: "not-kept"
  }, "s2", () => 0.5);

  assert.equal(invalid.answers.length, 12);
  assert.deepEqual(invalid.answers.slice(0, 7), [2, null, null, 1, 0, null, null]);
  assert.equal(invalid.currentQuestion, 1);
  assert.equal(invalid.results, null);
  assert.equal(invalid.completedAt, null);
  invalid.optionOrders.forEach((order) => assert.deepEqual([...order].sort(), [0, 1, 2]));

  const complete = app.normalizeDrivingState({
    answers: Array(12).fill(1),
    results: { total: 999 },
    completedAt: "2026-07-12T00:00:00.000Z",
    practiceCompleted: true
  }, "s2", () => 0.5);
  assert.equal(complete.currentQuestion, 11);
  assert.equal(complete.results.total, 50);
  assert.deepEqual(complete.results.scores, { A1: 50, A2: 50, A3: 50 });
  assert.equal(complete.completedAt, "2026-07-12T00:00:00.000Z");
  assert.equal(complete.practiceCompleted, true);
});

test("driving state treats parsed JSON null as empty storage", () => {
  const app = require("./app.js");
  const state = app.normalizeDrivingState(null, "s2", () => 0.5);
  assert.equal(state.answers.length, 12);
  assert.ok(state.answers.every((answer) => answer === null));
  assert.equal(state.results, null);
});

test("driving scores use semantic values and detect only the four approved hazards", () => {
  const app = require("./app.js");
  const s2Answers = Array(12).fill(2);
  s2Answers[9] = 0;
  s2Answers[10] = 0;
  const s3Answers = Array(12).fill(2);
  s3Answers[5] = 0;
  s3Answers[11] = 0;

  const s2 = app.calculateDrivingResults("s2", s2Answers);
  const s3 = app.calculateDrivingResults("s3", s3Answers);
  assert.deepEqual(s2.scores, { A1: 100, A2: 100, A3: 50 });
  assert.deepEqual(s3.scores, { B1: 100, B2: 75, B3: 75 });
  assert.equal(s2.total, 83);
  assert.equal(s3.total, 83);
  assert.equal(s2.weakest, "A3");
  assert.equal(s3.weakest, "B2");
  assert.deepEqual(s2.hazards.map((item) => item.id), ["A3-2", "A3-3"]);
  assert.deepEqual(s3.hazards.map((item) => item.id), ["B2-2", "B3-4"]);
  assert.equal(s2.deductions.length, 2);
  assert.equal(s3.deductions.length, 2);

  const noHazard = Array(12).fill(2);
  noHazard[0] = 0;
  assert.equal(app.calculateDrivingResults("s2", noHazard).hazards.length, 0);
});

test("license score, deduction total and grade boundaries are deterministic", () => {
  const app = require("./app.js");
  const expected = [
    [100, "教练级"],
    [85, "教练级"],
    [84, "老司机"],
    [70, "老司机"],
    [69, "实习期"],
    [55, "实习期"],
    [54, "陪练期"],
    [0, "陪练期"]
  ];
  expected.forEach(([score, name]) => assert.equal(app.getLicenseGrade(score).name, name));
  assert.throws(() => app.getLicenseGrade(-1), /0 to 100/);
  assert.throws(() => app.getLicenseGrade(101), /0 to 100/);

  const s2 = app.calculateDrivingResults("s2", Array(12).fill(2));
  const s3 = app.calculateDrivingResults("s3", Array(12).fill(1));
  const license = app.calculateLicense(s2, s3);
  assert.equal(license.score, 75);
  assert.equal(license.deductionTotal, 25);
  assert.equal(license.grade.name, "老司机");
  assert.equal(app.calculateLicense({ ...s2, total: 84 }, { ...s3, total: 85 }).score, 85);
  assert.deepEqual(app.DRIVING_STORAGE_KEYS, {
    s2: "happiness-driving:s2:v1",
    s3: "happiness-driving:s3:v1"
  });
  assert.equal(app.canIssueLicense({ results: s2 }, { results: s3 }), true);
  assert.equal(app.canIssueLicense({ results: s2 }, { results: null }), false);
});

test("license issue date ignores null completion timestamps instead of treating them as 1970", () => {
  const app = require("./app.js");
  const fallback = new Date("2026-07-12T08:00:00.000Z");
  assert.equal(
    app.resolveLicenseIssuedAt([null, ""], fallback).toISOString(),
    "2026-07-12T08:00:00.000Z"
  );
  assert.equal(
    app.resolveLicenseIssuedAt(["2026-07-10T00:00:00.000Z", null, "2026-07-11T00:00:00.000Z"], fallback).toISOString(),
    "2026-07-11T00:00:00.000Z"
  );
});

test("HTML keeps legacy screens and adds unique driving screens with valid references", () => {
  const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const screens = [...html.matchAll(/<section\b[^>]*\sdata-screen="([^"]+)"/g)].map((match) => match[1]);
  const requiredScreens = [
    "home", "quiz", "result", "plan", "breathe", "complete",
    "driving-quiz", "driving-result", "license"
  ];
  const requiredIds = [
    "s1SubjectCard", "s2SubjectCard", "s3SubjectCard", "licenseEntry",
    "drivingQuizBackButton", "drivingQuestionText", "drivingOptions",
    "drivingTotalScore", "drivingDimensionBars", "drivingDeductionList",
    "drivingHazardSection", "drivingPlanButton", "licenseCard", "licenseScore"
  ];

  assert.equal(new Set(ids).size, ids.length, "all HTML ids must be unique");
  assert.equal(new Set(screens).size, screens.length, "all screen names must be unique");
  requiredScreens.forEach((screen) => assert.ok(screens.includes(screen), `missing screen ${screen}`));
  requiredIds.forEach((id) => assert.ok(ids.includes(id), `missing id ${id}`));

  const idSet = new Set(ids);
  for (const match of html.matchAll(/\s(?:aria-labelledby|aria-describedby|for)="([^"]+)"/g)) {
    match[1].split(/\s+/).forEach((reference) => {
      assert.ok(idSet.has(reference), `missing referenced id ${reference}`);
    });
  }
  assert.match(html, /本测评仅用于生活状态的自我观察，不替代专业支持或个性化建议。/);

  const subjectsScript = html.indexOf('<script src="./subjects.js" defer></script>');
  const appScript = html.indexOf('<script src="./app.js" defer></script>');
  assert.ok(subjectsScript >= 0, "subjects.js script must be present");
  assert.ok(subjectsScript < appScript, "subjects.js must load before app.js");
  assert.doesNotMatch(html, /https?:\/\//);

  const appSource = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
  const staticIdSelectors = [...appSource.matchAll(/querySelector\("#([^"]+)"\)/g)].map((match) => match[1]);
  staticIdSelectors.forEach((id) => assert.ok(idSet.has(id), `app.js selects missing id ${id}`));
});

test("CSS covers every new paper-driving component and responsive boundary", () => {
  const css = fs.readFileSync(path.join(__dirname, "style.css"), "utf8");
  [
    ".subject-card",
    ".license-entry",
    ".driving-option",
    ".driving-bar__track",
    ".deduction-list",
    ".hazard-section.is-on",
    ".license-card",
    ".retest-list"
  ].forEach((selector) => assert.ok(css.includes(selector), `missing CSS selector ${selector}`));
  assert.match(css, /\.app-shell\s*\{[\s\S]*?max-width:\s*430px/);
  assert.match(css, /@media \(min-width:\s*700px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
});

test("browser controller initializes against the rebuilt DOM contract", () => {
  const data = require(SUBJECTS_PATH);
  const screenNames = ["home", "quiz", "result", "driving-quiz", "driving-result", "plan", "breathe", "complete", "license"];
  const idElements = new Map();
  let readyHandler = null;

  function makeElement(screenName = null) {
    const classes = new Set(screenName ? ["screen"] : []);
    return {
      dataset: screenName ? { screen: screenName } : {},
      hidden: screenName ? screenName !== "home" : false,
      inert: false,
      value: "",
      textContent: "",
      style: { setProperty() {} },
      classList: {
        add(...names) { names.forEach((name) => classes.add(name)); },
        remove(...names) { names.forEach((name) => classes.delete(name)); },
        contains(name) { return classes.has(name); },
        toggle(name, force) {
          if (force === undefined ? !classes.has(name) : force) classes.add(name);
          else classes.delete(name);
        }
      },
      addEventListener() {},
      setAttribute() {},
      replaceChildren() {},
      append() {},
      focus() {},
      querySelector() { return null; },
      querySelectorAll() { return []; }
    };
  }

  const screens = screenNames.map(makeElement);
  screens[0].classList.add("is-active");
  const documentStub = {
    hidden: false,
    body: { dataset: { screen: "home" } },
    querySelector(selector) {
      if (!idElements.has(selector)) idElements.set(selector, makeElement());
      return idElements.get(selector);
    },
    querySelectorAll(selector) {
      if (selector === "[data-screen]") return screens;
      return [];
    },
    createElement() { return makeElement(); },
    createElementNS() { return makeElement(); },
    addEventListener(type, handler) {
      if (type === "DOMContentLoaded") readyHandler = handler;
    }
  };
  const windowStub = {
    localStorage: {
      getItem(key) { return key === "happiness-driving:s2:v1" ? "null" : null; },
      setItem() {},
      removeItem() {}
    },
    addEventListener() {},
    clearTimeout() {},
    clearInterval() {},
    cancelAnimationFrame() {},
    requestAnimationFrame() { return 1; },
    setTimeout() { return 1; },
    setInterval() { return 1; },
    matchMedia() { return { matches: true }; },
    scrollTo() {}
  };
  const sandbox = {
    HAPPINESS_DRIVING_DATA: data,
    document: documentStub,
    window: windowStub,
    performance: { now() { return 0; } },
    Math,
    Date,
    Object,
    Array,
    Number,
    String,
    Boolean,
    TypeError,
    RangeError,
    console
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "app.js"), "utf8"), sandbox, { filename: "app.js" });
  assert.equal(typeof readyHandler, "function");
  assert.doesNotThrow(() => readyHandler());
  assert.equal(idElements.get("#licenseEntry").hidden, true);
});
