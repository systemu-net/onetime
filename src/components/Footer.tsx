import { Link } from "react-router-dom";
import {
  ABOUT_ROUTE,
  CONTACT_ROUTE,
  COOKIES_ROUTE,
  FEATURES_ROUTE,
  PLANS_ROUTE,
  PRIVACY_ROUTE,
  TERMS_ROUTE,
  USER_POLICY_ROUTE
} from "../routes";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* About Section */}
          <div className="footer-section">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              thin.ly
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Simple, powerful URL shortening
            </p>
          </div>

          {/* Product Section */}
          <div className="footer-section">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to={FEATURES_ROUTE}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to={PLANS_ROUTE}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Plans
                </Link>
              </li>
              <li>
                <a
                  href="/blog/"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/api-docs"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div className="footer-section">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to={ABOUT_ROUTE}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to={CONTACT_ROUTE}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="footer-section">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to={TERMS_ROUTE}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to={PRIVACY_ROUTE}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to={COOKIES_ROUTE}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to={USER_POLICY_ROUTE}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  User Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="footer-section">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/help"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <Link
                  to={CONTACT_ROUTE}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@thin.ly"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Email Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            &copy; {currentYear} thin.ly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
