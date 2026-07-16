# AGENTS.md — 幸福驾校（幸福自检）项目 · AI 代理操作手册

> 本文件供 Codex / Claude 等编码代理阅读。人类同事请从 [docs/HANDOFF交接文档.md](docs/HANDOFF交接文档.md) 开始。

## 这个项目是什么

「幸福自检 / 幸福驾校」是一个**纯静态、零依赖的移动端 H5 心理自检产品**。用户做完测评后看到分数报告、按最弱维度获得 7 天微练习。已上线，线上地址见下。

**当前主版本 = `variants/paper/`（纸境·东方文人视觉）。** 其余目录是历史 UI 方案与早期 demo，勿动。

## 你（代理）必须遵守的硬约束

1. **只改 `variants/paper/`。** 不要动 `demo/`、`variants/mist/`、`variants/nocturne/` —— 它们是留档的对照方案，改了会污染历史。
2. **纯静态、零外部依赖。** 不许引入任何 CDN、外链字体、外链图片、npm 运行时依赖、构建步骤。图形一律内联 SVG 或 CSS。字体用系统字体栈。（`node --test` 是唯一的开发期工具依赖，不进产物。）
3. **改动后必须让契约测试全绿：** `cd variants/paper && node --test app.test.js`（当前 11/11）。再跑 `node --check app.js subjects.js`。
4. **合规禁词** —— 任何用户可见文案（含新增扣分梗、解读、等级话术）**绝不允许**出现：诊断、治疗、治愈、抑郁、焦虑症、心理医生、疗愈、寻求专业帮助。免责声明原文一字不改：「本测评仅用于生活状态的自我观察，不替代专业支持或个性化建议。」
5. **科目一（PERMA）逻辑冻结。** 15 题、1–7 计分、训练推荐、60 秒呼吸流程不改，除非任务明确要求。
6. **题干/选项一字不改。** 科目二/三的 24 题文案是心理测量专家逐字定稿的（见 `subjects.js`），非任务明确要求不得改写；改了会破坏 `subjects.js` 的规范哈希测试。

## 快速上手（30 秒）

```sh
cd variants/paper
node --test app.test.js      # 11/11 应全绿
node --check app.js subjects.js
python3 -m http.server 8000  # 然后浏览器打开 http://localhost:8000/ 走一遍三科流程
```

## 代码地图

| 文件 | 职责 |
|---|---|
| `variants/paper/index.html` | 全部 9 个屏幕的语义结构；先加载 `subjects.js` 再 `app.js` |
| `variants/paper/subjects.js` | 科目二/三题库（6 维 24 题）、6 套 7 天陪练、等级、复检数据。导出 `HAPPINESS_DRIVING_DATA` |
| `variants/paper/app.js` | 全部逻辑：PERMA 原流程 + 家庭科目流程 + 计分 + 状态恢复 + 报告 + 驾照渲染。底部 `APP_TEST_API` 导出纯函数供测试 |
| `variants/paper/style.css` | 纸境视觉、移动布局、动效、减少动效适配 |
| `variants/paper/app.test.js` | Node 内置 `node:test` 契约测试（数据、计分、DOM 结构、CSS 覆盖） |

详细数据结构与函数签名见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

## 改动纪律（TDD 优先）

本项目已建立"先测试后实现"的惯例：新增行为先在 `app.test.js` 写失败测试，再实现到绿。计分类改动尤其如此——`calculateDrivingResults` / `calculateLicense` 有边界测试守着。

**已知的一个坑：** 屏幕/题目切换的门闩必须由 `setTimeout` 同步释放，**不能依赖 `requestAnimationFrame`**——页面不可见时 rAF 不触发，会导致点击被吞、交互卡死。这个 bug 修过一次，别改回去。

## 部署

`git push` 到 `main` 即自动经 GitHub Pages 部署（约 1–2 分钟）。根路径 `index.html` 是一个 meta-refresh 跳到 `variants/paper/`。切换主版本 = 改根 `index.html` 的跳转目标。

- 仓库：`HomerZhou716/happiness-check-h5`（**public**——提交前扫一遍无密钥/无敏感信息）
- 线上：https://homerzhou716.github.io/happiness-check-h5/
- ⚠️ github.io 在微信内置浏览器打不开，仅适合用浏览器分享给团队/客户看；正式对用户投放需迁国内托管。

## 不在仓库里的东西（敏感，勿尝试提交）

`.gitignore` 排除了商业策略与内部资料（`*.xlsx`、`商业模式论证报告.md`、`docs/内部-*.md`）。这些由项目负责人私下传递，不进公开仓库。如果任务需要商业上下文，向负责人索取，别把它们 `git add`。

## 下一步做什么

见 [docs/ROADMAP.md](docs/ROADMAP.md)。当前最高优先级是 v2 量表迭代（B3 维度两题近重复需合并、部分题缺"不适用"出口）与企业版交付形态——但**动手前先读 HANDOFF 和对应 PRD**。
