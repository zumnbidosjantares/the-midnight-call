@echo off
title The Midnight Call
cd /d "%~dp0"

echo.
echo   ==========================================
echo      T H E   M I D N I G H T   C A L L
echo      Chamado da Meia-Noite
echo   ==========================================
echo.
echo   Subindo o servidor local...
echo   Deixe esta janela ABERTA enquanto joga.
echo   Para fechar o jogo: feche esta janela.
echo.

REM O jogo usa modulos JavaScript (import/export). Navegador bloqueia isso
REM quando o arquivo e aberto direto (file://), por isso precisa do servidor.
REM
REM Quem abre o navegador e o servidor.py, DEPOIS que a porta ja esta
REM escutando. Nao mova isso para ca: abrir o navegador antes do servidor
REM subir faz a pagina bater numa porta morta e parecer que o jogo travou.

py --version >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:8123/index.html
  if exist "servidor.py" ( py servidor.py 8123 ) else ( py -m http.server 8123 )
  goto :eof
)

python --version >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:8123/index.html
  if exist "servidor.py" ( python servidor.py 8123 ) else ( python -m http.server 8123 )
  goto :eof
)

node --version >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:8123/index.html
  npx --yes serve -l 8123 --no-clipboard .
  goto :eof
)

echo   Nao encontrei Python nem Node.js instalado.
echo.
echo   Instale o Python em https://python.org/downloads
echo   (marque "Add Python to PATH") e rode este arquivo de novo.
echo.
pause
goto :eof

:temPython
if not exist "servidor.py" goto :semServidor

where py >nul 2>nul
if %errorlevel%==0 ( py servidor.py 8137 ) else ( python servidor.py 8137 )
goto :fim

:semServidor
echo   AVISO: servidor.py nao foi encontrado. Usando o servidor simples.
echo.
start "" http://localhost:8137/index.html
where py >nul 2>nul
if %errorlevel%==0 ( py -m http.server 8137 ) else ( python -m http.server 8137 )

:fim
echo.
echo   O servidor encerrou.
echo   Se ele fechou sozinho na hora, a mensagem de erro esta logo acima.
echo.
pause
