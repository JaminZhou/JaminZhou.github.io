# JaminZhou 网站视觉重设计：页面范围、内容与复用审计

审计日期：2026-10-17（Asia/Shanghai）。基于当前工作区源码和提交 `c5e96f34356b40817a4f4cb75e2d798b43a4bfa5`。本报告不修改生产 HTML、CSS、脚本或媒体，不检查线上页面，不声称完成浏览器视觉验收。

## 1. 结论与设计边界

这次适合保留 GitHub Pages 静态输出，统一网站的内容模型、页面框架和组件，而不是只替换字体和配色。当前已有成熟的路由与多语言生成基础；真正的维护成本集中在：首页手写、Trailglass 手写、英文与其他语言使用不同结构、内容片段内大量样式、产品事实分散重复、产品展示资源质量不齐。

精确范围：

- 部署目录共有 **102 个 HTML 文件**，不含 `_site-src/` 与设计研究文件。
- 本次需要统一视觉的既有内容页为 **88 页**：首页 1 页 + 六个产品的 87 页。
- 87 个产品页中 **84 页由源码生成，3 页 Trailglass 手写**。
- **12 个 `/calcbird/` 兼容重定向**需要保持有效，不设计成第七个产品。
- **2 个 `/privacy_policy/iCube_*/` 页面排除**。它们不引用当前全局 CSS；保留内容、样式、路径、元数据及其头像资源。
- `/codex-ui-kit/` 是首页和 sitemap 保留的独立项目入口，本仓库没有其页面目录；不能把它当作本仓库缺失文件删除，也不应将其他仓库的实现纳入本次改版。
- 当前没有 `404.html`。完整设计应补充 404 页面模式，这是新增页面，不算进上述 88 页。
- `garlicbird/` 只有旧图标与 CSS，没有 HTML 页面。它不是当前第七个产品，也没有可供改版的 GarlicBird 落地页。

## 2. 语言 × 页面类型矩阵

`L` = 产品页；`S` = Support；`P` = Privacy；`C` = Changelog；`H` = Closed-lid Helper 指南。

| 产品/范围 | 网站语言 | 页面类型 | 内容页数量 | 生成方式 |
|---|---|---|---:|---|
| 首页 | en | 首页 | 1 | 手写 `index.html` |
| Rouse | en / de / fr / es / pt-BR / ko / ja / zh-Hans / zh-Hant | L / S / P / C / H | 45 | `_site-src/rouse/` + 专用生成器 |
| PriceBird | en / ja / zh-Hans / zh-Hant | L / S / P | 12 | `_site-src/pricebird/` + 共用生成器 |
| Hushtrail | en | L / S / P | 3 | `_site-src/hushtrail/` + 共用生成器 |
| Trailglass | en | L / S / P | 3 | 手写 `trailglass/` |
| Aperlo | en / zh-Hans / zh-Hant / ja | L / S / P | 12 | `_site-src/aperlo/` + 共用生成器 |
| FIRE | en / zh-Hans / zh-Hant / ja | L / S / P | 12 | `_site-src/fire/` + 共用生成器 |
| 合计 | 9 种语言的不同子集 | 首页 + 5 种产品页面类型 | **88** | 84 生成 + 4 手写 |

语言是路由能力，不是显示装饰：英文使用产品根路径，其他语言用小写路径段，`pt-BR` 对应 `pt-br`。HTML `lang` 和 `hreflang` 保持正确大小写。不能把所有产品都强行显示九种语言；Hushtrail 的 App 文案提到支持简体中文，不等于网站已有中文翻译。

### 真实内容路由清单

以下是完整展开后的 **88 个既有内容路由**；每格中逗号分隔的是独立路由。

