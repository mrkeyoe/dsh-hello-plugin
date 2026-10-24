/**
 * dsh-hello-plugin — the smallest useful DeepSeek Harness host plugin.
 *
 * A DSH plugin is a plain Cordis plugin with a fixed export contract:
 *
 *   export const name    — plugin name (also the loader row label)
 *   export const inject  — services this plugin requires; `apply` runs only
 *                          after every listed service exists
 *   export function apply(ctx, config) — the entry point
 *
 * `config` is the `config:` block of this plugin's row in cordis.patch.yml.
 * Everything you register inside `ctx.effect(...)` is disposed automatically
 * when the plugin unloads or the row is disabled.
 */
import { defineTool } from "@deepseek-ai/dsh-tools";

export const name = "dsh-hello-plugin";

/** Require the tools service so `ctx.tools` is available in `apply`. */
export const inject = ["tools"];

export function apply(ctx, config = {}) {
  const greeting =
    typeof config.greeting === "string" && config.greeting.trim() !== ""
      ? config.greeting.trim()
      : "你好";

  ctx.effect(() => {
    const dispose = ctx.tools.register(
      defineTool({
        name: "hello_plugin",
        description:
          "Greet someone from dsh-hello-plugin. Use this to verify that the plugin loaded and that a custom tool can be registered.",
        parameters: {
          who: {
            type: "string",
            description: "Who to greet. Defaults to 世界 (the world).",
          },
        },
        output: {
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              message: { type: "string" },
            },
            required: ["message"],
          },
        },
        render(_args, value) {
          return [{ type: "text", text: value.message }];
        },
        async execute(args) {
          const who = typeof args.who === "string" && args.who.trim() !== ""
            ? args.who.trim()
            : "世界";
          return { message: `${greeting}，${who}！` };
        },
      })
    );
    return () => dispose();
  }, "dsh-hello-plugin: hello_plugin tool");
}