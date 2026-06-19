import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// User-facing app on port 5173.
// Frontend calls /api/* - proxied to the FastAPI backend on :8000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // 127.0.0.1 (not "localhost") so Node never tries IPv6 ::1 first.
      "/api": { target: "http://127.0.0.1:8000", changeOrigin: true },
    },
  },
});
