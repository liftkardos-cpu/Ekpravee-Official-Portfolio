import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  nitro: {
    preset: process.env.VERCEL ? "vercel" : undefined,
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
