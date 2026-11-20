import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import './styles/global.css';
import { App } from './App';
import { applyBrandTheme } from './config/brand';
import { StoreProvider } from './state/store';

applyBrandTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);
