// node --test (npm test). `next`: which pages a sign-in may land on, and which it ignores.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { loginRoute, NEXT_MAX, safeNext, signedInDestination, type WebEditorAnswer } from "./next.ts";

describe("safeNext", () => {
  const accepted: Array<[string, string]> = [
    ["/ai/account", "an auth-gated page"],
    ["/ai/admin/referrals", "a nested page"],
    ["/ai/pricing?plan=pro", "a query is kept"],
    ["/ai/account?checkout=changed&x=1", "a query with several keys"],
    ["/ai/docs/cloud", "a docs page"],
    ["/ai/x", "the shortest: one character after /ai/"],
    ["/ai/docs/a.b", "a dot inside a name is not a dot segment"],
    ["/ai/docs/...", "three dots are a name, not a dot segment"],
    ["/ai/docs?q=a%20b", "a percent escape that is not a separator"],
    ["/ai/pricing?next=/ai/account", "a single slash inside the query"],
    ["/ai/%252F%252Fevil.example", "double-encoded: a literal path under /ai/; nothing after /ai/ can make it start //"],
    ["/ai/" + "a".repeat(NEXT_MAX - 4), "exactly the longest"],
  ];
  for (const [raw, why] of accepted) {
    test(`takes ${JSON.stringify(raw.length > 40 ? raw.slice(0, 40) + "…" : raw)}: ${why}`, () => {
      assert.equal(safeNext(raw), raw);
      // What a browser makes of it: a page of this site, under /ai/.
      const url = new URL(raw, "https://levelcode.ai");
      assert.equal(url.origin, "https://levelcode.ai");
      assert.ok(url.pathname.startsWith("/ai/"), url.pathname);
    });
  }

  const refused: Array<[unknown, string]> = [
    // Not a string, or nothing
    [null, "absent"],
    [undefined, "absent"],
    [42, "a number"],
    [["/ai/account"], "an array (a repeated query key)"],
    [{ toString: () => "/ai/account" }, "an object that stringifies to a page"],
    ["", "empty"],
    // Not under /ai/
    ["/ai/", "the prefix alone"],
    ["/ai", "the landing without its slash"],
    ["/ai?x=1", "the landing's query"],
    ["/aisle", "a lookalike prefix"],
    ["/other/path", "another part of the site"],
    ["/", "the root"],
    ["ai/account", "relative"],
    ["account", "relative"],
    // Another origin, in any spelling
    ["//evil.example", "protocol-relative"],
    ["//evil.example/ai/account", "protocol-relative, with an /ai/ path"],
    ["https://evil.example/ai/account", "absolute, another host"],
    ["https://levelcode.ai/ai/account", "absolute, even this host: a next is a path"],
    ["javascript:alert(1)", "a script URL"],
    ["/\\evil.example", "a backslash is a slash to a browser"],
    ["/ai/\\evil.example", "a backslash after the prefix"],
    ["/ai\\account", "a backslash in place of the slash"],
    // Doubled slashes anywhere
    ["/ai//x", "doubled after the prefix"],
    ["/ai/x//y", "doubled further in"],
    ["/ai/pricing?u=//evil.example", "doubled in the query"],
    // Percent-encoded separators
    ["/ai/%2F%2Fevil", "encoded slashes"],
    ["/ai/%2f%2fevil", "encoded slashes, lower case"],
    ["/ai/%2Fx", "one encoded slash"],
    ["/ai/x?u=%2F%2Fevil", "encoded slashes in the query"],
    ["/ai/%5Cevil", "an encoded backslash"],
    ["/ai/%5cevil", "an encoded backslash, lower case"],
    // Dot segments, plain or encoded: a browser resolves them
    ["/ai/../account", "a parent segment"],
    ["/ai/./account", "a current segment"],
    ["/ai/docs/..", "a trailing parent segment"],
    ["/ai/docs/../../x", "climbing out of /ai/"],
    ["/ai/%2e%2e/account", "an encoded parent segment"],
    ["/ai/%2E%2E/account", "an encoded parent segment, upper case"],
    ["/ai/.%2e/account", "half encoded"],
    ["/ai/%2e/account", "an encoded current segment"],
    // The server's own endpoints: not pages
    ["/ai/auth/handoff?code=x", "the editor's account hand-off"],
    ["/ai/auth/oauth/github", "an OAuth start"],
    ["/ai/csrf", "the CSRF token endpoint"],
    // Fragments
    ["/ai/account#billing", "a fragment"],
    ["/ai/account#", "an empty fragment"],
    // Whitespace and control characters
    ["/ai/acc ount", "a space"],
    ["/ai/account\t", "a tab"],
    ["/ai/account\n", "a newline"],
    ["/ai/account\r\nSet-Cookie: x=1", "a header-injection attempt"],
    ["/ai/a\u0000", "NUL"],
    ["/ai/a\u007f", "DEL"],
    ["/ai/a\u0085", "a C1 control"],
    ["/ai/a\u00a0", "a no-break space"],
    ["/ai/a\u2028", "a line separator"],
    ["/ai/a\u200b", "a zero-width space"],
    ["/ai/a\u202e", "a right-to-left override"],
    [" /ai/account", "leading whitespace"],
    // Characters RFC 3986 does not allow unescaped, and broken escapes
    ["/ai/\u00e9", "non-ASCII"],
    ["/ai/<script>", "angle brackets"],
    ['/ai/"x"', "quotes"],
    ["/ai/a|b", "a pipe"],
    ["/ai/{x}", "braces"],
    ["/ai/%zz", "a broken escape"],
    ["/ai/%2", "a truncated escape"],
    // Too long
    ["/ai/" + "a".repeat(NEXT_MAX - 3), "one character over the limit"],
  ];
  for (const [raw, why] of refused) {
    const shown = typeof raw === "string" ? JSON.stringify(raw.length > 40 ? raw.slice(0, 40) + "…" : raw) : String(raw);
    test(`ignores ${shown}: ${why}`, () => {
      assert.equal(safeNext(raw), null);
    });
  }
});

