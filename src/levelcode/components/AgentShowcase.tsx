import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * The agent-runtime showcase, ported from the levelcode.dev marketing site into the account app's
 * paper-and-ink system. A pill tab bar (Generate / Refactor / Explain / Test / Review), a cross-fading
 * caption, and a dark editor frame that plays a scripted LevelCode session per tab — chat prompt on the
 * left, typewriter code on the right — auto-advancing with a progress bar and a pause control.
 *
 * Only the styling tokens changed from the source: the cream page keeps the dark editor frame for
 * contrast, and the tab bar/caption adopt the account app's ink/rule/flame palette. Behaviour, timings,
 * and copy are the source of truth. Reduced motion: everything renders fully, nothing types or advances.
 */

type Token = { t: string; c?: string };
type CodeLine = { no: string; toks: Token[] };
type Msg = { who: "you" | "ai"; text: string };
type Tab = {
  id: string;
  label: string;
  file: string;
  caption: ReactNode;
  chat: Msg[];
  code: CodeLine[];
  duration?: number; // seconds before auto-advance (default 9)
};

// Syntax-token helpers → explicit dark-editor colors (the account app has no `syn-*` tokens).
const k = (t: string): Token => ({ t, c: "text-[#c58aff]" }); // keyword
const s = (t: string): Token => ({ t, c: "text-[#7fd88f]" }); // string
const f = (t: string): Token => ({ t, c: "text-[#9fb4ff]" }); // fn / class
const c = (t: string): Token => ({ t, c: "text-[#5b6172]" }); // comment
const n = (t: string): Token => ({ t, c: "text-[#e6a86b]" }); // number
const p = (t: string): Token => ({ t }); // plain

