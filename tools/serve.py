# Dev server that never caches and proxies /api/* to the OMR server on :8000
import http.server, urllib.request, urllib.error

OMR = 'http://127.0.0.1:8000'

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_POST(self):
        if self.path.startswith('/api/'):
            target = OMR + self.path[4:]
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length) if length else b''
            req = urllib.request.Request(target, data=body, method='POST')
            for h in ('Content-Type', 'Content-Length'):
                if self.headers.get(h):
                    req.add_header(h, self.headers[h])
            try:
                with urllib.request.urlopen(req, timeout=320) as r:
                    data = r.read()
                    self.send_response(r.status)
                    self.send_header('Content-Type', r.headers.get('Content-Type', 'application/json'))
                    self.send_header('Content-Length', str(len(data)))
                    self.end_headers()
                    self.wfile.write(data)
            except urllib.error.HTTPError as e:
                data = e.read()
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(data)))
                self.end_headers()
                self.wfile.write(data)
            except Exception as e:
                msg = str(e).encode()
                self.send_response(502)
                self.send_header('Content-Type', 'text/plain')
                self.send_header('Content-Length', str(len(msg)))
                self.end_headers()
                self.wfile.write(msg)
        else:
            self.send_response(405)
            self.end_headers()

http.server.ThreadingHTTPServer(('', 5180), Handler).serve_forever()
