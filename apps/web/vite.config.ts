import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three")) return "three";
          if (id.includes("node_modules/d3")) return "d3";
          if (id.includes("node_modules/lucide-react")) return "icons";
          if (id.includes("@brainbuilder/courseware")) return "courseware";
        }
      }
    }
  },
  server: {
    port: 5173,
    strictPort: false
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/vitest.setup.ts",
    css: true,
    exclude: ["tests/**", "node_modules/**", "dist/**"]
  }
});
