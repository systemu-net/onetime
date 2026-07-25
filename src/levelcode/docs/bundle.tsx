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

/** True for a slug this bundle can render — lets the route 404 instead of guessing. */
export function isDocSlug(slug: string): boolean {
  return slug in PAGES;
}

export default function DocsBundle({ slug = "" }: { slug?: string }) {
  const Doc = PAGES[slug] ?? Overview;
  return <Doc />;
}
