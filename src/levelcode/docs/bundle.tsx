import { Link } from "react-router-dom";
import Agent from "./agent.mdx";
import Autocomplete from "./autocomplete.mdx";
import Chat from "./chat.mdx";
import Cloud from "./cloud.mdx";
import Edit from "./edit.mdx";
import Hackability from "./hackability.mdx";
import ImportAndUpdates from "./import-and-updates.mdx";
import Overview from "./overview.mdx";
import PowerEditing from "./power-editing.mdx";
import Providers from "./providers.mdx";
import Quickstart from "./quickstart.mdx";
import Setup from "./setup.mdx";
import Troubleshooting from "./troubleshooting.mdx";

// EVERY doc page, in ONE lazily-loaded chunk.
//
// The split matters: statically importing this from the route would put ~240 kB
// of prose into the levelcode entry bundle, which the landing page, login,
// pricing and the signed-in dashboard all download — for content most visitors
// never open. Lazy-loading the whole set together (rather than per page) keeps it
// out of that critical path while still making sidebar navigation instant after
// the first docs visit, since page two is already in this chunk.
//
// docs/nav.ts owns the ORDER and titles; this owns what renders. A new page needs
// an entry in both.
const PAGES: Record<string, React.ComponentType> = {
  "": Overview,
  quickstart: Quickstart,
  setup: Setup,
  chat: Chat,
  agent: Agent,
  edit: Edit,
  autocomplete: Autocomplete,
  providers: Providers,
  "power-editing": PowerEditing,
  hackability: Hackability,
  "import-and-updates": ImportAndUpdates,
  cloud: Cloud,
  troubleshooting: Troubleshooting,
};

export default function DocsBundle({ slug = "" }: { slug?: string }) {
  const Doc = PAGES[slug];
  // An unknown slug says so rather than quietly rendering the Overview. Falling
  // back would make a typo or a stale link look like a working page, which hides
  // broken links from whoever published them.
  if (!Doc) return <DocNotFound slug={slug} />;
  return <Doc />;
}

function DocNotFound({ slug }: { slug: string }) {
  return (
    <div>
      <h1 className="mb-4 text-[34px] font-bold leading-tight tracking-tight text-[var(--c-text)]">
        Page not found
      </h1>
      <p className="my-4 text-[16px] leading-[1.7]">
        There is no documentation page at{" "}
        <code className="rounded-[3px] border border-[var(--c-line)] bg-[var(--c-surface)] px-[5px] py-[1.5px] font-mono text-[0.875em] text-[var(--c-text)]">
          /docs/{slug}
        </code>
        . It may have been renamed or removed.
      </p>
      <p className="my-4 text-[16px] leading-[1.7]">
        Use the navigation to find what you need, or start from the{" "}
        <Link
          to="/docs"
          className="font-medium text-[var(--c-accent)] underline decoration-[var(--c-accent)]/30 underline-offset-2 hover:decoration-[var(--c-accent)]"
        >
          documentation overview
        </Link>
        .
      </p>
    </div>
  );
}
