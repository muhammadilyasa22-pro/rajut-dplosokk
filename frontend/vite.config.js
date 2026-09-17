import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/rajut-dplosokk/",
  
  plugins: [react()],

  server: {
    port: 5173
  }
});