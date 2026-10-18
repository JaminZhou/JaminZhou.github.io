# 设计验证记录

日期：2026-10-17。对象：`_design/` 本地视觉原型，分支 `feat/site-design-system`。本记录区分静态内容检查、实际浏览器观察和仍需生产验收的项目。

## 第一轮标注后的精修（当前版本）

Jamin 的七处标注均已落实到共享结构：

| 标注 | 修改 |
| --- | --- |
| 1：语言箭头奇怪 | 字体字符改为16px SVG chevron；展开旋转；双圈符号改为18px地球SVG |
| 2、3：图标条中部分图标小 | 读取原图alpha范围；Aperlo与Trailglass主体占画布80.47%，共用组件按1.242718倍校正，原PNG不修改 |
| 4：卡片图标偏小 | 目录图标改64px；图标条52/48px、产品导航36px、文档标识48px，使用同一光学校正规则 |
| 5：暂停维护的工具不展示 | 英中首页均移除Codex UI Kit宣传区 |
| 6：外观箭头小 | 共享16px SVG，原生select保留；控件最小高44px |
| 7：双精选依据与视觉不统一 | 取消当前双精选；主页呈现等权重应用目录，真实截图和widgets保留在各自产品页 |

子页面额外修复：Rouse英文支持页移除重复的旧TOC，保留新桌面/移动目录、正文及全部章节锚点。现有样稿共94页统一使用图标与选择器组件。

静态检查：94页、87个原产品路由、**4,405个本地URL**、2,785个原文事实块、155个服务/发行URL、122个原媒体引用通过；生产文件与iCube不变。下面初版记录中的4,435个引用与精选说明属于历史结果。

浏览器回归：13条路线 × 6个窗口尺寸 × 2个主题 = **156组**，包括六个产品、首页、支持、隐私、更新记录、中日德文。外宽320/390/606/768/925/1280px，iframe实际内容宽318/388/604/766/923/1278px。没有整页横向溢出；当时已加载图片没有解码失败。检查台固定iframe渲染宽度，较宽页面可在预览区内横向滚动，不会偷偷缩成当前窗口大小。

交互实测：语言菜单展开、16px箭头、Escape关闭及焦点回到summary；外观仍是原生SELECT，实际高度44px、SVG16px，浅/深/系统可切换。键盘菜单与主题行为继续有效。

证据：`evidence/polish-layout-matrix.json`、`evidence/home-polished-desktop.png`。以下保留初版完整验证记录；尚未完成的真机、辅助技术与生产发布验证边界继续适用。

## 已完成的验证

### 全量内容、路线与保护范围

执行 `python3 _design/build.py`、`python3 _design/check.py`。检查器独立读取原站内容，不 import 构建器，避免共用同一个解析错误。

| 项目 | 结果 |
| --- | --- |
| 预览HTML | 94页，全部noindex |
| 原产品页面矩阵 | 87页完整，所有现有语言与surface保留 |
| 本地链接、资源与fragment | 4,435个引用通过 |
| 原文事实块 | 2,785个通过；明确允许6款英文hero导语重新撰写 |
| 服务、反馈与发行链接 | 155个保留；未对外提交反馈或下载 |
| 原始图片引用 | 122个保留 |
| 标题/ID | 每页一个H1，ID无重复 |
| 生产文件 | 与审计基线无差异；新增文件仅在`_design/` |
| iCube | 两个原隐私页SHA与基线一致 |
| Git空白检查 | `git diff --check`通过（新增目录由构建和独立脚本检查） |

仓库原有基线 `npm test` 30/30、`npm run check:site` 通过。该结果由仓库审计阶段执行；之后没有改动生产构建或产品文件，未为了重复报告重新跑相同基线。

### 本轮发现并修复的回归

- PriceBird四语言支持页的次级按钮文字曾被旧兼容样式覆盖，现与背景有清楚对比。
- Hushtrail版本说明与发行仓库入口恢复；直链下载和发行说明保持分离。
- PriceBird三个非英文首屏的iPhone Duo版本说明保留。
- Rouse九语言ActionGroup与ReleaseEntry共用结构，目录统一显示版本号。
- 繁中名称、公共release/skip/menu/footer文案修正；缺翻译入口明确显示English。
- 320px导航和图标条溢出修复；图标条可换行。
- 精选由配置驱动，支持三种媒体，实际检查6款分别作为精选的英文和中文输出，12种组合均成功且媒体存在。
- 目录改用事实用途描述，精选保留较有情绪的简短文案。
- FIRE图标原始文件在当前浏览器不能解码，预览重新编码后正常，原文件未修改。
- 加强浅色控件边框对比；skip link目标添加可聚焦main，文档锚点避免重复叠加滚动偏移。

