import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const docs = path.join(root, 'docs');
const pages = ['index.html', 'index.ru.html', 'workflow.en.html', 'workflow.ru.html', 'illustrations.html'];
const images = ['breaks-locator.jpg', 'dmg-ports.png', 'mbc1-schematic.png', 'patterns-scale.png', 'psx-metal.jpg', 'sega-damage.png', 'ula-schematic.png'];
const anchors = ['route', 'dossier', 'dataset', 'cells', 'netlist', 'model', 'validation', 'publication', 'checklist', 'evidence'];

const contents = new Map(await Promise.all(pages.map(async file => [file, await readFile(path.join(docs, file), 'utf8')])));
for (const file of pages) assert.ok((await stat(path.join(docs, file))).isFile(), `${file} missing`);
for (const image of images) {
  const original = await readFile(path.join(root, 'imgstore', 'guide', image));
  const copy = await readFile(path.join(docs, 'images', image));
  assert.equal(createHash('sha256').update(copy).digest('hex'), createHash('sha256').update(original).digest('hex'), `${image} changed while copied`);
}
for (const file of ['workflow.en.html', 'workflow.ru.html']) for (const id of anchors) assert.match(contents.get(file), new RegExp(`(?:id|href)="${id}(?:"|#)`), `${file} lacks ${id}`);
for (const lang of ['en', 'ru']) assert.equal((contents.get(`index${lang === 'ru' ? '.ru' : ''}.html`).match(new RegExp(`workflow\\.${lang}\\.html#(?:dossier|dataset|cells|netlist|model|validation|publication)`, 'g')) || []).length, 7, `${lang} landing tile count`);
for (const [file, html] of contents) {
  assert.doesNotMatch(html, /\[[^\]]+\]\[[^\]]+\]/, `${file} contains unresolved Markdown reference syntax`);
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  for (const [, raw] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    if (/^(?:[a-z]+:|\/\/|data:|mailto:)/i.test(raw)) continue;
    const [target, fragment] = raw.split('#');
    const targetFile = path.resolve(docs, target || file);
    assert.ok(targetFile.startsWith(`${docs}${path.sep}`) || targetFile === docs, `${file} escapes docs: ${raw}`);
    assert.ok((await stat(targetFile)).isFile(), `${file} points to missing ${raw}`);
    if (fragment) assert.ok(target === '' ? ids.has(fragment) : new Set([...((contents.get(path.relative(docs, targetFile)) || '').matchAll(/\bid="([^"]+)"/g))].map(m => m[1])).has(fragment), `${file} points to missing fragment ${raw}`);
  }
}
assert.deepEqual(await readFile(path.join(root, 'docs', 'assets', 'style.css')), await readFile(path.join(root, 'site', 'style.css')), 'published CSS differs from source');
const theme = await readFile(path.join(root, 'site', 'theme.js'), 'utf8');
assert.equal(await readFile(path.join(root, 'docs', 'assets', 'theme.js'), 'utf8'), theme, 'published theme differs from source');

const runTheme = ({ saved = null, systemDark = false, storageWorks = true }) => {
  const classes = new Set();
  const rootElement = { dataset: {}, classList: { toggle(name, on) { on ? classes.add(name) : classes.delete(name); } } };
  let click;
  const stored = { value: saved };
  const storage = {
    getItem() { if (!storageWorks) throw new Error('storage unavailable'); return stored.value; },
    setItem(_, value) { if (!storageWorks) throw new Error('storage unavailable'); stored.value = value; }
  };
  const button = { textContent: '', addEventListener(_, listener) { click = listener; } };
  vm.runInNewContext(theme, { document: { documentElement: rootElement, querySelector: () => button }, window: { localStorage: storage, matchMedia: () => ({ matches: systemDark }) } });
  return { rootElement, button, click, stored, classes };
};

let state = runTheme({ systemDark: true });
assert.equal(state.rootElement.dataset.theme, 'dark', 'system preference is ignored');
assert.ok(state.classes.has('dark'), 'dark class is missing');
state = runTheme({ saved: 'light', systemDark: true });
assert.equal(state.rootElement.dataset.theme, 'light', 'saved preference is ignored');
assert.ok(!state.classes.has('dark'), 'saved light preference leaves dark class');
state.click();
assert.equal(state.rootElement.dataset.theme, 'dark', 'theme button does not toggle');
assert.ok(state.classes.has('dark'), 'theme button does not update dark class');
assert.equal(state.stored.value, 'dark', 'theme toggle is not persisted');
state = runTheme({ storageWorks: false });
state.click();
assert.equal(state.rootElement.dataset.theme, 'dark', 'theme toggle fails when storage is unavailable');
assert.ok(state.classes.has('dark'), 'theme toggle with unavailable storage misses dark class');
console.log(`checked ${pages.length} pages, ${images.length} byte-equal images, ${anchors.length} anchors per guide, local links, references, shipped assets, and theme behavior`);
