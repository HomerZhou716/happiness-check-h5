const STORAGE_KEY = "happiness-self-check:paper:v1";
const DRIVING_STORAGE_KEYS = Object.freeze({
  s2: "happiness-driving:s2:v1",
  s3: "happiness-driving:s3:v1"
});
const DRIVING_DATA = typeof module !== "undefined" && module.exports
  ? require("./subjects.js")
  : globalThis.HAPPINESS_DRIVING_DATA;
const QUESTION_TRANSITION_MS = 250;
const SCREEN_TRANSITION_MS = 320;
const BREATH_TOTAL_SECONDS = 60;
const BREATH_PHASES = Object.freeze([
  { label: "吸气", seconds: 4 },
  { label: "屏息", seconds: 2 },
  { label: "呼气", seconds: 6 }
]);

const DIMENSION_ORDER = Object.freeze(["P", "E", "R", "M", "A"]);
const TIE_PRIORITY = Object.freeze(["R", "P", "E", "M", "A"]);
const SCALE_LABELS = Object.freeze([
  "完全没有",
  "偶尔闪过",
  "很少",
  "有时",
  "比较多",
  "经常",
  "非常频繁"
]);

const QUESTIONS = Object.freeze([
  { id: "p1", dimension: "P", text: "最近一周，有没有哪个瞬间让你真心笑出来？" },
  { id: "p2", dimension: "P", text: "醒来面对新一天时，你有多少期盼？" },
  { id: "p3", dimension: "P", text: "忙完一天回头看，值得记住的好时刻多吗？" },
  { id: "e1", dimension: "E", text: "做一件事时，你有多久能全心在场，不惦记下一件？" },
  { id: "e2", dimension: "E", text: "最近有没有什么事，让你一投入就忘了看时间？" },
  { id: "e3", dimension: "E", text: "面对眼前的事，你能感到自己正好用上了擅长的部分吗？" },
  { id: "r1", dimension: "R", text: "最近想说真心话时，你身边有能接住它的人吗？" },
  { id: "r2", dimension: "R", text: "你有多常感到，自己被认真听见、被放在心上？" },
  { id: "r3", dimension: "R", text: "这一周，你主动靠近过一个重要的人吗？" },
  { id: "m1", dimension: "M", text: "你正在做的事，和你真正看重的东西有多贴近？" },
  { id: "m2", dimension: "M", text: "即使日子普通，你还能感觉它有值得走下去的方向吗？" },
  { id: "m3", dimension: "M", text: "这一周，有没有哪件小事让你觉得“这样做是值得的”？" },
  { id: "a1", dimension: "A", text: "最近完成一件事后，你有认真肯定过自己吗？" },
  { id: "a2", dimension: "A", text: "想做的事，你能一步一步把它往前推吗？" },
  { id: "a3", dimension: "A", text: "回看这一周，你能看见自己留下的进展吗？" }
]);

const DIMENSIONS = Object.freeze({
  P: {
    name: "积极情绪",
    short: "感受好事",
    insights: {
      low: "你不是没有好事，只是最近太忙，没来得及接住它们。",
      mid: "你能感到生活的亮处，只是它们还容易被忙碌盖过去。",
      high: "你常能接住生活里的好时刻，这份感受力正在帮你稳住日常。"
    }
  },
  E: {
    name: "投入",
    short: "全心在场",
    insights: {
      low: "你一直在做事，但真正让你忘记时间的事，已经很少了。",
      mid: "你偶尔能进入自己的节奏，只是外界还很容易把你带走。",
      high: "你知道怎样把注意力放进一件事里，这份专注很珍贵。"
    }
  },
  R: {
    name: "关系",
    short: "彼此接住",
    insights: {
      low: "你习惯把话咽回去，关系里的温度也因此慢了半拍。",
      mid: "你并不缺少联结，只是还可以更坦然地把自己放进去。",
      high: "你身边有能彼此接住的人，这让你不必独自消化一切。"
    }
  },
  M: {
    name: "意义",
    short: "看见方向",
    insights: {
      low: "日子没有停，只是你暂时看不清它正把你带向哪里。",
      mid: "你心里有在意的方向，只是日常还没有完全与它对齐。",
      high: "你知道什么值得投入，这让普通的日子也有了方向。"
    }
  },
  A: {
    name: "成就",
    short: "确认进展",
    insights: {
      low: "你做成了不少事，却很少允许自己认真算一次数。",
      mid: "你看得见进展，但对自己的肯定总比下一件事来得晚。",
      high: "你能把想法一步步落下，也愿意承认自己已经走了多远。"
    }
  }
});

const TRAINING_PLANS = Object.freeze({
  inward: {
    key: "inward",
    name: "内观",
    kicker: "回到身体",
    description: "你的注意力散得有些远。接下来七天，先练习把它轻轻收回来。",
    days: [
      { day: 1, minutes: 1, title: "先停在这一分钟", action: "坐稳，放松肩膀，跟随一轮 4–2–6 呼吸。", interactive: true },
      { day: 2, minutes: 3, title: "听见身体", action: "闭眼，从额头到脚尖扫一遍，只标记紧与松。" },
      { day: 3, minutes: 3, title: "一次只做一件", action: "挑一件日常小事，三分钟里不切换，也不赶。" },
      { day: 4, minutes: 4, title: "给念头留白", action: "注意脑中最响的念头，默念“我看见了”，再回到呼吸。" },
      { day: 5, minutes: 5, title: "慢一点走", action: "走一小段路，只留意脚底与地面的接触。" },
      { day: 6, minutes: 5, title: "找回投入", action: "选一件略有难度又不压身的事，完整做五分钟。" },
      { day: 7, minutes: 4, title: "收拢这一周", action: "安静坐四分钟，记住此刻身体最清楚的感受。" }
    ]
  },
  mindset: {
    key: "mindset",
    name: "心态",
    kicker: "重新看见",
    description: "你不是缺少好事，而是注意力很久没有停在它们身上。七天里，练习换一个角度看见。",
    days: [
      { day: 1, minutes: 1, title: "先停在这一分钟", action: "坐稳，放松肩膀，跟随一轮 4–2–6 呼吸。", interactive: true },
      { day: 2, minutes: 3, title: "捡回一个好瞬间", action: "写下今天一个微小但真实的好时刻，再补一句为什么。" },
      { day: 3, minutes: 4, title: "把“应该”放下", action: "抓住今天一句“我应该”，改写成“我选择”或“我暂不”。" },
      { day: 4, minutes: 5, title: "替事实松绑", action: "写下一件不顺的事，把“发生了什么”和“我怎么想”分两行。" },
      { day: 5, minutes: 3, title: "认真算一次数", action: "记下今天做成的三件小事，不用等它们足够大。" },
      { day: 6, minutes: 4, title: "谢谢具体的人", action: "写一句感谢，点明对方做了什么、这件事给你带来了什么。" },
      { day: 7, minutes: 5, title: "给下周留一个期待", action: "写下下周最想靠近的一件小事，只定第一步。" }
    ]
  },
  relationship: {
    key: "relationship",
    name: "关系",
    kicker: "主动联结",
    description: "你并不需要很多人，只需要几次真实的靠近。七天里，练习发出清楚而轻盈的信号。",
    days: [
      { day: 1, minutes: 1, title: "先停在这一分钟", action: "坐稳，放松肩膀，跟随一轮 4–2–6 呼吸。", interactive: true },
      { day: 2, minutes: 3, title: "先想起一个人", action: "选一个让你安心的人，写下最近想告诉对方的一句话。" },
      { day: 3, minutes: 3, title: "发出轻轻的联结", action: "给一个重要的人发条不带任务的问候，具体问问近况。" },
      { day: 4, minutes: 4, title: "把手机放远一点", action: "和人说话时，四分钟不碰手机，只看着对方听完。" },
      { day: 5, minutes: 3, title: "多问半句", action: "当对方说完，多问一句“那对你意味着什么？”" },
      { day: 6, minutes: 5, title: "说一件真心事", action: "分享一个最近真实的小感受，不解释，也不包装。" },
      { day: 7, minutes: 5, title: "留住一段关系", action: "写下本周一次被接住的时刻，并决定下一次主动靠近。" }
    ]
  }
});

