import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { FindingsPage } from './FindingsPage.tsx';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <FindingsPage />
  </StrictMode>,
);
