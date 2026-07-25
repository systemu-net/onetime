import { Children, isValidElement, useId, useState, type ReactElement, type ReactNode } from "react";

// <Tabs> / <Tab title="…"> — the docs' one interactive primitive, used wherever a
// choice branches the instructions (Apple Silicon vs Intel, .dmg vs build from
// source, one provider vs another). Authors write them straight into MDX:
//
//   <Tabs>
//     <Tab title="Apple Silicon">…</Tab>
//     <Tab title="Intel">…</Tab>
//   </Tabs>
//
// Tab itself never renders — Tabs reads `title` off each child and owns the
// panel — but it must be a real component so MDX can nest markdown inside it.

type TabProps = { title: string; children: ReactNode };

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

function isTab(node: ReactNode): node is ReactElement<TabProps> {
  return isValidElement(node) && typeof (node.props as TabProps)?.title === "string";
}

export function Tabs({ children }: { children: ReactNode }) {
  const tabs = Children.toArray(children).filter(isTab);
  const [active, setActive] = useState(0);
  const id = useId();

  if (tabs.length === 0) return null;
  const current = tabs[Math.min(active, tabs.length - 1)];

  return (
    <div className="my-6">
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex flex-wrap gap-1 border-b border-[var(--c-line)]"
      >
        {tabs.map((tab, i) => {
          const selected = i === active;
          return (
            <button
              key={tab.props.title}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${id}-panel-${i}`}
              onClick={() => setActive(i)}
              className={`-mb-px border-b-2 px-3 py-2 text-[14px] font-medium transition-colors ${
                selected
                  ? "border-[var(--c-accent)] text-[var(--c-text)]"
                  : "border-transparent text-[var(--c-text2)] hover:border-[var(--c-line)] hover:text-[var(--c-text)]"
              }`}
            >
              {tab.props.title}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${id}-panel-${active}`}
        aria-labelledby={`${id}-tab-${active}`}
        className="pt-4"
      >
        {current.props.children}
      </div>
    </div>
  );
}
