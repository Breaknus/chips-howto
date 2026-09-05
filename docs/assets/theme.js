(() => {
  let saved;
  try { saved = localStorage.getItem('chips-howto-theme'); } catch {}
  const dark = saved === 'dark' || (saved !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('theme-toggle');
    const reflect = () => button.setAttribute('aria-pressed', String(document.documentElement.classList.contains('dark')));
    button.hidden = false;
    reflect();
    button.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      reflect();
      try { localStorage.setItem('chips-howto-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light'); } catch {}
    });
    const language = document.querySelector('.language');
    const syncSection = () => { language.hash = location.hash; };
    syncSection();
    addEventListener('hashchange', syncSection);
  });
})();
