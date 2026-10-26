// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ command, mode }) => {
  const isDev = mode === "development" || command === "serve";

  return {
    plugins: [react()],
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        isDev ? "development" : "production",
      ),
    },
    server: {
      port: 3000,
      open: true,
    },
    build: {
      lib: isDev
        ? undefined
        : {
            entry: path.resolve(__dirname, "src/main.jsx"),
            name: "BOIComplaint",
            formats: ["es", "umd"],
            fileName: (format) => `boi-complaint.${format}.js`,
          },
      rollupOptions: isDev
        ? {}
        : {
            output: {
              assetFileNames: (assetInfo) => {
                if (!assetInfo.name) return "boi-complaint.css";
                if (assetInfo.name === "style.css") {
                  return "boi-complaint.css";
                }
                return assetInfo.name;
              },
            },
          },
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: isDev,
      cssCodeSplit: false,
      minify: isDev ? false : "esbuild",
    },
  };
});
