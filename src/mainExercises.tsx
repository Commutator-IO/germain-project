import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { ExercisesPage } from './ExercisesPage.tsx';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ExercisesPage />
  </StrictMode>,
);
