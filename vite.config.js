import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the built app works from any URL — site root, a GitHub
// Pages subpath, or a LAN preview.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
