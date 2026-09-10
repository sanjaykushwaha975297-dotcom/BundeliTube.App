import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './lib/safeStorage.ts';
import './index.css';

// Safeguard against unhandled async rejections (such as aborted network fetches or media play interruptions)
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  // Non-fatal unhandled rejections should not crash or alert
  if (
    reason?.name === 'AbortError' || 
    reason?.name === 'NotAllowedError' ||
    reason?.message?.includes('play()') ||
    reason?.message?.includes('network') ||
    reason?.message?.includes('CORS') ||
    reason?.message?.includes('cancelled')
  ) {
    event.preventDefault();
  }
  console.warn('Captured unhandled promise rejection:', reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Register PWA Service Worker for PWABuilder & Play Store offline capability
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('PWA ServiceWorker registration note:', err);
    });
  });
}

