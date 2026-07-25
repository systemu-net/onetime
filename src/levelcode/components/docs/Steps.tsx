import { Children, isValidElement, type ReactElement, type ReactNode } from "react";

// <Steps> / <Step title="…"> — ordered walkthroughs where each step is more than
// a sentence (the Quickstart, provider setup, building from source). Numbering is
// computed here rather than typed by the author, so inserting a step in the middle
// never leaves the list mis-numbered.
//
// It renders as a real <ol>, so assistive tech announces "3 of 5" and the numbers
// survive with CSS disabled.

type StepProps = { title: string; children: ReactNode };

export function Step({ children }: StepProps) {
  return <>{children}</>;
}

function isStep(node: ReactNode): node is ReactElement<StepProps> {
  return isValidElement(node) && typeof (node.props as StepProps)?.title === "string";
}

export function Steps({ children }: { children: ReactNode }) {
  const steps = Children.toArray(children).filter(isStep);
  if (steps.length === 0) return null;

  return (
    <ol className="my-6 list-none space-y-0 pl-0">
      {steps.map((step, i) => (
        <li key={step.props.title} className="relative pb-6 pl-10 last:pb-0">
          {/* the rail, stopping at the last marker */}
          {i < steps.length - 1 ? (
            <span aria-hidden className="absolute bottom-0 left-[13px] top-7 w-px bg-[var(--c-line)]" />
          ) : null}

          <span
            aria-hidden
            className="absolute left-0 top-0 flex h-[27px] w-[27px] items-center justify-center rounded-full border border-[var(--c-line)] bg-[var(--c-surface)] font-mono text-[12px] font-medium text-[var(--c-text)]"
          >
            {i + 1}
          </span>

          <h3 className="mb-2 mt-0.5 scroll-mt-24 text-[17px] font-semibold text-[var(--c-text)]">
            {step.props.title}
          </h3>

          <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{step.props.children}</div>
        </li>
      ))}
    </ol>
  );
}
