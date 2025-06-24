
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

console.log('🚀 Application starting...');

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

// Wrap in error boundary to catch React issues
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ Application rendered successfully');
} catch (error) {
  console.error('❌ Failed to render application:', error);
  // Fallback render without StrictMode
  root.render(<App />);
}
