(() => {
  const root = document.documentElement;
  const button = document.querySelector('[data-theme-toggle]');
  let storage = null;
  try { storage = window.localStorage; } catch (_) {}
  const preferred = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const saved = (() => { try { return storage && storage.getItem('theme'); } catch (_) { return null; } })();
  const setTheme = (theme, persist) => {
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;
    if (button) button.textContent = theme === 'dark' ? '☼ Light' : '☾ Dark';
    if (persist && storage) { try { storage.setItem('theme', theme); } catch (_) {} }
  };
  setTheme(saved === 'dark' || saved === 'light' ? saved : preferred(), false);
  if (button) button.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));
})();