const TRAINING_DIRECTION_BY_DIMENSION = Object.freeze({
  P: "mindset",
  E: "inward",
  R: "relationship",
  M: "mindset",
  A: "mindset"
});

const RESULT_MESSAGES = Object.freeze({
  low: {
    title: "先看见此刻，不急着得出结论。",
    summary: "五个维度里，有几处最近出现得更少。先不用急着做什么，看看它们在哪里。"
  },
  mid: {
    title: "有些部分比较稳定，有些值得多看一眼。",
    summary: "五个维度有轻有重。把注意力放到较轻的地方，看看最近少了什么。"
  },
  high: {
    title: "大部分维度比较稳定，仍然各有轻重。",
    summary: "你最近常能感到几种生活支点。较轻的那一处，也值得继续照看。"
  }
});

const RADAR_CENTER = 160;
const RADAR_RADIUS = 106;

function scoreDimension(values) {
  if (!Array.isArray(values) || values.length !== 3 || values.some((value) => !Number.isInteger(value) || value < 1 || value > 7)) {
    throw new TypeError("Each dimension needs three answers from 1 to 7.");
  }

  const sum = values.reduce((total, value) => total + value, 0);
  return Math.round(((sum - 3) / 18) * 100);
}

function calculateResults(answers) {
  if (!Array.isArray(answers) || answers.length !== QUESTIONS.length) {
    throw new TypeError("A complete answer set is required.");
  }

  const scores = Object.fromEntries(DIMENSION_ORDER.map((dimension) => {
    const values = QUESTIONS
      .map((question, index) => ({ question, value: answers[index] }))
      .filter(({ question }) => question.dimension === dimension)
      .map(({ value }) => value);

    return [dimension, scoreDimension(values)];
  }));
  const answerSum = answers.reduce((sum, value) => sum + value, 0);
  const total = Math.round(((answerSum - QUESTIONS.length) / (QUESTIONS.length * 6)) * 100);

  return { total, scores };
}

function rankWeakDimensions(scores) {
  return [...DIMENSION_ORDER].sort((first, second) => {
    const scoreDifference = scores[first] - scores[second];
    return scoreDifference || TIE_PRIORITY.indexOf(first) - TIE_PRIORITY.indexOf(second);
  });
}

function selectWeakDimensions(scores) {
  const ranked = rankWeakDimensions(scores);
  const closeSecond = scores[ranked[1]] - scores[ranked[0]] <= 8;
  return ranked.slice(0, closeSecond ? 2 : 1);
}

function getTrainingDirection(dimension) {
  return TRAINING_DIRECTION_BY_DIMENSION[dimension] || "mindset";
}

function getBreathPhaseAt(elapsedSeconds) {
  const cycleSeconds = BREATH_PHASES.reduce((total, phase) => total + phase.seconds, 0);
  const safeElapsed = Number.isFinite(elapsedSeconds) ? Math.max(0, elapsedSeconds) : 0;
  const position = safeElapsed % cycleSeconds;
  let phaseStart = 0;

  for (const phase of BREATH_PHASES) {
    if (position < phaseStart + phase.seconds) {
      return {
        label: phase.label,
        remaining: Math.max(1, Math.ceil(phaseStart + phase.seconds - position))
      };
    }
    phaseStart += phase.seconds;
  }

  return { label: BREATH_PHASES[0].label, remaining: BREATH_PHASES[0].seconds };
}

