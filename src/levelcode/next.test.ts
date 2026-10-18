// node --test (npm test). `next`: which pages a sign-in may land on, and which it ignores.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { NEXT_MAX, safeNext } from "./next.ts";

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
