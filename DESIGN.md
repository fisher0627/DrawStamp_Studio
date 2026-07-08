# DrawStamp Studio · 设计系统锚（DESIGN.md）

> 方向 A · 纸面工坊（Paper Atelier）— 2026-07-08 确认
> 本文件是项目视觉的唯一事实源。改风格 = 先改本文件。所有页面、组件、会话轮次以此为准。

## 1. 视觉主题与氛围

电子印章工作台，暖纸印刷质感。纸面是底，印章红是唯一重音，工具蓝仅用于次要不抢戏的强调（focus、链接）。
气质：克制、专业、有手工感，不科技、不炫技。像一张铺在工作台上的米白纸，上面盖着一枚红印章。

## 2. 色板与角色（--studio-* token，唯一允许的色彩来源）

| 角色 | token | 值 | 用途 |
|------|-------|-----|------|
| 纸面底 | --studio-paper | #f4f5f1 | app/工作区底色 |
| 暖纸浅 | --studio-paper-warm | #fbfaf6 | 渐变浅端 |
| 面板 | --studio-panel | #fffefa | 卡片/面板/输入底 |
| 面板次 | --studio-panel-muted | #f2f4ef | 次级面板/分区底 |
| 分割线 | --studio-line | #d9ded4 | 实线分隔 |
| 分割线强 | --studio-line-strong | #bfc8bb | hover/强调分隔 |
| 分割线极淡 | --studio-line-hair | rgba(191,200,187,.58) | 发丝线 |
| 墨色正文 | --studio-ink | #202522 | 标题/正文/输入文字 |
| 次要文字 | --studio-muted | #697268 | 次要说明 |
| 极淡文字 | --studio-soft | #8b958a | 仅用于非关键提示（对比度敏感，慎用） |
| 印章红（主重音） | --studio-ui-red | #a33a32 | 主按钮/选中/删除/危险 |
| 印章红深 | --studio-ui-red-deep | #842b26 | 主按钮 hover/按下 |
| 印章红鲜 | --studio-stamp-red | #ff0015 | 仅 canvas 印章绘制 |
| 工具蓝（次要） | --studio-tool-blue | #234c5c | 链接/次按钮 hover |
| 工具蓝浅 | --studio-tool-blue-soft | #e5eef0 | 次按钮 hover 底 |
| focus 环 | --studio-focus | 0 0 0 3px rgba(35,76,92,.12) | 输入聚焦阴影（暖蓝） |

**铁律**：禁止再出现 `#bd2431`（冷红）、`#1890ff`/`#e6f7ff`（冷蓝）、`#ff4d4f`（Ant 红）、`#b8c2cf`（冷灰滚动条）、`#f7f9fb`/`#d2dae6`（冷灰）等冷色残留。红色重音全局只有 `--studio-ui-red` 一支；focus 统一为暖蓝 `--studio-focus` + `rgba(35,76,92,.38)` 边框。

## 3. 排版规则

- 字体栈（中文 UI/正文，系统栈零下载）：
  `-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif`
- 装饰中文字体 `DrawStamp-STLiti`（华文隶体）**仅**用于 canvas 印章绘制，绝不进 UI 文字
- 字重只用 400 / 500 / 600 / 700；**禁用 `font-style: italic`**（中文伪斜体禁令）
- 数字一律 `font-variant-numeric: tabular-nums`（尺寸 mm、缩放 %、倍率不跳动）
- 行高 1.4–1.6；正文 ≥ 14px；中西文/数字之间加空格

## 4. 组件样式

- 输入框/选择框：边框 `--studio-line`，圆角 7px，底 `--studio-panel`，内阴影 `inset 0 1px 0 rgba(255,255,255,.7)`；focus 边框 `rgba(35,76,92,.38)` + `--studio-focus`，**不用红**
- 主按钮：底 `--studio-ui-red`，文字白，圆角 7px；hover `--studio-ui-red-deep`；active `scale(.985)`
- 次按钮：底 `--studio-panel`，边框 `--studio-line`；hover `--studio-tool-blue-soft` + `--studio-tool-blue`
- 选中态：左边 3px `--studio-ui-red` 内边框 + `#fff6f3` 底；选中边框 `rgba(163,58,50,.48)`
- 卡片/分组：优先 `--studio-line-hair` 发丝线分隔，少用整卡包裹；hover 才出现 `--studio-shadow-quiet`
- 滚动条：`--studio-line-strong` 暖灰，不用冷灰

## 5. 布局原则

- 三栏工作区：左 元素/模板库 304px · 中 canvas 自适应 · 右 属性面板 352px
- 顶部工具栏与纸面融合：无独立重 border，共享纸面材质与渐变
- 间距 4px 基准（4/8/12/16/24/32）；组内间距 < 组间间距
- 容器 `max-width: 1440px` 居中

## 6. 深度层级

| 层 | 阴影 token | 用途 |
|----|-----------|------|
| 静态面板 | --studio-shadow-quiet | 0 8px 20px rgba(40,48,38,.045) |
| 浮起面板 | --studio-shadow-panel | 0 10px 28px rgba(40,48,38,.08) |
| 主舞台 | --studio-shadow-soft | 0 18px 52px rgba(40,48,38,.13) |
| 阴影染底色色调（暖灰 rgba(40,48,38,...)），不用冷蓝灰 |

## 7. Motion 哲学

- 缓动：`ease-out`（禁 `ease-in` 用于 UI）；关键转场可用 `cubic-bezier(0.23,1,0.32,1)`
- 时长：按钮反馈 100–160ms · 提示 125–200ms · 下拉 150–250ms · 弹窗 200–300ms（≤300ms 红线）
- 只动 `transform` 与 `opacity`（颜色/背景过渡可例外但需逐属性声明）
- **禁 `transition: all`**，一律逐属性
- `:active` 按压 50ms 内有视觉响应（`scale(.97)`–`.985`）
- 全局 `@media (prefers-reduced-motion: reduce)` 兜底，关闭所有过渡/动画
- hover 动效包 `@media (hover:hover) and (pointer:fine)`（触屏不触发）

## 8. Do's / Don'ts

**Do**：保留暖纸 + 印章红隐喻；focus 用暖蓝；红色重音只用一支；数字 tabular-nums；危险操作给确认/撤销路径。
**Don't**：不要引冷灰/冷蓝/冷红；不要 `transition: all`；不要斜体；不要装饰中文字体进 UI；不要纯黑 `#000000`（用 `--studio-ink`）；不要常驻"已载入"类系统自言自语。

## 9. 响应式

- `<900px`：三栏各自塌缩为单列，属性面板 max-height 520px，元素列表 max-height 360px
- 禁 `h-screen`（用 `min-height: 100dvh` 或 `calc(100vh - Npx)`）
- flex 文本子项加 `min-width:0` 防溢出；非对称布局窄屏塌缩单列
- canvas footer export-dock 横向 flex 窄屏需换行或收起

## 10. 待办（本轮未覆盖，后续迭代）

- 信息架构：导出入口收敛（顶栏/canvas 工具条/footer dock 三处→主入口+快捷条）
- 交互完整性：删除 `confirm()` → 可撤销/确认弹窗；草稿失败重试入口；导出预览骨架
- ruler 真实数据（StampWorkspace.vue 硬编码 0/300/600）
- eyebrow 收敛（每区块都有 eyebrow → ≤ ⌈section/3⌉）
- hover 动效补 `@media(hover:hover)` 包裹（本轮仅加 reduced-motion 兜底）
