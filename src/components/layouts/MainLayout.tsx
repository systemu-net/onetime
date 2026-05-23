import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    TransitionChild,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
    Bars3Icon,
    BellIcon,
    Cog6ToothIcon,
    HomeIcon,
    LinkIcon,
    MegaphoneIcon,
    QrCodeIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { IoCellular } from "react-icons/io5";
import { MdPhoneIphone } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { getCurrentUserApi, logoutApi } from "../../apis/authentication";
import Logo from "../../assets/logo.svg";
import {
    CAMPAIGNS_ROUTE,
    DASHBOARD_ROUTE,
    GOVERNANCE_ROUTE,
    LANDING_ROUTE,
    LINKS_ROUTE,
    PAGES_ROUTE,
    PLANS_ROUTE,
    PROFILE_ROUTE,
    QR_ROUTE,
    SETTINGS_ROUTE,
} from "../../routes";
import { User } from "../../types";
import {
    getCachedUser,
    invalidateUserCache,
    setCachedUser,
    USER_CACHE_VERSION_KEY_EXPORT,
} from "../../utils/userCache";
import ThemeToggle from "../ThemeToggle";

const navigation = [
  { name: "Home", href: DASHBOARD_ROUTE, icon: HomeIcon, current: true },
  // { name: 'Analytics', href: ANALYTICS_ROUTE, icon: ChartBarIcon, current: false },
  {
    name: "Link Governance",
    href: GOVERNANCE_ROUTE,
    icon: LinkIcon,
    current: false,
  },
  {
    name: "Campaigns",
    href: CAMPAIGNS_ROUTE,
    icon: MegaphoneIcon,
    current: false,
  },
  { name: "Pages", href: PAGES_ROUTE, icon: MdPhoneIphone, current: false },
  { name: "Links", href: LINKS_ROUTE, icon: LinkIcon, current: false },
  { name: "QR Codes", href: QR_ROUTE, icon: QrCodeIcon, current: false },
  { name: "Plans", href: PLANS_ROUTE, icon: IoCellular, current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function SidebarFooterActions({
  user,
  userLoading,
  email,
  onLogout,
}: {
  user: User | null;
  userLoading: boolean;
  email?: string;
  onLogout: () => void;
}) {
  return (
    <div className="mt-4 border-t border-gray-200 dark:border-zinc-700 pt-3">
      <div className="flex items-center gap-2">
        <Menu as="div" className="relative min-w-0 flex-1">
          <MenuButton className="-m-1.5 flex w-full items-center gap-2 rounded-md p-1.5 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
            <span className="sr-only">Open user menu</span>
            {userLoading ? (
              <div className="size-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="User avatar"
                className="size-8 rounded-full bg-gray-50 object-cover"
              />
            ) : (
              <div className="size-8 rounded-full bg-violet-600 flex items-center justify-center text-white font-semibold text-sm">
                {email?.[0]?.toUpperCase() || "U"}
              </div>
            )}

            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
                {email || "Account"}
              </span>
              <span className="block text-[11px] text-gray-500 dark:text-zinc-400">
                Account
              </span>
            </span>

            <ChevronDownIcon
              aria-hidden="true"
              className="size-5 shrink-0 text-gray-400"
            />
          </MenuButton>

          <MenuItems
            transition
            className="absolute bottom-full left-0 z-20 mb-2 w-40 origin-bottom-left rounded-md bg-white dark:bg-zinc-900 py-2 shadow-lg ring-1 ring-gray-900/5 dark:ring-zinc-700 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
          >
            <MenuItem key="Your profile">
              <Link
                to={PROFILE_ROUTE}
                className="block px-3 py-1 text-sm/6 text-gray-900 dark:text-zinc-100 data-[focus]:bg-gray-50 dark:data-[focus]:bg-zinc-800 data-[focus]:outline-none"
              >
                Your profile
              </Link>
            </MenuItem>
            <MenuItem key="Sign out">
              <Link
                to={LANDING_ROUTE}
                className="block px-3 py-1 text-sm/6 text-gray-900 dark:text-zinc-100 data-[focus]:bg-gray-50 dark:data-[focus]:bg-zinc-800 data-[focus]:outline-none"
                onClick={onLogout}
              >
                Sign out
              </Link>
            </MenuItem>
          </MenuItems>
        </Menu>

        <ThemeToggle />
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
        >
          <span className="sr-only">View notifications</span>
          <BellIcon aria-hidden="true" className="size-5" />
        </button>
      </div>
    </div>
  );
}

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [cookies, , removeCookie] = useCookies(["token", "email"]);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!cookies.token) {
      setUserLoading(false);
      return;
    }

    // Check cache first
    const cachedUser = getCachedUser();
    if (cachedUser) {
      setUser(cachedUser);
      setUserLoading(false);
      return;
    }

    // Fetch from API if not cached
    setUserLoading(true);
    const [response, error] = await getCurrentUserApi(cookies.token);
    if (!error && response && typeof response !== "string") {
      const data = await response.json();
      setUser(data.user);
      setCachedUser(data.user);
    }
    setUserLoading(false);
  }, [cookies.token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Listen for cache invalidation (e.g., after avatar upload/delete)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === USER_CACHE_VERSION_KEY_EXPORT) {
        // Cache was invalidated, refetch user data
        const fetchFreshUser = async () => {
          if (!cookies.token) return;

          setUserLoading(true);
          const [response, error] = await getCurrentUserApi(cookies.token);
          if (!error && response && typeof response !== "string") {
            const data = await response.json();
            setUser(data.user);
            setCachedUser(data.user);
          }
          setUserLoading(false);
        };
        fetchFreshUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [cookies.token]);

  const handleLogout = async () => {
    const [result, error] = await logoutApi(cookies.token);
    handleLogoutResponse(result, error);
  };

  const handleLogoutResponse = (_, error) => {
    if (error) {
      console.error(error);
    }
    invalidateUserCache();
    setUser(null);
    removeCookie("token");
  };

  return (
    <>
      <div className="text-primary dark:text-gray-200 font-rubik bg-zinc-100 dark:bg-zinc-950 min-h-svh">
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
                  <Link
                    to="/"
                    className="logo h-8 w-auto dark:invert hover:bg-pink-300"
                  >
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
                                  ? "bg-gray-50 text-violet-600 dark:bg-zinc-900 dark:text-violet-500"
                                  : "text-gray-700 dark:text-white hover:bg-gray-50 hover:text-violet-600",
                                "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold",
                              )}
                            >
                              <item.icon
                                aria-hidden="true"
                                className={classNames(
                                  item.href === location.pathname
                                    ? "text-violet-600 dark:text-violet-500"
                                    : "text-gray-400 group-hover:text-violet-600",
                                  "size-6 shrink-0",
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
                        className={classNames(
                          SETTINGS_ROUTE === location.pathname
                            ? "bg-gray-50 text-violet-600 dark:bg-zinc-900 dark:text-violet-500"
                            : "text-gray-700 dark:text-white hover:bg-gray-50 hover:text-violet-600",
                          "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold",
                        )}
                      >
                        <Cog6ToothIcon
                          aria-hidden="true"
                          className={classNames(
                            SETTINGS_ROUTE === location.pathname
                              ? "text-violet-600 dark:text-violet-500"
                              : "text-gray-400 group-hover:text-violet-600",
                            "size-6 shrink-0",
                          )}
                        />
                        Settings
                      </Link>
                    </li>
                  </ul>
                </nav>
                <SidebarFooterActions
                  user={user}
                  userLoading={userLoading}
                  email={cookies.email}
                  onLogout={handleLogout}
                />
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
                              ? "bg-gray-50 text-violet-600 dark:bg-zinc-900 dark:text-violet-500"
                              : "text-gray-700 dark:text-white hover:bg-gray-50 hover:text-violet-600 dark:hover:bg-zinc-900",
                            "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold",
                          )}
                        >
                          <item.icon
                            aria-hidden="true"
                            className={classNames(
                              item.href === location.pathname
                                ? "text-violet-600 dark:text-violet-500"
                                : "text-gray-400 group-hover:text-violet-600",
                              "size-6 shrink-0",
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
                    className={classNames(
                      SETTINGS_ROUTE === location.pathname
                        ? "bg-gray-50 text-violet-600 dark:bg-zinc-900 dark:text-violet-500"
                        : "text-gray-700 dark:text-white hover:bg-gray-50 hover:text-violet-600 dark:hover:bg-zinc-900",
                      "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold",
                    )}
                  >
                    <Cog6ToothIcon
                      aria-hidden="true"
                      className={classNames(
                        SETTINGS_ROUTE === location.pathname
                          ? "text-violet-600 dark:text-violet-500"
                          : "text-gray-400 group-hover:text-violet-600",
                        "size-6 shrink-0",
                      )}
                    />
                    Settings
                  </Link>
                </li>
              </ul>
            </nav>
            <SidebarFooterActions
              user={user}
              userLoading={userLoading}
              email={cookies.email}
              onLogout={handleLogout}
            />
          </div>
        </div>

        <div className="lg:pl-72">
          <main className="pt-6 flex flex-1 h-full overflow-x-clip">
            <div className="flex-grow h-full min-w-0">
              <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
                <div className="sticky top-0 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-4 bg-white/90 dark:bg-neutral-950/90 backdrop-blur supports-[backdrop-filter]:bg-white/75 border-b border-neutral-200/70 dark:border-white/[0.06] lg:hidden flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-700 dark:text-zinc-100"
                  >
                    <Bars3Icon aria-hidden="true" className="size-5" />
                    Menu
                  </button>
                  <button
                    type="button"
                    aria-label="View notifications"
                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 text-gray-700 dark:text-zinc-100"
                  >
                    <BellIcon aria-hidden="true" className="size-5" />
                  </button>
                </div>
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};
export default MainLayout;
