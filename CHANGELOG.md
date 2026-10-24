# Changelog

本文件格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [0.1.1] - 2026-10-24

### Added

- GitHub Actions CI（`.github/workflows/ci.yml`）：node 20 / 22 / 24 三档矩阵跑离线冒烟测试
- `pack` job：`npm pack --dry-run` 后断言 `lib/index.js`、`cordis.patch.yml`、`README.md`、`LICENSE` 已进包，并断言 `test/` 未被打包
- README 顶部 CI 状态徽章

### Notes

- 无功能变更，插件运行行为与 0.1.0 完全一致

## [0.1.0] - 2026-10-24

### Added

- 宿主插件骨架：`export const name` / `export const inject` / `export function apply(ctx, config)`
- `hello_plugin` 工具，支持可选 `who` 参数，声明 `output.schema` 并提供 `render`
- `cordis.patch.yml` 加载行，`config.greeting` 可配置问候语前缀
- 离线冒烟测试 `test/smoke.mjs`：验证导出契约、注册数量、`execute` / `render` 行为
- `package.json` 声明 `dsh.bundle.patch`、`engines.dsh` 与可选的 `@deepseek-ai/dsh-tools` peer

[Unreleased]: https://github.com/mrkeyoe/dsh-hello-plugin/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/mrkeyoe/dsh-hello-plugin/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/mrkeyoe/dsh-hello-plugin/releases/tag/v0.1.0