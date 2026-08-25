import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import Home from './page';
import Manage from './manage/page';
import './globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <BrowserRouter>
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/manage" element={<Manage />} />
          </Routes>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-8 text-center text-gray-600 dark:text-gray-400">
          Create By{' '}
          <a
            href="https://catcat.blog/"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            猫猫博客
          </a>
        </div>
      </BrowserRouter>
    </QueryProvider>
  </StrictMode>
);