| 范围/语言 | 路由 |
|---|---|
| 首页 | `/` |
| Rouse en | `/rouse/`, `/rouse/support/`, `/rouse/privacy/`, `/rouse/changelog/`, `/rouse/support/clamshell/` |
| Rouse de | `/rouse/de/`, `/rouse/de/support/`, `/rouse/de/privacy/`, `/rouse/de/changelog/`, `/rouse/de/support/clamshell/` |
| Rouse fr | `/rouse/fr/`, `/rouse/fr/support/`, `/rouse/fr/privacy/`, `/rouse/fr/changelog/`, `/rouse/fr/support/clamshell/` |
| Rouse es | `/rouse/es/`, `/rouse/es/support/`, `/rouse/es/privacy/`, `/rouse/es/changelog/`, `/rouse/es/support/clamshell/` |
| Rouse pt-BR | `/rouse/pt-br/`, `/rouse/pt-br/support/`, `/rouse/pt-br/privacy/`, `/rouse/pt-br/changelog/`, `/rouse/pt-br/support/clamshell/` |
| Rouse ko | `/rouse/ko/`, `/rouse/ko/support/`, `/rouse/ko/privacy/`, `/rouse/ko/changelog/`, `/rouse/ko/support/clamshell/` |
| Rouse ja | `/rouse/ja/`, `/rouse/ja/support/`, `/rouse/ja/privacy/`, `/rouse/ja/changelog/`, `/rouse/ja/support/clamshell/` |
| Rouse zh-Hans | `/rouse/zh-hans/`, `/rouse/zh-hans/support/`, `/rouse/zh-hans/privacy/`, `/rouse/zh-hans/changelog/`, `/rouse/zh-hans/support/clamshell/` |
| Rouse zh-Hant | `/rouse/zh-hant/`, `/rouse/zh-hant/support/`, `/rouse/zh-hant/privacy/`, `/rouse/zh-hant/changelog/`, `/rouse/zh-hant/support/clamshell/` |
| PriceBird en | `/pricebird/`, `/pricebird/support/`, `/pricebird/privacy/` |
| PriceBird ja | `/pricebird/ja/`, `/pricebird/ja/support/`, `/pricebird/ja/privacy/` |
| PriceBird zh-Hans | `/pricebird/zh-hans/`, `/pricebird/zh-hans/support/`, `/pricebird/zh-hans/privacy/` |
| PriceBird zh-Hant | `/pricebird/zh-hant/`, `/pricebird/zh-hant/support/`, `/pricebird/zh-hant/privacy/` |
| Hushtrail en | `/hushtrail/`, `/hushtrail/support/`, `/hushtrail/privacy/` |
| Trailglass en | `/trailglass/`, `/trailglass/support/`, `/trailglass/privacy/` |
| Aperlo en | `/aperlo/`, `/aperlo/support/`, `/aperlo/privacy/` |
| Aperlo ja | `/aperlo/ja/`, `/aperlo/ja/support/`, `/aperlo/ja/privacy/` |
| Aperlo zh-Hans | `/aperlo/zh-hans/`, `/aperlo/zh-hans/support/`, `/aperlo/zh-hans/privacy/` |
| Aperlo zh-Hant | `/aperlo/zh-hant/`, `/aperlo/zh-hant/support/`, `/aperlo/zh-hant/privacy/` |
| FIRE en | `/fire/`, `/fire/support/`, `/fire/privacy/` |
| FIRE ja | `/fire/ja/`, `/fire/ja/support/`, `/fire/ja/privacy/` |
| FIRE zh-Hans | `/fire/zh-hans/`, `/fire/zh-hans/support/`, `/fire/zh-hans/privacy/` |
| FIRE zh-Hant | `/fire/zh-hant/`, `/fire/zh-hant/support/`, `/fire/zh-hant/privacy/` |

兼容矩阵：`/calcbird/`、`/calcbird/ja/`、`/calcbird/zh-hans/`、`/calcbird/zh-hant/` 每个语言有根页面、`support/`、`privacy/` 共 12 个文件，分别即时 meta-refresh 到相同语言/页面类型的 PriceBird 路由，同时有目标 canonical。现有实现有意不添加 `noindex`，这些 URL 也不进入 sitemap。实现位于 `scripts/build-pricebird-site.mjs:86` 起。

排除路由：`/privacy_policy/iCube_Lite/`、`/privacy_policy/iCube_Pro/`。两者继续在 sitemap 中存在；排除视觉改版不等于移除索引。

## 3. 当前生成链与真正的复用缺口

### 已有可保留能力

- `package.json:5` 定义五个产品生成/检查命令；`build:site` 和 `check:site` 聚合五个产品。没有前端框架运行时，也没有生产 npm 依赖。
- `scripts/lib/static-product-site.mjs:246` 的 `createStaticProductSite()` 处理路由、模板、元数据、输出目录；`escapeHtml()`、JSON-LD 转义和 unresolved token 检查是必须继续保留的保护。
- `scripts/lib/static-product-site.mjs:61` 提供共用语言菜单，`:116` 提供 masthead，`:155` 装饰产品内容。
- `renderAlternateLinks()` 会生成完整同 surface 的多语言链接以及英文 `x-default`。切换语言保持当前页面类型，不是回到产品首页。
- `scripts/build-rouse-site.mjs` 仍有独立的渲染循环、结构化数据处理，但复用 masthead、语言菜单与 escape helper。其独有价值包括版本一致性验证，不适合为统一代码而直接删掉。
- `_site-src/<product>/pages.json` 保存页面元数据；`content/<locale>/<surface>.html` 保存内容。84 个内容片段 + 5 个产品 shell = 89 个源码 HTML。
- 部署产物作为普通 HTML 提交进仓库。页面直接访问无需 SPA fallback，SEO、App Store 支持链接、关闭 JavaScript 后的正文仍有效。

### 当前事实来源散落

产品名称、版本、平台、分发渠道、Store URL、首页介绍和结构化数据分布在首页、脚本参数、JSON manifest、多个语言片段里。Rouse 专门增加了版本一致性校验来补偿重复；其他产品没有同等的全面校验。