describe("loginRoute", () => {
  /** The `next` the login page will read from a route loginRoute built. */
  const nextOf = (route: string) => new URL(route, "https://levelcode.ai/ai/").searchParams.get("next");

  test("a plain sign-in carries no next", () => {
    assert.equal(loginRoute(), "/login");
    assert.equal(loginRoute(null), "/login");
  });

  test("a page comes back to the login page exactly as it went in", () => {
    for (const page of ["/ai/account", "/ai/pricing?plan=pro", "/ai/admin/referrals", "/ai/account?checkout=changed&x=1"]) {
      const route = loginRoute(page);
      assert.ok(route.startsWith("/login?next="), route);
      assert.equal(nextOf(route), page);
    }
  });

  test("a page that is not a valid next is dropped", () => {
    for (const page of ["/ai/", "/ai//x", "/ai/%2F%2Fevil", "/ai/account#billing", "/web", ""]) {
      assert.equal(loginRoute(page), "/login", page);
    }
  });
});

describe("signedInDestination", () => {
  const EDITOR_URL = "https://app.levelcode.example/?signin=1";
  const ON: WebEditorAnswer = { enabled: true, url: EDITOR_URL, loading: false };
  const OFF: WebEditorAnswer = { enabled: false, url: null, loading: false };
  const LOADING: WebEditorAnswer = { enabled: false, url: null, loading: true };

  test("an editor signing in wins over next and the browser edition", () => {
    for (const webEditor of [ON, OFF, LOADING]) {
      for (const next of [null, "/ai/pricing"]) {
        assert.deepEqual(signedInDestination({ editorSigningIn: true, next, webEditor }), { kind: "editor" });
      }
    }
  });

  test("next wins over the browser edition, as a route under the /ai basename", () => {
    for (const webEditor of [ON, OFF]) {
      assert.deepEqual(signedInDestination({ editorSigningIn: false, next: "/ai/pricing?plan=pro", webEditor }), {
        kind: "route",
        to: "/pricing?plan=pro",
      });
    }
  });

  test("next does not wait for the browser edition's answer", () => {
    assert.deepEqual(signedInDestination({ editorSigningIn: false, next: "/ai/account", webEditor: LOADING }), {
      kind: "route",
      to: "/account",
    });
  });

  test("with no next, it waits for the browser edition's answer", () => {
    assert.deepEqual(signedInDestination({ editorSigningIn: false, next: null, webEditor: LOADING }), { kind: "wait" });
  });

  test("with no next and the browser edition on, it is the editor's address as given", () => {
    assert.deepEqual(signedInDestination({ editorSigningIn: false, next: null, webEditor: ON }), {
      kind: "href",
      to: EDITOR_URL,
    });
  });

  test("with no next and the browser edition off, it is the account page", () => {
    assert.deepEqual(signedInDestination({ editorSigningIn: false, next: null, webEditor: OFF }), {
      kind: "route",
      to: "/account",
    });
  });

  test("enabled with no address counts as off", () => {
    const webEditor = { enabled: true, url: null, loading: false };
    assert.deepEqual(signedInDestination({ editorSigningIn: false, next: null, webEditor }), {
      kind: "route",
      to: "/account",
    });
  });

  test("a next that is not valid counts as absent", () => {
    for (const next of ["//evil.example", "https://evil.example/", "/ai/%2F%2Fevil", "/other"]) {
      assert.deepEqual(signedInDestination({ editorSigningIn: false, next, webEditor: ON }), { kind: "href", to: EDITOR_URL }, next);
      assert.deepEqual(signedInDestination({ editorSigningIn: false, next, webEditor: OFF }), { kind: "route", to: "/account" }, next);
    }
  });
});
