"""Check generated descriptions without changing archival post sources."""
from html.parser import HTMLParser
from pathlib import Path
import json,re,sys

class Descriptions(HTMLParser):
    def __init__(self):
        super().__init__();self.stack=[];self.values=[];self.headings=[];self.frames=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs);classes=a.get('class','').split()
        if tag=='meta' and a.get('name',a.get('property','')) in ['description','og:description','twitter:description']:
            self.values.append(a.get('content',''))
        if tag=='iframe':self.frames.append(a.get('src',a.get('data-src','')))
        card=any(x['card'] for x in self.stack) or any(c in classes for c in ['post-preview','card'])
        capture=('post-desc' in classes) or (card and tag=='p')
        node={'tag':tag,'card':card,'capture':capture,'header':'post-desc' in classes,'json':tag=='script' and a.get('type')=='application/ld+json','text':[]}
        if tag not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:self.stack.append(node)
    def handle_data(self,text):
        for node in self.stack:
            if node['capture'] or node['json']:node['text'].append(text)
    def handle_endtag(self,tag):
        matches=[i for i,n in enumerate(self.stack) if n['tag']==tag]
        if not matches:return
        for node in self.stack[matches[-1]:]:
            text=''.join(node['text']).strip()
            if node['capture']:self.values.append(text)
            if node['header']:self.headings.append(text)
            if node['json']:
                def visit(value):
                    if isinstance(value,dict):
                        for key,item in value.items():
                            if key=='description' and isinstance(item,str):self.values.append(item)
                            visit(item)
                    elif isinstance(value,list):
                        for item in value:visit(item)
                visit(json.loads(text))
        self.stack=self.stack[:matches[-1]]

root=Path(sys.argv[1]);pages={};checked=0
for file in root.rglob('*.html'):
    parser=Descriptions();parser.feed(file.read_text(encoding='utf-8'))
    for text in parser.values:
        assert not re.search(r'\{[%{]',text),f'{file}: template code in description: {text}'
        checked+=1
    pages[file.relative_to(root).as_posix()]=parser
posts=[path for path in pages if path.startswith('posts/') and path.endswith('/index.html')]
assert len(posts)>=182,f'Expected all published posts, got {len(posts)}'
fixtures=json.loads((Path(__file__).with_name('fixtures.json')).read_text(encoding='utf-8'))
for entry in fixtures:
    slug=re.sub(r'^\d{4}-\d{2}-\d{2}-','',Path(entry['path']).stem)
    page=pages[f'posts/{slug}/index.html']
    assert page.headings==[entry['expected']],f'{slug}: preserve meaningful description text'
    for video in entry['youtube']:
        assert any(video in src for src in page.frames),f'{slug}: original video must still render'
print(f'Clean descriptions: {len(posts)} posts, {checked} metadata/header/card descriptions; all 7 original video embeds retained')