一个已经发生的例子：`README.md:23` 仍把 Aperlo 描述为“preparing for the Mac App Store, no download link”，但 `scripts/build-aperlo-site.mjs:68` 已传入 App Store URL，`index.html:312` 显示 1.0.1 免费上架状态。新设计不能按 README 倒退成 Coming soon。这里仅确认本地材料存在冲突；实时商店状态应由实施阶段读取官方页面确认。

### 样式重复的量化结果

统计范围为首页 + 89 个源码 HTML + Trailglass 3 页，不重复计算部署生成文件。

| 位置 | `style=` 数量 | `style-hover=` | `style-active=` | `data-r=` |
|---|---:|---:|---:|---:|
| 首页 | 174 | 28 | 3 | 20 |
| Rouse 源码 | 293 | 16 | 1 | 43 |
| PriceBird 源码 | 132 | 19 | 1 | 9 |
| Hushtrail 源码 | 1 | 0 | 0 | 0 |
| Aperlo / FIRE / Trailglass | 0 | 0 | 0 | 0 |
| 合计 | **600** | **63** | **5** | **72** |

并不是所有语言都采用相同布局：Rouse 英文 changelog 157 条 inline style、英文 support 119 条，PriceBird 英文 landing 65 条、英文 privacy 64 条，其他语言大多还是 `.panel` / `.hero` 简单框架。因此“改英文，再复制配色”无法产生一致的多语言站点。

| 样式文件 | 字节 | 行数 | 当前引用情况 |
|---|---:|---:|---|
| `assets/classical/styles.css` | 11,790 | 274 | 全部 88 个内容页 |
| `assets/site.css` | 16,403 | 839 | 全部 88 个内容页；37 个 `!important`、19 个 `data-r` 选择器 |
| `aperlo/product.css` | 1,475 | 19 | Aperlo 全部 12 页 |
| `fire/product.css` | 4,022 | 36 | FIRE 全部 12 页 |
| `trailglass/product.css` | 3,016 | 118 | 仅 Trailglass 产品页 |
| `pricebird/styles.css` | 11,609 | 629 | 当前部署 HTML 无引用 |
| `calcbird/styles.css` | 11,609 | 629 | 当前部署 HTML 无引用 |
| `garlicbird/styles.css` | 11,609 | 629 | 当前部署 HTML 无引用 |

最后三个 CSS 的 SHA-256 完全相同，属于遗留资源，不能把它们当作新架构入口。是否删除是单独的资源清理决定；视觉设计不依赖删除它们。

### 当前耦合点

1. `index.html:55` 自带 `<style>`，覆盖 token 并以 `!important` 调整 `data-r` 布局；改全局文件后首页不一定同步。
2. `assets/site.css:43` 用全局 `body::before` 添加固定纸纹；这是全站视觉策略，不能留着与新图层相互叠加。
3. `.hero`、`.panel`、`.card`、`.button` 等宽泛 class 与全局元素规则混用；产品局部 CSS 可能依赖原选择器权重与加载顺序。
4. `assets/site.js:10` 通过 pointer event 改写整条 `style`，读取 `style-hover` / `style-active`；需要将 hover/active/focus 迁到 CSS 状态，不能仅删除 inline style 却保留这段行为。
5. `decorateProductContent()` 以 `data-r="ph1|dh1|sh1|ch1"` 检测是否已带产品身份头，这属于布局识别的隐式约定。新模型应显式选择页面类型与头部 variant。
6. 常用颜色混合到透明背景，当前浅色纹理下的对比度不能直接推定新背景或深色模式也合格。
7. 字体变量分为 heading/body/UI/mono，机制可保留，但 CJK 与西文没有显式的字体/行距策略；字重、字间距不能跨语言盲用。

## 4. 媒体资源与展示质量

本节检查实际文件 PNG header 尺寸、文件体积和四张代表图片的像素内容。没有运行浏览器，也没有核验外部源仓库与最新 App UI 的一致性。

