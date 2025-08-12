// Minimal hash-based router utilities to keep bundle light
import { useEffect, useState } from 'react';

export function useHashPath(): string {
  const getPath = () => {
    const raw = window.location.hash.replace(/^#/, '');
    return raw || '/';
  };

  const [path, setPath] = useState<string>(getPath);

  useEffect(() => {
    const onHashChange = () => setPath(getPath());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return path;
}

export function navigate(to: string): void {
  const normalized = to.startsWith('/') ? to : `/${to}`;
  if (window.location.hash === `#${normalized}`) return;
  window.location.hash = normalized;
}

export function useRouteMatch(pattern: string): boolean {
  const path = useHashPath();
  if (pattern === '/') return path === '/';
  return path.startsWith(pattern);
}

export function currentPath(): string {
  const raw = window.location.hash.replace(/^#/, '');
  return raw || '/';
}


