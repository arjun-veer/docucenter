
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ThemeProvider } from '@/components/theme-provider';
import { useSettings } from '@/lib/store';

// Create our DarkModeInitializer component
const DarkModeInitializer = () => {
  const { darkMode } = useSettings();
  
  useEffect(() => {
    // Apply the dark mode setting when the component mounts
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  return null;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="app-theme">
      <BrowserRouter>
        <DarkModeInitializer />
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
