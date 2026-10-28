import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

export default defineConfig(({ command }) => ({
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    react(),
    ...(command === "build"
      ? [
          nitro({
            preset: process.env.VERCEL ? "vercel" : undefined,
          }),
        ]
      : []),
  ],
}));
