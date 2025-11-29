import Boost from '@/components/Boost';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LegalNav from '@/components/legalNav';


const UserPolicyPage = () => {
  return (
    <>
      <Header />
      <div className="bg-white dark:bg-gray-900 min-h-screen">
        <LegalNav />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              User Policy
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last Updated: November 29, 2024
            </p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section id="introduction" className="mb-8">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                This User Policy governs your use of thin.ly's services and applies to all users. By using our Service, you agree to comply with this Policy.
              </p>
            </section>

            <section id="prohibited-content" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Prohibited Content</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">You may not use our Service to shorten, share, or promote URLs that contain:</p>

              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                <li><strong className="text-gray-900 dark:text-white">Illegal Content:</strong> Content that violates any applicable laws or regulations</li>
                <li><strong className="text-gray-900 dark:text-white">Malware:</strong> Viruses, trojans, worms, or other malicious code</li>
                <li><strong className="text-gray-900 dark:text-white">Phishing:</strong> Attempts to steal personal information or credentials</li>
                <li><strong className="text-gray-900 dark:text-white">Spam:</strong> Unsolicited bulk messages or commercial content</li>
                <li><strong className="text-gray-900 dark:text-white">Hate Speech:</strong> Content promoting violence or hatred based on race, religion, ethnicity, gender, sexual orientation, or disability</li>
                <li><strong className="text-gray-900 dark:text-white">Adult Content:</strong> Pornographic or sexually explicit material (unless properly age-gated)</li>
                <li><strong className="text-gray-900 dark:text-white">Violence:</strong> Content depicting extreme violence or promoting harm</li>
                <li><strong className="text-gray-900 dark:text-white">Fraud:</strong> Scams, pyramid schemes, or deceptive practices</li>
                <li><strong className="text-gray-900 dark:text-white">Intellectual Property Violations:</strong> Pirated content or trademark infringement</li>
              </ul>
            </section>

            <section id="prohibited-activities" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Prohibited Activities</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">You may not:</p>

              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Use automated means to create links excessively</li>
                <li>Manipulate click counts or analytics</li>
                <li>Impersonate others or misrepresent your affiliation</li>
                <li>Violate the privacy rights of others</li>
                <li>Engage in any activity that harms thin.ly or its users</li>
              </ul>
            </section>

            <section id="enforcement" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Enforcement</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Violations of this Policy may result in:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                <li>Removal of offending content</li>
                <li>Temporary or permanent account suspension</li>
                <li>Legal action if required by law</li>
                <li>Reporting to appropriate authorities</li>
              </ul>
            </section>

            <section id="reporting" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Reporting Violations</h2>
              <p className="text-gray-700 dark:text-gray-300">
                If you encounter content that violates this Policy, please report it to{' '}
                <a href="mailto:abuse@thin.ly" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">
                  abuse@thin.ly
                </a>
              </p>
            </section>

            <section id="updates" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Policy Updates</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We may update this Policy from time to time. Continued use of the Service after changes constitutes acceptance of the updated Policy.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              Questions about this Policy?{' '}
              <a href="mailto:legal@thin.ly" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">
                Contact us
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

export default UserPolicyPage;