独立审查的初始发现与修复后记录见 [prototype-review.md](research/prototype-review.md)。报告中的“辅助英语标签”和“精选硬编码”属于当时快照，随后已经继续处理；本文件记录最终结果。

### 浏览器布局与真实交互

环境：macOS上的Codex内置浏览器。桌面实际视口1280px。响应式检查台用真实同源iframe，其320 / 390 / 768px外宽对应318 / 388 / 766px内容宽（2px边框）。

**60组布局检查**：10条路线 × 3种宽度 × 浅色/深色。检查每次实际H1、语言、根元素clientWidth和scrollWidth，没有发现整页横向溢出。

路线：主页、Aperlo、FIRE、Rouse、Rouse支持、隐私、更新记录、映窗简中、Aperlo日文、Rouse德文。具体记录在 `evidence/layout-matrix.json`。

**桌面检查**：主页、六产品首屏、Rouse隐私与Helper长指南、映窗繁中、组件页共11条路线，均为1280px，无整页溢出，已加载图片没有解码失败。记录在 `evidence/desktop-matrix.json`。这不代表所有懒加载图片都已逐张滚动验收。

| 交互 | 实际结果 |
| --- | --- |
| 首页平台筛选 | Mac显示5款；iPhone & iPad显示PriceBird与FIRE两款；All恢复6款 |
| 主题 | Light/Dark可切换；跨页面保持；响应式页内同步 |
| 产品语言 | Aperlo简中切到日文，保留产品landing类型 |
| 移动菜单 | 展开显示导航；Escape关闭并将焦点返回菜单summary |
| FAQ | 组件页原生details实际展开，答案可见 |
| Skip link | 键盘Tab显示3px焦点框；Enter跳至main；目标支持程序化焦点 |
| 文档目录 | Helper指南目录进入Safety model的真实锚点 |
| 次级按钮 | PriceBird Feedback form / Privacy policy文字为实际Ink色，背景透明 |
| 图片 | FIRE图标解码宽度256；首页和产品页真实图片可见 |

浏览器驱动对iframe的部分DOM click未触发预期菜单展开；随后使用实际可访问性入口点击确认成功。没有把驱动的点击尝试当作组件通过。

### 语义色对比与资源

按sRGB相对亮度计算，原始结果在 `evidence/contrast.json`。这是选定token配对的检查，不能代替整页自动/人工无障碍审计。

| 配对 | 浅色 | 深色 |
| --- | --- | --- |
| Ink / Canvas | 13.79:1 | 14.44:1 |
| Muted / Canvas | 5.77:1 | 9.07:1 |
| Quiet / Canvas | 4.90:1 | 7.92:1 |
| Brand / Canvas | 7.29:1 | 9.96:1 |
| Warning / Warning背景 | 6.31:1 | 7.78:1 |
| Focus / Canvas | 4.82:1 | 9.38:1 |
| Strong border / Canvas | 3.40:1 | 4.58:1 |
| 六产品Accent / 自身Tint的最低值 | 5.17:1 | 7.50:1 |

当前共享CSS gzip约7.5KB，交互JS gzip约1KB，无外部字体依赖。不是Lighthouse结果；原始PNG未做生产级响应式压缩。

## 验证边界与生产门槛

- 94页结构与内容做全量检查；实际截图与交互是上述代表性覆盖，未宣称94页逐屏人工验收。
- 未进行真实iPhone/iPad触摸、Safari/Firefox/Windows字体、VoiceOver完整流程、200%文字与400%页面缩放验收。
- reduced-motion与forced-colors有CSS支持，但没有切换系统设置进行运行验收。
- 无JavaScript回退从静态HTML与原生details设计核查；没有在浏览器禁用JS跑完整流程。
- 未测试外部App Store购买、GitHub下载和反馈表提交，未修改外部服务。
- 版本、最低系统和商店状态来自当前仓库；没有做新一轮App Store在线核验。
- 截图仍需补拍/优化，尤其Rouse、PriceBird、Hushtrail；Aperlo与Trailglass现有商店合成截图还可换成网页专用干净窗口截图。
- 未部署。canonical/hreflang/OG/sitemap与线上read-back是正式迁移门槛；本地原型刻意noindex。

## 查看结果

启动方法见 [README.md](README.md)。主要截图保存在 `evidence/`：`home-desktop.png`、`home-dark.png`、`home-mobile.png`、`aperlo-dark.png`、`guide-desktop.png`。证据目录为本地生成文件，不加入Git；设计源文件可重建预览。

## 第二轮：目录去重与产品组织（2026-10-17）

