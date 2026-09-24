import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, "../../public"),
    // public is intentionally outside apps/web for Vercel's outputDirectory.
    // Avoid Vite scanning parent folders while clearing an external output path.
    emptyOutDir: false,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
