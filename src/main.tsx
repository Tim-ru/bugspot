import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './lib/mockApi';
import seedMockReports from './lib/seedMockReports';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Seed demo reports locally when mock mode is enabled
seedMockReports();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
