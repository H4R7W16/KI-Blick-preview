import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'shepherd.js/dist/css/shepherd.css';
import './styles/shepherd-theme.css';
import './styles/index.css';

const { pathname, hash, origin, search } = window.location;
const reviewPathPattern = /\/review-attribute\/?$/;
if (!hash && reviewPathPattern.test(pathname)) {
  const appBasePath = pathname.replace(reviewPathPattern, '/');
  const normalizedBasePath = appBasePath.endsWith('/') ? appBasePath : `${appBasePath}/`;
  window.location.replace(`${origin}${normalizedBasePath}${search}#/review-attribute`);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
