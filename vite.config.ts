import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Cette option permet à Vite d'accepter les requêtes venant de ngrok
    allowedHosts: [".ngrok-free.app"], 
    // Optionnel : si tu veux que ton front soit aussi accessible sur ton réseau local
    host: true, 
  },
});