import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isAdmin, isAdminAccess } from "./access.ts";

describe("admin access", () => {
  it("allows the admin role", () => {
    assert.equal(isAdmin({ role: "admin" }), true);
    assert.equal(
      isAdminAccess({ req: { user: { role: "admin" } } as never }),
      true
    );
  });

  it("denies editors, missing roles, and anonymous requests", () => {
    assert.equal(isAdmin({ role: "editor" }), false);
    assert.equal(isAdmin({}), false);
    assert.equal(isAdmin(undefined), false);
    assert.equal(
      isAdminAccess({ req: { user: { role: "editor" } } as never }),
      false
    );
  });
});
