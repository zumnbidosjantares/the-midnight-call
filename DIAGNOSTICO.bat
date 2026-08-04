@echo off
title The Midnight Call - Diagnostico
cd /d "%~dp0"
chcp 65001 >nul

echo.
echo   ==========================================
echo      DIAGNOSTICO - The Midnight Call
echo   ==========================================
echo.
echo   Rode isto quando o jogo nao abrir. Ao terminar, selecione tudo
echo   nesta janela (botao direito ^> Marcar ^> arraste ^> Enter) e cole
echo   no chat. E o suficiente para eu descobrir o que esta faltando.
echo.
echo   ------------------------------------------
echo   1. PASTA
echo   ------------------------------------------
echo   %CD%
echo.

echo   ------------------------------------------
echo   2. PYTHON
echo   ------------------------------------------
where py 2>nul
if %errorlevel%==0 (
  py -c "import sys; print('   py  ->', sys.version)"
) else (
  echo    py  -^> nao encontrado ^(normal^)
)
where python 2>nul
if %errorlevel%==0 (
  python -c "import sys; print('   python  ->', sys.version)"
) else (
  echo    python  -^> NAO ENCONTRADO  ^<-- este e o problema
)
echo.

echo   ------------------------------------------
echo   3. ARQUIVOS ESSENCIAIS
echo   ------------------------------------------
call :ver index.html
call :ver servidor.py
call :ver css\style.css
call :ver js\main.js
call :ver js\i18n.js
call :ver js\core\gfx.js
call :ver js\core\text.js
call :ver js\core\input.js
call :ver js\core\audio.js
call :ver js\core\save.js
call :ver js\art\palette.js
call :ver js\art\pixel.js
call :ver js\art\detective.js
call :ver js\world\camera.js
call :ver js\world\fx.js
call :ver js\world\materials.js
call :ver js\world\levels.js
call :ver js\systems\player.js
call :ver js\systems\dialogue.js
call :ver js\systems\cutscene.js
call :ver js\ui\menu.js
call :ver js\ui\panels.js
call :ver js\ui\pause.js
echo.

echo   ------------------------------------------
echo   4. PORTAS 8137-8140
echo   ------------------------------------------
netstat -ano ^| findstr ":813" 2>nul
if %errorlevel% neq 0 echo    nenhuma porta 813x em uso ^(bom^)
echo.

echo   ------------------------------------------
echo   5. AUDIO DA NARRACAO
echo   ------------------------------------------
if exist "assets\audio\narrator.mp3" (
  echo    narrator.mp3 encontrado
) else (
  echo    narrator.mp3 ausente ^(o jogo funciona sem ele^)
)
echo.
echo   ==========================================
echo   Fim. Copie tudo acima.
echo   ==========================================
echo.
pause
goto :eof

:ver
if exist "%~1" (echo    OK       %~1) else (echo    FALTANDO %~1   ^<-- problema)
goto :eof
