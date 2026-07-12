const STORAGE_KEY = "happiness-self-check:paper:v1";
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

function initApp() {
  elements = {
    screens: [...document.querySelectorAll("[data-screen]")].filter((element) => element.classList.contains("screen")),
    startButton: document.querySelector("#startButton"),
    startButtonLabel: document.querySelector("#startButtonLabel"),
    restartButton: document.querySelector("#restartButton"),
    resumeNote: document.querySelector("#resumeNote"),
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
    planBackButton: document.querySelector("#planBackButton"),
    planKicker: document.querySelector("#planKicker"),
    planName: document.querySelector("#planName"),
    planDescription: document.querySelector("#planDescription"),
    trainingTimeline: document.querySelector("#trainingTimeline"),
    closeBreatheButton: document.querySelector("#closeBreatheButton"),
    breathOrbit: document.querySelector("#breathOrbit"),
    breathPhase: document.querySelector("#breathPhase"),
    breathCountdown: document.querySelector("#breathCountdown"),
    breathPattern: document.querySelector("#breathPattern"),
    breathControls: document.querySelector(".breath-controls"),
    startBreathButton: document.querySelector("#startBreathButton"),
    backToPlanButton: document.querySelector("#backToPlanButton")
  };

  appState = loadStoredState();
  bindEvents();
  updateHomeState();
  renderQuestion();
}

function bindEvents() {
  elements.startButton.addEventListener("click", handlePrimaryStart);
  elements.restartButton.addEventListener("click", restartAssessment);
  elements.quizBackButton.addEventListener("click", goToPreviousQuestion);
  elements.scaleOptions.addEventListener("keydown", handleScaleKeys);
  elements.viewPlanButton.addEventListener("click", openTrainingPlan);
  elements.retakeButton.addEventListener("click", restartAssessment);
  elements.planBackButton.addEventListener("click", openResult);
  elements.closeBreatheButton.addEventListener("click", exitBreathingPractice);
  elements.startBreathButton.addEventListener("click", startBreathingPractice);
  elements.backToPlanButton.addEventListener("click", openTrainingPlan);
  document.querySelectorAll("[data-action='home']").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      stopBreathingPractice();
      updateHomeState();
      showScreen("home");
    });
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && breathTimer) updateBreathClock();
  });
  window.addEventListener("pagehide", persistState);
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

function updateHomeState() {
  const answeredCount = appState.answers.filter((answer) => answer !== null).length;

  if (appState.results) {
    elements.startButtonLabel.textContent = "查看我的报告";
    elements.resumeNote.textContent = storageAvailable ? "本次结果已保存在这台设备" : "本次结果仅保留到本页关闭前";
    elements.resumeNote.hidden = false;
    elements.restartButton.hidden = false;
    return;
  }

  if (answeredCount > 0) {
    elements.startButtonLabel.textContent = "继续自检";
    elements.resumeNote.textContent = storageAvailable
      ? `已完成 ${answeredCount} / ${QUESTIONS.length}，进度已保存`
      : `已完成 ${answeredCount} / ${QUESTIONS.length}（仅保留到本页关闭前）`;
    elements.resumeNote.hidden = false;
    elements.restartButton.hidden = false;
    return;
  }

  elements.startButtonLabel.textContent = "开始自检";
  elements.resumeNote.hidden = true;
  elements.restartButton.hidden = true;
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
  renderTrainingPlan();
  showScreen("plan");
}

function renderTrainingPlan() {
  const weakest = rankWeakDimensions(appState.results.scores)[0];
  const direction = appState.planDirection || getTrainingDirection(weakest);
  const plan = TRAINING_PLANS[direction];
  appState.planDirection = direction;
  persistState();

  elements.planKicker.textContent = plan.kicker;
  elements.planName.textContent = plan.name;
  elements.planDescription.textContent = plan.description;
  const items = plan.days.map((day, index) => {
    const item = document.createElement(day.interactive ? "button" : "article");
    if (day.interactive) item.type = "button";
    item.className = `timeline-item${day.interactive ? " timeline-item--active" : ""}${day.interactive && appState.practiceCompleted ? " is-complete" : ""}`;
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
      cta.textContent = appState.practiceCompleted ? "再练一次" : "开始练习";
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
  appState.practiceCompleted = true;
  persistState();
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
  renderTrainingPlan();
  showScreen("plan");
}

function showScreen(name) {
  const nextScreen = elements.screens.find((screen) => screen.dataset.screen === name);
  const currentScreen = elements.screens.find((screen) => screen.dataset.screen === activeScreen && !screen.hidden);
  if (!nextScreen || name === activeScreen || isScreenTransitioning) return;

  if (activeScreen === "result" && name !== "result") stopScoreAnimation();

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
  QUESTIONS,
  TRAINING_PLANS,
  scoreDimension,
  calculateResults,
  rankWeakDimensions,
  selectWeakDimensions,
  getTrainingDirection,
  normalizeStoredState,
  getBreathPhaseAt,
  formatCountdown
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = APP_TEST_API;
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initApp);
}