function formatCountdown(remainingSeconds) {
  const totalSeconds = Math.max(0, Math.ceil(Number.isFinite(remainingSeconds) ? remainingSeconds : 0));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function normalizeStoredState(rawState = {}) {
  const sourceAnswers = Array.isArray(rawState.answers) ? rawState.answers : [];
  const answers = Array.from({ length: QUESTIONS.length }, (_, index) => {
    const value = sourceAnswers[index];
    return Number.isInteger(value) && value >= 1 && value <= 7 ? value : null;
  });
  const firstUnanswered = answers.findIndex((value) => value === null);
  const isComplete = firstUnanswered === -1;
  const results = isComplete ? calculateResults(answers) : null;
  const weakest = results ? rankWeakDimensions(results.scores)[0] : null;

  return {
    answers,
    currentQuestion: isComplete ? QUESTIONS.length - 1 : Math.max(0, firstUnanswered),
    results,
    completedAt: results && typeof rawState.completedAt === "string" ? rawState.completedAt : null,
    planDirection: weakest ? getTrainingDirection(weakest) : null,
    practiceCompleted: isComplete && rawState.practiceCompleted === true
  };
}

function getDrivingSubject(subjectInput) {
  const subjectId = typeof subjectInput === "string" ? subjectInput : subjectInput?.id;
  const metadata = DRIVING_DATA?.subjects?.[subjectId];
  if (!metadata) throw new RangeError(`Unknown driving subject: ${String(subjectId)}`);

  const dimensions = metadata.dimension_codes.map((code) => {
    const dimension = DRIVING_DATA.dimensions.find((candidate) => candidate.code === code);
    if (!dimension) throw new RangeError(`Missing driving dimension: ${code}`);
    return dimension;
  });

  return {
    ...metadata,
    dimensions,
    questions: dimensions.flatMap((dimension) => dimension.items)
  };
}

function randomIndex(maxExclusive, random) {
  const roll = Number(random());
  const safeRoll = Number.isFinite(roll) ? Math.min(Math.max(roll, 0), 0.9999999999999999) : 0;
  return Math.floor(safeRoll * maxExclusive);
}

function createOptionOrders(questionCount, random = Math.random) {
  if (!Number.isInteger(questionCount) || questionCount < 0 || typeof random !== "function") {
    throw new TypeError("questionCount must be a non-negative integer and random must be a function.");
  }

  return Array.from({ length: questionCount }, () => {
    const order = [2, 1, 0];
    for (let index = order.length - 1; index > 0; index -= 1) {
      const swapIndex = randomIndex(index + 1, random);
      [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
    }
    return order;
  });
}

function isValidOptionOrder(order) {
  return Array.isArray(order)
    && order.length === 3
    && [...order].sort((first, second) => first - second).every((value, index) => value === index);
}

function calculateDrivingResults(subjectInput, answers) {
  const subject = getDrivingSubject(subjectInput);
  if (!Array.isArray(answers)
    || answers.length !== subject.questions.length
    || answers.some((value) => !Number.isInteger(value) || value < 0 || value > 2)) {
    throw new TypeError(`A complete ${subject.questions.length}-answer set using 0, 1 or 2 is required.`);
  }

  let answerOffset = 0;
  const scores = {};
  subject.dimensions.forEach((dimension) => {
    const values = answers.slice(answerOffset, answerOffset + dimension.items.length);
    const maximum = dimension.items.length * 2;
    scores[dimension.code] = Math.round((values.reduce((sum, value) => sum + value, 0) / maximum) * 100);
    answerOffset += dimension.items.length;
  });
  const total = Math.round(
    subject.dimension_codes.reduce((sum, code) => sum + scores[code], 0) / subject.dimension_codes.length
  );
  const weakest = subject.dimension_codes.reduce((current, code) => (
    scores[code] < scores[current] ? code : current
  ), subject.dimension_codes[0]);
  const deductions = subject.questions.flatMap((question, index) => answers[index] === 0 ? [{
    id: question.id,
    subjectId: subject.id,
    dimension: question.dimension || question.id.split("-")[0],
    text: question.text,
    selectedText: question.options.find((option) => option.value === 0).text,
    copy: question.deduction,
    points: 8
  }] : []);
  const hazards = deductions.flatMap((deduction) => {
    const question = subject.questions.find((candidate) => candidate.id === deduction.id);
    return question.hazard ? [{ ...deduction, hazard: question.hazard }] : [];
  });

  return { subjectId: subject.id, total, scores, weakest, deductions, hazards };
}

function normalizeDrivingState(rawState = {}, subjectInput, random = Math.random) {
  rawState = rawState && typeof rawState === "object" && !Array.isArray(rawState) ? rawState : {};
  const subject = getDrivingSubject(subjectInput);
  const sourceAnswers = Array.isArray(rawState.answers) ? rawState.answers : [];
  const answers = Array.from({ length: subject.questions.length }, (_, index) => {
    const value = sourceAnswers[index];
    return Number.isInteger(value) && value >= 0 && value <= 2 ? value : null;
  });
  const sourceOrders = Array.isArray(rawState.optionOrders) ? rawState.optionOrders : [];
  const optionOrders = Array.from({ length: subject.questions.length }, (_, index) => (
    isValidOptionOrder(sourceOrders[index])
      ? [...sourceOrders[index]]
      : createOptionOrders(1, random)[0]
  ));
  const firstUnanswered = answers.findIndex((answer) => answer === null);
  const isComplete = firstUnanswered === -1;
  const results = isComplete ? calculateDrivingResults(subject.id, answers) : null;

  return {
    answers,
    currentQuestion: isComplete ? subject.questions.length - 1 : Math.max(0, firstUnanswered),
    optionOrders,
    results,
    completedAt: results && typeof rawState.completedAt === "string" ? rawState.completedAt : null,
    planDimension: results ? results.weakest : null,
    practiceCompleted: Boolean(results && rawState.practiceCompleted === true)
  };
}

function getLicenseGrade(score) {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new RangeError("License score must be from 0 to 100.");
  }
  return DRIVING_DATA.grades.find((grade) => score >= grade.min);
}

function calculateLicense(s2Results, s3Results) {
  if (!s2Results || !s3Results || !Number.isFinite(s2Results.total) || !Number.isFinite(s3Results.total)) {
    throw new TypeError("Two completed subject results are required.");
  }
  const score = Math.round((s2Results.total + s3Results.total) / 2);
  const deductions = [...(s2Results.deductions || []), ...(s3Results.deductions || [])];
  const hazards = [...(s2Results.hazards || []), ...(s3Results.hazards || [])];
  return {
    score,
    deductionTotal: 100 - score,
    deductionCount: deductions.length,
    hazardCount: hazards.length,
    deductions,
    hazards,
    grade: getLicenseGrade(score)
  };
}

function canIssueLicense(s2State, s3State) {
  return Boolean(s2State?.results && s3State?.results);
}

let appState = null;
let elements = {};
let activeScreen = "home";
let screenTransitionTimer = null;
let questionTransitionTimer = null;
let scoreAnimationFrame = null;
let scoreAnimationTimer = null;
let breathTimer = null;
let breathStartedAt = 0;
let isScreenTransitioning = false;
let isQuestionTransitioning = false;
let storageAvailable = true;
let drivingStates = { s2: null, s3: null };
let drivingStorageAvailable = { s2: true, s3: true };
let activeDrivingSubjectId = null;
let drivingQuestionTransitionTimer = null;
let isDrivingQuestionTransitioning = false;
let drivingScoreAnimationFrame = null;
let drivingScoreAnimationTimer = null;
let currentPlanContext = { type: "perma" };

function initApp() {
  elements = {
    screens: [...document.querySelectorAll("[data-screen]")].filter((element) => element.classList.contains("screen")),
    subjectCards: Object.fromEntries(["s1", "s2", "s3"].map((subjectId) => [subjectId, {
      card: document.querySelector(`[data-subject-card='${subjectId}']`),
      status: document.querySelector(`#${subjectId}Status`),
      score: document.querySelector(`#${subjectId}Score`),
      label: document.querySelector(`#${subjectId}ActionLabel`),
      retake: document.querySelector(`[data-subject='${subjectId}'][data-subject-action='retake']`)
    }])),
    licenseEntry: document.querySelector("#licenseEntry"),
    licenseButton: document.querySelector("#licenseButton"),
    quizBackButton: document.querySelector("#quizBackButton"),
    questionNumber: document.querySelector("#questionNumber"),
    quizProgress: document.querySelector("#quizProgress"),
    questionStage: document.querySelector("#questionStage"),
    questionDimension: document.querySelector("#questionDimension"),
    questionText: document.querySelector("#questionText"),
    scaleOptions: document.querySelector("#scaleOptions"),
    scaleHint: document.querySelector("#scaleHint"),
    totalScore: document.querySelector("#totalScore"),
    resultTitle: document.querySelector("#result-title"),
    resultSummary: document.querySelector("#resultSummary"),
    radarChart: document.querySelector("#radarChart"),
    dimensionInsights: document.querySelector("#dimensionInsights"),
    viewPlanButton: document.querySelector("#viewPlanButton"),
    retakeButton: document.querySelector("#retakeButton"),
    drivingQuizBackButton: document.querySelector("#drivingQuizBackButton"),
    drivingSubjectLabel: document.querySelector("#drivingSubjectLabel"),
    drivingQuestionNumber: document.querySelector("#drivingQuestionNumber"),
    drivingQuizProgress: document.querySelector("#drivingQuizProgress"),
    drivingQuestionStage: document.querySelector("#drivingQuestionStage"),
    drivingQuestionDimension: document.querySelector("#drivingQuestionDimension"),
    drivingQuestionText: document.querySelector("#drivingQuestionText"),
    drivingOptions: document.querySelector("#drivingOptions"),
    drivingQuestionHint: document.querySelector("#drivingQuestionHint"),
    drivingQuestionSource: document.querySelector("#drivingQuestionSource"),
    drivingResultMeta: document.querySelector("#drivingResultMeta"),
    drivingResultKicker: document.querySelector("#drivingResultKicker"),
    drivingTotalScore: document.querySelector("#drivingTotalScore"),
    drivingResultTitle: document.querySelector("#driving-result-title"),
    drivingResultSummary: document.querySelector("#drivingResultSummary"),
    drivingDimensionBars: document.querySelector("#drivingDimensionBars"),
    drivingWeakLabel: document.querySelector("#drivingWeakLabel"),
    drivingWeakInsight: document.querySelector("#drivingWeakInsight"),
    drivingDeductionList: document.querySelector("#drivingDeductionList"),
    drivingDeductionEmpty: document.querySelector("#drivingDeductionEmpty"),
    drivingHazardSection: document.querySelector("#drivingHazardSection"),
    drivingHazardList: document.querySelector("#drivingHazardList"),
    drivingHazardClear: document.querySelector("#drivingHazardClear"),
    drivingPlanButton: document.querySelector("#drivingPlanButton"),
    drivingRetakeButton: document.querySelector("#drivingRetakeButton"),
    planBackButton: document.querySelector("#planBackButton"),
    planNavMeta: document.querySelector("#planNavMeta"),
    planKicker: document.querySelector("#planKicker"),
    planName: document.querySelector("#planName"),
    planTypeLabel: document.querySelector("#planTypeLabel"),
    planDescription: document.querySelector("#planDescription"),
    trainingTimeline: document.querySelector("#trainingTimeline"),
    closeBreatheButton: document.querySelector("#closeBreatheButton"),
    breathOrbit: document.querySelector("#breathOrbit"),
    breathPhase: document.querySelector("#breathPhase"),
    breathCountdown: document.querySelector("#breathCountdown"),
    breathPattern: document.querySelector("#breathPattern"),
    breathControls: document.querySelector(".breath-controls"),
    startBreathButton: document.querySelector("#startBreathButton"),
    backToPlanButton: document.querySelector("#backToPlanButton"),
    licenseCard: document.querySelector("#licenseCard"),
    licenseScore: document.querySelector("#licenseScore"),
    licenseGrade: document.querySelector("#licenseGrade"),
    licenseMessage: document.querySelector("#licenseMessage"),
    licenseS2Score: document.querySelector("#licenseS2Score"),
    licenseS3Score: document.querySelector("#licenseS3Score"),
    licenseDeductionTotal: document.querySelector("#licenseDeductionTotal"),
    licenseDeductionCount: document.querySelector("#licenseDeductionCount"),
    licenseIssuedAt: document.querySelector("#licenseIssuedAt"),
    licenseSerial: document.querySelector("#licenseSerial"),
    licenseRetestList: document.querySelector("#licenseRetestList"),
    licenseStableMessage: document.querySelector("#licenseStableMessage")
  };

  appState = loadStoredState();
  drivingStates = {
    s2: loadDrivingStoredState("s2"),
    s3: loadDrivingStoredState("s3")
  };
  bindEvents();
  updateHomeState();
  renderQuestion();
}

function bindEvents() {
  document.querySelectorAll("[data-subject-action]").forEach((button) => {
    button.addEventListener("click", () => handleSubjectAction(button.dataset.subject, button.dataset.subjectAction));
  });
  elements.licenseButton.addEventListener("click", openLicense);
  elements.quizBackButton.addEventListener("click", goToPreviousQuestion);
  elements.scaleOptions.addEventListener("keydown", handleScaleKeys);
  elements.viewPlanButton.addEventListener("click", openTrainingPlan);
  elements.retakeButton.addEventListener("click", restartAssessment);
  elements.drivingQuizBackButton.addEventListener("click", goToPreviousDrivingQuestion);
  elements.drivingOptions.addEventListener("keydown", handleDrivingOptionKeys);
  elements.drivingPlanButton.addEventListener("click", openDrivingTrainingPlan);
  elements.drivingRetakeButton.addEventListener("click", () => restartDrivingSubject(activeDrivingSubjectId));
  elements.planBackButton.addEventListener("click", returnToHome);
  elements.closeBreatheButton.addEventListener("click", exitBreathingPractice);
  elements.startBreathButton.addEventListener("click", startBreathingPractice);
  elements.backToPlanButton.addEventListener("click", returnToHome);
  document.querySelectorAll("[data-action='home']").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      returnToHome();
    });
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && breathTimer) updateBreathClock();
  });
  window.addEventListener("pagehide", () => {
    persistState();
    persistDrivingState("s2");
    persistDrivingState("s3");
  });
}

