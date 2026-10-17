#!/usr/bin/env python3
"""Regenerate committed web display assets. Requires cwebp; originals stay intact.
Run after changing an icon/screenshot, then npm run build:site. Node build/check
only read the manifest and generated files; CI does not require an image codec.
"""
from pathlib import Path
import hashlib,json,shutil,subprocess
ROOT=Path(__file__).resolve().parent.parent
products=['aperlo','rouse','pricebird','trailglass','hushtrail','fire']
files=[ROOT/'images/jamin-zhou-avatar.png']
for product in products:
    files.append(ROOT/product/'app-icon.png')
    for folder in ['screenshots','images']:
        if (ROOT/product/folder).exists():files.extend(sorted((ROOT/product/folder).rglob('*.png')))
encoder=shutil.which('cwebp')
if not encoder:raise SystemExit('Install cwebp to regenerate display images; normal builds use the committed files.')
manifest={}
for source in files:
    rel=source.relative_to(ROOT)
    width=128 if source.name=='jamin-zhou-avatar.png' else 256 if source.name=='app-icon.png' else 1280
    width=min(width,int.from_bytes(source.read_bytes()[16:20],'big'))
    dest=ROOT/'assets/media'/rel.with_suffix('.webp');dest.parent.mkdir(parents=True,exist_ok=True)
    subprocess.run([encoder,'-quiet','-q','86','-m','6','-metadata','none','-resize',str(width),'0',str(source),'-o',str(dest)],check=True)
    manifest['/'+rel.as_posix()]={'src':'/'+dest.relative_to(ROOT).as_posix(),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size}
(ROOT/'_site-src/shared/images.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'{len(manifest)} web images: {sum(x["bytes"] for x in manifest.values()):,} bytes; originals retained.')
