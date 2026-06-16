import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Clinician/admin app on port 5174 (different from user app's 5173).
// Same backend (FastAPI on :8000) — proxied via /api/*.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      // 127.0.0.1 (not "localhost") so Node never tries IPv6 ::1 first —
      // uvicorn binds IPv4 only, and ::1 would ECONNREFUSED.
      "/api": { target: "http://127.0.0.1:8000", changeOrigin: true },
    },
  },
});
