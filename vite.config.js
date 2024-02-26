import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "ReadEra BookNotes",
        short_name: "ReadEra BookNotes",
        description: "ReadEra BookNotes",
        icons: [
          {
            src: "android/android-launchericon-512-512.png",
            sizes: "512x512",
            purpose: "any maskable",
          },
          {
            src: "android/android-launchericon-192-192.png",
            sizes: "192x192",
          },
          {
            src: "android/android-launchericon-144-144.png",
            sizes: "144x144",
          },
          {
            src: "android/android-launchericon-96-96.png",
            sizes: "96x96",
          },
          {
            src: "android/android-launchericon-72-72.png",
            sizes: "72x72",
          },
          {
            src: "android/android-launchericon-48-48.png",
            sizes: "48x48",
          },
        ],
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait",
      },
    }),
  ],
});
