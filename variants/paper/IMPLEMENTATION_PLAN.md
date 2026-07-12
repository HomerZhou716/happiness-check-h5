# 幸福驾校三科目版实施计划

> **执行方式：** 规格已由产品方确认，按任务顺序在当前会话连续执行；每个行为先以 Node 契约测试锁定，再实现并复验。

**目标：** 在不改变科目一 PERMA 计分、推荐、呼吸与完成逻辑的前提下，把纸境 H5 升级为包含科目选择、夫妻/亲子测评、独立报告、六套陪练和幸福驾照的纯静态单页应用。

**架构：** `subjects.js` 只承载科目二/三的规格数据与新文案；`app.js` 保留科目一常量和函数，同时新增可在 Node 测试的纯函数，再由浏览器控制器连接复用屏幕。`index.html` 保留既有科目一屏幕 id，新增统一家庭题目、报告和驾照屏幕；`style.css` 继续使用纸、墨、朱砂、描金变量。

**技术栈：** 原生 HTML/CSS/JavaScript、CommonJS 兼容测试导出、Node 内置 `node:test` 与 `assert`，零外部依赖。

## 全局约束

- 只改 `variants/paper/`，不得改 `demo/` 或其他 `variants/`。
- 科目一沿用 `happiness-self-check:paper:v1`，原 15 题、1–7 计分、训练推荐和 60 秒呼吸流程不改。
- 科目二/三分别使用 `happiness-driving:s2:v1`、`happiness-driving:s3:v1`。
- 题干、选项、来源逐字来自 `final_spec.json`；语义高/中/低固定为 2/1/0，视觉顺序随机且保存后固定。
- 家庭题选择后 250ms 自动前进；页面切换门闩必须由定时器同步释放，不依赖 `requestAnimationFrame`。
- 纯静态、零外链、系统字体、移动优先 390×844，700px 以上限宽 430px。
- 所有新增文案必须通过禁词扫描；免责声明原文保持不变。

---

### 任务 1：题库与派生内容

**文件：**

- 新建：`variants/paper/subjects.js`
- 新建：`variants/paper/app.test.js`

**接口：**

- 输出 `HAPPINESS_DRIVING_DATA`，包含 `subjects.s2/s3`、`dimensions`、`plans`、`grades`、`retest`。
- 每题结构 `{ id, dimension, text, options: [{ text, value }], source, deduction, hazard? }`。

- [ ] 先写题库文件存在、24 题数量、字段、规范哈希与每维 7 天计划的失败测试。
- [ ] 运行 `node --test variants/paper/app.test.js`，确认因 `subjects.js` 尚不存在而失败。
- [ ] 逐字转录 6 维 24 题，加入克制的扣分短句、四个危险项、六套 Day 1–7 计划和四档话术。
- [ ] 重跑测试，确认题库规范哈希为 `4cf7763e8a7e03cf27d92a3dafb072424e3c4eee0acc9724e364470f8462c906`。

### 任务 2：家庭科目纯逻辑

**文件：**

- 修改：`variants/paper/app.test.js`
- 修改：`variants/paper/app.js`

**接口：**

- `createOptionOrders(questionCount, random)` 生成每题 `[0,1,2]` 排列。
- `normalizeDrivingState(rawState, subject, random)` 修复答案、游标、选项序与完成结果。
- `calculateDrivingResults(subject, answers)` 返回 `{ total, scores, weakest, deductions, hazards }`。
- `getLicenseGrade(score)` 按 85/70/55 边界返回等级。
- `calculateLicense(s2Results, s3Results)` 返回两科均值四舍五入、扣分总数和等级。

- [ ] 写计分边界、并列最弱维度、语义值不受随机序影响、坏存储修复、四危险项和等级边界测试。
- [ ] 运行测试，确认因接口缺失而失败。
- [ ] 在不改变既有 PERMA 纯函数结果的前提下实现最小逻辑。
- [ ] 重跑全部测试，并复验 PERMA 全 4 分仍为 50 分。

### 任务 3：页面结构与浏览器控制器

**文件：**

- 修改：`variants/paper/index.html`
- 修改：`variants/paper/app.js`
- 修改：`variants/paper/app.test.js`

**接口：**

- 既有屏幕保持 `home/quiz/result/plan/breathe/complete`。
- 新增屏幕 `driving-quiz/driving-result/license`，所有元素 id 使用 `driving` 或 `license` 前缀。
- 首页三张卡通过 `data-subject` 与 `data-subject-action` 连接状态、开始、继续、报告、重测。

- [ ] 写脚本顺序、必需屏幕、唯一 id、免责声明和本地存储 key 的静态契约测试。
- [ ] 运行测试，确认新结构缺失。
- [ ] 重构首页为三科目入口，新增家庭题目/报告/驾照语义结构。
- [ ] 扩展控制器：加载三份状态、卡片状态、随机选项、上一题、250ms 前进、报告、陪练上下文与领证条件。
- [ ] 重跑测试，确认静态契约及纯逻辑全部通过。

### 任务 4：纸境视觉与移动端适配

**文件：**

- 修改：`variants/paper/style.css`

- [ ] 为科目卡、朱砂科目章、完整文案选项卡、描金分数条、扣分清单、危险红灯、证书与复检时间轴新增样式。
- [ ] 确认触控目标不小于 44px，390×844 无横向溢出，长题干/长选项不遮挡。
- [ ] 700px 以上保持 430px 纸卷限宽，减少动效模式仍可完成流程。

### 任务 5：文档与生产验收

**文件：**

- 新建：`variants/paper/README.md`

- [ ] 记录三科目、存储 key、数据边界、运行与自检方式。
- [ ] 运行 `node --check variants/paper/subjects.js`、`node --check variants/paper/app.js` 与 `node --test variants/paper/app.test.js`。
- [ ] 扫描禁词、远程协议外链、重复 id、脚本顺序和目录外 diff。
- [ ] 在本地浏览器走通科一、科二、科三、返回/恢复、报告、Day 1 呼吸、领证与重测；检查 390×844 和桌面宽度截图。
- [ ] 独立复审完整 diff，修复 Critical/Important 问题后再做一次全量验收。