| 产品 | 现有可用展示 | 精确规格/规模 | 对设计的影响 |
|---|---|---|---|
| PriceBird | 图标 + 英文页 HTML 结构示意 | 图标 512×512，300,750 B；无截图目录 | 当前比较界面是 `aria-hidden` 的结构说明，不是真实 App 截图。需要真实示例数据截图后再做核心 hero；原型不能宣称示意即当前 App 界面。 |
| Rouse | 图标 + OG 分享卡 | 图标 1024×1024，759,739 B；OG 1200×630，216,799 B；无 App 截图 | 不应放大图标替代实际功能展示。需要菜单栏/计时/显示休眠状态图；现有 OG 可保留为社交分享基础素材。 |
| Hushtrail | 图标 | 图标 1024×1024，1,684,885 B；无截图 | 清理范围与确认是产品核心，需真实选择/检查/确认场景；仅用扫帚式视觉会误导成一键清理工具。当前图标体积过大，首页 56px 显示也下载原图。 |
| Trailglass | 3 张带排版的商店展示图 | 每张 2880×1800；318,871–415,671 B；英文 | 有真实 UI + 合成 example sessions，可信且可读；但图中自带大标题和边距，不适合直接缩小为首页缩略图。宜从可核验源资产导出纯窗口图，保留带字原图作可放大展示。 |
| Aperlo | 4 语言 × 5 张商店展示图 | 共20张，均2880×1800；350,122–603,419 B；截图共10,212,225 B | 覆盖 viewer / gallery / dark detail / fullscreen / windows，素材最完整。图片内已有宣传标题，再与网页大标题叠用容易重复；需为网页准备同一真实 UI 的纯窗口构图。 |
| FIRE | 4 语言 × 3 张原生 widget render | 共12张；Daybreak 1720×820，其余820×820；40,856–670,571 B | 可直接做 widget 展示，不能包装成完整设备截图。视觉中保持三种比例的自身含义，不统一裁成桌面窗口。 |

其他资产：Aperlo 图标实际 256×256（39,619 B），模板却标注 favicon `sizes="512x512"`；FIRE 图标 256×256（96,098 B）；Trailglass 图标 512×512（94,499 B）；头像 320×320（139,170 B）。图标尺寸元数据应随资产清单校准。

资源真实性与当前素材来源：

- `README.md:12` 记录 Trailglass 图片来自 App 仓库的 synthetic example-session images；`trailglass/index.html:68` 明确向读者标记 example sessions。
- `README.md:24` 记录 Aperlo 是 mock-only AppKit 截图和原创示例插画，没有客户图片；不要在设计里添加虚构照片作品或客户使用证言。
- `_site-src/fire/README.md:10` 记录 2026-10-16 原生 WidgetRendering 导出，固定示例数据，使用 shipping FirePalette 填充。这些是 widget renders，不是 device screenshots。

### 图片交付规则建议

- 资产 manifest 分清 `icon`、`app-window`、`store-artwork`、`widget-render`、`illustrative-diagram`，附 `locale`、`width`、`height`、`alt`、来源与示例数据说明。
- 不在主页面把全部高清原图预加载。首页产品目录使用图标/小预览，最多一个主要 hero 媒体优先加载。
- 当前所有源 HTML 图片均无 `srcset`；Aperlo 后四张已有 lazy，Trailglass 主展示有 high fetchpriority，其余部分 lazy。加入 480 / 960 / 1440 / 原尺寸等按实际槽位产生的变体，避免每个移动端图都传 2880px 原图。
- 现有原始 PNG 必须保留或可追溯；网页变体优先验证无损或高质量 WebP/AVIF，不能牺牲 UI 小字清晰度。不要用统一 `object-fit: cover` 裁掉按钮、窗口标题或证据说明。
- 每图提供固定 `width` / `height` 和对应 aspect ratio 预留空间，避免加载位移。重要说明仍写在 HTML，不能只存在截图像素中。
- 图标生成适合 48 / 64 / 128 / 256px 显示的资源，按 DPR 选取，保持平台原有图标边缘；不要在已有圆角像素外叠加过度圆角。
- 增加图片放大时，应明确放大入口、支持键盘和 Escape、关闭后回焦点；不把放大视图当成无法退出的炫技轮播。

## 5. 内容与功能必须保留什么

这些是视觉改版中的内容契约，不是对产品当前线上行为的新核实。

