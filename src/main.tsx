import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './styles/index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);