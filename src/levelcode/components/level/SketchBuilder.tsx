import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Interactive sketch builder demo, styled 1:1 after the real LevelCode canvas: a light dotted-grid board,
 * compact white node cards (colored role square, name, "tier: …"), side ports, and arrow-less curved edges
 * flowing left to right. A palette exposes predefined agent-topology templates as draggable cards; drop one
 * on the canvas and it materialises the full node/edge graph with an editable top-level goal. Ported from
 * levelcode.dev — the board is intentionally light in both themes, so it lands as-is on the cream page.
 */

type Tier = "powerful" | "balanced";
type NodeColor = "amber" | "blue" | "green";
type SketchNode = { id: string; label: string; tier: Tier; color: NodeColor; x: number; y: number };
type SketchEdge = { from: string; to: string };
type Sketch = { name: string; goal: string; reference?: string; w: number; h: number; nodes: SketchNode[]; edges: SketchEdge[] };

const NODE_COLOR: Record<NodeColor, string> = { amber: "#e2a43c", blue: "#57a2e8", green: "#7cb85c" };

const KV_STORE: Sketch = {
  name: "Design a Key-Value Store",
  goal: "Build and test a distributed, highly-available key-value store — implement it in C.",
  reference: "https://bytebytego.com/courses/system-design-interview/design-a-key-value-store",
  w: 1740,
  h: 700,
  nodes: [
    { id: "req", label: "requirements", tier: "powerful", color: "amber", x: 20, y: 300 },
    { id: "arch", label: "architecture", tier: "powerful", color: "amber", x: 320, y: 300 },
    { id: "storage", label: "storage-engine", tier: "balanced", color: "amber", x: 620, y: 130 },
    { id: "hash", label: "consistent-hash", tier: "balanced", color: "blue", x: 620, y: 245 },
    { id: "repl", label: "replication+quorum", tier: "balanced", color: "amber", x: 620, y: 360 },
    { id: "vclock", label: "vector-clocks", tier: "balanced", color: "amber", x: 620, y: 475 },
    { id: "gossip", label: "gossip+failover", tier: "balanced", color: "blue", x: 620, y: 590 },
    { id: "integrate", label: "integrate+server", tier: "balanced", color: "blue", x: 920, y: 300 },
    { id: "tests", label: "tests", tier: "balanced", color: "green", x: 1220, y: 240 },
    { id: "build", label: "build+validate", tier: "balanced", color: "green", x: 1220, y: 360 },
    { id: "review", label: "review+run-guide", tier: "balanced", color: "amber", x: 1520, y: 300 },
  ],
  edges: [
    { from: "req", to: "arch" },
    { from: "arch", to: "storage" },
    { from: "arch", to: "hash" },
    { from: "arch", to: "repl" },
    { from: "arch", to: "vclock" },
    { from: "arch", to: "gossip" },
    { from: "storage", to: "integrate" },
    { from: "hash", to: "integrate" },
    { from: "repl", to: "integrate" },
    { from: "vclock", to: "integrate" },
    { from: "gossip", to: "integrate" },
    { from: "integrate", to: "tests" },
    { from: "integrate", to: "build" },
    { from: "tests", to: "review" },
    { from: "build", to: "review" },
  ],
};

const LEADERBOARD: Sketch = {
  name: "Real-time Gaming Leaderboard",
  goal: "Design and test a real-time gaming leaderboard — top 10 by score, a user's rank, and ±4 neighbours around them.",
  reference: "https://bytebytego.com/courses/system-design-interview/real-time-gaming-leaderboard",
  w: 1740,
  h: 640,
  nodes: [
    { id: "arch", label: "architecture", tier: "powerful", color: "amber", x: 20, y: 300 },
    { id: "api", label: "public-api", tier: "balanced", color: "blue", x: 320, y: 130 },
    { id: "gateway", label: "api-gateway", tier: "balanced", color: "blue", x: 320, y: 300 },
    { id: "game", label: "game-service", tier: "balanced", color: "blue", x: 320, y: 470 },
    { id: "relational", label: "relational-baseline", tier: "balanced", color: "amber", x: 620, y: 130 },
    { id: "redis", label: "redis-sorted-set", tier: "balanced", color: "amber", x: 620, y: 300 },
    { id: "nosql", label: "nosql-dynamodb", tier: "balanced", color: "amber", x: 620, y: 470 },
    { id: "persist", label: "persistence-mysql", tier: "balanced", color: "amber", x: 920, y: 130 },
    { id: "shard", label: "sharding", tier: "balanced", color: "blue", x: 920, y: 300 },
    { id: "cache", label: "rank-cache", tier: "balanced", color: "amber", x: 920, y: 470 },
    { id: "service", label: "leaderboard-service", tier: "balanced", color: "blue", x: 1220, y: 300 },
    { id: "tests", label: "tests", tier: "balanced", color: "green", x: 1520, y: 300 },
  ],
  edges: [
    { from: "arch", to: "api" },
    { from: "arch", to: "gateway" },
    { from: "arch", to: "game" },
    { from: "api", to: "relational" },
    { from: "api", to: "redis" },
    { from: "gateway", to: "redis" },
    { from: "game", to: "redis" },
    { from: "relational", to: "redis" },
    { from: "redis", to: "persist" },
    { from: "redis", to: "nosql" },
    { from: "redis", to: "shard" },
    { from: "shard", to: "cache" },
    { from: "persist", to: "service" },
    { from: "cache", to: "service" },
    { from: "nosql", to: "service" },
    { from: "service", to: "tests" },
  ],
};

