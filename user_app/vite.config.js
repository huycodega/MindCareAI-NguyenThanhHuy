import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// User-facing app on port 5173.
// Frontend calls /api/* - proxied to the mock backend on :8001 for local UI work.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://127.0.0.1:8001", changeOrigin: true },
    },
  },
});
