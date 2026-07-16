# 幸福自检 · 幸福驾校（Happiness Self-Check）

纯静态、零依赖的移动端 H5 家庭关系自检产品。用一次「驾照式」自检看清夫妻/亲子关系，并给出可执行的 7 天陪练。

- **线上体验**：https://homerzhou716.github.io/happiness-check-h5/
- **主版本代码**：[`variants/paper/`](variants/paper/)（纸境·东方文人视觉）
- **在线体验（本地）**：`cd variants/paper && python3 -m http.server 8000`，浏览器打开根路径

## 产品结构

「幸福驾校」三科目 + 幸福驾照：

- **科目一 · 自我状态**：PERMA 15 题 · 7 点量表 → 五维雷达 → 7 天微训练 → 60 秒呼吸
- **科目二 · 夫妻同行**：12 题行为锚点 → 科目报告 → 7 天陪练
- **科目三 · 亲子上路**：12 题行为锚点 → 科目报告 → 7 天陪练
- **幸福驾照**：两科完成后生成，含领证分/等级/扣分/复检路线

## 文档

完整 PRD、架构与交接文档在 **[`docs/`](docs/)**。接手请从 [docs/HANDOFF交接文档.md](docs/HANDOFF交接文档.md) 开始；AI 代理见根目录 [`AGENTS.md`](AGENTS.md)。

## 开发

```sh
cd variants/paper
node --test app.test.js       # 契约测试 11/11
node --check app.js subjects.js
```

`git push` 到 `main` 即经 GitHub Pages 自动上线。

## 目录说明

| 目录 | 说明 |
|---|---|
| `variants/paper/` | **主版本**（纸境·幸福驾校三科目） |
| `variants/mist/` `variants/nocturne/` | 历史 UI 方案（晨雾/夜航），留档对照，不维护 |
| `demo/` | 最早的个人版 PERMA demo，留档 |
| `docs/` | PRD、架构、交接文档 |

> 本测评仅用于生活状态的自我观察，不替代专业支持或个性化建议。
