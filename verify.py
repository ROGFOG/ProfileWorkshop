"""Check local document targets and vector assets without network or dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import sys
import xml.etree.ElementTree as ET

SOURCE = Path(__file__).resolve().parent
ROOT = (SOURCE / sys.argv[1]).resolve() if len(sys.argv) > 1 else SOURCE
if not ROOT.is_dir() or not ROOT.is_relative_to(SOURCE):
    raise SystemExit('Choose an existing directory inside the project.')


class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []
        self.ids = set()
        self.remote_assets = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        for name in ('href', 'src'):
            if attrs.get(name):
                self.references.append(attrs[name])
                if tag in ('script', 'img', 'link', 'iframe') and urlsplit(attrs[name]).scheme:
                    self.remote_assets.append(attrs[name])


def verify():
    documents = {}
    errors = []
    checked = 0
    for path in ROOT.rglob('*.html'):
        if ROOT == SOURCE and 'dist' in path.relative_to(ROOT).parts:
            continue
        doc = Document()
        doc.feed(path.read_text(encoding='utf-8'))
        documents[path.resolve()] = doc
    for path, doc in documents.items():
        if doc.remote_assets:
            errors.append(f'{path.relative_to(ROOT)}: remote assets: {doc.remote_assets}')
        for reference in doc.references:
            url = urlsplit(reference)
            if url.scheme or url.netloc:
                continue
            target = (path.parent / unquote(url.path)).resolve() if url.path else path
            if target.is_dir():
                target = target / 'index.html'
            if not target.is_relative_to(ROOT) or not target.is_file():
                errors.append(f'{path.relative_to(ROOT)}: missing local target {reference}')
                continue
            if url.fragment and target in documents and url.fragment not in documents[target].ids:
                errors.append(f'{path.relative_to(ROOT)}: missing anchor {reference}')
            checked += 1
    vectors = [path for path in ROOT.rglob('*.svg')
               if not (ROOT == SOURCE and 'dist' in path.relative_to(ROOT).parts)]
    for path in vectors:
        try:
            svg = ET.fromstring(path.read_text(encoding='utf-8'))
            ns = {'s': 'http://www.w3.org/2000/svg'}
            if svg.find('s:title', ns) is None or svg.find('s:desc', ns) is None:
                errors.append(f'{path.relative_to(ROOT)}: missing SVG accessibility text')
        except ET.ParseError as error:
            errors.append(f'{path.relative_to(ROOT)}: invalid SVG: {error}')
    report = {'html_documents': len(documents), 'checked_local_references': checked,
              'svg_assets': len(vectors), 'errors': errors,
              'scope': 'Local targets and SVG structure. Does not test remote links or browser behavior.'}
    print(json.dumps(report, indent=2))
    return bool(errors)


if __name__ == '__main__':
    raise SystemExit(verify())
