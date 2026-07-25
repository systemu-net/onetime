import type { ComponentPropsWithoutRef } from "react";
import { Link } from "react-router-dom";
import { Accordion, AccordionGroup } from "./Accordion";
import { Card, CardGroup } from "./Card";
import { Info, Note, Tip, Warning } from "./Callout";
import CodeBlock from "./CodeBlock";
import Kbd from "./Kbd";
import { Step, Steps } from "./Steps";
import { Tab, Tabs } from "./Tabs";

// Handed to <MDXProvider> in DocsLayout, this is BOTH the prose styling and the
// set of components available inside a .mdx with no import — so a page can write
// <Tabs>, <Steps>, <Note> or <Kbd keys="cmd+alt+e" /> as though they were part of
// Markdown itself.
//
// Styling is element-by-element rather than a typography plugin: the docs sit
// inside the `.classic` theme, whose colours are CSS variables that flip with the
// One Dark switch, and a prose preset would fight that in dark mode.

/** Heading with a hover permalink. `id` arrives from rehype-slug. */
function heading(level: 2 | 3 | 4) {
  const Tag = `h${level}` as const;
  const size =
    level === 2
      ? "mt-12 text-[24px] font-semibold"
      : level === 3
        ? "mt-9 text-[18.5px] font-semibold"
        : "mt-7 text-[16px] font-semibold";

  return function Heading({ id, children, ...props }: ComponentPropsWithoutRef<"h2">) {
    return (
      <Tag id={id} className={`group mb-3 scroll-mt-8 text-[var(--c-text)] ${size}`} {...props}>
        {children}
        {id ? (
          <a
            href={`#${id}`}
            aria-label="Link to this section"
            className="ml-2 text-[var(--c-text3)] opacity-0 transition-opacity hover:text-[var(--c-accent)] focus-visible:opacity-100 group-hover:opacity-100"
          >
            #
          </a>
        ) : null}
      </Tag>
    );
  };
}

const LINK =
  "font-medium text-[var(--c-accent)] underline decoration-[var(--c-accent)]/30 underline-offset-2 transition-colors hover:decoration-[var(--c-accent)]";

export const mdxComponents = {
  h1: ({ children, ...props }: ComponentPropsWithoutRef<"h1">) => (
    <h1
      className="mb-4 text-[34px] font-bold leading-tight tracking-tight text-[var(--c-text)]"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),

  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="my-4 text-[16px] leading-[1.7] pretty" {...props} />
  ),

  a: ({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) => {
    // In-app routes go through the router so the SPA never does a full reload;
    // "#…" stays a plain anchor so it scrolls instead of navigating.
    if (href.startsWith("/")) {
      return (
        <Link to={href} className={LINK} {...props}>
          {children}
        </Link>
      );
    }
    const external = !href.startsWith("#");
    return (
      <a
        href={href}
        className={LINK}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },

  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="my-4 list-disc space-y-2 pl-5 marker:text-[var(--c-text3)]" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="my-4 list-decimal space-y-2 pl-5 marker:text-[var(--c-text3)]" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="leading-[1.7] [&>ol]:my-2 [&>ul]:my-2" {...props} />
  ),

  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-[var(--c-text)]" {...props} />
  ),

  // Inline code only — fenced blocks arrive as <figure><pre><code>, and the
  // figure mapping below owns those (CodeBlock resets what leaks through).
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded-[3px] border border-[var(--c-line)] bg-[var(--c-surface)] px-[5px] py-[1.5px] font-mono text-[0.875em] text-[var(--c-text)]"
      {...props}
    />
  ),

  figure: ({ children, ...props }: ComponentPropsWithoutRef<"figure">) => {
    const isCode = "data-rehype-pretty-code-figure" in props;
    if (isCode) return <CodeBlock {...props}>{children}</CodeBlock>;
    return (
      <figure className="my-6" {...props}>
        {children}
      </figure>
    );
  },

  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-5 border-l-2 border-[var(--c-line)] pl-4 text-[var(--c-text2)] [&>p]:my-2"
      {...props}
    />
  ),

  hr: () => <hr className="my-10 border-[var(--c-line)]" />,

  // Tables scroll inside their own box so a wide settings table never makes the
  // whole page scroll sideways on a phone.
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 overflow-x-auto rounded-md border border-[var(--c-line)]">
      <table className="w-full border-collapse text-left text-[14.5px]" {...props} />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead className="border-b border-[var(--c-line)] bg-[var(--c-surface)]" {...props} />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      className="px-4 py-2.5 font-semibold text-[var(--c-text)] [&_code]:text-[0.9em]"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td
      className="border-t border-[var(--c-line)] px-4 py-2.5 align-top leading-[1.6] [&_code]:text-[0.9em]"
      {...props}
    />
  ),

  // Doc components — usable in any .mdx with no import.
  Tabs,
  Tab,
  Accordion,
  AccordionGroup,
  Card,
  CardGroup,
  Steps,
  Step,
  Note,
  Tip,
  Info,
  Warning,
  Kbd,
};
