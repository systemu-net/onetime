// Credits — the single definition of how LevelCode spend is displayed.
//
// This module exists because two surfaces (the balance card and the activity panel) previously carried
// their own copies of the conversion rate, the locale, and the rounding rule, with a comment claiming
// they were "identical". Nothing enforced that. Now they import the same functions, so the claim is
// structural rather than aspirational.
//
// $1 = 100 credits, so 1 credit = $0.01 = 10_000 retail micro-$. The API sends RETAIL micro-$
// (Levelcode.retail_micros); the ledger, Stripe prices and invoices stay in dollars, because dollars are
// what providers charge and what we bill. This is presentation only.
//
// Keep MICROS_PER_CREDIT and LOCALE in step with CREDIT_LOCALE / MICROS_PER_CREDIT in the editor
// extension's chat.html — the editor's response bar shows the same balance and must render it the same.
export const MICROS_PER_CREDIT = 10_000;

// A FIXED locale, never the viewer's ambient one: a bare toLocaleString() renders the same balance as
// "1,279" here, "1.279" on a de-DE machine and "1 279" on fr-FR — so one number would look different per
// user, and the editor would disagree with the dashboard about it.
export const LOCALE = "en-US";

/** Retail micro-$ → credits, unrounded. */
export function toCredits(micros?: number | null): number {
  return (micros ?? 0) / MICROS_PER_CREDIT;
}

/** A balance, as whole credits — "1,279". Clamped at zero: an overage can push the remaining balance
 *  negative, and "-2 left" is a worse thing to show someone than "0 left". */
export function fmtCredits(micros?: number | null): string {
  const c = toCredits(micros);
  return (c > 0 ? Math.round(c) : 0).toLocaleString(LOCALE);
}

/** An amount SPENT — a per-turn price, a day's usage, a model's total.
 *
 *  Whole credits from 10 up, one decimal below, and a "<0.1" floor rather than a rounded-down zero:
 *  cheap models cost well under a credit per turn (gpt-oss is ~0.4), and rendering that as "0" would
 *  tell the user it was free. Returns the fixed string deliberately — wrapping it in a unary + to drop
 *  trailing zeros silently defeats both of those rules. */
export function fmtCreditAmount(micros?: number | null): string {
  const c = toCredits(micros);
  if (!(c > 0)) return "0";
  if (c >= 10) return Math.round(c).toLocaleString(LOCALE);
  return c < 0.05 ? "<0.1" : c.toFixed(1);
}

/** A whole number with thousands separators, pinned to the same locale — for counts, not money. */
export function fmtInt(n?: number | null): string {
  return (n ?? 0).toLocaleString(LOCALE);
}
