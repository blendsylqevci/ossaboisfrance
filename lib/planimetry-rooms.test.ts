import { test } from "node:test";
import assert from "node:assert/strict";
import { getPlanimetryRooms } from "./planimetry-rooms.ts";

test("getPlanimetryRooms uses CMS JSON when provided", () => {
  const rooms = getPlanimetryRooms(
    "test-house",
    [{ label: "Salon", area: 20 }],
    "fr"
  );
  assert.equal(rooms.length, 1);
  assert.equal(rooms[0].label, "Salon");
  assert.equal(rooms[0].area, 20);
});

test("getPlanimetryRooms falls back for a-frame-house", () => {
  const rooms = getPlanimetryRooms("a-frame-house", null, "fr");
  assert.ok(rooms.length >= 5);
  assert.equal(rooms[0].label, "Salon");
});

test("getPlanimetryRooms translates room labels", () => {
  const rooms = getPlanimetryRooms("a-frame-house", null, "en");
  assert.equal(rooms.find((r) => r.label === "Living room")?.area, 19.97);
});
