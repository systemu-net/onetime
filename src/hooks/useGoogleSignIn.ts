import { useEffect, useRef, useState } from "react";

const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

// Google's renderButton accepts a max width of 400px.
const MAX_BUTTON_WIDTH = 400;

let scriptPromise: Promise<void> | null = null;

const loadGisScript = (): Promise<void> => {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity Services")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
  return scriptPromise;
};

interface UseGoogleSignInResult {
  buttonRef: React.RefObject<HTMLDivElement>;
  ready: boolean;
  error: string | null;
}

export const useGoogleSignIn = (
  onCredential: (idToken: string) => void,
): UseGoogleSignInResult => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callbackRef = useRef(onCredential);
  callbackRef.current = onCredential;

  useEffect(() => {
    if (!CLIENT_ID) {
      setError("VITE_GOOGLE_CLIENT_ID is not configured");
      return;
    }
    let cancelled = false;

    loadGisScript()
      .then(() => {
        if (cancelled) return;
        const gid = window.google?.accounts?.id;
        const container = buttonRef.current;
        if (!gid || !container) return;

        gid.initialize({
          client_id: CLIENT_ID,
          callback: (response) => {
            if (response?.credential) {
              callbackRef.current(response.credential);
            }
          },
        });

        const width = Math.min(
          container.getBoundingClientRect().width || MAX_BUTTON_WIDTH,
          MAX_BUTTON_WIDTH,
        );
        gid.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width,
        });
        setReady(true);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { buttonRef, ready, error };
};

interface GoogleIdInitConfig {
  client_id: string;
  callback: (response: { credential: string }) => void;
}

interface GoogleButtonOptions {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdInitConfig) => void;
          renderButton: (
            parent: HTMLElement,
            options: GoogleButtonOptions,
          ) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}
