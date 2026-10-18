// node --test (npm test). What the two requests that finish a sign-in carry.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { Attribution } from "./attribution";
import { oauthStartUrl, verifyBody } from "./signInRequests.ts";

const EDITOR = { redirectUri: "levelcode://levelcode.levelcode-ai/auth/callback", codeChallenge: "challenge-abc" };

const ATTRIBUTION: Attribution = {
  source: "linkedin",
  params: { linkedin: "someone" },
  landing: "/ai",
  referrer: "https://www.linkedin.example/feed?trk=1",
  ts: "2026-10-17T00:00:00.000Z",
};

/** The query of an OAuth start link, as the backend will read it. */
function query(url: string): URLSearchParams {
  return new URL(url, "https://levelcode.ai").searchParams;
}

describe("oauthStartUrl", () => {
  test("a plain sign-in is the bare provider path", () => {
    assert.equal(oauthStartUrl("", "github", {}, null), "/ai/auth/oauth/github");
  });

  test("the API base is put in front", () => {
    assert.equal(oauthStartUrl("https://api.example.test", "google", {}, null), "https://api.example.test/ai/auth/oauth/google");
  });

  test("an editor's redirect_uri and code_challenge go together", () => {
    const q = query(oauthStartUrl("", "github", EDITOR, null));
    assert.equal(q.get("redirect_uri"), EDITOR.redirectUri);
    assert.equal(q.get("code_challenge"), EDITOR.codeChallenge);
  });

  test("half of the pair is forwarded as neither", () => {
    for (const context of [{ redirectUri: EDITOR.redirectUri }, { codeChallenge: EDITOR.codeChallenge }]) {
      const q = query(oauthStartUrl("", "github", context, null));
      assert.equal(q.has("redirect_uri"), false);
      assert.equal(q.has("code_challenge"), false);
    }
  });

  test("attribution rides the query, without the referrer", () => {
    const raw = query(oauthStartUrl("", "github", {}, ATTRIBUTION)).get("attribution");
    assert.deepEqual(JSON.parse(raw ?? "null"), {
      source: "linkedin",
      params: { linkedin: "someone" },
      landing: "/ai",
      ts: "2026-10-17T00:00:00.000Z",
    });
    assert.equal(oauthStartUrl("", "github", {}, ATTRIBUTION).includes("linkedin.example"), false);
  });

  test("a valid next rides a web sign-in", () => {
    const q = query(oauthStartUrl("", "github", { next: "/ai/pricing?plan=pro" }, null));
    assert.equal(q.get("next"), "/ai/pricing?plan=pro");
  });

  test("a next that is not valid is left out", () => {
    for (const next of ["//evil.example", "/ai//x", "https://evil.example/ai/", "/ai/%2F%2Fevil", "/other/path", ""]) {
      assert.equal(query(oauthStartUrl("", "github", { next }, null)).has("next"), false, next);
    }
  });

  test("an editor signing in never carries next", () => {
    const q = query(oauthStartUrl("", "github", { ...EDITOR, next: "/ai/account" }, null));
    assert.equal(q.has("next"), false);
    assert.equal(q.get("redirect_uri"), EDITOR.redirectUri);
  });

  test("half an editor pair is a web sign-in, so next rides it", () => {
    const q = query(oauthStartUrl("", "github", { redirectUri: EDITOR.redirectUri, next: "/ai/account" }, null));
    assert.equal(q.get("next"), "/ai/account");
    assert.equal(q.has("redirect_uri"), false);
  });
});

describe("verifyBody", () => {
  test("a plain sign-in sends the email, the code and the attribution", () => {
    const body = verifyBody("a@example.test", "123456", {}, ATTRIBUTION);
    assert.deepEqual(JSON.parse(JSON.stringify(body)), {
      email: "a@example.test",
      code: "123456",
      attribution: JSON.parse(JSON.stringify(ATTRIBUTION)),
    });
  });

  test("an editor sign-in sends its redirect_uri and code_challenge", () => {
    const body = verifyBody("a@example.test", "123456", EDITOR, null);
    assert.equal(body.redirect_uri, EDITOR.redirectUri);
    assert.equal(body.code_challenge, EDITOR.codeChallenge);
    assert.equal(body.attribution, null);
  });

  test("a valid next is sent on a web sign-in", () => {
    assert.equal(verifyBody("a@example.test", "123456", { next: "/ai/account" }, null).next, "/ai/account");
  });

  test("a next that is not valid is left out", () => {
    for (const next of ["//evil.example", "/ai//x", "javascript:alert(1)", "/ai/%2F%2Fevil", "/ai/account#x", null, undefined]) {
      assert.equal("next" in verifyBody("a@example.test", "123456", { next }, null), false, String(next));
    }
  });

  test("an editor signing in never sends next", () => {
    assert.equal("next" in verifyBody("a@example.test", "123456", { ...EDITOR, next: "/ai/account" }, null), false);
  });
});
