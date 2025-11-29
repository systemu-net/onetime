import Boost from '@/components/Boost';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LegalNav from '@/components/legalNav';
import { PRIVACY_ROUTE } from '@/routes';
import { Link } from 'react-router-dom';


const TermsPage = () => {
  return (
    <>
      <Header />

      <div className="bg-white dark:bg-gray-900 min-h-screen">
        <LegalNav />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Terms of Service
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last Updated: November 29, 2024
            </p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section id="introduction" className="mb-8">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Welcome to thin.ly ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of thin.ly's URL shortening services, including our website, mobile applications, and related services (collectively, the "Service").
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, do not use our Service.
              </p>
            </section>

            <section id="acceptance" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 dark:text-gray-300">
                By creating an account, accessing, or using thin.ly, you acknowledge that you have read, understood, and agree to be bound by these Terms and our <Link to={PRIVACY_ROUTE} className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">Privacy Policy</Link>. If you are using the Service on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.
              </p>
            </section>

            <section id="eligibility" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Eligibility</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You must be at least 13 years old to use thin.ly. If you are between 13 and 18 years old (or the age of majority in your jurisdiction), you may only use the Service under the supervision of a parent or legal guardian who agrees to be bound by these Terms.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">By using the Service, you represent and warrant that:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                <li>You meet the age requirements above</li>
                <li>You have the legal capacity to enter into these Terms</li>
                <li>You will comply with all applicable laws and regulations</li>
              </ul>
            </section>

            {/* Add more sections as needed */}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              Questions about these Terms?{' '}
              <a href="/contact" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">
                Contact us
              </a>{' '}
              or email{' '}
              <a href="mailto:legal@thin.ly" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">
                legal@thin.ly
              </a>
            </p>
          </div>
        </div>
      </div>

      <Boost />
      <Footer />
    </>
  );
};

export default TermsPage;
