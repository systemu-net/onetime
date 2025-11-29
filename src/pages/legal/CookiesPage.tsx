import Boost from '@/components/Boost';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LegalNav from '@/components/legalNav';
import { PRIVACY_ROUTE } from '@/routes';
import { Link } from 'react-router-dom';


const CookiesPage = () => {
  return (
    <>
      <Header />
      <div className="bg-white dark:bg-gray-900 min-h-screen">
        <LegalNav />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Cookie Policy
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last Updated: November 29, 2024
            </p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section id="introduction" className="mb-8">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                This Cookie Policy explains how thin.ly ("we," "us," or "our") uses cookies and similar technologies to recognize you when you visit our website and use our services.
              </p>
            </section>

            <section id="what-are-cookies" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. What Are Cookies?</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
              </p>
            </section>

            <section id="types-of-cookies" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Types of Cookies We Use</h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Essential Cookies</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                <li>Required for the Service to function</li>
                <li>Session management and authentication</li>
                <li>Security features</li>
                <li>Cannot be disabled</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Functional Cookies</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                <li>Remember your preferences and settings</li>
                <li>Improve user experience</li>
                <li>Can be disabled in browser settings</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Analytics Cookies</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                <li>Understand how you use the Service</li>
                <li>Measure performance</li>
                <li>Identify areas for improvement</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Advertising Cookies</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                <li>Deliver relevant ads</li>
                <li>Measure ad effectiveness</li>
                <li>Support revenue-sharing features</li>
              </ul>
            </section>

            <section id="managing-cookies" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Managing Cookies</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You can control cookies through your browser settings. Most browsers allow you to block all cookies, block third-party cookies, or clear existing cookies.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Note:</strong> Disabling cookies may limit Service functionality.
              </p>
            </section>

            <section id="contact" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Contact Us</h2>
              <p className="text-gray-700 dark:text-gray-300">
                If you have questions about our use of cookies, please contact us at{' '}
                <a href="mailto:privacy@thin.ly" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">
                  privacy@thin.ly
                </a>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              For more information, see our{' '}
              <Link to={PRIVACY_ROUTE} className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Boost />
      <Footer />
    </>
  );
};

export default CookiesPage;
