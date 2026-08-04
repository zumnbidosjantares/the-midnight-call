# Servidor local de The Midnight Call.
#
# Faz tres coisas alem de servir arquivo:
#
# 1. Manda Cache-Control: no-store. Sem isso o navegador guarda os modulos
#    JavaScript e continua rodando a versao antiga depois de uma atualizacao
#    — o jogo abre quebrado e parece bug novo quando e so arquivo velho.
#
# 2. Procura uma porta livre. Se a 8137 estiver ocupada (outro servidor, uma
#    janela antiga do jogo que ficou aberta), ele sobe na 8138, 8139...
#    em vez de falhar em silencio.
#
# 3. SO ABRE O NAVEGADOR DEPOIS que a porta esta escutando. Este era o bug:
#    o .bat abria o navegador primeiro e o Python levava meio segundo para
#    subir, entao o navegador batia numa porta morta e mostrava "nao foi
#    possivel acessar esse site". Da impressao de que o jogo travou, quando
#    na verdade ele nunca chegou a carregar.

import os
import socket
import sys
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORTA_PADRAO = 8137
TENTATIVAS = 12
RAIZ = os.path.dirname(os.path.abspath(__file__))

# O jogo procura a narracao por estes nomes, nesta ordem (ver
# js/core/audio.js). Enquanto nenhum existir ele gera 404 — o que e
# esperado, mas assusta quem esta olhando a janela preta.
NOMES_NARRACAO = [
    'narrator.mp3', 'narrator.wav', 'narrator.ogg', 'narrator.m4a',
    'narracao.mp3', 'narrador.mp3', 'intro.mp3', 'intro.wav',
]


class SemCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, fmt, *args):
        # Linha de acesso: args = (requisicao, codigo, tamanho).
        if len(args) > 1 and str(args[1]) == '404':
            return
        super().log_message(fmt, *args)

    def log_error(self, fmt, *args):
        # Linha de erro: "code 404, message File not found". Vem de send_error,
        # com outro formato de args, por isso o filtro acima nao pega.
        if args and str(args[0]) == '404':
            return
        super().log_error(fmt, *args)


def narracao_encontrada():
    pasta = os.path.join(RAIZ, 'assets', 'audio')
    for nome in NOMES_NARRACAO:
        if os.path.isfile(os.path.join(pasta, nome)):
            return nome
    return None


def ocupada(porta):
    s = socket.socket()
    s.settimeout(0.3)
    try:
        s.connect(('127.0.0.1', porta))
        return True
    except OSError:
        return False
    finally:
        s.close()


def subir(base):
    for p in range(base, base + TENTATIVAS):
        if ocupada(p):
            print('  porta %d ocupada, tentando a proxima...' % p)
            continue
        try:
            return ThreadingHTTPServer(('127.0.0.1', p), SemCache), p
        except OSError as e:
            print('  porta %d recusou (%s), tentando a proxima...' % (p, e))
    return None, None


if __name__ == '__main__':
    base = int(sys.argv[1]) if len(sys.argv) > 1 else PORTA_PADRAO
    servidor, porta = subir(base)

    if servidor is None:
        print()
        print('  NAO CONSEGUI ABRIR NENHUMA PORTA entre %d e %d.' % (base, base + TENTATIVAS - 1))
        print('  Provavelmente ja existe uma janela do jogo aberta.')
        print('  Feche todas as janelas pretas do jogo e tente de novo.')
        print()
        input('  Aperte ENTER para fechar.')
        sys.exit(1)

    url = 'http://localhost:%d/index.html' % porta
    narr = narracao_encontrada()

    print()
    print('  The Midnight Call rodando em %s' % url)
    print('  Deixe esta janela aberta enquanto joga. Ctrl+C encerra.')
    print()
    if narr:
        print('  Narracao: %s encontrada. A cutscene vai seguir o audio.' % narr)
    else:
        print('  Narracao: nenhum audio em assets\\audio\\ (isto nao e problema).')
        print('            A cutscene roda pelos tempos escritos em js/i18n.js.')
    print()
    print('  Se o navegador nao abrir sozinho, copie o endereco acima.')
    print()

    # A porta ja esta escutando neste ponto (o construtor faz bind + listen),
    # entao o navegador pode chegar mesmo antes do serve_forever.
    threading.Timer(0.3, lambda: webbrowser.open(url)).start()

    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print('\n  Encerrado.')