| 范围 | 必须保留的功能或事实边界 | 源码指针 |
|---|---|---|
| 首页 | 六个产品的可发现性，真实平台与可用状态，产品页入口；Jamin 身份、联系邮箱、GitHub；准确保留 `Apple WWDC 2014 Student Scholarship Winner`；Codex UI Kit 独立入口 | `index.html:117`, `:142`, `:330`, `:353` |
| PriceBird | 单价/重量/容量比较，最多4商品，优惠券/订金/满减、本地历史、自定义单位、参考汇率、结构化 Siri/Shortcuts；iPhone/iPad 与 Designed for iPad Mac 区别；非原生 macOS、无 Watch，不声称扫描条码或自动抓价 | `_site-src/pricebird/content/en/landing.html:1`; `support.html:15` |
| Rouse | timed sessions、display sleep、battery protection、menu bar/dashboard、官方 CLI；下载、support、privacy、changelog；设置与版本事实保持一致 | `_site-src/rouse/content/en/landing.html`; `support.html:1`; `changelog.html:1` |
| Rouse Helper | 单独分发、默认关闭、最低 Rouse 版本、签名公证下载、设置流程、有限 lease、恢复/移除；已验证与 deferred 项目分开；紧急命令及无法恢复非默认设置的限制不隐藏 | `_site-src/rouse/content/en/clamshell.html:1` |
| Hushtrail | 选择→检查→决定清理，leftovers 默认不选，app data 额外确认、移到 Trash；权限/管理员提示；实验性 Recents 及格式/系统限制；无备份/无应用内恢复、历史删除可不可逆，不承诺清理所有数据 | `_site-src/hushtrail/content/en/landing.html:1`; `support.html`; `privacy.html` |
| Trailglass | 用户选取本地文件，Codex/Claude Code/Pi/JSON，Browse/Research/Raw JSON、搜索、导出；不修改原始 session、不上传分析；样例会话标签；独立查看器身份 | `trailglass/index.html:49`; `trailglass/privacy/index.html`; `trailglass/support/index.html` |
| Aperlo | 本地图片/文件夹浏览，子文件夹、历史、缩放、全屏、多窗口、幻灯片；可选支持购买；当前实际 CTA 不能受旧 README 影响 | `_site-src/aperlo/content/en/landing.html`; `support.html`; `privacy.html` |
| FIRE | 准备发布状态，四平台、22 widget styles、偶尔记录、可选积累估算，不把估算画成真实资产自动增长；无银行连接、无自建账号、默认关闭 iCloud；不添加下载或预约邮件表单 | `_site-src/fire/README.md:6`; `content/en/landing.html:1` |
| FIRE 支持/隐私 | Watch snapshot 非实时余额；自动更新 opt-in 默认关闭、队列可能继续送达；无手动隐藏金额/应用锁；iCloud 加密字段不等同无条件端到端加密；StoreKit 仅进入 Support 后启动；反馈由用户提交 | `_site-src/fire/content/en/support.html:1`; `privacy.html:1`; `tests/fire-site.test.mjs` |
| 所有 support | 正确 mailto subject、Tally 链接（Rouse 含产品/语言/入口参数）、反馈所需信息、FAQ、故障处理；保留通往本产品隐私页与产品页 | 各 `content/<locale>/support.html`、Trailglass support |
| 所有 privacy | 有效/更新时间、产品适用范围、正文完整性、外部服务区别、数据保留/删除联系方式；不能为了统一品牌写成笼统“完全零联网” | 各 `content/<locale>/privacy.html`、Trailglass privacy |

支持内容的信息优先级：上来先让用户找到答案与联系入口；安装和常见问题应可直达；安全限制/恢复路径必须与操作步骤邻近。长篇隐私文档的视觉目标是可读、可导航、可打印，而不是做营销卡片。

## 6. 完整视觉系统需要覆盖的页面模式

| 模式 | 内容结构 | 必备状态/细节 |
|---|---|---|
| 首页 | 短身份介绍 → 精选展示 → 完整产品目录 → 个人介绍/联系 | 6个产品、可扩展到12/24个；状态和平台可扫读；无需强迫每个产品都用巨幅截图 |
| 产品详情 | 产品身份 → 一句话结果 → 可用状态与 CTA → 真实媒体 → 关键能力 → 兼容性/限制 → support/privacy | App Store、直接下载、准备发布三类 CTA；桌面窗口、移动屏幕、widget 三类媒体构图 |
| Support | 产品身份/面包屑 → 常见入口 → 分主题问题与步骤 → 联系 | FAQ 收起/展开、锚点定位、长代码块、可复制操作反馈、外部表单说明 |
| Privacy | 标题 + 生效/更新时间 → 正文 + 目录 → 联系 | 深链接、移动目录、长网址和列表换行、打印；不默认折叠关键正文 |
| Changelog | 产品身份 → 最新版本 → 时间序列条目 → 相关支持 | 最新标签、版本号与日期、跨语言更新一致、很长历史、旧版本锚点 |
| 操作指南（Clamshell） | 前置条件/状态 → 安装步骤 → 工作机制 → 验证边界 → 恢复/移除 | warning/info 区分、命令原样可读、官方链接、不可省略的限制 |
| 404（新增） | 明确找不到页面 → 首页/产品/支持导航 | 无 JS 可用、深路径下资源仍正确；不能凭 URL 模糊匹配自动跳转到错误产品 |
| 跨语言导航 | 当前语言显示 → 可用语言列表 | 当前项、键盘焦点、Escape、外部点击、9语言滚动、小屏长标签、同surface保持 |

首页作为产品数量增长的入口，优先使用稳定、清晰的目录结构。当前只有6个产品，不需要先造站内搜索。未来若需要筛选，分类来自产品数据；原始全部列表无 JS 仍可用，筛选应是渐进增强。

## 7. 最小可行静态复用架构

按 **data/schema → primitives/tokens → shared components → page patterns → product overrides** 建立五层，不引入为六个产品服务的通用 CMS 或浏览器 React 运行时。

### 7.1 data / schema：集中事实，保留正文自由度

建议一个全站产品注册表 + 各产品现有 metadata 与本地化正文：