function loadStoredState() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    storageAvailable = true;
    return normalizeStoredState(saved ? JSON.parse(saved) : {});
  } catch (_error) {
    storageAvailable = false;
    return normalizeStoredState({});
  }
}

function persistState() {
  if (!appState) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    storageAvailable = true;
    return true;
  } catch (_error) {
    storageAvailable = false;
    return false;
  }
}

function loadDrivingStoredState(subjectId) {
  let saved = null;
  try {
    saved = window.localStorage.getItem(DRIVING_STORAGE_KEYS[subjectId]);
    drivingStorageAvailable[subjectId] = true;
  } catch (_error) {
    drivingStorageAvailable[subjectId] = false;
  }

  let rawState = {};
  if (saved) {
    try {
      rawState = JSON.parse(saved);
    } catch (_error) {
      rawState = {};
    }
  }
  return normalizeDrivingState(rawState, subjectId);
}

function persistDrivingState(subjectId) {
  if (!drivingStates[subjectId]) return false;
  try {
    window.localStorage.setItem(DRIVING_STORAGE_KEYS[subjectId], JSON.stringify(drivingStates[subjectId]));
    drivingStorageAvailable[subjectId] = true;
    return true;
  } catch (_error) {
    drivingStorageAvailable[subjectId] = false;
    return false;
  }
}

function updateSubjectCard(subjectId, state, totalQuestions) {
  const controls = elements.subjectCards[subjectId];
  const answeredCount = state.answers.filter((answer) => answer !== null).length;
  const subjectNumber = subjectId === "s1" ? "一" : subjectId === "s2" ? "二" : "三";
  controls.card.classList.toggle("is-complete", Boolean(state.results));
  controls.card.classList.toggle("is-progress", !state.results && answeredCount > 0);

  if (state.results) {
    controls.status.textContent = "已完成";
    controls.score.textContent = `${state.results.total} 分`;
    controls.score.hidden = false;
    controls.label.textContent = "查看报告";
    controls.retake.hidden = false;
    return;
  }
  controls.score.hidden = true;
  controls.retake.hidden = answeredCount === 0;
  if (answeredCount > 0) {
    controls.status.textContent = `进行中 · ${answeredCount}/${totalQuestions}`;
    controls.label.textContent = `继续科目${subjectNumber}`;
    return;
  }
  controls.status.textContent = "未开始";
  controls.label.textContent = `开始科目${subjectNumber}`;
}

function updateHomeState() {
  updateSubjectCard("s1", appState, QUESTIONS.length);
  updateSubjectCard("s2", drivingStates.s2, getDrivingSubject("s2").questions.length);
  updateSubjectCard("s3", drivingStates.s3, getDrivingSubject("s3").questions.length);
  elements.licenseEntry.hidden = !canIssueLicense(drivingStates.s2, drivingStates.s3);
}

function handleSubjectAction(subjectId, action) {
  if (action === "retake") {
    if (subjectId === "s1") restartAssessment();
    else restartDrivingSubject(subjectId);
    return;
  }
  if (subjectId === "s1") handlePrimaryStart();
  else openDrivingSubject(subjectId);
}

function returnToHome() {
  stopBreathingPractice();
  stopScoreAnimation();
  stopDrivingScoreAnimation();
  updateHomeState();
  showScreen("home");
}

function handlePrimaryStart() {
  if (appState.results) {
    openResult();
    return;
  }

  const firstUnanswered = appState.answers.findIndex((answer) => answer === null);
  if (firstUnanswered >= 0 && appState.answers[appState.currentQuestion] !== null) {
    appState.currentQuestion = firstUnanswered;
  }
  renderQuestion();
  showScreen("quiz");
}

function restartAssessment() {
  appState = normalizeStoredState({});
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    storageAvailable = true;
  } catch (_error) {
    storageAvailable = false;
  }
  updateHomeState();
  renderQuestion();
  showScreen("quiz");
}

function renderQuestion() {
  const index = appState.currentQuestion;
  const question = QUESTIONS[index];
  const dimension = DIMENSIONS[question.dimension];
  const selectedValue = appState.answers[index];

  elements.questionNumber.textContent = String(index + 1).padStart(2, "0");
  elements.quizProgress.style.width = `${((index + 1) / QUESTIONS.length) * 100}%`;
  elements.questionDimension.textContent = `${question.dimension} · ${dimension.name}`;
  elements.questionText.textContent = question.text;
  elements.quizBackButton.setAttribute("aria-label", index === 0 ? "返回首页" : "返回上一题");
  elements.scaleOptions.replaceChildren(...SCALE_LABELS.map((label, labelIndex) => {
    const value = labelIndex + 1;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "scale-option";
    button.textContent = String(value);
    button.setAttribute("aria-label", `${value}，${label}`);
    button.setAttribute("aria-pressed", String(selectedValue === value));
    button.tabIndex = selectedValue ? (selectedValue === value ? 0 : -1) : (value === 1 ? 0 : -1);
    if (selectedValue === value) button.classList.add("is-selected");
    button.addEventListener("click", () => chooseAnswer(value));
    return button;
  }));
  elements.scaleHint.textContent = selectedValue ? SCALE_LABELS[selectedValue - 1] : "选择后自动进入下一题";
}

function handleScaleKeys(event) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
  event.preventDefault();
  const buttons = [...elements.scaleOptions.querySelectorAll(".scale-option")];
  const currentIndex = Math.max(0, buttons.indexOf(document.activeElement));
  const step = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
  const nextIndex = (currentIndex + step + buttons.length) % buttons.length;
  buttons.forEach((button, index) => { button.tabIndex = index === nextIndex ? 0 : -1; });
  buttons[nextIndex].focus();
}

