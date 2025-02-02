import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/socket.io": {
        target: "https://projectsworkbboard.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
