
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  console.log(`🔧 Vite build mode: ${mode}`);
  
  // Force production base for GitHub Pages
  const base = '/lessons-learnt/';
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