function chooseAnswer(value) {
  if (isQuestionTransitioning) return;
  const index = appState.currentQuestion;
  appState.answers[index] = value;
  persistState();

  elements.scaleOptions.querySelectorAll(".scale-option").forEach((button, buttonIndex) => {
    const isSelected = buttonIndex + 1 === value;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
  elements.scaleHint.textContent = SCALE_LABELS[value - 1];

  isQuestionTransitioning = true;
  elements.questionStage.classList.add("is-changing");
  questionTransitionTimer = window.setTimeout(() => {
    const isLastQuestion = index === QUESTIONS.length - 1;
    const firstUnanswered = appState.answers.findIndex((answer) => answer === null);

    if (isLastQuestion && firstUnanswered === -1) {
      completeAssessment();
      elements.questionStage.classList.remove("is-changing");
      isQuestionTransitioning = false;
      return;
    }

    appState.currentQuestion = isLastQuestion ? firstUnanswered : index + 1;
    persistState();
    renderQuestion();
    // rAF 在页面不可见时不触发，交互门闩必须同步解除
    elements.questionStage.classList.remove("is-changing");
    elements.questionText.focus({ preventScroll: true });
    isQuestionTransitioning = false;
  }, QUESTION_TRANSITION_MS);
}

function goToPreviousQuestion() {
  if (isQuestionTransitioning) return;
  if (appState.currentQuestion === 0) {
    updateHomeState();
    showScreen("home");
    return;
  }

  transitionQuestionTo(appState.currentQuestion - 1);
}

function transitionQuestionTo(index) {
  isQuestionTransitioning = true;
  elements.questionStage.classList.add("is-changing");
  window.clearTimeout(questionTransitionTimer);
  questionTransitionTimer = window.setTimeout(() => {
    appState.currentQuestion = index;
    persistState();
    renderQuestion();
    elements.questionStage.classList.remove("is-changing");
    elements.questionText.focus({ preventScroll: true });
    isQuestionTransitioning = false;
  }, QUESTION_TRANSITION_MS);
}

function completeAssessment() {
  appState.results = calculateResults(appState.answers);
  appState.completedAt = new Date().toISOString();
  const weakest = rankWeakDimensions(appState.results.scores)[0];
  appState.planDirection = getTrainingDirection(weakest);
  persistState();
  updateHomeState();
  openResult();
}

function openDrivingSubject(subjectId) {
  const state = drivingStates[subjectId];
  if (!state) return;
  activeDrivingSubjectId = subjectId;
  if (state.results) {
    openDrivingResult(subjectId);
    return;
  }
  const firstUnanswered = state.answers.findIndex((answer) => answer === null);
  if (firstUnanswered >= 0 && state.answers[state.currentQuestion] !== null) {
    state.currentQuestion = firstUnanswered;
  }
  renderDrivingQuestion();
  showScreen("driving-quiz");
}

function restartDrivingSubject(subjectId) {
  if (!DRIVING_STORAGE_KEYS[subjectId]) return;
  drivingStates[subjectId] = normalizeDrivingState({}, subjectId);
  activeDrivingSubjectId = subjectId;
  try {
    window.localStorage.removeItem(DRIVING_STORAGE_KEYS[subjectId]);
    drivingStorageAvailable[subjectId] = true;
  } catch (_error) {
    drivingStorageAvailable[subjectId] = false;
  }
  updateHomeState();
  renderDrivingQuestion();
  showScreen("driving-quiz");
}

function renderDrivingQuestion() {
  if (!activeDrivingSubjectId) return;
  const subject = getDrivingSubject(activeDrivingSubjectId);
  const state = drivingStates[activeDrivingSubjectId];
  const index = state.currentQuestion;
  const question = subject.questions[index];
  const dimensionCode = question.id.split("-")[0];
  const dimension = subject.dimensions.find((candidate) => candidate.code === dimensionCode);
  const selectedValue = state.answers[index];

  elements.drivingSubjectLabel.textContent = `${subject.number} · ${subject.name}`;
  elements.drivingQuestionNumber.textContent = String(index + 1).padStart(2, "0");
  elements.drivingQuizProgress.style.width = `${((index + 1) / subject.questions.length) * 100}%`;
  elements.drivingQuestionDimension.textContent = `${dimension.code} · ${dimension.name}`;
  elements.drivingQuestionText.textContent = question.text;
  elements.drivingQuestionSource.textContent = `题源 · ${question.source}`;
  elements.drivingQuizBackButton.setAttribute("aria-label", index === 0 ? "返回科目选择" : "返回上一题");

  const buttons = state.optionOrders[index].map((value, visualIndex) => {
    const option = question.options.find((candidate) => candidate.value === value);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "driving-option";
    button.dataset.value = String(value);
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(selectedValue === value));
    button.tabIndex = selectedValue === null ? (visualIndex === 0 ? 0 : -1) : (selectedValue === value ? 0 : -1);
    if (selectedValue === value) button.classList.add("is-selected");

    const mark = document.createElement("span");
    mark.className = "driving-option__mark";
    mark.textContent = String(visualIndex + 1).padStart(2, "0");
    mark.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.className = "driving-option__text";
    text.textContent = option.text;
    button.append(mark, text);
    button.addEventListener("click", () => chooseDrivingAnswer(value));
    return button;
  });
  elements.drivingOptions.replaceChildren(...buttons);
  elements.drivingQuestionHint.textContent = selectedValue === null
    ? "选择后 250ms 自动进入下一题"
    : `已选择 · ${question.options.find((option) => option.value === selectedValue).text}`;
}

function handleDrivingOptionKeys(event) {
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
  event.preventDefault();
  const buttons = [...elements.drivingOptions.querySelectorAll(".driving-option")];
  if (!buttons.length) return;
  const currentIndex = Math.max(0, buttons.indexOf(document.activeElement));
  const step = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1;
  const nextIndex = (currentIndex + step + buttons.length) % buttons.length;
  buttons.forEach((button, index) => { button.tabIndex = index === nextIndex ? 0 : -1; });
  buttons[nextIndex].focus();
}

function chooseDrivingAnswer(value) {
  if (isDrivingQuestionTransitioning || !activeDrivingSubjectId) return;
  const subject = getDrivingSubject(activeDrivingSubjectId);
  const state = drivingStates[activeDrivingSubjectId];
  const index = state.currentQuestion;
  state.answers[index] = value;
  persistDrivingState(activeDrivingSubjectId);

  elements.drivingOptions.querySelectorAll(".driving-option").forEach((button) => {
    const isSelected = Number(button.dataset.value) === value;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-checked", String(isSelected));
  });
  const question = subject.questions[index];
  elements.drivingQuestionHint.textContent = `已选择 · ${question.options.find((option) => option.value === value).text}`;

  isDrivingQuestionTransitioning = true;
  elements.drivingQuestionStage.classList.add("is-changing");
  window.clearTimeout(drivingQuestionTransitionTimer);
  drivingQuestionTransitionTimer = window.setTimeout(() => {
    const isLastQuestion = index === subject.questions.length - 1;
    const firstUnanswered = state.answers.findIndex((answer) => answer === null);
    if (isLastQuestion && firstUnanswered === -1) {
      completeDrivingSubject();
      elements.drivingQuestionStage.classList.remove("is-changing");
      isDrivingQuestionTransitioning = false;
      return;
    }

    state.currentQuestion = isLastQuestion ? firstUnanswered : index + 1;
    persistDrivingState(activeDrivingSubjectId);
    renderDrivingQuestion();
    // 页面不可见时 rAF 会暂停，门闩在定时器回调中直接解除
    elements.drivingQuestionStage.classList.remove("is-changing");
    elements.drivingQuestionText.focus({ preventScroll: true });
    isDrivingQuestionTransitioning = false;
  }, QUESTION_TRANSITION_MS);
}

function goToPreviousDrivingQuestion() {
  if (isDrivingQuestionTransitioning || !activeDrivingSubjectId) return;
  const state = drivingStates[activeDrivingSubjectId];
  if (state.currentQuestion === 0) {
    returnToHome();
    return;
  }
  transitionDrivingQuestionTo(state.currentQuestion - 1);
}

function transitionDrivingQuestionTo(index) {
  isDrivingQuestionTransitioning = true;
  elements.drivingQuestionStage.classList.add("is-changing");
  window.clearTimeout(drivingQuestionTransitionTimer);
  drivingQuestionTransitionTimer = window.setTimeout(() => {
    const state = drivingStates[activeDrivingSubjectId];
    state.currentQuestion = index;
    persistDrivingState(activeDrivingSubjectId);
    renderDrivingQuestion();
    elements.drivingQuestionStage.classList.remove("is-changing");
    elements.drivingQuestionText.focus({ preventScroll: true });
    isDrivingQuestionTransitioning = false;
  }, QUESTION_TRANSITION_MS);
}

function completeDrivingSubject() {
  const state = drivingStates[activeDrivingSubjectId];
  state.results = calculateDrivingResults(activeDrivingSubjectId, state.answers);
  state.completedAt = new Date().toISOString();
  state.planDimension = state.results.weakest;
  persistDrivingState(activeDrivingSubjectId);
  updateHomeState();
  openDrivingResult(activeDrivingSubjectId);
}

function drivingResultMessage(total) {
  if (total >= 85) return {
    title: "这段路开得稳，细节也经得住看。",
    summary: "守住已经做对的动作，再把扣分项当作下一段陪练路线。"
  };
  if (total >= 70) return {
    title: "大部分路段稳定，偶尔还有小剐蹭。",
    summary: "不用面面俱到，从最弱的一段和具体扣分项开始补练。"
  };
  if (total >= 55) return {
    title: "已经上路，几个路口还不太熟。",
    summary: "一次只练一个动作，比给自己贴结论更有用。"
  };
  return {
    title: "这段路先慢一点，别急着独自扛。",
    summary: "把结果放到家人之间认真聊一聊，先共同处理最弱的一段。"
  };
}

function openDrivingResult(subjectId = activeDrivingSubjectId) {
  if (!subjectId || !drivingStates[subjectId]?.results) return;
  activeDrivingSubjectId = subjectId;
  stopDrivingScoreAnimation();
  renderDrivingResult();
  showScreen("driving-result");
  drivingScoreAnimationTimer = window.setTimeout(
    () => animateDrivingScore(drivingStates[subjectId].results.total),
    SCREEN_TRANSITION_MS * 0.55
  );
}

function renderDrivingResult() {
  const subject = getDrivingSubject(activeDrivingSubjectId);
  const state = drivingStates[activeDrivingSubjectId];
  const { total, scores, weakest, deductions, hazards } = state.results;
  const message = drivingResultMessage(total);
  const weakestDimension = subject.dimensions.find((dimension) => dimension.code === weakest);

  elements.drivingResultMeta.textContent = `${subject.number} · 报告`;
  elements.drivingResultKicker.textContent = `${subject.name} · 本次科目分`;
  elements.drivingTotalScore.value = "0";
  elements.drivingTotalScore.textContent = "0";
  elements.drivingResultTitle.textContent = message.title;
  elements.drivingResultSummary.textContent = message.summary;
  elements.drivingWeakLabel.textContent = `${weakestDimension.code} · ${weakestDimension.name} · 本次较弱`;
  elements.drivingWeakInsight.textContent = weakestDimension.insight_low;

  const bars = subject.dimensions.map((dimension, index) => {
    const row = document.createElement("article");
    row.className = `driving-bar${dimension.code === weakest ? " is-weak" : ""}`;
    row.style.setProperty("--bar-delay", `${120 + (index * 110)}ms`);
    const head = document.createElement("div");
    head.className = "driving-bar__head";
    const name = document.createElement("span");
    name.textContent = `${dimension.code} · ${dimension.name}`;
    const score = document.createElement("strong");
    score.textContent = String(scores[dimension.code]);
    head.append(name, score);
    const track = document.createElement("div");
    track.className = "driving-bar__track";
    track.setAttribute("role", "meter");
    track.setAttribute("aria-label", `${dimension.name} ${scores[dimension.code]} 分`);
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    track.setAttribute("aria-valuenow", String(scores[dimension.code]));
    const fill = document.createElement("span");
    fill.style.setProperty("--bar-score", `${scores[dimension.code]}%`);
    track.append(fill);
    row.append(head, track);
    return row;
  });
  elements.drivingDimensionBars.replaceChildren(...bars);

  const deductionItems = deductions.map((deduction) => {
    const item = document.createElement("li");
    const points = document.createElement("strong");
    points.textContent = `扣 ${deduction.points} 分`;
    const copy = document.createElement("p");
    copy.textContent = deduction.copy;
    const answer = document.createElement("span");
    answer.textContent = `本题选择：${deduction.selectedText}`;
    item.append(points, copy, answer);
    return item;
  });
  elements.drivingDeductionList.replaceChildren(...deductionItems);
  elements.drivingDeductionEmpty.hidden = deductions.length > 0;

  const hazardItems = hazards.map((hazard) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = hazard.hazard;
    const detail = document.createElement("span");
    detail.textContent = hazard.selectedText;
    item.append(title, detail);
    return item;
  });
  elements.drivingHazardList.replaceChildren(...hazardItems);
  elements.drivingHazardSection.classList.toggle("is-on", hazards.length > 0);
  elements.drivingHazardClear.hidden = hazards.length > 0;
}

