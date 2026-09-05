import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

// Use the installed Marked parser; the published site has no runtime dependency.
const require = createRequire(import.meta.url);
const { Marked, Renderer } = await import(require.resolve('marked'));
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const check = process.argv.includes('--check');
const read = path => readFileSync(join(root, path), 'utf8');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const labels = {
  ru: {
    home: 'Главная', guide: 'Методика', sources: 'Источники', language: 'English',
    skip: 'К содержанию', theme: 'Тёмная тема', contents: 'На этой странице',
    eyebrow: 'ПОЛЕВОЕ РУКОВОДСТВО / EMU-RUSSIA',
    title: 'От кристалла<br>к схеме.',
    intro: 'Как планомерно исследовать новую микросхему: от первого снимка до модели, которую можно проверить.',
    start: 'Начать исследование', evidence: 'Изучить источники',
    stats: ['8 этапов', '9 проектов', '2 языка'],
    image: 'Кристалл PSXCPU, слой M2', imageCredit: 'PSXCPU / CXD8530CQ / M2',
    route: 'Маршрут исследования', routeNote: 'Начните с одного блока. Пройдите весь цикл. Повторите для следующего.',
    result: 'Результат', principle: 'Снимок → схема → модель → проверка',
    principleText: 'При расхождении возвращайтесь к первому недоказанному соединению или предположению. Каждый переход должен оставлять проверяемый результат.',
    atlas: 'Девять проектов. Общая практика.',
    atlasText: 'От нерегулярной NMOS-логики до стандартных ячеек и биполярной ULA. Что переносить в новый проект — и где заканчивается сходство.',
    footer: 'Самостоятельная методика по материалам emu-russia.',
    snapshot: 'Срез источников: 05.09.2026', markdown: 'Исходный Markdown', table: 'Таблица с горизонтальной прокруткой',
    stages: [
      ['Объект и вопрос', 'Маркировка, ревизия, граница и проверяемая цель.', 'Паспорт исследования'],
      ['Снимки', 'Исходные кадры, сшивка, совмещение и пропуски.', 'Проверенная мозаика'],
      ['Карта кристалла', 'Слои, пады, питание и границы блоков.', 'Карта и интерфейсы'],
      ['Элементы', 'Транзисторная схема или библиотека повторяющихся ячеек.', 'Ячейки и их порты'],
      ['Соединения', 'От контактов на снимке до редактируемого нетлиста.', 'Сцена и экспорт'],
      ['Модель', 'Исполняемая схема с явными допущениями.', 'HDL и testbench'],
      ['Проверка', 'Граничные сценарии, первая разница, возврат к схеме.', 'Повторяемый тест'],
      ['Передача', 'Исходники, версии и цепочка доказательств.', 'Комплект исследования'],
    ],
  },
  en: {
    home: 'Home', guide: 'Workflow', sources: 'Sources', language: 'Русский',
    skip: 'Skip to content', theme: 'Dark theme', contents: 'On this page',
    eyebrow: 'FIELD GUIDE / EMU-RUSSIA',
    title: 'From die<br>to schematic.',
    intro: 'A systematic route through a new integrated circuit: from the first image to a model you can check.',
    start: 'Start investigating', evidence: 'Explore the sources',
    stats: ['8 stages', '9 projects', '2 languages'],
    image: 'PSXCPU die, M2 layer', imageCredit: 'PSXCPU / CXD8530CQ / M2',
    route: 'The research route', routeNote: 'Start with one block. Complete the loop. Repeat for the next.',
    result: 'Result', principle: 'Image → schematic → model → check',
    principleText: 'When results diverge, return to the first unproven connection or assumption. Every transition should leave a checkable result.',
    atlas: 'Nine projects. Shared practice.',
    atlasText: 'From irregular NMOS logic to standard cells and a bipolar ULA. What carries over to a new project, and where the similarities end.',
    footer: 'An independent workflow based on emu-russia research.',
    snapshot: 'Source snapshot: 5 Sep 2026', markdown: 'Source Markdown', table: 'Horizontally scrollable table',
    stages: [
      ['Device and question', 'Markings, revision, scope, and a checkable goal.', 'Project record'],
      ['Images', 'Raw frames, stitching, alignment, and missing coverage.', 'Checked mosaic'],
      ['Die map', 'Layers, pads, power, and block boundaries.', 'Map and interfaces'],
      ['Elements', 'Transistor circuits or a library of repeating cells.', 'Cells and ports'],
      ['Connections', 'From image contacts to an editable netlist.', 'Scene and export'],
      ['Model', 'An executable circuit with explicit assumptions.', 'HDL and testbench'],
      ['Verification', 'Boundary cases, the first divergence, and the circuit.', 'Repeatable check'],
      ['Handover', 'Sources, versions, and a traceable chain of evidence.', 'Research package'],
    ],
  },
};

