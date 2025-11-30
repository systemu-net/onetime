import Boost from '@/components/Boost';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LegalNav from '@/components/legalNav';


const PrivacyPage = () => {
  return (
    <>
      <Header />
      <div className="bg-white dark:bg-gray-900 min-h-screen">
        <LegalNav />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last Updated: November 29, 2024
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Table of Contents</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#information-we-collect" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">1. Information We Collect</a></li>
              <li><a href="#how-we-use-information" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">2. How We Use Your Information</a></li>
              <li><a href="#how-we-share-information" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">3. How We Share Your Information</a></li>
              <li><a href="#cookies-tracking" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">4. Cookies and Tracking Technologies</a></li>
              <li><a href="#data-retention" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">5. Data Retention</a></li>
              <li><a href="#data-security" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">6. Data Security</a></li>
              <li><a href="#your-rights" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">7. Your Privacy Rights</a></li>
              <li><a href="#children-privacy" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">8. Children's Privacy</a></li>
              <li><a href="#international-transfers" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">9. International Data Transfers</a></li>
              <li><a href="#regional-rights" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">10. Regional Privacy Rights</a></li>
              <li><a href="#marketing" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">11. Marketing Communications</a></li>
              <li><a href="#third-party-links" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">12. Third-Party Links</a></li>
              <li><a href="#policy-changes" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">13. Changes to This Privacy Policy</a></li>
              <li><a href="#contact" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">14. Contact Us</a></li>
              <li><a href="#definitions" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">15. Definitions</a></li>
              <li><a href="#acknowledgment" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">16. Acknowledgment</a></li>
            </ul>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section id="introduction" className="mb-8">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                thin.ly ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our URL shortening service (the "Service").
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                By using thin.ly, you agree to the collection and use of information in accordance with this Privacy Policy.
              </p>
            </section>

            <section id="information-we-collect" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">1.1 Information You Provide to Us</h3>

              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-4">Account Information:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                <li>Name or username</li>
                <li>Email address</li>
                <li>Password (encrypted)</li>
                <li>Profile picture (if using OAuth sign-in)</li>
                <li>Payment information (processed by third-party payment processors)</li>
                <li>Tax information (for revenue-sharing participants)</li>
              </ul>

              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-4">Content You Create:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                <li>Original URLs you shorten</li>
                <li>Custom short link aliases</li>
                <li>Brand page information</li>
                <li>Link titles and descriptions</li>
                <li>Categories and tags</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">1.2 Information Automatically Collected</h3>

              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-4">Usage Data:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device type and operating system</li>
                <li>Pages visited and features used</li>
                <li>Time and date of visits</li>
              </ul>
            </section>

            <section id="how-we-use-information" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">2.1 Provide and Maintain the Service</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                <li>Create and manage your account</li>
                <li>Process and complete transactions</li>
                <li>Generate and manage shortened links</li>
                <li>Provide analytics and reporting</li>
                <li>Calculate and distribute revenue share</li>
              </ul>
            </section>

            <section id="how-we-share-information" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. How We Share Your Information</h2>

              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong className="text-gray-900 dark:text-white">We do not sell your personal information.</strong> We may share your information in the following circumstances:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">3.1 Service Providers</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">We share information with third-party vendors who perform services on our behalf:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                <li>Cloud hosting providers (AWS, Google Cloud, etc.)</li>
                <li>Payment processors (Stripe, PayPal, etc.)</li>
                <li>Email service providers</li>
                <li>Analytics providers (Google Analytics)</li>
              </ul>
            </section>

            <section id="cookies-tracking" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use cookies and similar tracking technologies to track activity on our Service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section id="data-security" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Data Security</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We implement industry-standard security measures including encryption in transit (SSL/TLS), encryption at rest for sensitive data, and regular security audits.
              </p>
            </section>

            <section id="your-rights" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Your Privacy Rights</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Depending on your location, you may have rights including access, correction, deletion, portability, and objection to processing of your personal information.
              </p>
            </section>

            <section id="children-privacy" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our Service is not directed to children under 13. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section id="international-transfers" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Your information may be transferred to and stored on servers located in the United States or other countries where our service providers operate. We ensure appropriate safeguards are in place when transferring data internationally.
              </p>
            </section>

            <section id="regional-rights" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Regional Privacy Rights</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">10.1 European Economic Area (EEA) / UK - GDPR</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you are located in the EEA or UK, you have additional rights under GDPR, including the right to access, rectification, erasure, data portability, and the right to lodge a complaint with a supervisory authority.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">10.2 California - CCPA/CPRA</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                California residents have rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected, the right to deletion, and the right to opt-out of sale of personal information. <strong className="text-gray-900 dark:text-white">We do not sell personal information.</strong>
              </p>
            </section>

            <section id="marketing" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Marketing Communications</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We will only send marketing communications if you have opted in or where permitted by law. You can opt out of marketing emails by clicking "unsubscribe" in any marketing email or adjusting preferences in your account settings.
              </p>
            </section>

            <section id="third-party-links" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Third-Party Links</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our Service contains links to third-party websites. We are not responsible for their privacy practices. When you use a shortened link, you will be redirected to the destination URL, and we are not responsible for the privacy practices of destination websites.
              </p>
            </section>

            <section id="policy-changes" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. For material changes, we will notify you by email, prominent notice on the Service, or in-app notification.
              </p>
            </section>

            <section id="contact" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">14. Contact Us</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have questions or concerns about this Privacy Policy:
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Email:</strong>{' '}
                <a href="mailto:privacy@thin.ly" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">
                  privacy@thin.ly
                </a>
              </p>
            </section>

            <section id="definitions" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">15. Definitions</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Personal Information:</dt>
                  <dd className="text-gray-700 dark:text-gray-300 ml-4">
                    Information that identifies, relates to, or could reasonably be linked to you.
                  </dd>
                </div>
                <div>
                  <dt className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Processing:</dt>
                  <dd className="text-gray-700 dark:text-gray-300 ml-4">
                    Any operation performed on personal information, including collection, use, storage, and disclosure.
                  </dd>
                </div>
                <div>
                  <dt className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Service:</dt>
                  <dd className="text-gray-700 dark:text-gray-300 ml-4">
                    thin.ly's URL shortening platform, including website and applications.
                  </dd>
                </div>
                <div>
                  <dt className="text-lg font-semibold text-gray-900 dark:text-white mb-1">You/User:</dt>
                  <dd className="text-gray-700 dark:text-gray-300 ml-4">
                    The individual or entity using our Service.
                  </dd>
                </div>
              </dl>
            </section>

            <section id="acknowledgment" className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">16. Acknowledgment</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong className="text-gray-900 dark:text-white">
                  By using thin.ly, you acknowledge that you have read and understood this Privacy Policy.
                </strong>
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mt-6">
                <p className="text-gray-700 dark:text-gray-300 mb-1">
                  <strong className="text-gray-900 dark:text-white">Version 1.0</strong>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong className="text-gray-900 dark:text-white">Effective Date:</strong> November 29, 2024
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              Questions about your privacy?{' '}
              <a href="mailto:privacy@thin.ly" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">
                Contact our privacy team
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

export default PrivacyPage;