function animateDrivingScore(target) {
  window.clearTimeout(drivingScoreAnimationTimer);
  drivingScoreAnimationTimer = null;
  window.cancelAnimationFrame(drivingScoreAnimationFrame);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.drivingTotalScore.value = String(target);
    elements.drivingTotalScore.textContent = String(target);
    return;
  }
  const startedAt = performance.now();
  const duration = 1050;
  const tick = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const value = Math.round(target * (1 - ((1 - progress) ** 3)));
    elements.drivingTotalScore.value = String(value);
    elements.drivingTotalScore.textContent = String(value);
    if (progress < 1) drivingScoreAnimationFrame = window.requestAnimationFrame(tick);
  };
  drivingScoreAnimationFrame = window.requestAnimationFrame(tick);
  drivingScoreAnimationTimer = window.setTimeout(() => {
    elements.drivingTotalScore.value = String(target);
    elements.drivingTotalScore.textContent = String(target);
  }, duration + 250);
}

function stopDrivingScoreAnimation() {
  window.clearTimeout(drivingScoreAnimationTimer);
  window.cancelAnimationFrame(drivingScoreAnimationFrame);
  drivingScoreAnimationTimer = null;
  drivingScoreAnimationFrame = null;
}

function resolveLicenseIssuedAt(values, fallback = new Date()) {
  const completedTimes = Array.isArray(values) ? values
    .map((value) => typeof value === "string" && value ? Date.parse(value) : Number.NaN)
    .filter(Number.isFinite) : [];
  const fallbackTime = fallback instanceof Date ? fallback.getTime() : Date.parse(fallback);
  const safeFallbackTime = Number.isFinite(fallbackTime) ? fallbackTime : Date.now();
  return new Date(completedTimes.length ? Math.max(...completedTimes) : safeFallbackTime);
}

function formatIssuedDate(value) {
  const date = new Date(value);
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  return `${safeDate.getFullYear()}年${safeDate.getMonth() + 1}月${safeDate.getDate()}日`;
}