对应研究：[catalog-rethink.md](research/catalog-rethink.md)。本节为当前预览的最新增量验证；上方截图与记录保留作历史，不代表当前首页仍有图标条。

### 本轮结构变化

- 首页删除六图标条与额外跳转，采用一份两列应用目录；每款产品只有一个条目。
- 目录图标可见主体统一为72px，保留已有透明留白补偿；支持汇总复用同一组件。
- 产品页删除按配置顺序取前两款的推荐卡片；Rouse、PriceBird、Hushtrail使用紧凑开场。
- 设计页改为「单一目录 / 按任务分组 / 主打与其余」三种结构草图，字体沿用已经选择的无衬线。

### 浏览器验证

- **88组布局检查**：11个路由 × 4个宽度 × 浅/深色。
- 路由：英文首页、中文首页、支持汇总、设计方案、Rouse、PriceBird、Hushtrail、Rouse德文、Aperlo、Trailglass、FIRE。
- 请求宽度320/606/925/1280px，iframe实测318/604/923/1278px。没有横向溢出，没有已完成加载但解码失败的图片；主题与请求相符。
- 首页各样本均为6个产品卡片、6个不同目标；用户当前672px窗口额外读回：主内容6个AppIcon、6个产品卡片。
- 真实按钮操作：All为6，Mac为5，iPhone & iPad为2；FIRE跨平台但不重复生成。筛选选中状态与数量提示同步。
- 目视检查：1280px浅色/深色首页、672px实际窗口首页、318px窄屏首页，以及1280px紧凑Rouse页面。恢复原先的System主题。
- 保留首页、设计方案、Rouse产品页预览；服务继续监听127.0.0.1:50380，便于Jamin继续检查。

证据文件（Git忽略）：

- `evidence/catalog-layout-matrix.json`
- `evidence/catalog-filter-check.json`
- `evidence/home-catalog-desktop.png`
- `evidence/home-catalog-light.png`
- `evidence/home-catalog-window.png`
- `evidence/rouse-compact-desktop.png`

### 静态校验

`python3 _design/build.py`、`python3 _design/check.py`与`git diff --check`通过。当前输出94个noindex页面，保留87个原产品路由、2785个原内容事实块、155个服务/发行链接、122个原媒体引用；校验4293个本地URL。六个英文开场文案仍是之前已经明确的改写例外。

生产基线与iCube哈希检查通过；未修改线上源文件，未发布。没有将DOM布局检查声称为真机Safari、全站屏幕阅读器或用户转化测试；无截图的三款产品仍需后续真实素材才能进行界面演示。

## 页脚生产布局精修（2026-10-17）

根据支持页标注，去掉页脚的Design preview链接，独立设计页仍保留。页脚使用两列grid：版权在左、外观控制在右，垂直居中；760px及以下分行左对齐。普通指针下原生选择器从44px调整到32px，粗指针设备保留44px；上、下内边距统一24px，元信息行间距20px。

- 浏览器验证30组：Rouse九种语言各320/995/1534px三种宽度（27组），支持汇总相同三种宽度（3组）。iframe实际宽度318/993/1532px。
- 全部无横向溢出；宽屏选择器右边缘与页脚内容右边缘一致，版权和控件中心线误差0px；窄屏控件左对齐，位于版权后12px。
- 实际支持页810px窗口：选择器32px，页脚高度由161.05px降至129.05px；没有Design preview占位。
- Light/Dark/System真实选择操作通过，控件始终32px；已恢复System。粗指针44px为CSS规则，未进行真机触摸验证。
- 全部94个预览页面重建；87个原产品路由、2785个事实块、155个服务/发行链接和122个媒体引用校验通过。生产及iCube保持不变。
- 证据：`evidence/footer-layout-matrix.json`、`evidence/footer-support-refined.png`。

## 正式静态实现与本地验收（2026-10-17）

本节是最新状态。原型已迁入正式 Node 构建流程；上方“生产源文件未变”的记录仅描述此前设计阶段。尚未部署、推送或创建PR。

### 代码与内容

- 共享模板生成91个现代页面：87个原产品/文档路由，英中首页、支持汇总、404。
- 12个CalcBird跳转保持原样；iCube两页SHA-256与改版前完全一致。
- 对照`c5e96f34356b40817a4f4cb75e2d798b43a4bfa5`核对，2785个原内容事实块、155个外部服务/发行链接保留；沿用已审核的6段英文hero介绍改写。
- 所有原产品canonical、语言矩阵、支持表单参数、隐私内容和原图入口保留；主页RSS发现链接与个人结构化资料继续提供。
- 原独立产品模板与Python转换器退役；导航、页脚、图标、目录卡片、hero、文档TOC及产品色统一由Node组件生成。设计快照的产品数据并入现有manifest，版本/下载不另建来源。

