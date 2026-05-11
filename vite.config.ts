import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, Plugin } from "vite";

function injectRuntimeEnv(): Plugin {
  return {
    name: "inject-runtime-env",
    transformIndexHtml(html) {
      const clientId =
        process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "";
      const envScript = `<script>window.__ENV__ = ${JSON.stringify({ GOOGLE_CLIENT_ID: clientId })};</script>`;
      return html.replace("</head>", `  ${envScript}\n</head>`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), injectRuntimeEnv()],
  server: {
    port: 4000,
  },
  resolve: {
    alias: {
      "@": path.join(import.meta.dirname, "src"),
    },
  },
  define: {
    "process.env": process.env,
  },
});