function renderLicense() {
  const license = calculateLicense(drivingStates.s2.results, drivingStates.s3.results);
  const issuedAt = resolveLicenseIssuedAt([drivingStates.s2.completedAt, drivingStates.s3.completedAt]);
  const dateCode = `${issuedAt.getFullYear()}${String(issuedAt.getMonth() + 1).padStart(2, "0")}${String(issuedAt.getDate()).padStart(2, "0")}`;

  elements.licenseScore.value = String(license.score);
  elements.licenseScore.textContent = String(license.score);
  elements.licenseGrade.textContent = license.grade.name;
  elements.licenseMessage.textContent = license.grade.message;
  elements.licenseS2Score.textContent = `${drivingStates.s2.results.total} 分`;
  elements.licenseS3Score.textContent = `${drivingStates.s3.results.total} 分`;
  elements.licenseDeductionTotal.textContent = `${license.deductionTotal} 分`;
  elements.licenseDeductionCount.textContent = `${license.deductionCount} 项`;
  elements.licenseIssuedAt.textContent = formatIssuedDate(issuedAt);
  elements.licenseSerial.textContent = `NO. HF-${dateCode}-${String(drivingStates.s2.results.total).padStart(3, "0")}${String(drivingStates.s3.results.total).padStart(3, "0")}`;

  const reminders = DRIVING_DATA.retest.map((reminder) => {
    const item = document.createElement("li");
    const when = document.createElement("span");
    when.textContent = reminder.when;
    const name = document.createElement("strong");
    name.textContent = reminder.name;
    item.append(when, name);
    return item;
  });
  elements.licenseRetestList.replaceChildren(...reminders);
  elements.licenseStableMessage.textContent = DRIVING_DATA.stable_message;
}

function openLicense() {
  if (!canIssueLicense(drivingStates.s2, drivingStates.s3)) return;
  renderLicense();
  showScreen("license");
}

function openResult() {
  if (!appState.results) return;
  stopScoreAnimation();
  renderResult();
  showScreen("result");
  scoreAnimationTimer = window.setTimeout(() => animateScore(appState.results.total), SCREEN_TRANSITION_MS * 0.55);
}

function renderResult() {
  const { total, scores } = appState.results;
  const message = total < 40 ? RESULT_MESSAGES.low : total < 70 ? RESULT_MESSAGES.mid : RESULT_MESSAGES.high;
  elements.totalScore.value = "0";
  elements.totalScore.textContent = "0";
  elements.resultTitle.textContent = message.title;
  elements.resultSummary.textContent = message.summary;
  renderRadar(scores);
  renderDimensionInsights(scores);
}

function animateScore(target) {
  window.clearTimeout(scoreAnimationTimer);
  scoreAnimationTimer = null;
  window.cancelAnimationFrame(scoreAnimationFrame);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.totalScore.value = String(target);
    elements.totalScore.textContent = String(target);
    return;
  }

  const startedAt = performance.now();
  const duration = 1050;
  const tick = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - ((1 - progress) ** 3);
    const value = Math.round(target * eased);
    elements.totalScore.value = String(value);
    elements.totalScore.textContent = String(value);
    if (progress < 1) scoreAnimationFrame = window.requestAnimationFrame(tick);
  };
  scoreAnimationFrame = window.requestAnimationFrame(tick);
  // 页面不可见时 rAF 暂停，兜底把最终分数落上
  scoreAnimationTimer = window.setTimeout(() => {
    elements.totalScore.value = String(target);
    elements.totalScore.textContent = String(target);
  }, duration + 250);
}

function stopScoreAnimation() {
  window.clearTimeout(scoreAnimationTimer);
  window.cancelAnimationFrame(scoreAnimationFrame);
  scoreAnimationTimer = null;
  scoreAnimationFrame = null;
}

