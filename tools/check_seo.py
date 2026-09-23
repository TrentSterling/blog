"""Check generated sitemap URLs against the actual HTML emitted by Jekyll."""
from html.parser import HTMLParser
from pathlib import Path
import sys
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET


class Metadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonicals = []
        self.robots = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == 'link' and 'canonical' in values.get('rel', '').lower().split():
            self.canonicals.append(values.get('href'))
        if tag == 'meta' and values.get('name', '').lower() in ('robots', 'googlebot'):
            self.robots.extend(values.get('content', '').lower().replace(',', ' ').split())


def main():
    root = Path(sys.argv[1] if len(sys.argv) > 1 else '_site')
    urls = [node.text for node in ET.parse(root / 'sitemap.xml').findall('{*}url/{*}loc')]
    errors = []
    if len(urls) != len(set(urls)):
        errors.append('Duplicate sitemap URLs')
    for url in urls:
        parsed = urlsplit(url)
        if parsed.scheme != 'https' or parsed.netloc != 'tront.xyz' or not parsed.path.startswith('/blog/'):
            errors.append(f'Unexpected sitemap origin/path: {url}')
            continue
        relative = unquote(parsed.path[len('/blog/'):])
        file = root / relative
        if parsed.path.endswith('/'):
            file /= 'index.html'
        if not file.is_file():
            errors.append(f'Sitemap target has no generated HTML: {url}')
            continue
        metadata = Metadata()
        metadata.feed(file.read_text(encoding='utf-8'))
        if metadata.canonicals != [url]:
            errors.append(f'Canonical mismatch for {url}: {metadata.canonicals}')
        if 'noindex' in metadata.robots or 'none' in metadata.robots:
            errors.append(f'Noindex page in sitemap: {url}')
    for suffix in ('snapscan/', 'snapscan-local-ai-pipeline/'):
        if 'https://tront.xyz/blog/posts/' + suffix not in urls:
            errors.append(f'Missing SnapScan article: {suffix}')
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'SEO checks passed: {len(urls)} unique URLs, generated HTML, matching canonicals, no noindex targets')


if __name__ == '__main__':
    main()
