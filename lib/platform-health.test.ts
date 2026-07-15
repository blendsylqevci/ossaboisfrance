import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runPlatformHealthChecks } from "./platform-health.ts";

describe("runPlatformHealthChecks", () => {
  it("reports healthy only when both dependencies respond", async () => {
    const result = await runPlatformHealthChecks({
      database: async () => undefined,
      storage: async () => undefined,
    });

    assert.equal(result.ok, true);
    assert.deepEqual(result.checks, { database: "ok", storage: "ok" });
  });

  it("reports a dependency failure without returning its internal error", async () => {
    const errors: string[] = [];
    const result = await runPlatformHealthChecks(
      {
        database: async () => undefined,
        storage: async () => {
          throw new Error("secret storage endpoint detail");
        },
      },
      {
        onError: (name) => errors.push(name),
      }
    );

    assert.equal(result.ok, false);
    assert.deepEqual(result.checks, { database: "ok", storage: "error" });
    assert.deepEqual(errors, ["storage"]);
    assert.equal(JSON.stringify(result).includes("secret storage"), false);
  });

  it("turns a hung dependency into an error after the deadline", async () => {
    const result = await runPlatformHealthChecks(
      {
        database: async () => undefined,
        storage: () => new Promise<void>(() => undefined),
      },
      { timeoutMs: 10 }
    );

    assert.equal(result.ok, false);
    assert.equal(result.checks.storage, "error");
  });
});
