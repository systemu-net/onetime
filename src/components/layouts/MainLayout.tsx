import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
} from '@headlessui/react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import {
  Bars3Icon,
  BellIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  LinkIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import Jdenicon from 'react-jdenticon';
import { Link, useLocation } from 'react-router-dom';
import { logoutApi } from '../../apis/authentication';
import Logo from '../../assets/logo.svg';
import { ANALYTICS_ROUTE, DASHBOARD_ROUTE, LANDING_ROUTE, LINKS_ROUTE, PAGES_ROUTE, PRICING_ROUTE, PROFILE_ROUTE, QR_ROUTE, SETTINGS_ROUTE } from '../../routes';

const navigation = [
  { name: 'Home', href: DASHBOARD_ROUTE, icon: HomeIcon, current: true },
  { name: 'Links', href: LINKS_ROUTE, icon: LinkIcon, current: false },
  { name: 'QR Codes', href: QR_ROUTE, icon: QrCodeIcon, current: false },
  { name: 'Pages', href: PAGES_ROUTE, icon: DocumentTextIcon, current: false },
  { name: 'Analytics', href: ANALYTICS_ROUTE, icon: ChartBarIcon, current: false },
  { name: 'Pricing', href: PRICING_ROUTE, icon: ShieldCheckIcon, current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [cookies, , removeCookie] = useCookies(['token', 'email']);

  const handleLogout = async () => {
    const [result, error] = await logoutApi(cookies.token);
    handleLogoutResponse(result, error);
  }

  const handleLogoutResponse = (_, error) => {
    if (error) {
      console.error(error);
      removeCookie('token');
    } else {
      console.error('Logged out');
      removeCookie('token');
    }
  }

  return (
    <>
      <div className='text-textPrimary font-rubik bg-zinc-100 dark:bg-zinc-950'>
        <Dialog
          open={sidebarOpen}
          onClose={setSidebarOpen}
          className="relative z-50 lg:hidden"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />
          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="-m-2.5 p-2.5"
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon
                      aria-hidden="true"
                      className="size-6 text-white"
                    />
                  </button>
                </div>
              </TransitionChild>

              {/* Sidebar component, swap this element with another sidebar if you like */}

              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-zinc-950 px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <Link to="/" className="logo h-8 w-auto dark:invert">
                    <img src={Logo} alt="Logo" />
                  </Link>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <Link
                              to={item.href}
                              className={classNames(
                                item.href === location.pathname
                                  ? 'bg-gray-50 text-violet-600 dark:bg-zinc-900 dark:text-violet-500'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-violet-600',
                                'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold'
                              )}
                            >
                              <item.icon
                                aria-hidden="true"
                                className={classNames(
                                  item.href === location.pathname
                                    ? 'text-violet-600 dark:text-violet-500'
                                    : 'text-gray-400 group-hover:text-violet-600',
                                  'size-6 shrink-0'
                                )}
                              />
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>

                    <li className="mt-auto">
                      <Link
                        to={SETTINGS_ROUTE}
                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-violet-600"
                      >
                        <Cog6ToothIcon
                          aria-hidden="true"
                          className="size-6 shrink-0 text-gray-400 group-hover:text-violet-600"
                        />
                        Settings
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <Link to="/" className="logo h-8 w-auto dark:invert">
                <img src={Logo} alt="Logo" />
              </Link>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={classNames(
                            item.href === location.pathname
                              ? 'bg-gray-50 text-violet-600 dark:bg-zinc-900 dark:text-violet-500'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-violet-600 dark:hover:bg-zinc-900',
                            'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold'
                          )}
                        >
                          <item.icon
                            aria-hidden="true"
                            className={classNames(
                              item.href === location.pathname
                                ? 'text-violet-600 dark:text-violet-500'
                                : 'text-gray-400 group-hover:text-violet-600',
                              'size-6 shrink-0'
                            )}
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>

                <li className="mt-auto">
                  <Link
                    to={SETTINGS_ROUTE}
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-violet-600"
                  >
                    <Cog6ToothIcon
                      aria-hidden="true"
                      className="size-6 shrink-0 text-gray-400 group-hover:text-violet-600"
                    />
                    Settings
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <div className="lg:pl-72">
          <div className="border-b border-gray-200 dark:border-zinc-700 sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-8">
            <div className="flex h-16 items-center gap-x-4 bg-white dark:bg-zinc-950 shadow-sm sm:gap-x-6 sm:px-6 px-4 lg:shadow-none">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>
              {/* Separator */}
              <div
                aria-hidden="true"
                className="h-6 w-px bg-gray-200 lg:hidden"
              />
              <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <form
                  action="#"
                  method="GET"
                  className="grid flex-1 grid-cols-1"
                >
                  <input
                    name="search"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    className="col-start-1 row-start-1 block size-full bg-white dark:bg-zinc-900 pl-8 text-base text-gray-900 outline-none placeholder:text-gray-400 sm:text-sm/6"
                  />

                  <MagnifyingGlassIcon
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 size-5 self-center text-gray-400"
                  />
                </form>
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon aria-hidden="true" className="size-6" />
                  </button>
                  {/* Separator */}
                  <div
                    aria-hidden="true"
                    className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
                  />
                  {/* Profile dropdown */}
                  <Menu as="div" className="relative">
                    <MenuButton className="-m-1.5 flex items-center p-1.5">
                      <span className="sr-only">Open user menu</span>
                      <Jdenicon value={cookies.email} size={32} className="size-8 rounded-full bg-gray-50" />
                      <span className="hidden lg:flex lg:items-center">
                        <span
                          aria-hidden="true"
                          className="ml-4 text-sm/6 font-semibold text-gray-900"
                        >
                          {cookies.email}
                        </span>
                        <ChevronDownIcon
                          aria-hidden="true"
                          className="ml-2 size-5 text-gray-400"
                        />
                      </span>
                    </MenuButton>
                    <MenuItems
                      transition
                      className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                    >
                      <MenuItem key={`Your profile`}>
                        <Link
                          to={PROFILE_ROUTE}
                          className="block px-3 py-1 text-sm/6 text-gray-900 data-[focus]:bg-gray-50 data-[focus]:outline-none"
                        >
                          Your profile
                        </Link>
                      </MenuItem>
                      <MenuItem key={`Sign out`}>
                        <Link
                          to={LANDING_ROUTE}
                          className="block px-3 py-1 text-sm/6 text-gray-900 data-[focus]:bg-gray-50 data-[focus]:outline-none"
                          onClick={handleLogout}
                        >
                          Sign out
                        </Link>
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                </div>
              </div>
            </div>
          </div>
          <main className="pt-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};
export default MainLayout;
