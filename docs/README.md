# Chips HOWTO website

Готовый статический сайт: [Русский](index.html) · [English](index.en.html).
Open either landing page directly, or serve this directory with any static server.
The published site needs no JavaScript framework, CDN, API, or build service.
Reading and navigation work without JavaScript; JavaScript adds a persistent theme
switch and keeps the current section when changing language.

## Edit and rebuild

Canonical content lives in `../specs/workflow.{ru,en}.md` and
`../specs/sources.{ru,en}.md`. Edit both translations, then rebuild the checked-in
HTML. Landing-page copy and layout are in `../tools/build-site.mjs`; shared styles
and theme behaviour are in `assets/`.

Requires Node.js 20 or later, npm, and Python 3.9 or later for the link check:

```sh
npm ci
npm run build
npm run check
```

Run these commands from the repository root. Marked is a build-time dependency;
visitors do not download it. The build also copies the seven source illustrations
and their provenance manifest from `../imgstore/workflow/` into this directory,
and provides identical Markdown downloads. Do not edit generated files separately.

## Preview the actual Pages boundary

From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory docs
```

Open `http://127.0.0.1:8000/`. The link checker rejects dependencies outside
`docs/` and root-relative paths, so the same files also work below the
`/chips-howto/` project prefix.

## GitHub Pages

In the fork's **Settings → Pages → Build and deployment**, select **Deploy from a
branch**, select the branch containing these files, and choose **/docs**.
For this contribution the branch is `issue-8-workflow-astra-only`.
Save the settings; use the deployment URL GitHub reports when it completes.
`.nojekyll` keeps these generated pages as plain static files.
See the [official GitHub Pages publishing instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

Repository settings determine which branch is live. If the branch is merged,
choose the destination branch instead. Verify the latest deployment's commit
before treating the published site as a preview of your changes.

## Проверка перед обновлением / release check

- `npm run check`: generated files match Markdown, local links and fragments stay
  inside the published tree, translation anchors and citations match, copied
  image hashes agree with the provenance manifest.
- Open both languages on desktop and a narrow viewport. Follow a stage tile,
  switch languages in the middle of the guide, change theme, and reload.
- Check that tables scroll without widening the whole page, images load, keyboard
  focus is visible, and the browser console has no errors. Check navigation with
  JavaScript disabled as well.

These are checks of the guide and website. They do not execute the external
hardware models described in the source material.
