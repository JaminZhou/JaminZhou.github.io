#!/usr/bin/env python3
"""Local preview server. Unknown URLs return the designed 404 with status 404."""
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
import argparse
ROOT=Path(__file__).resolve().parent/'preview'
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def send_error(self,code,message=None,explain=None):
        if code==404 and (ROOT/'404.html').exists():
            body=(ROOT/'404.html').read_bytes();self.send_response(404);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Content-Length',str(len(body)));self.end_headers()
            if self.command!='HEAD':self.wfile.write(body)
        else:super().send_error(code,message,explain)
    def log_message(self,*args):pass
parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=0);args=parser.parse_args()
server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
print(f'http://127.0.0.1:{server.server_port}/design/',flush=True)
try:server.serve_forever()
except KeyboardInterrupt:pass
finally:server.server_close()
