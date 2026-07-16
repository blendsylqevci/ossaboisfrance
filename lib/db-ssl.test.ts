import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildDbSsl } from "./db-ssl.ts";

const originalNodeEnv = process.env.NODE_ENV;
const originalCa = process.env.DATABASE_CA_CERT;

afterEach(() => {
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;

  if (originalCa === undefined) delete process.env.DATABASE_CA_CERT;
  else process.env.DATABASE_CA_CERT = originalCa;
});

describe("buildDbSsl", () => {
  it("keeps local development on its existing non-TLS configuration", () => {
    process.env.NODE_ENV = "development";
    delete process.env.DATABASE_CA_CERT;

    assert.equal(buildDbSsl(), false);
  });

  it("fails closed in production when the Supabase CA is missing", () => {
    process.env.NODE_ENV = "production";
    delete process.env.DATABASE_CA_CERT;

    assert.throws(() => buildDbSsl(), /DATABASE_CA_CERT is required/i);
  });

  it("verifies production TLS and normalizes escaped PEM newlines", () => {
    process.env.NODE_ENV = "production";
    process.env.DATABASE_CA_CERT =
      "-----BEGIN CERTIFICATE-----\\nTEST\\n-----END CERTIFICATE-----";

    assert.deepEqual(buildDbSsl(), {
      rejectUnauthorized: true,
      ca: "-----BEGIN CERTIFICATE-----\nTEST\n-----END CERTIFICATE-----",
    });
  });
});
