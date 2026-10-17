# 网站视觉设计与本地检查

[设计提案](DESIGN.md) · [目录研究](research/catalog-rethink.md) · [初轮研究](research/reference-study.md) · [验证记录](VALIDATION.md)

设计已迁入正式静态构建器，尚未发布。首页、支持与产品页面的预览直接来自正式 Node 组件，不再保留独立产品数据或 Python 内容转换器。iCube 不参与改版。

```sh
npm run build:preview
python3 _design/check.py
python3 _design/serve.py --port 8080
```

- `/`、`/zh-hans/`：正式实现的英文、中文首页。
- `/support/`：支持目录；各产品原路径保留全部语言和文档。
- `/design/`、`/design/system/`、`/design/responsive/`：本地设计记录、组件展示与尺寸检查台。
- `pages/`、`system/`：评审板及其辅助样式；不参与生产构建。
- `preview/`、`evidence/`：可重建输出与浏览器证据，Git 忽略。
- `build.py`：兼容旧命令的入口，转调 `npm run build:preview`。

服务器仅监听本机。预览页面加 noindex，production 页脚不含 Design preview。
设计研究中的早期布局与旧测试数量是过程记录，最新状态见 VALIDATION.md 最后一节。
