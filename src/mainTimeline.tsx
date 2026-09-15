import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { TimelinePage } from './TimelinePage.tsx';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <TimelinePage />
  </StrictMode>,
);
