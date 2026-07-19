/**
 * Supported providers as a running line — every model shown equally, scrolling continuously. Edge fades
 * keep it feeling endless. Ported from levelcode.dev (already on the cream token names).
 */

const PROVIDERS = [
  "Anthropic Claude",
  "OpenAI",
  "OpenRouter",
  "Groq",
  "Together",
  "Fireworks",
  "DeepSeek",
  "xAI Grok",
  "Mistral",
  "Ollama — local",
  "Any OpenAI-compatible",
];

export default function Providers() {
  return (
    <div className="relative overflow-hidden py-2">
      <div className="flex w-max animate-marquee items-center" style={{ animationDuration: "42s" }}>
        {[0, 1].map((half) => (
          <div key={half} aria-hidden={half === 1} className="flex items-center gap-4 pr-4">
            {PROVIDERS.map((name) => (
              <span
                key={name}
                className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-rule bg-card px-5 py-2.5 font-display text-[15px] font-semibold text-ink"
              >
                <span className="h-2 w-2 rounded-full bg-flame" />
                {name}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-paper to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-paper to-transparent"
      />
    </div>
  );
}