```text
_site-src/
  site.json                 # 站点身份、外部项目入口、导航、默认语言
  products.json             # 六个产品的稳定事实与首页排序
  shared/
    locales.json            # locale id / 路径段 / 自称 / 共用UI文案
  home/                     # 首页文案与精选策划
  <product>/
    pages.json              # 每语言×surface的标题/描述/结构化数据覆盖
    media.json              # 媒体类型、尺寸、语言、来源、替代文字
    content/<locale>/...    # 语义HTML正文，逐步消除布局与颜色
```

产品注册表最少字段：`id`、`name`、`route`、`icon`、`siteLocales`、`surfaces`、`platforms`、`release { version, status, channel, url }`、`summaryByLocale`、`accent`、`featuredMedia`。状态用有限枚举，如 `available / preview`，渠道用 `app-store / direct / none`；不要只存一个 `isAvailable`，否则无法表现直接下载与未发布的差别。

页面内容不必全部改成巨型 JSON block tree。Privacy/Support 保留语义 HTML（或已有团队采用的轻量文本源），渲染时用公共容器。产品页仅把常见、重复的身份/CTA/媒体/功能集合结构化。特有流程保留少量自定义 section，避免为了个别布局扩出十几个万能字段。

所有产品事实只在一处修改，首页卡片、header CTA、产品 metadata/JSON-LD 从同一数据派生。版本与可用状态的测试检查结果一致，不绑死 HTML 的具体标签或 CSS 文件名。

### 7.2 primitives / tokens：可复用的视觉语言

一份集中 token 包含：语义颜色、文字层级、语言字体栈、正文宽度、space scale、radius、border、shadow、motion、focus ring、z-index。

应有 `text-primary / secondary / muted`、`surface-page / raised / subtle`、`border-default / strong`、`accent / accent-text / accent-surface`、`status-info / warning / success` 等语义角色。产品色与状态色分开，避免把 FIRE 绿色误解成“成功”或把 Rouse accent 当成可点击状态。

组件优先采用统一字级和 class，禁止为每段正文写 14.5 / 15 / 15.5 / 16 / 16.5 的任意值。中文/日文/韩文通过 `:lang()` 调整字体 fallback、行距与文字换行；不把英文 uppercase + 高 letter-spacing 套给 CJK。

CSS 建议只维护 `tokens.css / base.css / components.css / pages.css` 四个逻辑层，必要时构建合并。文件拆分数量不需要与组件数量相同。旧 Classical 字体若不再引用，移除网络请求；历史授权文件可保留，不应被测试强制要求继续加载。

### 7.3 shared components：先覆盖实际重复

首批组件足够：SiteHeader、ProductBreadcrumb、LocaleSwitcher、ProductIdentity、StatusLabel、ActionGroup、ProductCard、MediaFigure、FeatureList、DocumentHeader、ContentsNav、Notice、CodeBlock、FAQ、ReleaseEntry、ProductFooter、SiteFooter。

组件契约重点：

- Header 的 variant 只有 home / product / document。小屏不把关键产品身份全部挤掉。
- ActionGroup 处理可用状态、渠道、主次动作、外部链接标识，不能对未发布产品自动生成下载按钮。
- ProductCard 目录卡共享布局；精选卡是显式 variant，不能每个产品任意一套 DOM。
- MediaFigure 对不同媒体类型提供合理容器，UI图与widget不硬套同一aspect ratio。
- DocumentHeader 提供日期、返回产品与合适的内容宽度；正文不依赖 `.panel > h2` 等特定深度。
- LocaleSwitcher 使用原生 `details/summary` 可继续保留。若行为只需原生元素实现，就不增加 ARIA menu 角色和完整菜单键盘模型。
- Notice 的语义与颜色配套，warning 不只依赖颜色；恢复命令旁有正确限制文案。
- Footer 从产品 capability 自动决定是否包含 Changelog/Helper。没有这些 surface 的产品不生成空链接。

可继续使用依赖为零的 ESM render functions 输出 HTML。输出函数统一 escaping，正文 fragment 是明确的可信源码插槽，不把用户输入混入 raw HTML。只在新增功能显著受益时再引入模板库，不为“组件化”改变部署模式。

### 7.4 page patterns：六种产品页模式而非84种

Home、ProductLanding、Support、Privacy、Changelog、Guide、NotFound 采用清晰的模式函数；产品和语言只是数据。模式负责 section 顺序、语义 heading、container 与媒体结构；shared component 负责内部细节。

迁移后的输出仍是现有 URL 下的 `index.html`，404 是根 `404.html`。不使用客户端路由，语言切换和深链接继续是普通 `<a>`。site build 产出 manifest 供本地链接校验、sitemap、OG 生成使用，并允许单独注册 `/codex-ui-kit/` 外部项目入口。

### 7.5 product overrides：保留差异的边界

允许覆盖：产品 accent、媒体类型/比例、最多少量有明确目的的特色 section（如 FIRE widget composition、PriceBird 比价说明、Rouse Helper 流程）。

