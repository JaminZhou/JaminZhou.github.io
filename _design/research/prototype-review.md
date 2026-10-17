# 视觉原型只读复核

日期：2026-10-17。范围：`_design/build.py`、`products.json`、`system/` 与已生成的 `preview/`；只做源码、文本、链接、资源与模式一致性审查，不启动浏览器，不修改主实现或生产文件。以下是审查时的快照，主线程可能正在同步修复。

## 已通过的静态检查

- 94 个 HTML 输出存在：87 个既有产品/文档页 + 英文首页、中文首页概念、Support hub、404、三张设计辅助页。
- 87 个产品页完整保留原来的产品 × 语言 × surface 矩阵，网站语言没有按 App 支持语言伪造额外页面。
- 94 页所有根相对 `href` / `src` 目标存在；页内与跨页面 fragment 目标存在；未发现重复 `id`；每页恰好一个 `h1`。
- 逐页比较源 `p` / `li` / `pre` / `h2` / `h3` 文本后，Support、Privacy、Changelog、Clamshell 的既有正文未发现缺失。主要内容差异集中在被替换的 landing hero。
- 官方 App Store、各语言 Tally 参数、mailto、Helper 下载/验证边界/恢复命令均仍在相应文档内。
- iCube 未被带入输出、生产文件未修改；原型没有生成 CalcBird 重定向属于独立预览范围，不是当前生产重定向被删除。
- 预览全页带 noindex,nofollow 和统一 robots 禁抓。没有 canonical/SEO 生产迁移不属于本轮原型缺陷。
- FIRE 的“准备发布”仍由状态和 spec 展示，没有被加上下载按钮；截图模式没有凭空生成真实 App UI。

## 需要修正的具体问题

### 1. [P2] 文档次级按钮文字与背景同色

位置：`system/components.css:7`，规则 `.document a.button{color:var(--canvas)}`。

该选择器优先级高于 `.button.secondary{color:var(--ink)}`。PriceBird 四种语言的 Support 页各有两个 `a.button.secondary`（Feedback form 与 Privacy policy），背景透明，文字却被改成画布色。浅色/深色模式均出现同色文字，静态 CSS 优先级即可确认。

最小修法：只对 `.document a.button:not(.secondary)` 应用主按钮文字色，或者移除文档层按钮颜色覆盖，让共用 Button 自己管理状态。然后检查四语言、浅/深色下正常与 hover 状态，不能只修英文。

### 2. [P2] Hushtrail 发布说明与产品下载仓库入口丢失

位置：`build.py:174-188` 的 hero 整块替换，以及 `normalize()` 无条件移除 footer。

源 `_site-src/hushtrail/content/en/landing.html:12-14` 的 `Release notes` 指向 `https://github.com/JaminZhou/hushtrail-releases/releases/tag/v0.1.3`，原 footer 另有 `https://github.com/JaminZhou/hushtrail-releases`。这两个 URL 均不在预览产品页里；现在只剩 ZIP 下载，用户不能直接检查版本信息和官方发行仓库。

最小修法：在产品数据分开 `downloadUrl` / `releaseUrl` / `repositoryUrl`；direct 类型的 ActionGroup 保留 Release notes 次级入口，产品 footer 或发布详情提供发行仓库。不要把所有链接都挤进唯一名为 `store` 的字段。

### 3. [P2] hero 只按 class 白名单保留，漏掉已有版本说明

位置：`build.py:185-188`。

现规则只保留 `.status`、`.aperlo-status`、`.release-meta`。PriceBird ja / zh-Hans / zh-Hant landing 的普通 `<p>` 版本说明（iPhone Duo 布局、历史搜索与选项弹窗安全区域调整）没有这些 class，删除 hero 时随之丢失。它不是重复标题或纯装饰文字。

最小修法：显式标记/提取旧 hero 中要替换的标题、lead、媒体、重复 CTA；其余事实块默认保留，或给这三个真实段落加统一 `release-note` 语义角色后渲染。不要改成靠字符串长度判断是否重要。

英文 hero 的营销句缩写、FIRE 版本与状态在新 spec 中重现属于预期改写，不应把所有文本差异一概当成丢失。

### 4. [P2] Support 与 Changelog 没有真正跨语言复用同一模式

位置：`build.py:205-219` 只是给原 HTML 包文档壳；`system/components.css:7` 仅兼容英文 `data-r`。

