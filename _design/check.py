#!/usr/bin/env python3
"""Verify local preview copies against production output, not a second renderer."""
from pathlib import Path
import json,re,sys
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'_design/preview'
errors=[];count=0
for product in ['aperlo','rouse','pricebird','trailglass','hushtrail','fire']:
    manifest=json.loads((ROOT/'_site-src'/product/'pages.json').read_text())
    for key in manifest['pages']:
        locale,surface=key.split('.')
        route=product+'/'+('' if locale=='en' else locale.lower()+'/')+('' if surface=='landing' else 'support/clamshell/' if surface=='clamshell' else surface+'/')+'index.html'
        original=(ROOT/route).read_text();preview=(OUT/route).read_text()
        expected=original.replace('</head>','<meta name="robots" content="noindex,nofollow"></head>')
        if preview!=expected:errors.append(route)
        count+=1
if errors:
    print('Stale preview pages: '+', '.join(errors));sys.exit(1)
if (OUT/'robots.txt').read_text()!='User-agent: *\nDisallow: /\n':raise SystemExit('Preview robots must disallow indexing')
print(f'PASS: {count} product preview pages match production output with local noindex protection.')
