/**
 * Offline smoke test — no DSH host required.
 *
 * It verifies the three things that usually break a published plugin:
 *   1. the entry module parses and exports the contract (name / inject / apply)
 *   2. `apply` registers exactly one tool through `ctx.tools.register`
 *   3. the tool's `execute` returns the shape its `output.schema` promises
 *
 * `@deepseek-ai/dsh-tools` is a HOST-PROVIDED peer: the DSH runtime resolves it
 * from its own module graph, plain `node` cannot. This test therefore bootstraps
 * a throwaway identity stub into node_modules (gitignored) on first run.
 * Consequence: it proves WIRING, not host behaviour. The real proof is installing
 * the package into a profile and restarting DSH (see README).
 *
 * Run: node test/smoke.mjs      (or: npm test)
 */
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const stubDir = join(here, "..", "node_modules", "@deepseek-ai", "dsh-tools");

if (!existsSync(join(stubDir, "index.js"))) {
  mkdirSync(stubDir, { recursive: true });
  writeFileSync(
    join(stubDir, "package.json"),
    JSON.stringify({ name: "@deepseek-ai/dsh-tools", version: "0.0.0-stub", type: "module", main: "index.js" }, null, 2)
  );
  writeFileSync(join(stubDir, "index.js"), "export const defineTool = (spec) => spec;\n");
}

const { name, inject, apply } = await import("../lib/index.js");

assert.equal(name, "dsh-hello-plugin", "export `name` must match the package name");
assert.ok(Array.isArray(inject) && inject.includes("tools"), "export `inject` must list tools");
assert.equal(typeof apply, "function", "export `apply` must be a function");

const registered = [];
const effects = [];
const ctx = {
  tools: {
    register(tool) {
      registered.push(tool);
      return () => {};
    },
  },
  effect(fn) {
    effects.push(fn());
  },
};

apply(ctx, { greeting: "Hello" });

assert.equal(effects.length, 1, "apply must register exactly one effect");
assert.equal(registered.length, 1, "apply must register exactly one tool");

const tool = registered[0];
assert.equal(tool.name, "hello_plugin");
assert.equal(typeof tool.execute, "function");
assert.equal(typeof tool.render, "function");
assert.ok(tool.output?.schema, "tool must declare an output schema");

assert.deepEqual(await tool.execute({ who: "GitHub" }), { message: "Hello，GitHub！" });
assert.deepEqual(await tool.execute({}), { message: "Hello，世界！" });

const rendered = tool.render({}, { message: "x" });
assert.ok(Array.isArray(rendered) && rendered[0].type === "text");

console.log("smoke ok: 1 tool registered; execute/render behave as declared");