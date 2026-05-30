import Boost from "@/components/Boost";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {
  CONTACT_ROUTE,
  FEATURES_ROUTE,
  PRIVACY_ROUTE,
  REGISTER_ROUTE,
  RESOURCES_ROUTE,
  TERMS_ROUTE,
} from "@/routes";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <>
      <Header />

      <main className="bg-white dark:bg-gray-900">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400 mb-3">
              About thin.ly
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Short links, built for people who actually measure what they
              share.
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              thin.ly is a URL shortening and link management service for
              creators, marketers, product teams, and developers. We turn long,
              ugly URLs into short, shareable links — and then give you the
              analytics, QR codes, routing rules, branded pages and governance
              tooling you need to actually understand what happens after someone
              clicks.
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Why we built thin.ly
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              Most URL shorteners stop at the redirect. You paste a long link,
              you get a short one, and that's the end of the conversation. We
              thought that was a waste of an extremely high-signal moment —
              every short link is a measurable touchpoint between a brand and a
              real human being.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              thin.ly was built on the belief that a short link should be a
              first-class part of a campaign, not an afterthought. Every link
              you create gets click analytics, geographic breakdown, device and
              referrer data, an optional QR code, an optional branded landing
              page, and a governance layer so you can pause, redirect, or expire
              a link without losing the click history.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you've ever printed a QR code on a banner and then had to live
              with the destination URL for the rest of the campaign's life, you
              already know why dynamic, governable short links matter.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              What thin.ly does
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Short links with real analytics
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  Every click is logged with country, device, browser, referrer
                  and timestamp. You get per-link dashboards and an aggregated
                  click-timeline across your whole portfolio.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  QR codes for everything physical
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  Generate QR codes for any short link, customise the styling,
                  and swap the destination later without reprinting anything.
                  Useful for packaging, posters, conference booths and direct
                  mail.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Branded link-in-bio pages
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  Bundle several links, QR codes and resources onto a single
                  branded page you can share from a social profile, an email
                  signature or a print campaign.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Routing rules &amp; governance
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  Route the same short link to different destinations based on
                  device, geography or schedule. Pause campaigns, expire links,
                  and audit every destination change with a full history log.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Threat detection on every link
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  Every link is scanned and re-scanned. Destinations that turn
                  malicious are automatically blocked with a safety
                  interstitial, protecting both end users and your brand.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  An API for developers
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  A JSON HTTP API for creating, updating and analysing links
                  programmatically, plus webhooks for click events. Designed to
                  be embedded inside a CMS, a CRM or a CI pipeline.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Who thin.ly is for
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              thin.ly is used by marketers running paid and organic campaigns
              who need attribution beyond what the destination's own analytics
              will tell them; by creators who want one short, memorable URL to
              put in a video description or podcast notes; by product and
              engineering teams who need governable, auditable links inside
              transactional email and push notifications; and by small
              businesses that just want a friendlier-looking link on a flyer.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you currently keep a spreadsheet of "where did this link go and
              when did it stop working," thin.ly is for you.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              How we think about trust
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              Short links are an unusually high-trust medium. People click them
              without seeing the destination, so we treat that trust as our core
              product responsibility:
            </p>
            <ul className="list-disc list-outside ml-6 space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
              <li>
                Every destination URL is scanned for malware, phishing and other
                threat signals before the link is activated, and rescanned on a
                schedule afterwards.
              </li>
              <li>
                Links whose destinations turn malicious are automatically
                blocked and replaced with an interstitial safety warning. The
                end user never reaches the dangerous page.
              </li>
              <li>
                Click data is collected for analytics, never sold. See our{" "}
                <Link
                  to={PRIVACY_ROUTE}
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                >
                  Privacy Policy
                </Link>{" "}
                for the full data-handling story.
              </li>
              <li>
                We publish clear{" "}
                <Link
                  to={TERMS_ROUTE}
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                >
                  Terms of Service
                </Link>{" "}
                explaining what the service does, what it doesn't do, and what
                kinds of content are not allowed on the platform.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Where to go next
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              If you want to see the product in action, the fastest path is to{" "}
              <Link
                to={REGISTER_ROUTE}
                className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                create a free account
              </Link>{" "}
              and shorten your first link. From there you can explore the{" "}
              <Link
                to={FEATURES_ROUTE}
                className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                features
              </Link>
              {", "}browse the{" "}
              <Link
                to={RESOURCES_ROUTE}
                className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                resources
              </Link>
              , or reach the team via the{" "}
              <Link
                to={CONTACT_ROUTE}
                className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                contact page
              </Link>
              .
            </p>
          </section>
        </section>
      </main>

      <Boost />
      <Footer />
    </>
  );
};

export default AboutPage;
