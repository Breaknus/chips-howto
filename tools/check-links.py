"""Check the published /docs tree, translations, and copied image provenance."""

from hashlib import sha256
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.ids = set()
        self.links = []
        self.images = []
        self.language = None
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            assert attrs["id"] not in self.ids, f"Duplicate anchor: {attrs['id']}"
            self.ids.add(attrs["id"])
        if tag == "html":
            self.language = attrs.get("lang")
        if tag == "img":
            assert attrs.get("alt"), "Image without alternative text"
            self.images.append(attrs["src"])
        for key in ("href", "src"):
            if key in attrs:
                self.links.append(attrs[key])


def check():
    pages = {path.resolve(): Page(path) for path in DOCS.glob("*.html")}
    assert len(pages) == 6, "Expected two landing pages and four reading pages"
    for path, page in pages.items():
        assert page.language in ("ru", "en"), path
        assert "main" in page.ids and "theme-toggle" in page.ids, path
        for link in page.links:
            url = urlsplit(link)
            if url.scheme or url.netloc:
                assert url.scheme == "https", f"Unexpected remote URL: {link}"
                continue
            assert not url.path.startswith("/"), f"Root-relative URL breaks project Pages: {link}"
            target = (path.parent / unquote(url.path)).resolve() if url.path else path
            assert target.is_relative_to(DOCS), f"Escapes published /docs: {path}: {link}"
            assert target.is_file(), f"Missing target: {path}: {link}"
            if url.fragment and target in pages:
                assert unquote(url.fragment) in pages[target].ids, f"Missing anchor: {path}: {link}"
        assert not re.search(r"\]\[[A-Z][0-9]+\]", path.read_text()), f"Unresolved reference: {path}"

    for kind in ("workflow", "sources"):
        ru = pages[(DOCS / f"{kind}.ru.html").resolve()]
        en = pages[(DOCS / f"{kind}.en.html").resolve()]
        assert ru.ids == en.ids, f"Translated anchors differ: {kind}"
        assert ru.images == en.images, f"Translated images differ: {kind}"
        assert {s for s in ru.links if s.startswith("https:")} == {
            s for s in en.links if s.startswith("https:")
        }, f"Translated evidence differs: {kind}"

    stage_ids = {f"stage-{i:02}" for i in range(1, 9)}
    assert stage_ids <= pages[(DOCS / "workflow.ru.html").resolve()].ids
    for index in ("index.html", "index.en.html"):
        fragments = {urlsplit(link).fragment for link in pages[(DOCS / index).resolve()].links}
        assert stage_ids <= fragments, f"Landing page misses a stage: {index}"

    manifest = json.loads((ROOT / "imgstore/workflow/provenance.json").read_text())
    assert len(manifest) == 7
    for item in manifest:
        for base in (ROOT, DOCS):
            data = (base / "imgstore/workflow" / item["file"]).read_bytes()
            assert len(data) == item["bytes"] and sha256(data).hexdigest() == item["sha256"], item["file"]

    snapshots = json.loads((ROOT / "specs/source-snapshots.json").read_text())["repositories"]
    assert len(snapshots) == 9
    for name, snapshot in snapshots.items():
        assert re.fullmatch(r"[0-9a-f]{40}", snapshot["commit"]), name
        assert f"source-{name.lower()}" in pages[(DOCS / "sources.ru.html").resolve()].ids, name
    print(f"PASS: {len(pages)} HTML pages, links and anchors, bilingual evidence, 8 stages, 9 sources, 7 image hashes.")


if __name__ == "__main__":
    check()