不允许覆盖：基本字体栈、按钮交互、焦点环、全局 header/footer 结构、文档正文宽度策略、语言菜单、小屏导航。产品不应该重新定义全局 `.button` 或 `body`。如果两个产品都出现相同特例，应提升为组件 variant；只有一个产品使用时，先保留局部特色，不提前抽象。

扩展验收：未来增加第七个普通产品，应主要新增产品记录、必要的语言文案和媒体，不复制全套 CSS、header/footer 或 CLI 生成器。

## 8. 迁移顺序与兼容风险

### 推荐迁移顺序

1. 冻结真实路由、页面元数据、内部锚点、下载/反馈链接、iCube 文件哈希；将产品事实冲突列为可追踪项。
2. 完成设计 token、组件清单与代表页面方案。代表页至少覆盖：首页、可用产品、准备发布产品、长 support、privacy、changelog、Helper。
3. 建立新公共 shell 和组件；先接一组有真实媒体的产品（Aperlo）验证结构，再接差异较大的 FIRE 和文档页。
4. 首页与 Trailglass 纳入生成链，去掉复制的 masthead/footer；统一 registry 驱动首页列表，保留全部六个入口与外部项目入口。
5. 迁移 Rouse/PriceBird 所有语言，先去 inline style 再删旧适配 `data-r` 与 JS hover runtime。同步保留 Rouse 版本一致性与完整内容。
6. 检查所有88页及12个重定向，最后清理不再加载的视觉资源/过时 README。不要在中途让“英语新版、其他语言旧版”成为最终交付。

### 主要兼容风险

| 风险 | 影响 | 控制方式 |
|---|---|---|
| 全局 CSS 一次覆盖88页 | 字体、行高、宽度变化可能破坏旧 inline layout | 代表页先验收；逐步迁移到显式组件；所有语言再跑矩阵 |
| 改错生成输出 | 下次 build 会把设计覆盖回去 | 只编辑 `_site-src` / shared renderer，再生成；Trailglass/home 先明确来源 |
| 英文/非英文结构不一致 | 看似全站同色但信息层级仍不同 | 共享page pattern，翻译只改变内容而不重新定义布局 |
| `style-hover` 继续运行 | 覆盖新 CSS 或产生鼠标/键盘状态差异 | 迁完对应节点即删除旧状态属性，最终移除JS循环 |
| 更换 heading/版本标签 | Rouse `<dd>` / `data-rouse-version` 校验失败 | 保留语义版本数据契约或重写一致性验证，不能仅删测试 |
| 老测试绑定 Classical 文件名 | 新设计正确但旧实现断言失败 | `tests/product-site.test.mjs:256` 更新为新设计契约与无运行时依赖，而非继续强绑旧CSS |
| 平台/状态简化 | PriceBird被误标原生Mac；FIRE出现下载；Hushtrail变成App Store | 精确 platform/channel/status 数据模型；与页面真实状态核对 |
| 目录重新生成 | 丢失 iCube 或外部 `/codex-ui-kit/` | registry显式标记 external/legacy/excluded，保留sitemap91条基线 |
| 图片重裁与压缩 | 宣传文案重复、UI字不可读、产品被误表述 | 区分原图/网页变体、保留来源；按真实显示尺寸逐张检查 |
| 固定高度与长翻译 | 德语/葡萄牙语按钮截断，CJK标题拥挤 | 容器随内容增长，禁止关键文字省略；使用长字符串压力样例 |
| 统一“local/private”营销句 | 与汇率、StoreKit、iCloud、反馈等实际网络行为冲突 | 保留产品级事实，不把隐私正文自动归并成统一承诺 |
| 404站点根路径 | 深URL加载相对CSS/图片失效 | 全局资源使用根相对地址；404不自动生成错误canonical |

## 9. 验收矩阵：源码证据、浏览器证据与发布证据分开

本次审计的当前基线：`npm test` **30/30 通过**；`npm run check:site` 通过。以上只说明已提交生成产物和现有契约一致，不证明视觉美观、可访问性、实际部署和最新商店状态。

### 结构与内容（所有路由）

| 检查 | 覆盖量 | 完成标准 |
|---|---:|---|
| 所有内容页输出/结构 | 88既有页 + 新404 | 有主标题与main、合法语义、无未替换token、无空链接 |
| 产品生成源与输出一致 | 87产品页（迁移后） | 一次build后check零差异，第二次build无变化 |
| 兼容重定向 | 12页 | 相同语言与surface映射；refresh和canonical目标一致 |
| 排除文件 | 2页 | iCube HTML哈希不变，不意外引用新样式 |
| sitemap与外部项目 | 既有91 URL | 内容页完整、无calcbird重复、iCube与codex-ui-kit保留；404通常不进sitemap |
| 语言/SEO | 所有多语言路由 | lang、canonical、自指与互指hreflang、x-default、同surface切换正确 |
| 产品事实 | 6产品 | 首页/产品/header/JSON-LD版本、平台、状态、渠道无漂移 |
| 内容保全 | support/privacy/changelog/Helper | 重要限制、日期、联系方式、反馈参数、恢复步骤和历史条目无意外丢失 |