- Rouse 英文 Support CTA 通过 `[data-r="ctas"]` 获得按钮容器和按钮样式；其余八种语言保留 `.cta-row` / `.cta`，新 CSS 没有这些类规则，退回普通链接。内容没有丢失，但控件形态、间距与触摸区域不统一。
- Rouse 英文 Changelog 使用 `[data-r="rel"]` / `[data-r="relmeta"]` 双列与分隔线；八种翻译保留 `.entry` / `.entry-meta`，没有映射到同一 ReleaseEntry。英文目录取更新标题，翻译目录取版本号；信息导航逻辑也不同。

最小修法：归一化到明确的 ActionGroup / Button / ReleaseEntry 数据或语义类。Changelog 提取 version、summary、body，统一生成版本号+短标题的目录，并保留源正文；不要为每个语言再补一套布局。

### 5. [P2] 新增公共 UI 文案存在非英语页面的英文泄漏

位置：`build.py:41`、`:106-132`、`:171-172`、`:197`。

已确认例子：

- `source-facts` 的标题只区分简中与英文，ja / zh-Hant / de / fr / es / ko / pt-BR 均显示 `Release details`。
- 图标 poster 的摘要只区分简中与英文，Rouse 所有其他语言、PriceBird ja / zh-Hant 显示英文副文案。
- `display_name()` 只有 `nameZh` 与英文二分；Aperlo zh-Hant 原文叫“映窗”，新产品导航/眉题变成 Aperlo；PriceBird zh-Hant 原文“算鳥”也没有对应字段。
- Header 的 skip link、Primary/Mobile/Menu，Footer 的英文口号等新文案没有进入 UI 字典。全站 Support 链接固定到仅英文 hub，需要明确 fallback，而不是给出本地语言标签后静默跳英文。
- Related cards 在非简中页面全部回落英文说明，即使目标产品存在该语言页面。

最小修法：将名称、summary、releaseDetails、skipContent、primaryNav、mobileNav/menu、footer 文案收进 locale-keyed 字段；已有翻译能从源内容复用则优先复用。无翻译的推荐条目可以不显示摘要，或明确标记目标为英语；不要造不存在的产品翻译。

### 6. [P2] 320px 图标条尺寸超出容器，未来产品增长也无法容纳

位置：`system/components.css:3` 的 `.app-shelf` 与窄屏规则。

当前 `.app-shelf` 不 wrap。320px 时容器约280px；6个35px图标 + 每个链接左右合计8px padding + 5个7px gap，最小内容宽约293px，超出13px。新增第七个图标后问题进一步扩大。

最小修法：允许图标条 `flex-wrap:wrap`，同时明确产品数多时的展示策略；或把它限制为固定精选并提供“全部应用”入口。当前6图标的320px场景需要浏览器确认最终边界，此处是根据CSS尺寸得出的确定性布局风险。

### 7. [P3] 产品配置尚不能独立驱动精选和媒体模式

位置：`build.py:153`、`:162-170`；`products.json`。

- 数据已有 `featured:true`，但 homepage 固定 `[BY_ID['aperlo'], BY_ID['fire']]`，配置修改不会影响精选。
- `media="widgets"` 的实现固定输出 `/fire/images/...`，未来另一产品选同模式会显示 FIRE。
- screenshot 多语言路径依赖 `p['id']=='aperlo'` 和字符串替换，资源尺寸也固定2880×1800；第二个截图型产品使用另一尺寸/文件命名时仍需改布局函数。

最小修法：通过配置读取精选排序；为媒体定义最少的 `kind`、`items[{srcByLocale,width,height,altByLocale}]`。保留 widget / screenshot / icon 三种布局模式即可，不需要泛化为任意区块CMS。

## 非阻断的后续完善

- Hero 截图替换后把 Trailglass 具体 alt（暗色库、示例会话）降成笼统“Actual app screenshot”。应保留能说明画面内容的 alt，再把“示例数据”放在 caption；媒体类型、来源与替代文字应由同一资产记录提供。
- `.source-facts` 当前无专用样式；版本/发布日期原文常被挪到内容末端的默认 details。原型应决定哪些信息靠近下载动作，哪些是补充折叠信息，不应仅为了保全文本把重要状态藏到底部。
- 六个 app 的当前目录已足够清晰。筛选逻辑的 iPhone & iPad 实际只匹配 `iphone`，未来出现仅 iPad 产品时会漏掉；过滤组应显式包含两个平台。
- 首页旧的 LinkedIn / Dribbble / Medium / Instagram 被收敛为邮箱和GitHub。这是可接受的内容策划决定，但应在交付说明明确“入口重新编排”，不要声称首页全部链接逐项保留。
- 默认 `<aside>` 全部移除规则有扩展风险。当前被移除的内容未发现独立必需正文，但之后不应该默认所有aside都是旧目录；应只移除明确识别的 legacy TOC。
- 当前文档内容保全结论来自静态文本与链接比较，不能替代屏幕阅读器、键盘、打印、深浅色视觉、200%/400%缩放或移动端视觉验收。

