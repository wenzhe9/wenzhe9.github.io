import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const buildDate = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "Asia/Shanghai",
}).format(new Date());

const isGitHubPagesBuild = Boolean(process.env.GITHUB_ACTIONS);
const pageInputs = {
  home: resolve(import.meta.dirname, "index.html"),
  projects: resolve(import.meta.dirname, "projects/index.html"),
  project: resolve(import.meta.dirname, "project/index.html"),
  cv: resolve(import.meta.dirname, "cv/index.html"),
};

if (!isGitHubPagesBuild) {
  pageInputs.admin = resolve(import.meta.dirname, "admin/index.html");
}

export default defineConfig({
  base: isGitHubPagesBuild ? "/personal-academic-site/" : "/",
  define: {
    "import.meta.env.VITE_BUILD_DATE": JSON.stringify(buildDate),
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    port: 3001,
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  build: {
    rollupOptions: {
      input: pageInputs,
    },
  },
  plugins: [react()],
});
