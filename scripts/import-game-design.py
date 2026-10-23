"""Import the ten curated archive groups. Requires Pillow for authoring only."""
import concurrent.futures, hashlib, io, json, re, sys, time, urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
ROOT = Path(__file__).resolve().parents[1]
text = Path(sys.argv[1]).read_text(encoding='utf-8')
groups = re.split(r'\n(?=\d+\. [^\n]+\nSlug:)', text)[1:11]
out = ROOT / 'imgsrc/game-design'
out.mkdir(parents=True, exist_ok=True)
def download(task):
    slug, i, url = task
    folder = out / slug
    folder.mkdir(exist_ok=True)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'}), timeout=35) as response:
                mime = response.headers.get_content_type()
                if response.status != 200 or not mime.startswith('image/'):
                    raise ValueError(f'Invalid response: {response.status}, {mime}')
                raw = response.read()
            with Image.open(io.BytesIO(raw)) as check: check.verify()
            picture = ImageOps.exif_transpose(Image.open(io.BytesIO(raw))).convert('RGB')
            picture.load()
            stem = f'view-{i:02}'
            original = folder / (stem + Path(url).suffix)
            original.write_bytes(raw)
            variants = []
            for width in sorted(set(min(w,picture.width) for w in [480,960,1600])):
                resized = picture.resize((width,round(picture.height*width/picture.width)),Image.Resampling.LANCZOS)
                dest = folder / f'{stem}-{width}.webp'
                resized.save(dest,'WEBP',quality=85,method=6)
                variants.append({'src':'/'+dest.relative_to(ROOT).as_posix(),'width':width,'height':resized.height})
            return {'slug':slug,'id':stem,'originalSourceUrl':url,'original':'/'+original.relative_to(ROOT).as_posix(),'width':picture.width,'height':picture.height,'contentType':mime,'sha256':hashlib.sha256(raw).hexdigest(),'variants':variants}
        except Exception as error:
            if attempt == 2: return {'slug':slug,'originalSourceUrl':url,'error':str(error)}
            time.sleep(1)
tasks = []
for group in groups:
    slug = re.search(r'Slug: (.+)',group).group(1).strip()
    for i,url in enumerate(re.findall(r'https://bassfreerunning.weebly.com/uploads/\S+',group),1): tasks.append((slug,i,url))
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: records=list(pool.map(download,tasks))
(ROOT/'game-design/assets.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8')
preview=ROOT/'output/game-design-review'
preview.mkdir(parents=True,exist_ok=True)
for group in groups:
    slug=re.search(r'Slug: (.+)',group).group(1).strip()
    images=[r for r in records if r['slug']==slug and 'error' not in r]
    sheet=Image.new('RGB',(960,max(1,(len(images)+1)//2)*300),'#14212b')
    draw=ImageDraw.Draw(sheet)
    for i,r in enumerate(images):
        picture=Image.open(ROOT/r['original'].lstrip('/'))
        picture.thumbnail((470,265))
        x,y=(i%2)*480,(i//2)*300
        sheet.paste(picture,(x,y))
        draw.text((x+8,y+272),f"{r['id']}  {r['width']} x {r['height']}",fill='white')
    if images: sheet.save(preview/(slug+'.jpg'))
print(json.dumps({'imported':sum('error' not in r for r in records),'errors':[r for r in records if 'error' in r]},indent=2))
