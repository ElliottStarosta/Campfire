import { defineConfig } from "vite";
export default defineConfig({
  root: "src",
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