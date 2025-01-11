import { defineConfig } from "vite";

export default defineConfig({
  base: "/cache_example/",
  server: {
    open: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