### 视觉与响应式

自动截图覆盖至少桌面1440px与手机390px的88个内容页；320px做窄屏溢出检查，768px检验中间断点。人工重点检查以下代表集合，不能只看首页：

| 维度 | 必检代表 |
|---|---|
| 页面模式 | 首页、六个产品landing、Rouse support/privacy/changelog/Helper、FIRE support/privacy、新404 |
| 西文长文本 | Rouse de、pt-BR 的header、support和Helper |
| CJK | PriceBird zh-Hans、Aperlo ja、FIRE zh-Hant、Rouse ko |
| 媒体 | Mac窗口图、暗色UI图、长宽widget、方形widget、图标缺少截图的产品 |
| 数据规模 | 6 / 12 / 24产品；极长产品名；没有hero媒体；只有一种语言；9语言菜单 |
| 操作状态 | hover/active/focus、当前页、语言展开、FAQ展开、目录锚点到达、图片放大（若有） |

### 可访问性与健壮性

- 键盘从页首到末尾可达；可见 skip link；合理焦点顺序；菜单 Escape 后返回触发器；不能出现只能hover获取的关键内容。
- 正文普通字号对比度至少4.5:1，大文字至少3:1；按钮边界和focus根据实际背景检查，不能只查hex表。相关标准由主研究报告提供权威引用。
- 200%文本缩放、400%页面缩放下内容可读；长中文、德文、URL、命令不会迫使整页横向滚动。局部代码块可水平滚动。
- `prefers-reduced-motion` 下移除非必要动画；关闭JS后产品目录、下载、语言跳转、support/privacy正文可用。
- 若本轮定义深色模式，则必须为所有组件和媒体容器完成深色验收；不应只对body取反就把它称为完整模式。
- 图片有适当alt；装饰性重复图标空alt；截图说明包含“示例数据/原生渲染”等必要背景；错误的icon尺寸声明修正。

### 性能与实际发布

- 手机网络下测试首页和媒体最重的Aperlo/FIRE页面，记录LCP/CLS与实际传输体积；用预算防止首页24产品样例演变成24张高清图的下载页。
- 本地图片全部可读；fetchpriority只用于明确LCP候选；below-fold媒体lazy；正确尺寸预留避免布局跳动。
- 发布后才核验最终主域、关键深路由、样式/图片内容哈希、canonical与headers；不能把本地通过等同于GitHub Pages已经更新。

## 10. 需要单独记录的待核实项

1. 真实 App 截图：PriceBird、Rouse、Hushtrail 当前仓库无可用截图。首轮设计应区分“已具备真实素材”与“待补素材”，不要生成虚构App界面填补证据。
2. Aperlo README 状态冲突；其favicon声明512px与实际256px不符。
3. 首页没有多语言版本。这次统一现有多语言产品页不自动等于新增四/九语言首页；若要新增，需完整译文与路由策略，而非语言按钮假入口。
4. 当前OG除了Rouse多使用图标。可设计共用分享卡模板（1200×630），各产品保留名称、核心用途、真实图形与状态；是否批量产出属于后续实施。
5. `/codex-ui-kit/` 是外部项目页，当前本地测试明确要求其入口和sitemap，实际可用性需要发布阶段或研究阶段通过官方页面再核验。
6. 六个产品的公开可用状态、最新版与最低OS目前只按本地内容记录；发布改版前必须重新核验官方商店/Release，不能用本审计当作实时发行信息。

## 11. 审计依据与排除保护

主要文件：`index.html`、`README.md`、`package.json`、`.github/workflows/site-checks.yml`、`_site-src/*/pages.json`、五个template、84个content fragments、`scripts/build-*-site.mjs`、`scripts/lib/static-product-site.mjs`、8个CSS、`assets/site.js`、四个test文件、`sitemap.xml` 与媒体文件。

参考历史仅用于确认“保持静态输出、生成源编辑和跨仓库依赖显式化”的既有选择；本报告中路由、数量、资源、当前代码与测试结果均在2026-10-17重新读取。

排除文件基线 SHA-256：

```text
privacy_policy/iCube_Lite/index.html
229b1e717fc3ba408c95a5ac12794504a842cf9690f47a4a40310a9e727fcfac
privacy_policy/iCube_Pro/index.html
7e52c0b55b31e7573d458697caac4430caf574545419bbda17ab064a154df2ce
```

历史依据：`MEMORY.md:1949-1959`、`rollout_summaries/2026-07-12T14-03-41-Dw4C-rouse_site_template_pr_watch_merge.md:19-24`，rollout `019f56a4-139e-7560-98dc-5ff8008fb566`。
