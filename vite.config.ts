
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  console.log(`🔧 Vite build mode: ${mode}`);
  
  // For custom domain, always use root path
  const base = '/';
  
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
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast', '@radix-ui/react-tabs'],
            routing: ['react-router-dom'],
            forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
            supabase: ['@supabase/supabase-js'],
            charts: ['recharts'],
            icons: ['lucide-react']
          },
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
      sourcemap: false,
      minify: mode === 'production' ? 'terser' : false,
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      outDir: 'dist',
      emptyOutDir: true,
      chunkSizeWarningLimit: 1000,
    },
    define: {
      __BASE_URL__: JSON.stringify(base),
    },
  };
});