const TABS: Tab[] = [
  {
    id: "generate",
    label: "Generate",
    file: "payments/refund_service.rb — LevelCode",
    caption: (
      <>
        <strong className="font-semibold text-ink">Generate.</strong> Describe the change in plain
        language — LevelCode writes idiomatic code in your project&rsquo;s style, right in the buffer.
      </>
    ),
    chat: [
      { who: "you", text: "Add idempotency to RefundService — same request twice must not double-refund." },
      { who: "ai", text: "Adding an idempotency key check backed by Redis, with a 24h TTL. Writing it now…" },
    ],
    code: [
      { no: "12", toks: [k("class"), p(" "), f("RefundService")] },
      { no: "13", toks: [p("  "), k("def"), p(" "), f("call"), p("(charge, key:)")] },
      { no: "14", toks: [p("    "), k("return"), p(" cached(key) "), k("if"), p(" seen?(key)")] },
      { no: "15", toks: [p("    result = gateway.refund(charge)")] },
      { no: "16", toks: [p("    remember(key, result, ttl: "), n("24"), p(".hours)")] },
      { no: "17", toks: [p("    result")] },
      { no: "18", toks: [p("  "), k("end")] },
      { no: "19", toks: [k("end")] },
    ],
  },
  {
    id: "refactor",
    label: "Refactor",
    file: "api/orders_controller.rb — LevelCode",
    caption: (
      <>
        <strong className="font-semibold text-ink">Refactor.</strong> Select any block and ask. LevelCode
        restructures across files, keeping behavior identical and diffs reviewable.
      </>
    ),
    chat: [
      { who: "you", text: "This controller does too much. Extract the pricing logic." },
      {
        who: "ai",
        text: "Extracting to app/services/pricing_calculator.rb and updating 3 call sites. Behavior unchanged — diff ready.",
      },
    ],
    code: [
      { no: "40", toks: [c("# before: 62 lines in controller")] },
      { no: "41", toks: [k("def"), p(" "), f("create")] },
      { no: "42", toks: [p("  total = "), f("PricingCalculator")] },
      { no: "43", toks: [p("    .new(cart, coupon: params[:coupon])")] },
      { no: "44", toks: [p("    .total")] },
      { no: "45", toks: [p("  order = "), f("Order"), p(".create!(total:)")] },
      { no: "46", toks: [p("  render json: order")] },
      { no: "47", toks: [k("end")] },
    ],
  },
  {
    id: "explain",
    label: "Explain",
    file: "legacy/billing_engine.rb — LevelCode",
    caption: (
      <>
        <strong className="font-semibold text-ink">Explain.</strong> Point at unfamiliar code — get a
        walkthrough of what it does, why it exists, and where it&rsquo;s called from.
      </>
    ),
    chat: [
      { who: "you", text: "What is this proration branch actually doing?" },
      {
        who: "ai",
        text: "It splits the billing period at the plan-change date, credits unused time on the old plan, and charges the remainder at the new rate. Called from 2 places — both webhooks.",
      },
    ],
    code: [
      { no: "88", toks: [k("if"), p(" plan_changed_mid_cycle?")] },
      { no: "89", toks: [p("  credit  = unused_ratio * old_rate")] },
      { no: "90", toks: [p("  charge  = remaining_ratio * new_rate")] },
      { no: "91", toks: [p("  invoice.adjust(credit:, charge:)")] },
      { no: "92", toks: [k("end")] },
      { no: "93", toks: [c("# ← LevelCode: proration on plan change")] },
    ],
  },
  {
    id: "test",
    label: "Test",
    file: "spec/refund_service_spec.rb — LevelCode",
    caption: (
      <>
        <strong className="font-semibold text-ink">Test.</strong> LevelCode drafts the spec, runs it,
        reads the failure, and fixes the code — a full red-green loop without leaving the editor.
      </>
    ),
    chat: [
      { who: "you", text: "Write specs for the double-refund case." },
      { who: "ai", text: "Spec written. Running… 1 failure: cache key ignored currency. Patched — all green ✓" },
    ],
    code: [
      { no: "05", toks: [f("it"), p(" "), s('"refunds only once per key"'), p(" "), k("do")] },
      { no: "06", toks: [p("  "), n("2"), p(".times { service.call(charge, key:) }")] },
      { no: "07", toks: [p("  expect(gateway.refunds.count).to eq("), n("1"), p(")")] },
      { no: "08", toks: [k("end")] },
      { no: "09", toks: [p("")] },
      { no: "10", toks: [s("✓ 14 examples, 0 failures — 0.42s")] },
    ],
  },
  {
    id: "review",
    label: "Review",
    file: "PR #241 · fix race in webhook retry — LevelCode",
    caption: (
      <>
        <strong className="font-semibold text-ink">Review.</strong> Before you push, LevelCode flags edge
        cases, security issues, and style drift — like a senior reviewer on every commit.
      </>
    ),
    chat: [
      { who: "you", text: "Review this PR before I push." },
      {
        who: "ai",
        text: "One real issue: retry loop can fire twice if the worker restarts between enqueue and ack. Suggesting a fix inline.",
      },
    ],
    code: [
      { no: "21", toks: [c("# ⚠ LevelCode: not restart-safe")] },
      { no: "22", toks: [{ t: "- retry_later(webhook)", c: "text-[#e06c75]" }] },
      { no: "23", toks: [{ t: "+ ", c: "text-[#7fd88f]" }, f("WebhookRetryJob")] },
      { no: "24", toks: [{ t: "+ ", c: "text-[#7fd88f]" }, p("  .set(wait: backoff(attempt))")] },
      { no: "25", toks: [{ t: "+ ", c: "text-[#7fd88f]" }, p("  .perform_later(webhook.id,")] },
      { no: "26", toks: [{ t: "+ ", c: "text-[#7fd88f]" }, p("    lock: webhook.lock_token)")] },
    ],
  },
];

