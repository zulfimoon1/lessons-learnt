
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  console.log(`🔧 Vite build mode: ${mode}`);
  
  // Use different base paths for different environments
  let base = '/';
  if (mode === 'production') {
    // Check if we're building for GitHub Pages
    if (process.env.VITE_BASE_PATH) {
      base = process.env.VITE_BASE_PATH;
    } else {
      // Default for GitHub Pages
      base = '/lessons-learnt/';
    }
  }
  
  console.log(`🔧 Base path set to: ${base}`);
  
  return {
    base,
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
      sourcemap: false,
      minify: mode === 'production' ? 'terser' : false,
      outDir: 'dist',
    },
  };
});
