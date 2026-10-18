"""Check generated sitemap, canonical metadata, and visible post breadcrumbs."""
from html.parser import HTMLParser
from pathlib import Path
import json
import sys
from urllib.parse import unquote, urljoin, urlsplit
import xml.etree.ElementTree as ET


class Metadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonicals = []
        self.robots = []
        self.json_ld = []
        self.breadcrumbs = []
        self.redirect = False
        self._script = None
        self._in_breadcrumb = False
        self._crumb = None

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == 'link' and 'canonical' in values.get('rel', '').lower().split():
            self.canonicals.append(values.get('href'))
        if tag == 'meta' and values.get('name', '').lower() in ('robots', 'googlebot'):
            self.robots.extend(values.get('content', '').lower().replace(',', ' ').split())
        if tag == 'meta' and values.get('http-equiv', '').lower() == 'refresh':
            self.redirect = True
        if tag == 'script' and values.get('type', '').lower() == 'application/ld+json':
            self._script = []
        if tag == 'nav' and values.get('id') == 'breadcrumb':
            self._in_breadcrumb = True
        if self._in_breadcrumb and tag == 'span':
            self._crumb = {'text': [], 'href': None}
        if self._crumb is not None and tag == 'a':
            self._crumb['href'] = values.get('href')

    def handle_data(self, data):
        if self._script is not None:
            self._script.append(data)
        if self._crumb is not None:
            self._crumb['text'].append(data)

    def handle_endtag(self, tag):
        if tag == 'script' and self._script is not None:
            self.json_ld.append(''.join(self._script))
            self._script = None
        if tag == 'span' and self._crumb is not None:
            self.breadcrumbs.append({
                'name': ' '.join(''.join(self._crumb['text']).split()),
                'item': self._crumb['href'],
            })
            self._crumb = None
        if tag == 'nav':
            self._in_breadcrumb = False


def schema_nodes(value):
    """Find typed nodes in ordinary JSON-LD objects, lists, and @graph blocks."""
    if isinstance(value, dict):
        if '@type' in value:
            yield value
        for child in value.values():
            yield from schema_nodes(child)
    elif isinstance(value, list):
        for child in value:
            yield from schema_nodes(child)


def has_type(node, kind):
    types = node.get('@type', [])
    return kind in (types if isinstance(types, list) else [types])


def check_breadcrumbs(metadata, url, expect_breadcrumb):
    errors = []
    nodes = []
    for script in metadata.json_ld:
        try:
            nodes.extend(schema_nodes(json.loads(script)))
        except json.JSONDecodeError as exc:
            errors.append(f'Invalid JSON-LD for {url}: {exc}')
    trails = [node for node in nodes if has_type(node, 'BreadcrumbList')]
    expected_count = 1 if expect_breadcrumb else 0
    if len(trails) != expected_count:
        errors.append(f'Expected {expected_count} BreadcrumbList for {url}, got {len(trails)}')
    if not expect_breadcrumb:
        return errors
    articles = [node for node in nodes if any(has_type(node, kind)
                for kind in ('Article', 'BlogPosting', 'NewsArticle'))]
    if len(articles) != 1:
        errors.append(f'Expected one existing Article node for {url}, got {len(articles)}')
    for trail in trails:
        if trail.get('@context') != 'https://schema.org':
            errors.append(f'Unexpected breadcrumb context for {url}')
        items = trail.get('itemListElement')
        if not isinstance(items, list) or len(items) != 2:
            errors.append(f'Expected Home and post breadcrumb items for {url}')
            continue
        if len(metadata.breadcrumbs) != 2:
            errors.append(f'Expected two visible breadcrumb items for {url}')
            continue
        for position, (item, visible) in enumerate(zip(items, metadata.breadcrumbs), 1):
            if not isinstance(item, dict):
                errors.append(f'Invalid breadcrumb item for {url}')
                continue
            if not has_type(item, 'ListItem') or type(item.get('position')) is not int or item['position'] != position:
                errors.append(f'Invalid breadcrumb type/position for {url}: {item}')
            name = item.get('name')
            if not isinstance(name, str) or not name.strip() or ' '.join(name.split()) != visible['name']:
                errors.append(f'Breadcrumb name differs from visible trail for {url}: {name!r}')
            target = item.get('item')
            expected = urljoin(url, visible['item']) if visible['item'] else url
            if target != expected:
                errors.append(f'Breadcrumb URL differs from visible trail/canonical for {url}: {target!r}')
            parsed = urlsplit(target) if isinstance(target, str) else None
            if not parsed or parsed.scheme != 'https' or parsed.netloc != 'tront.xyz' or not parsed.path.startswith('/blog/') or parsed.query or parsed.fragment:
                errors.append(f'Breadcrumb URL is not absolute canonical blog URL for {url}: {target!r}')
    return errors


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
    # Inspect every generated HTML file, including redirects, 404, archives,
    # taxonomy, and pagination, so accidental duplicate or out-of-scope markup fails.
    post_count = 0
    for file in root.rglob('*.html'):
        metadata = Metadata()
        metadata.feed(file.read_text(encoding='utf-8'))
        relative = file.relative_to(root).as_posix()
        canonical = metadata.canonicals[0] if len(metadata.canonicals) == 1 else ''
        expect_breadcrumb = (relative.startswith('posts/') and canonical in urls
                             and not metadata.redirect
                             and not {'noindex', 'none'}.intersection(metadata.robots))
        errors.extend(check_breadcrumbs(metadata, canonical or relative, expect_breadcrumb))
        post_count += expect_breadcrumb
    if not post_count:
        errors.append('No canonical post pages checked for breadcrumbs')
    for suffix in ('snapscan/', 'snapscan-local-ai-pipeline/'):
        if 'https://tront.xyz/blog/posts/' + suffix not in urls:
            errors.append(f'Missing SnapScan article: {suffix}')
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'SEO checks passed: {len(urls)} unique URLs, generated HTML, matching canonicals, no noindex targets; {post_count} post breadcrumbs match visible trails and preserve Article metadata')


if __name__ == '__main__':
    main()
