import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPasswordChangedEmail,
  buildPasswordResetEmail,
  getPublicSiteUrl,
} from "./email-templates.ts";

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

test("password reset email uses an absolute encoded link and states its 30-minute lifetime", () => {
  const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NEXT_PUBLIC_SITE_URL = "https://app.example.com/ignored/path";
  process.env.NODE_ENV = "production";

  try {
    const token = "token/with ?&<>";
    const message = buildPasswordResetEmail(token);

    assert.match(message.subject, /Réinitialisation/);
    assert.match(
      message.html,
      /https:\/\/app\.example\.com\/admin\/reset\/token%2Fwith%20%3F%26%3C%3E/
    );
    assert.match(message.html, /30 minutes/);
    assert.match(message.html, /OSSA BOIS/);
    assert.doesNotMatch(message.html, /token\/with \?&<>/);
  } finally {
    restoreEnv("NEXT_PUBLIC_SITE_URL", previousSiteUrl);
    restoreEnv("NODE_ENV", previousNodeEnv);
  }
});

test("public site URL fails closed to the canonical HTTPS origin in production", () => {
  const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NEXT_PUBLIC_SITE_URL = "http://untrusted.example.com";
  process.env.NODE_ENV = "production";

  try {
    assert.equal(getPublicSiteUrl(), "https://ossaboisfrance.com");
  } finally {
    restoreEnv("NEXT_PUBLIC_SITE_URL", previousSiteUrl);
    restoreEnv("NODE_ENV", previousNodeEnv);
  }
});

test("password changed email is branded and contains no credential material", () => {
  const message = buildPasswordChangedEmail();

  assert.match(message.subject, /mot de passe a été modifié/);
  assert.match(message.html, /Alerte de sécurité/);
  assert.match(message.html, /OSSA BOIS/);
  assert.doesNotMatch(message.html, /token|mot de passe:\s*\S+/i);
});
