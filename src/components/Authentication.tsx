import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import { googleAuthApi, loginApi, registerApi } from "../apis/authentication";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";
import {
  DASHBOARD_ROUTE,
  LOGIN_ROUTE,
  PRIVACY_ROUTE,
  REGISTER_ROUTE,
  TERMS_ROUTE,
  USER_POLICY_ROUTE,
} from "../routes";
import { validateEmail, validatePassword } from "../utils/validations";

// type PageType = 'LOGIN' | 'REGISTER'; // Define PageType as a string literal union type

interface AuthenticationProps {
  pageType: PageType;
}

const initialErrorsState = {
  email: "",
  password: "",
  api: "",
};

const normalizeToken = (token: string): string => {
  return token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`;
};

const extractTokenFromResponse = async (
  response: Response,
): Promise<string | null> => {
  const authorization =
    response.headers.get("authorization") ||
    response.headers.get("Authorization");
  if (authorization) {
    return normalizeToken(authorization);
  }

  return null;
};

export const LOGIN = "LOGIN";
export const REGISTER = "REGISTER";

export type PageType = typeof LOGIN | typeof REGISTER;

const Authentication = ({ pageType = LOGIN }: AuthenticationProps) => {
  const [cookies, setCookie] = useCookies(["token"]);
  const navigate = useNavigate();

  useEffect(() => {
    if (cookies.token) {
      navigate(DASHBOARD_ROUTE, { replace: true });
    }
  }, [cookies.token, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Six months expressed in seconds — used both as the JWT lifetime on the
  // server and as the cookie maxAge here so the two stay in sync.
  const REMEMBER_ME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 * 6;
  const [errors, setErrors] =
    useState<typeof initialErrorsState>(initialErrorsState);

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    let newErrors: typeof initialErrorsState = { ...initialErrorsState };

    if (!validateEmail(email)) {
      newErrors = {
        ...newErrors,
        email: "Invalid email",
      };
    }

    if (!validatePassword(password)) {
      newErrors = {
        ...newErrors,
        password: "Password must be at least 6 characters long",
      };
    }

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) {
      return;
    }

    // Make API call
    if (pageType === LOGIN) {
      const [response, error] = await loginApi({
        user: {
          email: email,
          password: password,
          remember_me: rememberMe,
        },
      });
      handleResponse([response, error], rememberMe);
    } else {
      const [response, error] = await registerApi({
        user: {
          email: email,
          password: password,
          terms_accepted: true,
        },
      });
      handleResponse([response, error]);
    }
  };

  const handleGoogleCredential = async (idToken: string) => {
    const [response, error] = await googleAuthApi({
      id_token: idToken,
      terms_accepted: true,
    });
    handleResponse([response, error]);
  };

  const { buttonRef: googleButtonRef, error: googleError } =
    useGoogleSignIn(handleGoogleCredential);

  const handleResponse = async ([response, error], persist = false) => {
    if (error) {
      setErrors({ ...errors, api: error });
    } else {
      const jwt = await extractTokenFromResponse(response);
      if (!jwt) {
        setErrors({
          ...errors,
          api: "Login succeeded, but no auth token was returned. Check CORS exposed headers and JWT dispatch settings.",
        });
        return;
      }

      setCookie("token", jwt, {
        path: "/",
        sameSite: "lax",
        ...(persist ? { maxAge: REMEMBER_ME_COOKIE_MAX_AGE_SECONDS } : {}),
      });
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 flex min-h-full flex-1">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div>
              <h2 className="mt-2 text-balance text-2xl/9 font-semibold tracking-tight text-primary dark:text-violet-400">
                {pageType === LOGIN ? (
                  <>Sign in to your account</>
                ) : (
                  <>Create an account</>
                )}
              </h2>
            </div>

            <div className="mt-10">
              <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm/6 font-medium text-gray-900 dark:text-zinc-100"
                    >
                      Email address
                    </label>
                    <div className="mt-2">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        className="block w-full rounded-md bg-white dark:bg-zinc-900 px-3 py-1.5 text-base text-gray-900 dark:text-zinc-100 outline outline-1 -outline-offset-1 outline-gray-300 dark:outline-zinc-600 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-2 focus:-outline-offset-2 focus:outline-violet-600 sm:text-sm/6"
                        placeholder="Enter email address"
                        value={email}
                        onChange={handleEmailChange}
                      />
                      {errors.email && (
                        <p className="text-sm text-medium text-red-500 mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm/6 font-medium text-gray-900 dark:text-zinc-100"
                    >
                      Password
                    </label>
                    <div className="mt-2 relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        className="block w-full rounded-md bg-white dark:bg-zinc-900 px-3 py-1.5 text-base text-gray-900 dark:text-zinc-100 outline outline-1 -outline-offset-1 outline-gray-300 dark:outline-zinc-600 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-2 focus:-outline-offset-2 focus:outline-violet-600 sm:text-sm/6"
                        placeholder="Enter password"
                        value={password}
                        onChange={handlePasswordChange}
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                        className="absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-hidden focus:outline-violet-600 focus:text-violet-600 dark:text-neutral-600 dark:focus:text-violet-500"
                      >
                        <svg
                          className="shrink-0 size-3.5"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                          <line
                            className={showPassword ? "hidden" : ""}
                            x1="2"
                            x2="22"
                            y1="2"
                            y2="22"
                          ></line>
                          <path
                            className={showPassword ? "" : "hidden"}
                            d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
                          ></path>
                          <circle
                            className={showPassword ? "" : "hidden"}
                            cx="12"
                            cy="12"
                            r="3"
                          ></circle>
                        </svg>
                      </button>
                      {errors.password && (
                        <p className="text-sm text-medium text-red-500 mt-1">
                          {errors.password}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Remember me and Forgot password - Only for Login */}
                  {pageType === LOGIN && (
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3">
                        <div className="flex h-6 shrink-0 items-center">
                          <div className="group grid size-4 grid-cols-1">
                            <input
                              id="remember-me"
                              name="remember-me"
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 checked:border-violet-600 checked:bg-violet-600 indeterminate:border-violet-600 indeterminate:bg-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                            />
                            <svg
                              fill="none"
                              viewBox="0 0 14 14"
                              className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
                            >
                              <path
                                d="M3 8L6 11L11 3.5"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-0 group-has-[:checked]:opacity-100"
                              />
                              <path
                                d="M3 7H11"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-0 group-has-[:indeterminate]:opacity-100"
                              />
                            </svg>
                          </div>
                        </div>
                        <label
                          htmlFor="remember-me"
                          className="block text-sm/6 text-gray-900 dark:text-zinc-100"
                        >
                          Remember me
                        </label>
                      </div>

                      {pageType === LOGIN && (
                        <div className="text-sm/6">
                          <a
                            href="#"
                            className="font-semibold text-violet-600 hover:text-violet-500"
                          >
                            Forgot password?
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <button
                      type="submit"
                      className="flex w-full justify-center rounded-md bg-accent text-primary px-3 py-1.5 hover:bg-primary hover:text-white mt-6 block px-3 py-2 text-center font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
                    >
                      {pageType === "LOGIN" ? "Sign in" : "Create an account"}
                    </button>
                    {errors.api && (
                      <p className="text-sm text-medium text-red-500 mt-1">
                        {errors.api}
                      </p>
                    )}
                  </div>
                </form>
              </div>

              {/* OAuth sign-in options - Shown on both Login and Register */}
              <div className="mt-10">
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center"
                  >
                    <div className="w-full border-t border-gray-200 dark:border-zinc-700" />
                  </div>
                  <div className="relative flex justify-center text-sm/6 font-medium">
                    <span className="bg-white dark:bg-zinc-900 px-6 text-gray-900 dark:text-zinc-100">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <div
                    ref={googleButtonRef}
                    className="flex justify-center [&>div]:!w-full [&_iframe]:!w-full"
                  />
                </div>
                <p className="mt-4 text-xs text-gray-500 dark:text-zinc-400 text-center leading-relaxed">
                  By continuing, you agree to our{" "}
                  <Link
                    to={TERMS_ROUTE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-violet-600 hover:text-violet-500 underline"
                  >
                    Terms of Service
                  </Link>
                  ,{" "}
                  <Link
                    to={PRIVACY_ROUTE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-violet-600 hover:text-violet-500 underline"
                  >
                    Privacy Policy
                  </Link>
                  , and{" "}
                  <Link
                    to={USER_POLICY_ROUTE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-violet-600 hover:text-violet-500 underline"
                  >
                    User Policy
                  </Link>
                  .
                </p>
                {googleError && (
                  <p className="text-sm text-medium text-red-500 mt-2">
                    {googleError}
                  </p>
                )}
              </div>
              <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
                {pageType === LOGIN ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <Link
                      to={REGISTER_ROUTE}
                      className="font-medium text-violet-600 hover:text-violet-500 hover:underline"
                    >
                      Sign up
                    </Link>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <Link
                      to={LOGIN_ROUTE}
                      className="font-medium text-violet-600 hover:text-violet-500 hover:underline"
                    >
                      Sign in
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Authentication;
