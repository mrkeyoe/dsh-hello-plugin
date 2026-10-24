# dsh-hello-plugin

[![CI](https://github.com/mrkeyoe/dsh-hello-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/mrkeyoe/dsh-hello-plugin/actions/workflows/ci.yml)

一个**最小可用的 DeepSeek Harness（dsh）插件**：向宿主注册一个 `hello_plugin` 工具。
它不是玩具 demo 的堆砌，而是把「一个 dsh 插件到底需要哪些文件、每个文件负责什么」压缩到能一眼看完的程度 —— 抄这份骨架改名即可起步。

- 零运行时依赖（`@deepseek-ai/dsh-tools` 由宿主提供）
- 单一职责：一个工具、一个 effect、一处配置
- 附离线冒烟测试，不需要启动 DSH 就能验证接线是否正确

## 目录结构

```
dsh-hello-plugin/
├── package.json        # 插件身份 + dsh.bundle.patch 声明
├── cordis.patch.yml    # 向 bundle 插入加载行（id / name / config）
├── lib/index.js        # 宿主入口：export name / inject / apply
├── test/smoke.mjs      # 离线冒烟测试（node test/smoke.mjs）
├── README.md
├── CHANGELOG.md
├── LICENSE
└── .gitignore
```

## 四个必需文件各自的职责

| 文件 | 必需性 | 作用 | 缺了会怎样 |
|---|---|---|---|
| `package.json` | 必需 | 包身份、`main` 入口、`dsh.bundle.patch` 指向 patch 文件 | 无法被 profile 当作 bundle 解析 |
| `cordis.patch.yml` | 必需 | 往 loader 树里插入一行 `id` + `name`，`config` 即 `apply` 收到的第二个参数 | 包被安装但永远不会加载 —— 表现为「装了没反应」 |
| `lib/index.js` | 必需 | Cordis 插件本体：`export const name` / `export const inject` / `export function apply(ctx, config)` | 加载行报错或插件空转 |
| `LICENSE` | 强烈建议 | npm / GitHub 上别人能否合法复用 | 法务上等同于「保留所有权利」 |

`README.md`、`CHANGELOG.md`、`test/` 不是加载所必需，但没有它们的仓库没人敢用。

## 契约要点

```js
export const name = "dsh-hello-plugin";  // 与 package.json 的 name 保持一致
export const inject = ["tools"];         // 依赖的服务；全部就绪后 apply 才会被调用
export function apply(ctx, config) {     // config 来自 cordis.patch.yml 的 config 块
  ctx.effect(() => {                     // effect 内的东西在插件卸载时自动释放
    const dispose = ctx.tools.register(tool);
    return () => dispose();
  }, "label");
}
```

三个容易踩的点：

1. **必须把注册动作放进 `ctx.effect(...)`**。直接 `ctx.tools.register` 也能跑，但插件卸载或该行被 disable 后工具不会注销，热重载会撞名。
2. **`inject` 声明什么，`apply` 里才能直接用 `ctx.<service>`**。想要别的服务（`settings`、`webServer`、`llm`），加进 `inject` 数组。
3. **工具要有 `output.schema` 和 `render`**。缺 `render` 时返回值会以原始 JSON 落到对话里；`render` 应直接返回 `ContentBlock[]`（`[{ type: "text", text }]`），不要返回裸字符串。

## 本地开发

```bash
# 离线验证接线（无需 DSH 运行）
node test/smoke.mjs

# 或
npm test
```

冒烟测试会在 `node_modules/` 里造一个 `@deepseek-ai/dsh-tools` 的 identity stub —— 该包由宿主运行时提供，普通 node 解析不到。所以它证明的是**接线正确**，不是宿主行为正确。

## 装进自己的 DSH 验证

```bash
# 1. 链接进当前 profile（以桌面版为例，路径按实际 profile 调整）
cd ~/.dsh/profiles/desktop
npm install --no-save /path/to/dsh-hello-plugin

# 2. 把包名登记进 package.json 的 dsh.profile.bundles
#    以及在 dependencies 里加一行 "dsh-hello-plugin": "file:/path/to/dsh-hello-plugin"

# 3. 重启 DSH，然后在会话里让 agent 调用 hello_plugin
```

装好后 `hello_plugin` 会出现在工具列表里；`cordis.patch.yml` 的 `config.greeting` 改一行、重启，问候语就跟着变。

## 配置

| 键 | 默认值 | 说明 |
|---|---|---|
| `greeting` | `你好` | 问候语前缀，来自 `cordis.patch.yml` 中该行的 `config` 块 |

## License

MIT