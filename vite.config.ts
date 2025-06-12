
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
    // Check if we're building for GitHub Pages or custom domain
    // If GITHUB_PAGES is set in environment, use the repository path
    if (process.env.GITHUB_PAGES === 'true') {
      base = '/lessons-learnt/';
    } else {
      // For custom domain, use root path
      base = '/';
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
      // Ensure proper base path handling
      emptyOutDir: true,
    },
  };
});