### 自动检查

- `npm test`：35项通过。
- `npm run check:site`：共享页面与6产品的生成内容均一致。
- `python3 _design/check.py`：87个产品预览与正式输出一致，仅增加本地noindex。
- `git diff --check`通过；未知预览路径实测HTTP 404。
- 新增检查覆盖91页面的主标题、main、canonical、锚点、本地链接、图片哈希/预算、目录唯一性、版本来源及iCube排除范围。

### 浏览器

- 120组：15路由 × 320/606/995/1534px × 浅/深色；iframe实际宽度318/604/993/1532px。
- 无页面横向溢出；已加载图像均可解码；每页一个H1和main。
- 首页All/Mac/iPhone & iPad实测6/5/2项，数量提示同步；恢复All。
- Aperlo英语→繁中→隐私页→日语：语言切换保留surface，繁中产品名“映窗”正确。
- 语言菜单Escape关闭并回到summary焦点；窄屏移动菜单Escape正常。
- 窄屏Rouse目录可展开，点击后跳转到section-1且焦点落到H2。
- 目视检查首页、支持汇总与Aperlo截图hero；支持页生产页脚已无Design preview，版权与外观控制左右对齐。
- 保留首页、设计板、支持页三个浏览器标签与127.0.0.1:50380预览，主题恢复System。

### 图片与性能预算

- 42个WebP显示资源共750852字节，原始截图保留；小图不放大后再编码。
- 首页头像与六图标共36100字节。
- 共享CSS合并后gzip 7922字节，JS gzip 871字节；没有外部字体请求。
- 这些是静态字节预算和本地浏览器结果，不能等同于线上LCP/INP/CLS成绩。

### 证据与边界

本地`evidence/implementation-layout-matrix.json`、`production-migration-audit.json`、`implementation-asset-budgets.json`、`implementation-home.png`、`implementation-support.png`。证据目录Git忽略。

未执行线上发布、外部购买/下载/反馈提交；未新增App Store状态核验。没有宣称已完成真机Safari、触摸设备、屏幕阅读器完整验收或WCAG认证。三款缺少当前界面截图的产品继续采用已审定的紧凑开场。

## 2026-10-18 · 精简品牌、导航与联系入口

- 头像仅保留在 About；顶栏保留文字站点标识；页脚移除第二套品牌与全站导航。
- 中英主页不设支持汇总，每个应用只在目录展示一次。全站导航保留 Apps / About，各产品导航保留自己的帮助入口。
- 移除顶部邮件图标与 Get in touch 区块；主页仅在页脚显示一处 `me@jaminzhou.com` 邮件链接。原 `/support/` 及其 canonical、sitemap 记录保留，兼容已有外部链接。
- `npm test` 35 项通过，`npm run check:site` 与 `git diff --check` 通过；iCube 和 CalcBird 历史链接检查仍通过。
- 最终版浏览器检查：320 / 1280px × 中英主页 × 深浅色，共8种组合，未见横向溢出；每页6张产品卡、1个邮箱链接，无支持汇总区。默认810px预览确认页脚邮箱和外观控件排列正常。
- 本地证据：`evidence/home-minimal-layout-matrix.json`、`home-minimal-refined.png`。只验证本地预览，未发布本轮调整。

## 2026-10-18 · Support 直接帮助菜单

- 顶部增加 Support 点击下拉，仅列六个产品名称，直接进入各自帮助页；手机端在主菜单内展示支持分组。主页正文仍只有一份产品目录。
- 桌面和手机链接共用产品 manifest；91 个生成页面逐一核对六个直达目标，优先当前语言，回退英文时显示 English。原 `/support/` 不再作为必经中转。
- `npm test` 35 项、`npm run check:site`、`git diff --check` 通过；iCube、CalcBird 无变更。
- 浏览器检查 320 / 760 / 768 / 1280px × 深浅色，共8种组合：页面不横向溢出，菜单边界在视口内。320×480短屏菜单可滚动，已点击末项 FIRE 到达帮助页。
- 桌面 Enter 展开、Tab 进入首项、Enter 到达 Aperlo Support；Escape 收起并返回触发器焦点，Tab 离开收起，点击外部收起，语言菜单和 Support 互斥。手机端中文“映窗”直达中文帮助页；英文回退标记核对正确。
- 本地证据：`evidence/support-dropdown-layout-matrix.json`、`support-dropdown-mobile-zh.png`、`support-dropdown-desktop.png`。本轮仅更新本地预览，未发布。
