import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const docs = path.join(root, 'docs');
const sourceDir = path.join(root, 'specs');
const sourceImages = path.join(root, 'imgstore', 'guide');
const outputImages = path.join(docs, 'images');
const outputAssets = path.join(docs, 'assets');
const images = [
  'breaks-locator.jpg', 'dmg-ports.png', 'mbc1-schematic.png', 'patterns-scale.png',
  'psx-metal.jpg', 'sega-damage.png', 'ula-schematic.png'
];

await mkdir(outputImages, { recursive: true });
await mkdir(outputAssets, { recursive: true });
await copyFile(path.join(root, 'site', 'style.css'), path.join(outputAssets, 'style.css'));
await copyFile(path.join(root, 'site', 'theme.js'), path.join(outputAssets, 'theme.js'));
for (const image of images) await copyFile(path.join(sourceImages, image), path.join(outputImages, image));

marked.setOptions({ gfm: true, breaks: false });

const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const localLinks = (markdown) => markdown
  .replaceAll('../imgstore/guide/README.md', 'illustrations.html')
  .replaceAll('../imgstore/guide/', 'images/')
  .replaceAll('(workflow.en.md)', '(workflow.en.html)')
  .replaceAll('(workflow.ru.md)', '(workflow.ru.html)')
  .replace(/!\[([^\]]*)\]\(images\/([^\s)]+)(?:\s+"([^"]*)")?\)/g, (_, alt, file, title) => {
    const image = `images/${file}`;
    return `[![${alt}](${image}${title ? ` "${title}"` : ''})](${image})`;
  });

const header = (lang, title, pageType = 'workflow') => {
  const other = lang === 'en' ? 'Русский' : 'English';
  const otherHref = pageType === 'workflow'
    ? (lang === 'en' ? 'workflow.ru.html' : 'workflow.en.html')
    : (lang === 'en' ? 'index.ru.html' : 'index.html');
  const guideHref = lang === 'en' ? 'workflow.en.html' : 'workflow.ru.html';
  const guideLabel = lang === 'en' ? 'Guide' : 'Руководство';
  const imagesLabel = lang === 'en' ? 'Images' : 'Иллюстрации';
  const homeHref = lang === 'en' ? 'index.html' : 'index.ru.html';
  return `<a class="skip-link" href="#main-content">${lang === 'en' ? 'Skip to content' : 'К содержанию'}</a>
<header class="site-header"><a class="brand" href="${homeHref}">Silicon → model</a><nav class="site-nav" aria-label="${lang === 'en' ? 'Site navigation' : 'Навигация'}"><a href="${guideHref}">${guideLabel}</a><a href="illustrations.html">${imagesLabel}</a><a href="${otherHref}">${other}</a><button class="theme-toggle" type="button" data-theme-toggle aria-label="${lang === 'en' ? 'Change colour theme' : 'Сменить тему'}">☾ Dark</button></nav></header>`;
};