const TEMPLATES: Sketch[] = [KV_STORE, LEADERBOARD];
const TEMPLATE_BADGE: Record<string, string> = {
  "Design a Key-Value Store": "KV",
  "Real-time Gaming Leaderboard": "LB",
};

const NODE_W = 200;
const PORT_Y = 44;

export default function SketchBuilder() {
  const [dropped, setDropped] = useState<Sketch | null>(null);
  const [goal, setGoal] = useState("");
  const [dragging, setDragging] = useState(false);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState<Set<string>>(new Set());
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const runTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const place = useCallback((s: Sketch) => {
    setDropped(s);
    setGoal(s.goal);
    setRunning(new Set());
  }, []);

  const run = useCallback(() => {
    if (!dropped) return;
    runTimers.current.forEach(clearTimeout);
    runTimers.current = [];
    setRunning(new Set());
    dropped.nodes.forEach((node, i) => {
      const start = setTimeout(() => {
        setRunning((prev) => new Set(prev).add(node.id));
      }, i * 900);
      const stop = setTimeout(() => {
        setRunning((prev) => {
          const next = new Set(prev);
          next.delete(node.id);
          return next;
        });
      }, i * 900 + 1600);
      runTimers.current.push(start, stop);
    });
  }, [dropped]);

  useEffect(() => () => runTimers.current.forEach(clearTimeout), []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setOver(false);
    setDragging(false);
    const name = e.dataTransfer.getData("text/levelcode-sketch");
    const s = TEMPLATES.find((t) => t.name === name);
    if (s) place(s);
  };

  const nodeById = (id: string) => dropped?.nodes.find((node) => node.id === id);

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      {/* ── palette ── */}
      <div className="surface p-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-flame">template palette</span>
        <p className="mt-1.5 text-[12px] leading-relaxed text-sub">
          Drag a card onto the canvas to lay down a fully-configured agent topology.
        </p>

        <div className="mt-4 space-y-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.name}
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/levelcode-sketch", t.name);
                e.dataTransfer.effectAllowed = "copy";
                setDragging(true);
              }}
              onDragEnd={() => setDragging(false)}
              onClick={() => place(t)}
              className="group w-full cursor-grab rounded-md border border-rule bg-paper p-3 text-left transition-colors hover:border-flame/60 active:cursor-grabbing"
            >
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded border border-flame/30 bg-flame/10 font-mono text-[13px] text-flame">
                  {TEMPLATE_BADGE[t.name] ?? "◆"}
                </span>
                <span className="font-display text-[13.5px] font-semibold leading-tight text-ink">{t.name}</span>
              </div>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                {t.nodes.length} agents · {t.edges.length} links · bytebytego
              </p>
              <span className="mt-2 inline-block font-mono text-[10px] text-flame/70 group-hover:text-flame">
                ⠿ drag onto canvas →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── canvas — the real board: light, dotted grid ── */}
      <div
        ref={canvasRef}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={`relative min-h-[440px] overflow-hidden rounded-xl border bg-[#f2f0ea] transition-colors ${
          over ? "border-flame/70" : "border-rule"
        }`}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(27,26,23,0.13) 1px, transparent 1.4px)",
            backgroundSize: "22px 22px",
          }}
        />

        {dropped && (
          <div className="relative z-10 flex items-center gap-2 border-b border-rule bg-card/80 px-3 py-2 backdrop-blur-sm">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-flame">goal</span>
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="min-w-0 flex-1 bg-transparent font-mono text-[12.5px] text-ink outline-none placeholder:text-faint"
              placeholder="Describe what to build…"
            />
            <button
              type="button"
              onClick={run}
              className="shrink-0 rounded bg-flame px-3 py-1 font-mono text-[11px] font-semibold text-paper transition-colors hover:bg-flamedeep"
            >
              ▶ Run
            </button>
          </div>
        )}

        {!dropped && (
          <div className="relative z-10 grid h-full min-h-[440px] place-items-center px-6 text-center">
            <div>
              <div
                className={`mx-auto mb-4 grid h-14 w-14 place-items-center rounded-lg border-2 border-dashed transition-colors ${
                  dragging || over ? "border-flame text-flame" : "border-faint/50 text-faint"
                }`}
              >
                ⠿
              </div>
              <p className="font-display text-[15px] font-semibold text-ink">Drop a template here</p>
              <p className="mx-auto mt-1.5 max-w-xs text-[12.5px] leading-relaxed text-sub">
                Drag a template card in — or just click it — to materialise the full topology.
              </p>
            </div>
          </div>
        )}

        {dropped && (
          <div className="relative z-10 w-full overflow-auto p-3">
            <div className="relative" style={{ width: dropped.w, height: dropped.h }}>
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${dropped.w} ${dropped.h}`}>
                {dropped.edges.map((edge, i) => {
                  const a = nodeById(edge.from);
                  const b = nodeById(edge.to);
                  if (!a || !b) return null;
                  const x1 = a.x + NODE_W;
                  const y1 = a.y + PORT_Y;
                  const x2 = b.x;
                  const y2 = b.y + PORT_Y;
                  return (
                    <path
                      key={i}
                      d={`M${x1},${y1} C ${x1 + 70},${y1} ${x2 - 70},${y2} ${x2},${y2}`}
                      fill="none"
                      stroke="#b9b4a8"
                      strokeWidth={1.5}
                    />
                  );
                })}
              </svg>

              {dropped.nodes.map((node) => {
                const color = NODE_COLOR[node.color];
                const isRunning = running.has(node.id);
                return (
                  <div
                    key={node.id}
                    className={`sb-node absolute w-[200px] rounded-lg border bg-white p-3 shadow-[0_2px_10px_rgba(27,26,23,0.08)] ${
                      isRunning ? "sb-node--running" : ""
                    }`}
                    style={{ left: node.x, top: node.y, borderColor: isRunning ? "transparent" : "#e2ddd2" }}
                  >
                    {isRunning && (
                      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
                        <rect
                          className="sb-ants"
                          x="0.75"
                          y="0.75"
                          rx="8"
                          fill="none"
                          stroke="#65a34a"
                          strokeWidth="1.5"
                          strokeDasharray="6 6"
                          style={{ width: "calc(100% - 1.5px)", height: "calc(100% - 1.5px)" }}
                        />
                      </svg>
                    )}

                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-[3px] ${isRunning ? "sb-pulse" : ""}`}
                        style={{ background: isRunning ? "#65a34a" : color }}
                      />
                      <span className="truncate text-[13px] font-semibold text-[#2a2822]">{node.label}</span>
                      {isRunning ? (
                        <span className="ml-auto shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-[#65a34a]">
                          running
                        </span>
                      ) : (
                        <span aria-hidden className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#3f3c34]/50" />
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-[#8a8578]">tier: {node.tier}</p>

                    <span
                      aria-hidden
                      className="absolute -left-[5px] h-2.5 w-2.5 rounded-full border-2 border-[#8a8578] bg-white"
                      style={{ top: PORT_Y - 5 }}
                    />
                    <span
                      aria-hidden
                      className="absolute -right-[5px] h-2.5 w-2.5 rounded-full border-2 border-[#8a8578] bg-white"
                      style={{ top: PORT_Y - 5 }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {dropped && (
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-3 right-3 z-10 flex items-center gap-1.5 font-mono text-[11px] text-sub"
          >
            {["−", "99%", "+", "⤢", "⇄ Tidy"].map((c) => (
              <span key={c} className="rounded-md border border-[#e2ddd2] bg-white px-2 py-1 shadow-sm">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
