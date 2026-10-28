import { useEffect, useState } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    try { const saved = localStorage.getItem('ziki-theme'); return saved === 'dark' || saved === 'system' ? saved : 'light'; } catch { return 'light'; }
  });
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const theme = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#080f20' : '#f4f7fc');
    try { localStorage.setItem('ziki-theme', mode); } catch { /* Theme still works without storage. */ }
  }, [mode, theme]);
  return { theme, mode, setMode, toggleTheme: () => setMode(theme === 'dark' ? 'light' : 'dark') };
}
