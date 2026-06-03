import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isStorageQuotaError,
  saveCheckoutSelection,
  CHECKOUT_SELECTION_KEY,
} from "./checkout-selection-storage.ts";

test("isStorageQuotaError detects QuotaExceededError", () => {
  const err = new DOMException("quota", "QuotaExceededError");
  assert.equal(isStorageQuotaError(err), true);
});

test("isStorageQuotaError rejects other errors", () => {
  assert.equal(isStorageQuotaError(new Error("nope")), false);
  assert.equal(isStorageQuotaError(null), false);
});

test("saveCheckoutSelection falls back to house image URL on quota error", () => {
  const store = new Map<string, string>();
  let failOnce = true;

  const sessionStorageMock = {
    setItem(key: string, value: string) {
      if (failOnce && value.includes("data:image")) {
        failOnce = false;
        throw new DOMException("quota", "QuotaExceededError");
      }
      store.set(key, value);
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
  };

  const original = globalThis.sessionStorage;
  Object.defineProperty(globalThis, "sessionStorage", {
    value: sessionStorageMock,
    configurable: true,
  });

  try {
    const payload = {
      house: { name: "Test", id: "test", image: "https://cdn.example/house.jpg" },
      currentImage: "data:image/jpeg;base64,AAAA",
      totalPrice: 100000,
    };

    assert.equal(saveCheckoutSelection(payload), true);
    const raw = sessionStorageMock.getItem(CHECKOUT_SELECTION_KEY);
    assert.ok(raw);
    const parsed = JSON.parse(raw!) as { currentImage: string };
    assert.equal(parsed.currentImage, "https://cdn.example/house.jpg");
  } finally {
    Object.defineProperty(globalThis, "sessionStorage", {
      value: original,
      configurable: true,
    });
  }
});