const boot = `<script>try { const s=localStorage.getItem('theme'); const t=(s==='dark'||s==='light')?s:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'); document.documentElement.dataset.theme=t; if(t==='dark') document.documentElement.classList.add('dark'); } catch (_) {}</script>`;
const footer = lang => `<footer class="footer"><span>${lang === 'en' ? 'Independent guide · source-backed, reproducible work' : 'Независимое руководство · проверяемая работа по источникам'}</span><a href="illustrations.html">${lang === 'en' ? 'Image register' : 'Реестр изображений'}</a></footer>`;
const page = (lang, title, body, pageType = 'workflow', extraClass = '') => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)}</title>${boot}<link rel="stylesheet" href="assets/style.css"></head><body class="${extraClass}">${header(lang, title, pageType)}<main id="main-content">${body}</main><script defer src="assets/theme.js"></script></body></html>`;

const tiles = {
  en: [
    ['01', 'Dossier', 'Fix the specimen, revision, question, and first boundary.', 'dossier'],
    ['02', 'Dataset', 'Preserve layers, coordinates, provenance, and defects.', 'dataset'],
    ['03', 'Library', 'Understand cells and their confidence before scaling up.', 'cells'],
    ['04', 'Netlist', 'Trace ports and conductors back to the image.', 'netlist'],
    ['05', 'Model', 'Turn a structural hypothesis into an executable test.', 'model'],
    ['06', 'Validation', 'Compare expected and observed behavior honestly.', 'validation'],
    ['07', 'Publication', 'Leave a package another contributor can continue.', 'publication']
  ],
  ru: [
    ['01', 'Паспорт', 'Зафиксировать экземпляр, ревизию, вопрос и границу.', 'dossier'],
    ['02', 'Датасет', 'Сохранить слои, координаты, происхождение и дефекты.', 'dataset'],
    ['03', 'Библиотека', 'Понять ячейки и уверенность до массовой разметки.', 'cells'],
    ['04', 'Нетлист', 'Привязать порты и проводники обратно к изображению.', 'netlist'],
    ['05', 'Модель', 'Сделать структурную гипотезу исполняемым тестом.', 'model'],
    ['06', 'Проверка', 'Честно сравнить ожидаемое и фактическое поведение.', 'validation'],
    ['07', 'Публикация', 'Оставить комплект, который продолжит другой участник.', 'publication']
  ]
};

function landing(lang) {
  const en = lang === 'en';
  const cards = tiles[lang].map(([number, name, description, id]) => `<a class="tile" href="workflow.${lang}.html#${id}"><span class="tile-number">${number}</span><span><h3>${name}</h3><p>${description}</p></span></a>`).join('');
  return page(lang, en ? 'From silicon to a verifiable model' : 'От кристалла к проверяемой модели', `<div class="page"><section class="hero"><div><div class="eyebrow">${en ? 'Independent research guide · 2026' : 'Независимое руководство · 2026'}</div><h1>${en ? 'From silicon to a verifiable model' : 'От кристалла к проверяемой модели'}</h1><p class="hero-lead">${en ? 'A practical route from a chip image to a small, executable claim that another person can inspect, run, and challenge.' : 'Практический маршрут от снимка кристалла к небольшой исполняемой гипотезе, которую другой человек может изучить, запустить и проверить.'}</p><p><a href="workflow.${lang}.html">${en ? 'Read the complete guide →' : 'Читать руководство целиком →'}</a></p></div><figure class="hero-figure"><a href="images/psx-metal.jpg"><img src="images/psx-metal.jpg" alt="${en ? 'Reduced M2 layer master from a PlayStation CPU' : 'Уменьшенный мастер слоя M2 процессора PlayStation'}"></a><figcaption>${en ? 'Real silicon image · open full resolution' : 'Настоящее изображение кристалла · открыть полный размер'}</figcaption></figure></section><section aria-labelledby="route-title"><div class="eyebrow">${en ? 'The route' : 'Маршрут'}</div><h2 id="route-title">${en ? 'Seven deliverables, one checkable path' : 'Семь результатов, один проверяемый путь'}</h2><p class="section-intro">${en ? 'Choose a small block, preserve the evidence, and keep each confidence claim attached to the artifact that supports it.' : 'Выберите небольшой блок, сохраните свидетельства и привязывайте каждое утверждение об уверенности к подтверждающему артефакту.'}</p><div class="tiles">${cards}</div></section>${footer(lang)}</div>`, 'landing');
}

const sectionNames = {
  en: [['route', 'Route'], ['dossier', 'Dossier'], ['dataset', 'Dataset'], ['cells', 'Library'], ['netlist', 'Netlist'], ['model', 'Model'], ['validation', 'Validation'], ['publication', 'Publication'], ['checklist', 'Checklist'], ['evidence', 'Sources and history']],
  ru: [['route', 'Маршрут'], ['dossier', 'Паспорт'], ['dataset', 'Датасет'], ['cells', 'Библиотека'], ['netlist', 'Нетлист'], ['model', 'Модель'], ['validation', 'Проверка'], ['publication', 'Публикация'], ['checklist', 'Чек-лист'], ['evidence', 'Источники и история']]
};

async function workflow(lang) {
  const filename = `workflow.${lang}.md`;
  const raw = await readFile(path.join(sourceDir, filename), 'utf8');
  const html = marked.parse(localLinks(raw));
  const nav = `<nav class="section-nav" aria-label="${lang === 'en' ? 'Guide sections' : 'Разделы руководства'}">${sectionNames[lang].map(([id, name]) => `<a href="#${id}">${name}</a>`).join('')}</nav>`;
  return page(lang, lang === 'en' ? 'From silicon to a verifiable model' : 'От кристалла к проверяемой модели', `<div class="article-page"><div class="article-head"><div class="eyebrow">${lang === 'en' ? 'Independent guide' : 'Независимое руководство'}</div><p>${lang === 'en' ? 'Seven stages from source image to a reproducible conclusion.' : 'Семь этапов от исходного изображения к воспроизводимому выводу.'}</p>${nav}</div><article class="prose">${html}</article>${footer(lang)}</div>`);
}

async function illustrations() {
  const raw = await readFile(path.join(sourceImages, 'README.md'), 'utf8');
  const html = marked.parse(raw.replace(/\]\(([^)]+\.(?:jpg|png))\)/g, (_, target) => `](${target.startsWith('http') ? target : `images/${target}`})`));
  const gallery = `<section class="gallery" aria-label="Illustration previews">${images.map(image => `<figure><a href="images/${image}"><img src="images/${image}" alt="${escape(image)}" loading="lazy"></a><figcaption><code>${image}</code></figcaption></figure>`).join('')}</section>`;
  return page('en', 'Illustration register', `<div class="article-page illustrations-page"><div class="article-head"><div class="eyebrow">Source register</div><h1>Illustrations and provenance</h1><p>Seven local copies, linked to their pinned primary sources.</p></div><article class="prose">${gallery}${html}</article>${footer('en')}</div>`, 'illustrations');
}

await writeFile(path.join(docs, 'index.html'), landing('en'));
await writeFile(path.join(docs, 'index.ru.html'), landing('ru'));
await writeFile(path.join(docs, 'workflow.en.html'), await workflow('en'));
await writeFile(path.join(docs, 'workflow.ru.html'), await workflow('ru'));
await writeFile(path.join(docs, 'illustrations.html'), await illustrations());
console.log(`built ${images.length} images and 5 pages in ${path.relative(root, docs)}/`);