function emit(path, content) {
  if (check) {
    if (!readFileSync(join(root, path)).equals(Buffer.from(content))) {
      throw new Error(`Stale generated file: ${path}. Run npm run build.`);
    }
  } else {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
}

function page(lang, kind, title, main) {
  const t = labels[lang];
  const other = lang === 'ru' ? 'en' : 'ru';
  const index = lang === 'ru' ? 'index.html' : 'index.en.html';
  const languageTarget = kind === 'index'
    ? (other === 'ru' ? 'index.html' : 'index.en.html') : `${kind}.${other}.html`;
  return `<!doctype html>
<!-- Generated by tools/build-site.mjs. Edit specs/*.md or the generator. -->
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="description" content="${escape(t.intro)}">
<title>${escape(title)} · Chips HOWTO</title>
<script src="assets/theme.js"></script>
<link rel="stylesheet" href="assets/style.css">
</head>
<body>
<a class="skip" href="#main">${t.skip}</a>
<header class="site-header"><a class="brand" href="${index}" aria-label="Chips HOWTO — ${t.home}"><span class="chip-mark" aria-hidden="true">▦</span> CHIPS<span class="brand-sub"> / HOWTO</span></a>
<nav aria-label="${t.guide}"><a href="workflow.${lang}.html"${kind === 'workflow' ? ' aria-current="page"' : ''}>${t.guide}</a><a href="sources.${lang}.html"${kind === 'sources' ? ' aria-current="page"' : ''}>${t.sources}</a></nav>
<div class="header-actions"><a class="language" href="${languageTarget}" lang="${other}" hreflang="${other}">${t.language}</a><button id="theme-toggle" type="button" aria-pressed="false" hidden><span aria-hidden="true">◐</span> ${t.theme}</button></div></header>
${main}
<footer class="site-footer"><span>${t.footer}<br><span class="muted">${t.snapshot} · CC0-1.0</span></span><a href="sources.${lang}.html#images">${t.sources} ↗</a></footer>
</body>
</html>
`;
}

for (const lang of ['ru', 'en']) {
  const t = labels[lang];
  const renderer = new Renderer();
  const table = renderer.table;
  renderer.table = function (token) {
    return `<div class="table-scroll" role="region" aria-label="${t.table}" tabindex="0">${table.call(this, token)}</div>`;
  };
  const parser = new Marked({ renderer, walkTokens(token) {
    if (token.type === 'image' || token.type === 'link') {
      token.href = token.href.replace(/^\.\.\/imgstore\//, 'imgstore/');
      token.href = token.href.replace(/^(workflow|sources)\.(ru|en)\.md(?=#|$)/, '$1.$2.html');
    }
  } });

  for (const kind of ['workflow', 'sources']) {
    const markdown = read(`specs/${kind}.${lang}.md`);
    const title = markdown.match(/^# (.+)/)[1];
    const anchors = [...markdown.matchAll(/<a id="([^"]+)"><\/a>\s+## (.+)/g)];
    const toc = anchors.map(([, id, text]) => `<a href="#${id}">${escape(text)}</a>`).join('\n');
    const main = `<main id="main" class="reader-layout"><aside class="contents"><p class="eyebrow">${t.contents}</p><nav aria-label="${t.contents}">${toc}</nav><a class="download" href="downloads/${kind}.${lang}.md" download>${t.markdown} ↓</a></aside><article class="prose">${parser.parse(markdown)}</article></main>`;
    emit(`docs/${kind}.${lang}.html`, page(lang, kind, title, main));
    // Markdown downloads remain identical to specs; their relative links use the
    // local imgstore sibling and the other downloads when viewed on GitHub.
    emit(`docs/downloads/${kind}.${lang}.md`, markdown);
  }

  const tiles = t.stages.map(([title, text, result], i) => {
    const number = String(i + 1).padStart(2, '0');
    return `<a class="stage-card" href="workflow.${lang}.html#stage-${number}"><span class="stage-number">${number}</span><span class="stage-arrow" aria-hidden="true">↗</span><h3>${title}</h3><p>${text}</p><div class="stage-result"><span>${t.result}</span>${result}</div></a>`;
  }).join('\n');
  const main = `<main id="main" class="landing">
<section class="hero"><div class="hero-copy"><p class="eyebrow">${t.eyebrow}</p><h1>${t.title}</h1><p class="hero-intro">${t.intro}</p><a class="primary" href="workflow.${lang}.html#overview">${t.start} <span aria-hidden="true">↗</span></a><div class="stats">${t.stats.map(s => `<span>${s}</span>`).join('')}</div></div><figure class="hero-image"><img src="imgstore/workflow/psxcpu-metal.jpg" alt="${t.image}" width="800" height="802"><figcaption><span>${t.imageCredit}</span><a href="sources.${lang}.html#images">${t.sources} ↗</a></figcaption></figure></section>
<section class="route" aria-labelledby="route-title"><div class="section-heading"><h2 id="route-title">${t.route}</h2><p>${t.routeNote}</p></div><div class="stage-grid">${tiles}</div></section>
<section class="method-note"><span class="loop-mark" aria-hidden="true">↺</span><div><h2>${t.principle}</h2><p>${t.principleText}</p></div></section>
<section class="atlas"><p class="eyebrow">BREAKS / SEGA / DMG / DEROUTE / MAPPERS / VI53 / ULA / PSX / PATTERNS</p><h2>${t.atlas}</h2><p>${t.atlasText}</p><a class="text-link" href="sources.${lang}.html">${t.evidence} ↗</a></section>
</main>`;
  emit(`docs/${lang === 'ru' ? 'index.html' : 'index.en.html'}`, page(lang, 'index', lang === 'ru' ? 'От кристалла к схеме' : 'From die to schematic', main));
}

const images = JSON.parse(read('imgstore/workflow/provenance.json'));
for (const { file } of images) {
  emit(`docs/imgstore/workflow/${file}`, readFileSync(join(root, 'imgstore/workflow', file)));
}
emit('docs/imgstore/workflow/provenance.json', read('imgstore/workflow/provenance.json'));
emit('docs/.nojekyll', '');
console.log(check ? 'Generated HTML, Markdown downloads, and images are current.' : 'Built six HTML pages, four Markdown downloads, and local images.');