export default function AgentShowcase() {
  const [rm, setRm] = useState(false); // prefers-reduced-motion
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(true);
  const [cycle, setCycle] = useState(0); // bump to replay current tab
  const [codeShown, setCodeShown] = useState(0);
  const [capIdx, setCapIdx] = useState(0);
  const [capFading, setCapFading] = useState(false);
  const [barKey, setBarKey] = useState(0);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const paneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const tab = TABS[idx];
  const dur = tab.duration ?? 9;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRm(true);
      setPlaying(false);
      setCodeShown(TABS[idx].code.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* pill follows the active tab */
  useLayoutEffect(() => {
    const move = () => {
      const t = tabRefs.current[idx];
      const pill = pillRef.current;
      if (!t || !pill || !t.parentElement) return;
      const r = t.getBoundingClientRect();
      const pr = t.parentElement.getBoundingClientRect();
      pill.style.width = `${r.width}px`;
      pill.style.transform = `translateX(${r.left - pr.left}px)`;
    };
    move();
    window.addEventListener("resize", move);
    document.fonts?.ready.then(move).catch(() => {});
    return () => window.removeEventListener("resize", move);
  }, [idx, rm]);

  /* pause auto-advance when scrolled off screen */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* caption cross-fade */
  useEffect(() => {
    if (idx === capIdx) return;
    setCapFading(true);
    const t = setTimeout(() => {
      setCapIdx(idx);
      setCapFading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [idx, capIdx]);

  /* the show: typewriter chat → code lines → auto-advance */
  useEffect(() => {
    if (rm) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!playing || !visible) return;

    const pane = paneRefs.current[idx];
    const bubbles = pane ? Array.from(pane.querySelectorAll<HTMLElement>("[data-text]")) : [];
    bubbles.forEach((b) => (b.textContent = ""));
    setCodeShown(0);
    setBarKey((v) => v + 1);

    let delay = 300;
    bubbles.forEach((b) => {
      const txt = b.dataset.text ?? "";
      for (let i = 1; i <= txt.length; i++) {
        delay += 14;
        timers.current.push(setTimeout(() => (b.textContent = txt.slice(0, i)), delay));
      }
      delay += 350;
    });
    TABS[idx].code.forEach((_, li) => {
      delay += 320;
      timers.current.push(setTimeout(() => setCodeShown(li + 1), delay));
    });

    timers.current.push(
      setTimeout(() => setIdx((i) => (i + 1) % TABS.length), (TABS[idx].duration ?? 9) * 1000),
    );
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [idx, playing, visible, cycle, rm]);

  const togglePlay = () => {
    setPlaying((was) => {
      const now = !was;
      if (now) setCycle((v) => v + 1);
      return now;
    });
  };

  const shownFor = (i: number) => (rm ? TABS[i].code.length : i === idx ? codeShown : 0);

  return (
    <div ref={rootRef} className="relative">
      {/* soft accent glow behind the frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-flame/10 blur-3xl"
      />

      {/* tabs */}
      <div
        role="tablist"
        aria-label="LevelCode capabilities"
        className="relative mx-auto mb-6 flex w-max max-w-full gap-1 overflow-x-auto rounded-full border border-rule bg-card p-1.5 [scrollbar-width:none]"
      >
        <span
          ref={pillRef}
          aria-hidden
          className="absolute left-0 top-1.5 h-[calc(100%-12px)] rounded-full bg-flame shadow-[0_0_18px_rgb(var(--accent-rgb)/0.45)] transition-[transform,width] duration-300 ease-out"
        />
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            id={`sc-tab-${t.id}`}
            aria-selected={i === idx}
            aria-controls={`sc-pane-${t.id}`}
            onClick={() => {
              if (i === idx) setCycle((v) => v + 1);
              else setIdx(i);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") tabRefs.current[(i + 1) % TABS.length]?.focus();
              if (e.key === "ArrowLeft") tabRefs.current[(i - 1 + TABS.length) % TABS.length]?.focus();
            }}
            className={`relative z-10 whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              i === idx ? "text-paper" : "text-sub hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* caption */}
      <p
        aria-live="polite"
        className={`mx-auto mb-8 min-h-[48px] max-w-xl text-center text-[15px] leading-relaxed text-sub transition-opacity duration-200 ${
          capFading ? "opacity-0" : "opacity-100"
        }`}
      >
        {TABS[capIdx].caption}
      </p>

      {/* editor frame */}
      <div className="shot-shadow relative overflow-hidden rounded-2xl border border-[#20232f] bg-[#0a0c16]">
        {/* title bar */}
        <div className="flex h-10 items-center gap-2 border-b border-[#1b1e2b] bg-[#0d1020] px-4">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="ml-2 truncate font-mono text-[12px] text-[#6b7280]">{tab.file}</span>
          <span className="ml-auto shrink-0 rounded-full border border-[#7d6bff]/40 bg-[#7d6bff]/15 px-2.5 py-0.5 font-mono text-[10.5px] text-[#c6bfff]">
            AI session · live
          </span>
        </div>

        {/* stage */}
        <div className="relative aspect-video bg-black/20">
          {TABS.map((t, i) => (
            <div
              key={t.id}
              ref={(el) => {
                paneRefs.current[i] = el;
              }}
              role="tabpanel"
              id={`sc-pane-${t.id}`}
              aria-labelledby={`sc-tab-${t.id}`}
              className={`absolute inset-0 transition-opacity duration-300 ${
                i === idx ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <div className="grid h-full grid-cols-1 md:grid-cols-[minmax(200px,300px)_1fr]">
                {/* chat column */}
                <div className="hidden flex-col gap-4 border-r border-[#1b1e2b] bg-black/15 p-5 font-mono text-[12.5px] leading-relaxed md:flex">
                  {t.chat.map((m, mi) => (
                    <div key={mi}>
                      <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#a99bff]">
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 rounded-full bg-[#7d6bff] shadow-[0_0_8px_rgba(125,107,255,0.9)]"
                        />
                        {m.who === "you" ? "You" : "LevelCode"}
                      </div>
                      <div data-text={m.text} className={m.who === "you" ? "text-[#c7cbe0]" : "text-[#8b93ad]"}>
                        {rm ? m.text : ""}
                      </div>
                    </div>
                  ))}
                </div>
                {/* code column */}
                <div className="overflow-hidden whitespace-pre p-5 font-mono text-[12px] leading-[1.9] text-[#c7cbe0] md:text-[13px]">
                  {t.code.slice(0, shownFor(i)).map((line, li) => (
                    <div key={li}>
                      <span className="inline-block w-[2.6em] select-none text-[#3b4157]">{line.no}</span>
                      {line.toks.map((tok, ti) => (
                        <span key={ti} className={tok.c ?? "text-[#c7cbe0]"}>
                          {tok.t}
                        </span>
                      ))}
                      {li === shownFor(i) - 1 && !rm && (
                        <span className="ml-px inline-block h-[1.05em] w-[2px] -translate-y-[1px] animate-caret bg-[#7d6bff] align-middle" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* pause / play */}
          {!rm && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause showcase" : "Play showcase"}
              className="absolute bottom-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur transition-colors hover:bg-[#7d6bff]/30"
            >
              {playing ? (
                <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden>
                  <rect x="3" y="2" width="4" height="12" rx="1" />
                  <rect x="9" y="2" width="4" height="12" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden>
                  <path d="M4 2.5v11a1 1 0 0 0 1.53.85l9-5.5a1 1 0 0 0 0-1.7l-9-5.5A1 1 0 0 0 4 2.5z" />
                </svg>
              )}
            </button>
          )}

          {/* auto-advance progress */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[3px]">
            <i
              key={barKey}
              className="block h-full w-0 bg-[#7d6bff] shadow-[0_0_10px_rgba(125,107,255,0.8)]"
              style={playing && visible && !rm ? { animation: `scfill ${dur}s linear forwards` } : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
