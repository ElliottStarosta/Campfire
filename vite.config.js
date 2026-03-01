import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  publicDir: "../public",   // ← tells Vite: public assets are in the-seventh/public/
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api/chat": {
        target: "http://localhost:8888",
        changeOrigin: true,
      },
    },
  },
});