import Boost from '@/components/Boost';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { ABOUT_ROUTE, RESOURCES_ROUTE } from '@/routes';
import { Link } from 'react-router-dom';

const ContactPage = () => {
  return (
    <>
      <Header />

      <main className="bg-white dark:bg-gray-900">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400 mb-3">
              Contact
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Get in touch with the thin.ly team
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              The fastest way to reach us is email. We read every message and reply
              from the address that received it &mdash; not a no-reply queue. Use the
              right inbox below to get the right pair of eyes the first time.
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Email us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Product support
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 leading-relaxed">
                  Account access, broken links, billing questions, analytics that
                  don't look right, anything else inside the product.
                </p>
                <a
                  href="mailto:support@thin.ly"
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium"
                >
                  support@thin.ly
                </a>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Abuse &amp; safety reports
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 leading-relaxed">
                  Report a short link that points somewhere malicious, fraudulent or
                  in violation of our policies. Reviewed daily.
                </p>
                <a
                  href="mailto:abuse@thin.ly"
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium"
                >
                  abuse@thin.ly
                </a>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Privacy &amp; data requests
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 leading-relaxed">
                  GDPR, CCPA and other privacy requests &mdash; data export, deletion,
                  or questions about how we handle personal data.
                </p>
                <a
                  href="mailto:privacy@thin.ly"
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium"
                >
                  privacy@thin.ly
                </a>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Legal &amp; compliance
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 leading-relaxed">
                  Subpoenas, takedown notices, intellectual-property questions,
                  partnership and licensing enquiries.
                </p>
                <a
                  href="mailto:legal@thin.ly"
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium"
                >
                  legal@thin.ly
                </a>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Press &amp; media
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 leading-relaxed">
                  Story leads, interview requests, logo and brand-asset requests.
                </p>
                <a
                  href="mailto:press@thin.ly"
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium"
                >
                  press@thin.ly
                </a>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Sales &amp; partnerships
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 leading-relaxed">
                  Team plans, custom domains, API volume tiers, integration
                  conversations.
                </p>
                <a
                  href="mailto:hello@thin.ly"
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium"
                >
                  hello@thin.ly
                </a>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Response times
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
              We aim to acknowledge every email within one business day, Monday
              through Friday. Most product-support questions are answered the same
              day. Abuse reports involving an active threat are triaged within a
              few hours, around the clock.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Complex legal, privacy or technical investigations can take longer
              &mdash; if we need more than a day to get you a real answer, we'll send
              a holding reply so you know it's in progress.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Before you email
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
              A lot of common questions are answered faster on{' '}
              <Link
                to={RESOURCES_ROUTE}
                className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                Resources
              </Link>
              {' '}or in our public guides &mdash; how to set a custom domain, how
              click analytics are calculated, the difference between paused and
              expired links, and so on. If you're not sure what thin.ly does in the
              first place, the{' '}
              <Link
                to={ABOUT_ROUTE}
                className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                About page
              </Link>{' '}
              is a good starting point.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              When you do email, including the short URL (e.g.{' '}
              <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">
                thin.ly/aB3xY9q
              </code>
              ) and the rough time of the issue helps us find the relevant logs
              much faster.
            </p>
          </section>
        </section>
      </main>

      <Boost />
      <Footer />
    </>
  );
};

export default ContactPage;
