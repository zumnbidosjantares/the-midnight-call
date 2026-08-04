#!/usr/bin/env bash
# The Midnight Call — lancador para Linux/macOS.
cd "$(dirname "$0")" || exit 1
PORT=8137
URL="http://localhost:$PORT/index.html"

abrir() {
  sleep 1
  if command -v xdg-open >/dev/null; then xdg-open "$URL"
  elif command -v open >/dev/null; then open "$URL"
  fi
}

echo
echo "  =========================================="
echo "     T H E   M I D N I G H T   C A L L"
echo "  =========================================="
echo
echo "  Servidor local na porta $PORT. Ctrl+C encerra."
echo

if command -v python3 >/dev/null; then
  abrir &
  if [ -f servidor.py ]; then python3 servidor.py $PORT; else python3 -m http.server $PORT; fi
elif command -v node >/dev/null; then
  abrir &
  npx --yes serve -l $PORT --no-clipboard .
else
  echo "  Instale Python 3 ou Node.js para rodar o jogo."
  exit 1
fi
