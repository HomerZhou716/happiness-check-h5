# ARCHITECTURE · 技术架构

> 范围：`variants/paper/`（主版本）。纯静态 SPA，原生 HTML/CSS/JS，零运行时依赖，无构建步骤。

## 1. 文件职责

| 文件 | 行为 |
|---|---|
| `index.html` | 9 个屏幕的语义 DOM；`<head>` 内**先** `subjects.js` **后** `app.js`（均 `defer`）。内联 SVG `<defs>` 供纸境图形复用。 |
| `subjects.js` | IIFE，挂 `HAPPINESS_DRIVING_DATA` 到全局并 `module.exports`（供测试）。`deepFreeze` 只读。纯数据，无逻辑。 |
| `app.js` | 全部逻辑。顶部常量（PERMA 题库、训练计划、存储 key）→ 纯函数（计分/归一化）→ 浏览器控制器（DOM 绑定、屏幕切换、渲染）→ 底部 `APP_TEST_API` 导出。 |
| `style.css` | CSS 变量定义纸/墨/朱砂/描金；组件样式；响应式断点；`prefers-reduced-motion`。 |
| `app.test.js` | `node:test` + `assert`，11 个用例，覆盖数据契约、计分、DOM 结构、CSS 覆盖、控制器初始化。 |

## 2. 运行模型

- 单页多屏：所有 `<section class="screen" data-screen="…">` 常驻 DOM，靠 `hidden` + class 切换显隐。
- 无路由、无框架、无状态库。状态 = 三份 localStorage + 内存中的 `appState`。
- `initApp()` 在 `DOMContentLoaded` 跑：加载三份存储 → 归一化 → 绑定事件 → 渲染首页。

## 3. 状态与存储

| 科目 | localStorage key | 归一化函数 |
|---|---|---|
| 科目一 PERMA | `happiness-self-check:paper:v1` | `normalizeStoredState` |
| 科目二 夫妻 | `happiness-driving:s2:v1` | `normalizeDrivingState` |
| 科目三 亲子 | `happiness-driving:s3:v1` | `normalizeDrivingState` |

- 归一化 = 防御性修复：非法答案清除、游标夹取、随机选项序补齐、完成态重算。坏 JSON / `null` 当空存储处理（有测试守）。
- 重测单科只清该 key，不影响其余两科；重测后领证入口即时收回（`canIssueLicense` 门控）。

## 4. 纯函数（`APP_TEST_API` 导出，可 Node 单测）

| 函数 | 作用 |
|---|---|
| `scoreDimension` / `calculateResults` | PERMA 维度分与总分 |
| `rankWeakDimensions` / `selectWeakDimensions` | PERMA 最弱维度（训练推荐用） |
| `getTrainingDirection` | PERMA 维度 → 训练方向映射 |
| `getDrivingSubject` | 科目输入归一（s2/s3 或对象） |
| `createOptionOrders(count, random)` | 每题 `[0,1,2]` 的随机排列（防刷分） |
| `normalizeDrivingState(raw, subject, random)` | 家庭科目状态修复 |
| `calculateDrivingResults(subject, answers)` | 返回 `{total, scores, weakest, deductions, hazards}` |
| `getLicenseGrade(score)` | 85/70/55 边界 → 等级 |
| `calculateLicense(s2, s3)` | 领证分、扣分总数、等级 |
| `canIssueLicense` | 两科是否都完成 |
| `resolveLicenseIssuedAt` | 颁发日期（忽略 null 时间戳，不当 1970） |
| `getBreathPhaseAt` / `formatCountdown` | 呼吸练习相位与倒计时 |

> 设计原则：**计分与状态是纯函数，浏览器控制器只做 DOM。** 新增计分逻辑先写纯函数 + 测试，再接控制器。

## 5. 屏幕切换门闩（重要）

题目/屏幕切换的"正在过渡"门闩由 `setTimeout` 回调**同步**释放，**不得**放进 `requestAnimationFrame`。原因：页面不可见（后台标签、无头环境）时 rAF 不触发，会导致门闩永不释放、点击被吞死。此 bug 修复过，回归测试与本约束共同守护。

## 6. 测试（11 用例）

```sh
cd variants/paper
node --test app.test.js     # 11/11
node --check app.js
node --check subjects.js
```

用例覆盖：24 题数据契约（规范哈希）· PERMA 计分不变 · 随机选项序是语义排列且持久固定 · 坏存储修复 · `null` 存储 · 家庭计分与 4 危险项 · 领证分/扣分/等级边界 · 颁发日期非 1970 · HTML 屏幕与唯一 id + 无外链 · CSS 覆盖新组件与断点 · 控制器初始化。

`app.test.js` 通过 `require("./app.js")` 拿 `APP_TEST_API`，通过 `require("./subjects.js")` 拿数据，并用 `fs.readFileSync` 对 `index.html`/`style.css` 做静态断言（无 headless 浏览器）。

## 7. 部署

`git push` origin/main → GitHub Pages 自动构建（约 1–2 分钟）。根 `index.html` = meta-refresh 跳 `variants/paper/`。无 CI 门禁——**推之前本地必须先 `node --test` 全绿**。

## 8. 其余目录（勿改）

`demo/`（早期暖炭 PERMA 版）、`variants/mist/`（晨雾）、`variants/nocturne/`（夜航）是留档对照方案，与主版本逻辑同源、视觉不同。历史，不维护。
