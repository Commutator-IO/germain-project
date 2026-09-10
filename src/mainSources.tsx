import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { SourcesPage } from './SourcesPage.tsx';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <SourcesPage />
  </StrictMode>,
);
