# servidor_dev.py — SOMENTE DESENVOLVIMENTO. Nao e usado pelo ABRIR_JOGO.bat.
#
# Igual ao servidor.py normal (sem cache), mais um endpoint POST /snap que
# grava o PNG enviado pela pagina em ferramentas/capturas/. Serve para o
# Claude conseguir OLHAR o jogo rodando e ajustar arte e animacao em vez de
# programar no escuro.
#
# Uso:  python ferramentas/servidor_dev.py 8137     (rode da raiz do projeto)

import base64
import os
import sys
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, 'ferramentas', 'capturas')


class Dev(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=RAIZ, **kw)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_POST(self):
        if not self.path.startswith('/snap'):
            self.send_error(404)
            return
        n = int(self.headers.get('Content-Length', 0))
        corpo = self.rfile.read(n).decode('utf-8', 'replace')
        if ',' in corpo:
            corpo = corpo.split(',', 1)[1]
        nome = self.path.split('?nome=')[-1] if '?nome=' in self.path else str(int(time.time()))
        nome = ''.join(c for c in nome if c.isalnum() or c in '-_')
        os.makedirs(SAIDA, exist_ok=True)
        caminho = os.path.join(SAIDA, nome + '.png')
        with open(caminho, 'wb') as f:
            f.write(base64.b64decode(corpo))
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        self.wfile.write(caminho.encode())

    def log_message(self, fmt, *args):
        if len(args) > 1 and str(args[1]) == '404':
            return
        super().log_message(fmt, *args)


if __name__ == '__main__':
    porta = int(sys.argv[1]) if len(sys.argv) > 1 else 8137
    print('DEV em http://localhost:%d/index.html  (capturas em %s)' % (porta, SAIDA))
    try:
        ThreadingHTTPServer(('127.0.0.1', porta), Dev).serve_forever()
    except KeyboardInterrupt:
        print('\nEncerrado.')