function radarPoint(value, index, radius = RADAR_RADIUS) {
  const angle = ((index * 72) - 90) * (Math.PI / 180);
  const distance = radius * (value / 100);
  return {
    x: RADAR_CENTER + (Math.cos(angle) * distance),
    y: RADAR_CENTER + (Math.sin(angle) * distance)
  };
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

function renderRadar(scores) {
  elements.radarChart.replaceChildren();

  [20, 40, 60, 80, 100].forEach((level) => {
    const points = DIMENSION_ORDER.map((_, index) => radarPoint(level, index));
    elements.radarChart.append(svgElement("polygon", {
      class: "radar-grid",
      points: points.map(({ x, y }) => `${x},${y}`).join(" ")
    }));
  });

  DIMENSION_ORDER.forEach((_, index) => {
    const outer = radarPoint(100, index);
    elements.radarChart.append(svgElement("line", {
      class: "radar-axis",
      x1: RADAR_CENTER,
      y1: RADAR_CENTER,
      x2: outer.x,
      y2: outer.y
    }));
  });

  const scorePoints = DIMENSION_ORDER.map((dimension, index) => radarPoint(scores[dimension], index));
  const shape = svgElement("path", {
    class: "radar-shape",
    d: `${scorePoints.map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ")} Z`,
    pathLength: 1
  });
  elements.radarChart.append(shape);

  scorePoints.forEach(({ x, y }, index) => {
    const dot = svgElement("circle", { class: "radar-dot", cx: x, cy: y, r: 3.2 });
    dot.style.setProperty("--dot-delay", `${720 + (index * 65)}ms`);
    elements.radarChart.append(dot);
  });

  DIMENSION_ORDER.forEach((dimension, index) => {
    const labelPoint = radarPoint(100, index, 137);
    const anchor = labelPoint.x < RADAR_CENTER - 8 ? "end" : labelPoint.x > RADAR_CENTER + 8 ? "start" : "middle";
    const code = svgElement("text", {
      class: "radar-code",
      x: labelPoint.x,
      y: labelPoint.y - 3,
      "text-anchor": anchor
    });
    code.textContent = dimension;
    const name = svgElement("text", {
      class: "radar-name",
      x: labelPoint.x,
      y: labelPoint.y + 10,
      "text-anchor": anchor
    });
    name.textContent = DIMENSIONS[dimension].name;
    elements.radarChart.append(code, name);
  });

  const accessibleSummary = DIMENSION_ORDER.map((dimension) => `${DIMENSIONS[dimension].name} ${scores[dimension]} 分`).join("，");
  elements.radarChart.setAttribute("aria-label", `五维幸福状态雷达图：${accessibleSummary}`);
}

function insightForScore(dimension, score) {
  const band = score < 40 ? "low" : score < 70 ? "mid" : "high";
  return DIMENSIONS[dimension].insights[band];
}

function renderDimensionInsights(scores) {
  const weakDimensions = new Set(selectWeakDimensions(scores));
  const rows = DIMENSION_ORDER.map((dimension, index) => {
    const data = DIMENSIONS[dimension];
    const row = document.createElement("article");
    row.className = `dimension-row${weakDimensions.has(dimension) ? " is-weak" : ""}`;
    row.style.setProperty("--row-delay", `${90 + (index * 80)}ms`);

    const code = document.createElement("span");
    code.className = "dimension-code";
    code.textContent = dimension;

    const heading = document.createElement("div");
    const name = document.createElement("h3");
    name.className = "dimension-name";
    name.textContent = `${data.name} · ${data.short}`;
    heading.append(name);
    if (weakDimensions.has(dimension)) {
      const flag = document.createElement("span");
      flag.className = "dimension-flag";
      flag.textContent = "此刻更需要照看";
      heading.append(flag);
    }

    const score = document.createElement("span");
    score.className = "dimension-score";
    score.textContent = String(scores[dimension]);

    const insight = document.createElement("p");
    insight.className = "dimension-insight";
    insight.textContent = insightForScore(dimension, scores[dimension]);

    row.append(code, heading, score, insight);
    return row;
  });
  elements.dimensionInsights.replaceChildren(...rows);
}

function openTrainingPlan() {
  if (!appState.results) return;
  currentPlanContext = { type: "perma" };
  renderTrainingPlan();
  showScreen("plan");
}

function openDrivingTrainingPlan() {
  if (!activeDrivingSubjectId || !drivingStates[activeDrivingSubjectId]?.results) return;
  const state = drivingStates[activeDrivingSubjectId];
  currentPlanContext = {
    type: "driving",
    subjectId: activeDrivingSubjectId,
    dimension: state.planDimension || state.results.weakest
  };
  renderTrainingPlan();
  showScreen("plan");
}

function renderTrainingPlan() {
  let plan;
  let practiceCompleted;
  if (currentPlanContext.type === "driving") {
    const { subjectId, dimension } = currentPlanContext;
    const subject = getDrivingSubject(subjectId);
    const state = drivingStates[subjectId];
    plan = DRIVING_DATA.plans[dimension];
    state.planDimension = dimension;
    persistDrivingState(subjectId);
    practiceCompleted = state.practiceCompleted;
    elements.planNavMeta.textContent = `${subject.number} · ${dimension} 陪练`;
    elements.planTypeLabel.textContent = "7 天陪练";
  } else {
    const weakest = rankWeakDimensions(appState.results.scores)[0];
    const direction = appState.planDirection || getTrainingDirection(weakest);
    plan = TRAINING_PLANS[direction];
    appState.planDirection = direction;
    persistState();
    practiceCompleted = appState.practiceCompleted;
    elements.planNavMeta.textContent = "科目一 · 为你推荐";
    elements.planTypeLabel.textContent = "7 天微训练";
  }

  elements.planKicker.textContent = plan.kicker;
  elements.planName.textContent = plan.name;
  elements.planDescription.textContent = plan.description;
  const items = plan.days.map((day, index) => {
    const item = document.createElement(day.interactive ? "button" : "article");
    if (day.interactive) item.type = "button";
    item.className = `timeline-item${day.interactive ? " timeline-item--active" : ""}${day.interactive && practiceCompleted ? " is-complete" : ""}`;
    item.style.setProperty("--item-delay", `${80 + (index * 65)}ms`);

    const dayLabel = document.createElement("span");
    dayLabel.className = "timeline-day";
    dayLabel.textContent = String(day.day).padStart(2, "0");

    const content = document.createElement("div");
    content.className = "timeline-content";
    const meta = document.createElement("div");
    meta.className = "timeline-meta";
    meta.innerHTML = `<span>DAY ${String(day.day).padStart(2, "0")}</span><span>${day.minutes} 分钟</span>`;
    const title = document.createElement("h3");
    title.className = "timeline-title";
    title.textContent = day.title;
    const action = document.createElement("p");
    action.className = "timeline-action";
    action.textContent = day.action;
    content.append(meta, title, action);

    if (day.interactive) {
      const cta = document.createElement("span");
      cta.className = "timeline-cta";
      cta.textContent = practiceCompleted ? "再练一次" : "开始练习";
      content.append(cta);
      item.setAttribute("aria-label", `${day.title}，${cta.textContent}`);
      item.addEventListener("click", openBreathingPractice);
    }

    item.append(dayLabel, content);
    return item;
  });
  elements.trainingTimeline.replaceChildren(...items);
}

function openBreathingPractice() {
  stopBreathingPractice();
  elements.breathPhase.textContent = "准备";
  elements.breathCountdown.textContent = "01:00";
  elements.breathCountdown.setAttribute("datetime", "PT1M");
  elements.breathPattern.textContent = "吸气 4 秒 · 屏息 2 秒 · 呼气 6 秒";
  showScreen("breathe");
}

function startBreathingPractice() {
  if (breathTimer) return;
  breathStartedAt = performance.now();
  elements.breathOrbit.classList.add("is-running");
  elements.breathControls.classList.add("is-running");
  updateBreathClock();
  breathTimer = window.setInterval(updateBreathClock, 100);
}

function updateBreathClock() {
  const elapsedSeconds = (performance.now() - breathStartedAt) / 1000;
  const remainingSeconds = Math.max(0, BREATH_TOTAL_SECONDS - elapsedSeconds);
  const displaySeconds = Math.ceil(remainingSeconds);
  elements.breathCountdown.textContent = formatCountdown(remainingSeconds);
  elements.breathCountdown.setAttribute("datetime", `PT${displaySeconds}S`);

  if (remainingSeconds <= 0) {
    finishBreathingPractice();
    return;
  }

  const phase = getBreathPhaseAt(elapsedSeconds);
  elements.breathPhase.textContent = phase.label;
  elements.breathPattern.textContent = `${phase.label} · ${phase.remaining} 秒`;

}

function finishBreathingPractice() {
  stopBreathingPractice(false);
  if (currentPlanContext.type === "driving") {
    const state = drivingStates[currentPlanContext.subjectId];
    state.practiceCompleted = true;
    persistDrivingState(currentPlanContext.subjectId);
  } else {
    appState.practiceCompleted = true;
    persistState();
  }
  showScreen("complete");
}

function stopBreathingPractice(resetDisplay = true) {
  window.clearInterval(breathTimer);
  breathTimer = null;
  if (!elements.breathOrbit) return;
  elements.breathOrbit.classList.remove("is-running");
  elements.breathControls.classList.remove("is-running");
  if (resetDisplay) {
    elements.breathPhase.textContent = "准备";
    elements.breathCountdown.textContent = "01:00";
    elements.breathPattern.textContent = "吸气 4 秒 · 屏息 2 秒 · 呼气 6 秒";
  }
}

function exitBreathingPractice() {
  stopBreathingPractice();
  returnToHome();
}

function showScreen(name) {
  const nextScreen = elements.screens.find((screen) => screen.dataset.screen === name);
  const currentScreen = elements.screens.find((screen) => screen.dataset.screen === activeScreen && !screen.hidden);
  if (!nextScreen || name === activeScreen || isScreenTransitioning) return;

  if (activeScreen === "result" && name !== "result") stopScoreAnimation();
  if (activeScreen === "driving-result" && name !== "driving-result") stopDrivingScoreAnimation();

  document.body.dataset.screen = name;
  window.clearTimeout(screenTransitionTimer);
  window.scrollTo({ top: 0, behavior: "auto" });

  if (!currentScreen) {
    elements.screens.forEach((screen) => {
      const isTarget = screen === nextScreen;
      screen.hidden = !isTarget;
      screen.inert = !isTarget;
      screen.classList.toggle("is-active", isTarget);
      screen.classList.remove("is-leaving");
    });
    activeScreen = name;
    return;
  }

  isScreenTransitioning = true;
  nextScreen.hidden = false;
  nextScreen.classList.remove("is-leaving", "is-active");
  nextScreen.classList.add("is-entering");
  currentScreen.inert = true;
  nextScreen.inert = true;
  currentScreen.style.position = "absolute";
  currentScreen.style.inset = "0 0 auto";
  currentScreen.style.zIndex = "2";

  window.requestAnimationFrame(() => {
    currentScreen.classList.add("is-leaving");
    nextScreen.classList.add("is-active");
  });

  screenTransitionTimer = window.setTimeout(() => {
    currentScreen.hidden = true;
    currentScreen.classList.remove("is-active", "is-leaving");
    currentScreen.style.position = "";
    currentScreen.style.inset = "";
    currentScreen.style.zIndex = "";
    nextScreen.classList.add("is-active");
    nextScreen.classList.remove("is-entering");
    nextScreen.inert = false;
    activeScreen = name;
    isScreenTransitioning = false;
    const title = nextScreen.querySelector("h1[tabindex='-1'], h2[tabindex='-1']");
    if (title) title.focus({ preventScroll: true });
  }, SCREEN_TRANSITION_MS);
}

const APP_TEST_API = Object.freeze({
  STORAGE_KEY,
  DRIVING_STORAGE_KEYS,
  DRIVING_DATA,
  QUESTIONS,
  TRAINING_PLANS,
  scoreDimension,
  calculateResults,
  rankWeakDimensions,
  selectWeakDimensions,
  getTrainingDirection,
  normalizeStoredState,
  getDrivingSubject,
  createOptionOrders,
  normalizeDrivingState,
  calculateDrivingResults,
  getLicenseGrade,
  calculateLicense,
  canIssueLicense,
  resolveLicenseIssuedAt,
  getBreathPhaseAt,
  formatCountdown
});

if (typeof globalThis !== "undefined") {
  globalThis.HappinessDrivingTestAPI = APP_TEST_API;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = APP_TEST_API;
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initApp);
}