## 建议修复后的最小回归

1. 再生成一次原型，重新检查94页链接/fragment/id/h1及87个路由manifest。
2. 明确断言 Hushtrail 两个Release URL保留、PriceBird三段版本说明保留。
3. 对 PriceBird 四语言support检查次级按钮颜色；对 Rouse 英文+德文+简中文档检查 ActionGroup 与 ReleaseEntry 采用同一结构。
4. 320px首页验证图标条/导航；查看中文、日文、德文产品页，确保新增UI文案没有无意英语回退。
5. 加一个只用于研究的“仅iPad产品”和第二个widget产品配置样例，确认过滤/媒体/精选通过数据扩展；不需将这些假产品加入真实目录。

## 修复后复核（2026-10-17）

已对修复后的当前94页重新作独立静态检查，并新增持久校验脚本 `_design/check.py`。脚本不导入 `build.py`，从生产 `pages.json` 与原始内容直接建立预期路由和事实块，避免生成器与校验器复用同一转换错误。

运行命令：

```sh
python3 _design/build.py
python3 _design/check.py
```

复核执行只运行了后一条；没有重写或修改生成器、CSS、生产文件。

结果：**PASS**。检查覆盖94个noindex页面、87个原产品路由、4,435个本地URL、2,785个原文事实块、155个外部服务/发布URL、122个原始媒体引用。六个明确改写的英文hero介绍单独列入批准例外，其他普通事实段落不得因class变化而自动豁免。

| 原问题 | 当前复核状态 |
|---|---|
| 文档次级按钮同色 | 已增加 `.document a.button.secondary` 正确前景色，静态优先级冲突解除；最终浅/深色视觉由主线程浏览器验收 |
| Hushtrail发行链接丢失 | 已保留准确版本Release页面与发行仓库两个入口，进入持久回归 |
| PriceBird普通hero版本说明丢失 | ja / zh-Hans / zh-Hant三段iPhone Duo说明均恢复；原文完整比对与点名回归通过 |
| Rouse跨语言组件不统一 | 九语言Support CTA均使用共用actions/button；九语言Changelog全部条目归一为同一结构，目录使用版本号，原正文仍完整 |
| 公共UI与繁中名称 | 九语言release/skip/menu文案、繁中“映窗/算鳥”、非英文poster原语言intro已修复；其余语言完善项见下方 |
| 窄屏图标条 | `.app-shelf`已允许wrap，原静态最小宽度冲突解除；320px最终视觉由浏览器检查 |
| 精选/媒体硬编码 | featured由配置选择；widget资源路径由`widgetImages`生成；剩余产品特例已明确，不视作当前六产品错误 |

额外核查：

- 所有94页拥有一个main、一个h1，所有id唯一，内部锚点真实存在，资源和页面路径可解析。
- 所有产品语言菜单仍保持同产品与同surface；单语言产品没有虚构语言选项，当前语言准确标记。
- 预览与源`tokens.css/components.css/interactions.js`字节一致，没有仅修源文件而忘记更新预览。
- 所有引用的既有App截图/widget渲染与生产资产哈希一致；FIRE图标使用原型单独配置的override，不修改生产图标。
- FIRE四语言产品hero没有新增App Store下载CTA。
- 对初始生产提交 `c5e96f34356b40817a4f4cb75e2d798b43a4bfa5` 的完整diff显示 `_design/` 之外没有任何受控文件变化；没有设计目录之外的未跟踪文件。持久脚本固定此审计基线，避免提交生产修改后仅检查HEAD得到假阴性。两份iCube HTML与初始SHA-256完全一致，且没有进入原型目录。

仍应准确保留的局限：

1. 还不能声称新增公共文案已“全面九语言本地化”：`Primary/Mobile/Footer`导航辅助标签、非简中footer口号、Related cards摘要仍有英文。这不影响已核验的产品语言路由和原正文保全，但完整上线方案应继续归入locale字典。
2. widget图片路径已数据化，caption/alt仍带FIRE具体名称；screenshot尺寸与Aperlo语言路径仍有产品特例。这在当前六产品样稿内正确，下一个同类型产品加入前应将media描述、尺寸和locale路径收进资产配置。
3. 原文比对检查的是内容未丢失，不能证明其在折叠面板中是否处于最佳位置，也不替代视觉阅读、键盘、屏幕阅读器、缩放和实际渲染对比度检查。
4. 此结果不包括线上商店状态核验、GitHub Pages部署、真实404 HTTP状态或浏览器表现；它是本地原型静态验收证据。
