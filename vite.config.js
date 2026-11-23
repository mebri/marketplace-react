import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
<<<<<<< HEAD
  plugins: [react(), cloudflare()],
  base: "./",
});
=======
  plugins: [react()],
  base: "/",
});

>>>>>>> c85442526896fc48e5cb237998fcf0cc1e1daa3a
