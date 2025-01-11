import { defineConfig } from "vite";

export default defineConfig({
  base: "/cache-example/",
  server: {
    open: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
