import { COOKIES_ROUTE, PRIVACY_ROUTE, TERMS_ROUTE, USER_POLICY_ROUTE } from '@/routes';
import { Link, useLocation } from 'react-router-dom';

const LegalNav = () => {
    const location = useLocation();

    const navItems = [
        { path: TERMS_ROUTE, label: 'Terms of Service' },
        { path: PRIVACY_ROUTE, label: 'Privacy Policy' },
        { path: COOKIES_ROUTE, label: 'Cookie Policy' },
        { path: USER_POLICY_ROUTE, label: 'User Policy' },
    ];

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
            <nav className="flex flex-wrap gap-4 px-4 md:pl-0 -mb-px justify-center items-center">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${location.pathname === item.path
                            ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300'
                            }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
};


export default LegalNav;
