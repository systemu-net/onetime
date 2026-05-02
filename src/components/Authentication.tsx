import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import { loginApi, registerApi } from "../apis/authentication";
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
  terms: "",
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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

    // Validate legal agreements for registration only
    if (pageType === REGISTER && !termsAccepted) {
      newErrors = {
        ...newErrors,
        terms: "You must accept the terms and policies to continue",
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
        },
      });
      handleResponse([response, error]);
    } else {
      const [response, error] = await registerApi({
        user: {
          email: email,
          password: password,
          terms_accepted: termsAccepted,
        },
      });
      handleResponse([response, error]);
    }
  };

  const handleResponse = async ([response, error]) => {
    if (error) {
      setErrors({ ...errors, api: error });
    } else {
      const jwt = await extractTokenFromResponse(response);
      // debugger;
      if (!jwt) {
        setErrors({
          ...errors,
          api: "Login succeeded, but no auth token was returned. Check CORS exposed headers and JWT dispatch settings.",
        });
        return;
      }

      setCookie("token", jwt, { path: "/", sameSite: "lax" });
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
              <p className="mt-2 text-sm/6 text-gray-500 dark:text-gray-400">
                {pageType === LOGIN ? (
                  <>
                    Not a user?
                    <Link
                      to={REGISTER_ROUTE}
                      className="ms-1 text-violet-500 underline"
                    >
                      Register
                    </Link>
                  </>
                ) : (
                  <>
                    Already a user?
                    <Link
                      to={LOGIN_ROUTE}
                      className="ms-1 text-violet-500 underline"
                    >
                      Login
                    </Link>
                  </>
                )}
              </p>
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

                  {/* Legal Agreement - Only for Registration */}
                  {pageType === REGISTER && (
                    <div className="border-t border-gray-200 dark:border-zinc-700 pt-6">
                      <div className="flex items-start gap-3">
                        <div className="flex h-6 shrink-0 items-center">
                          <input
                            id="terms-accepted"
                            name="terms-accepted"
                            type="checkbox"
                            required
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="size-4 rounded border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 text-violet-600 focus:ring-violet-600"
                          />
                        </div>
                        <label
                          htmlFor="terms-accepted"
                          className="text-sm text-gray-700 dark:text-gray-400 leading-tight"
                        >
                          I agree to the{" "}
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
                          </Link>{" "}
                          and{" "}
                          <Link
                            to={USER_POLICY_ROUTE}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-violet-600 hover:text-violet-500 underline"
                          >
                            User Policy
                          </Link>
                          .
                        </label>
                      </div>
                      {errors.terms && (
                        <p className="text-sm text-red-500 mt-2 ml-7">
                          {errors.terms}
                        </p>
                      )}
                    </div>
                  )}

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

              {/* OAuth sign-in options - Only for Login */}
              {pageType === LOGIN && (
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

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <a
                      href="#"
                      className="flex w-full items-center justify-center gap-3 rounded-md bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-zinc-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700 focus-visible:ring-transparent"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-5 w-5"
                      >
                        <path
                          d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                          fill="#EA4335"
                        />
                        <path
                          d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                          fill="#34A853"
                        />
                      </svg>
                      <span className="text-sm/6 font-semibold">Google</span>
                    </a>

                    <a
                      href="#"
                      className="flex w-full items-center justify-center gap-3 rounded-md bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-zinc-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700 focus-visible:ring-transparent"
                    >
                      <svg
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        className="size-5 fill-[#24292F] dark:fill-zinc-100"
                      >
                        <path
                          d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                          clipRule="evenodd"
                          fillRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm/6 font-semibold">GitHub</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Authentication;
