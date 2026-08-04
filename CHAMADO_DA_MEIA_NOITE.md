# 🕛 THE MIDNIGHT CALL — Documento Mestre do Projeto

> **Arquivo de acompanhamento oficial.** Toda sessão é registrada aqui: o que foi
> feito, o que falta, bugs encontrados, resolvidos e pendentes, o que funciona e o
> que não funciona.
> **Nunca apagar histórico** — só adicionar sessões novas e atualizar os status.

---

## 📑 ÍNDICE

1. [Identidade do Projeto](#1-identidade-do-projeto)
2. [Stack Técnica](#2-stack-técnica)
3. [Como rodar](#3-como-rodar)
4. [Estrutura de Pastas (real)](#4-estrutura-de-pastas-real)
5. [Arquitetura](#5-arquitetura)
6. [Direção de Arte](#6-direção-de-arte)
7. [ANIMAÇÃO — área completa](#7-animação--área-completa)
8. [ÁUDIO — área completa](#8-áudio--área-completa)
9. [Status Geral](#9-status-geral)
10. [O que FUNCIONA](#10-o-que-funciona)
11. [O que NÃO FUNCIONA / falta](#11-o-que-não-funciona--falta)
12. [Bugs — Registro Completo](#12-bugs--registro-completo)
13. [⚠️ RESSALVAS — o que precisa mudar](#13-️-ressalvas--o-que-precisa-mudar)
14. [Roadmap — Capítulo 2](#14-roadmap--capítulo-2)
15. [Decisões Técnicas](#15-decisões-técnicas)
16. [Dúvidas em Aberto](#16-dúvidas-em-aberto)
17. [Log de Sessões](#17-log-de-sessões)
18. [Glossário](#18-glossário)

**Legenda de status usada no documento inteiro:**

| Símbolo | Significado |
|---|---|
| 🟢 | Feito, testado, funcionando |
| 🟡 | Feito mas **não validado em jogo real** — precisa de teste humano |
| 🟠 | Precisa de atenção agora / decisão pendente |
| 🔴 | Quebrado ou bloqueado |
| ⚪ | Não começado — escopo futuro, não é pendência |
| 🔥 | Crítico |

---

## 1. IDENTIDADE DO PROJETO

| Campo | Valor |
|---|---|
| **Nome** | **The Midnight Call** |
| **Nome em PT** | Chamado da Meia-Noite |
| **Gênero** | Survival horror investigativo, lateral 2D (side-scroller) |
| **Referências** | Silent Hill / The Evil Within (tom) · 2Dark (paleta) · Hope 01 (câmera) · Urban Detective (sprite) |
| **Plataforma** | Navegador desktop |
| **Perspectiva** | Lateral fixa, câmera acompanha no eixo X |
| **Idiomas** | 🇧🇷 PT-BR e 🇬🇧 EN, com seletor no menu |
| **Repositório** | `github.com/luizhenriquevfernandes2008-ops/the-midnight-call` (público) |
| **Início** | 03/08/2026 |
| **Status** | 🟡 Sessão 08b — Capítulo 1 jogável do início ao fim. Aguardando teste humano completo e o roteiro do Capítulo 2 |

### Pitch

Um detetive falido, sem distintivo e sem nada a perder, atende o telefone às
2h14 da manhã. Uma mulher sem nome dá o endereço de um bar fechado há seis
anos. Ele vai. Os inimigos do jogo são os medos e pesadelos da própria cabeça
dele.

### Duração pretendida

**5 horas de jogo.** Estimativa honesta de produção: 250 a 400 horas de
trabalho, ~100 a 140 sessões. Em ritmo de 3 sessões por semana: 8 a 11 meses.
Em ritmo quase diário: 4 a 6 meses.

---

## 2. STACK TÉCNICA

| Camada | Tecnologia |
|---|---|
| Estrutura | HTML5 + módulos ES6 |
| Lógica | JavaScript (ES2020), **zero dependências, zero build obrigatório** |
| Renderização | **Canvas 2D** — buffer interno de 480×270 ampliado com nearest-neighbor |
| Áudio | Web Audio API — **100% sintetizado em código**, exceto a narração gravada |
| Fontes | **Nenhum arquivo de fonte** — texto vem de fonte do sistema com corte duro de alpha |
| Sprites | **Nenhuma sprite sheet** — personagem é rig articulado montado de grades ASCII |
| Cenário | **Procedural determinístico** — tijolo, asfalto, ferrugem gerados por seed fixa |
| Persistência | `localStorage` (3 slots + configurações) |
| Distribuição | `JOGO_OFFLINE.html` — arquivo único de ~321 KB, roda com dois cliques |

### O que NÃO existe no projeto (de propósito)

- Nenhum arquivo de imagem do jogo (só as referências em `assets/reference/`)
- Nenhum arquivo de fonte
- Nenhum arquivo de som além de `narrator.mp3`
- Nenhum `node_modules`, nenhum bundler, nenhum framework

---

## 3. COMO RODAR

| Forma | O que fazer | Quando usar |
|---|---|---|
| 🟢 **Recomendada** | Clique duas vezes em **`JOGO_OFFLINE.html`** | Jogar, mandar para alguém, testar em outra máquina |
| 🔧 Desenvolvimento | `ABRIR_JOGO.bat` (Windows) ou `abrir_jogo.sh` | Editar código e apertar F5 |
| 🩺 Diagnóstico | `DIAGNOSTICO.bat` | Quando não abrir |

**Depois de mexer no código, regerar o arquivo offline:**

```
python ferramentas/gerar_offline.py
```

> ⚠️ **Nunca abrir `index.html` com dois cliques.** Ele usa módulos JavaScript, que
> todo navegador bloqueia em `file://`. A tela fica presa em "carregando...".
> Era exatamente por isso que o jogo não rodava em máquinas alheias.

### Controles

```
A / D  ou setas ....... andar                SHIFT (segurar) ..... correr
E ..................... interagir / avançar diálogo
J  ou  ESPAÇO ......... socar (aperte de novo para o 2º golpe)

BOTÃO DIREITO (segurar) saca a arma e mira
MOUSE ↑ / ↓ ........... levanta e abaixa o cano (horizontal é IGNORADO)
BOTÃO ESQUERDO ........ atirar               R ................... recarregar

ESC ................... pausar / voltar      DELETE .............. apagar save
ESC ou ENTER (segurar)  pular a cutscene     F1 .................. depuração
```

Mirando, os pés ficam presos no chão. É de propósito: jogo de terror, não de ação.

---

## 4. ESTRUTURA DE PASTAS (REAL)

```
chamado da meia noite/
├── JOGO_OFFLINE.html          🟢 O JOGO. Arquivo único, dois cliques, sem servidor
├── index.html                 casca + tela de erro (só via servidor local)
├── ABRIR_JOGO.bat             lançador Windows (dev)
├── abrir_jogo.sh              lançador Linux/macOS (dev)
├── DIAGNOSTICO.bat            relatório copiável quando não abre
├── servidor.py                servidor local: acha porta livre, abre o navegador
├── LEIA-ME.txt                instruções para o jogador
├── README.md                  vitrine do repositório (em inglês)
├── CHAMADO_DA_MEIA_NOITE.md   ESTE ARQUIVO — documento mestre
│
├── css/style.css              casca da página, tela de boot e de erro
│
├── js/
│   ├── main.js                máquina de estados, laço principal, QTE, HUD
│   ├── i18n.js                TODO texto do jogo (PT+EN) + narração + falas
│   ├── core/
│   │   ├── gfx.js             buffers, luz, bloom, grão, vinheta, pálpebras
│   │   ├── text.js            texto pixelado a partir de fonte do sistema
│   │   ├── input.js           teclado, mouse (inclui botão direito e eixo Y)
│   │   ├── audio.js           TODO o som, sintetizado
│   │   └── save.js            3 slots + configurações
│   ├── art/
│   │   ├── palette.js         paleta fechada do jogo
│   │   ├── pixel.js           grades ASCII → sprite, rotação, silhueta, dither
│   │   └── detective.js       peças, esqueleto, TODAS as animações
│   ├── world/
│   │   ├── camera.js          câmera lateral com atraso e antecipação
│   │   ├── materials.js       pincéis: tijolo, asfalto, sangue, destroço...
│   │   ├── levels.js          as 5 fases + carro + rua da cutscene
│   │   └── fx.js              chuva, névoa, partículas, poeira
│   ├── systems/
│   │   ├── player.js          controle, arma, falas, estados de ócio
│   │   ├── dialogue.js        caixa de diálogo, legendas, balão de interagir
│   │   ├── cutscene.js        abertura (carro + narração)
│   │   └── scene-nota.js      cena da nota, figura negra, nocaute, despertar
│   └── ui/
│       ├── menu.js            tela de título (é uma cena viva, não um cartaz)
│       ├── panels.js          slots de save e painel de opções
│       └── pause.js           menu de pausa
│
├── ferramentas/
│   ├── gerar_offline.py       empacota os 21 módulos no HTML único
│   └── servidor_dev.py        servidor + endpoint de captura de tela (só dev)
│
├── assets/
│   ├── audio/
│   │   ├── narrator.mp3       🟠 narração — NÃO corresponde ao roteiro atual
│   │   ├── roteiro-narracao.srt  roteiro das legendas
│   │   └── LEIA-ME.txt        como trocar o áudio e reajustar
│   ├── reference/             🟠 arte de terceiros — APAGAR se o repo for público
│   └── sprites/               (vazia, para sprite sheets futuras)
│
└── docs/
    ├── GAME_DESIGN.md         plano das 5 horas, capítulos, sistemas (inglês)
    └── SESSION_LOG.md         log técnico detalhado por sessão (inglês)
```

---

## 5. ARQUITETURA

### Máquina de estados (`main.js`)

```
BOOT → WAITKEY → MENU ─┬─→ CUTSCENE (abertura) → PLAY ⇄ PAUSE
                       ├─→ PLAY (carregar save)
                       └─→ LAB (sala de teste de animação)

PLAY pode entrar em: SCENE (cena roteirizada) · QTE · ENDCARD
```

### Ordem de desenho de um quadro — **regra que não pode ser quebrada**

```
1. gfx.begin()              limpa a cena
2. camadas de paralaxe      fundo → meio → principal
3. personagem               (+ figura negra, se houver cena)
4. partículas
5. poeira / névoa / chuva   ANTES da luz, para serem iluminadas
6. camada de primeiro plano
7. gfx.beginLights(ambiente)
8. luzes da fase + do jogador + da cena
9. gfx.endLights(bloom)     multiplica a cena pela luz
10. INTERFACE               ← DEPOIS da luz, senão o menu sai escuro
11. gfx.present(dt)         grão, vinheta, scanline, pálpebras, fade, tremor
```

### Pipeline de imagem

Tudo é desenhado num buffer interno de **480×270**. O navegador só amplia o
resultado final, com nearest-neighbor — o pixel nunca borra. A cena é
**multiplicada** por um buffer de luz, com bloom em 1/4 de resolução por cima.

### Sistema de falas ("barks")

Falas curtas em cima da cabeça, uma de cada vez, com respiro entre elas.
Disparam de três formas:

| Origem | Campo | Exemplo |
|---|---|---|
| Ao entrar na fase | `level.enterBarks` | "Alguém chegou antes de mim." |
| Ao entrar, **cortando tudo** | `level.enterBarksNow` | "Alguém ficou parado sangrando aqui." |
| Ao cruzar um ponto | `level.barks[]` | "Isso não foi briga de bar." |
| Por evento de animação | `player.say()` | "hoje não..." |

---

## 6. DIREÇÃO DE ARTE

| Elemento | Decisão |
|---|---|
| **Resolução interna** | 480×270 — 4× exato em 1080p |
| **Altura do personagem** | 62 px (≈23% da tela) |
| **Paleta** | Preto esmagado · âmbar sujo `#e0b070` · vermelho seco `#a8382c` · marrom sobretudo `#6d4c2e` · azul-noite `#2e3644` |
| **Regra de cor** | Tudo dessaturado. A **única** cor com permissão de gritar é o vermelho — reservada para sangue e para o título |
| **Luz** | A cena é multiplicada pela luz. Cor "realista" vira preto: **toda a paleta é pintada mais clara do que a lógica pediria** |
| **Grão de filme** | 0.018, e **pula o personagem** (só 25% de força em cima dele) |
| **Título** | "THE MIDNIGHT CALL" em Impact, corroído pixel a pixel e escorrido, com halo vermelho e piscada de mau contato |
| **Menu** | Não é um cartaz: é uma cena viva, com chuva, poste zumbindo e o detetive acendendo um cigarro que joga fora |

### O personagem

| Parte | Decisão | Por quê |
|---|---|---|
| **Sobretudo marrom fechado** | Pano sólido, lapela dobrada, botões na beirada, cinto | Colete + camisa não formava silhueta nenhuma a 62px. E casaco **aberto** é o que se vê de frente — num jogo lateral a câmera olha o costado |
| **Aba do casaco** | Peça separada, cai até abaixo do joelho, persegue a inclinação **com atraso** e balança a cada passo | É o único lugar do personagem onde "mole" é o efeito certo: pano não acompanha osso |
| **Gola levantada** | Desenhada **atrás** da cabeça | Sem ela a cabeça pousava num pescoço de 2px e parecia recortada e colada |
| **Rosto 3/4** | **Um olho só**, nariz quebrando a silhueta, orelha marcada, cabelo jogado para trás | Dois olhos simétricos faziam ele parecer virado para a câmera — ou de costas |
| **Olho** | 4 pixels com funções diferentes: sobrancelha, esclera, pupila, sombra | Um ponto preto sozinho não é olho, é furo |
| **Cabelo quase preto** | Contraste ganhou do realismo | Cabelo castanho em cima de casaco marrom fazia a cabeça derreter no corpo |
| **Coldre no quadril** | Por **cima** do casaco | Por baixo seria mais realista e completamente invisível |

---

## 7. ANIMAÇÃO — ÁREA COMPLETA

### O sistema

**Não existe sprite sheet.** O personagem é um **boneco articulado**: 12 peças
de pixel art que giram em torno de juntas, com poses-chave interpoladas.
Rotação usa `drawImage` com `imageSmoothingEnabled = false` — o navegador
reamostra por vizinho mais próximo, então o braço continua com cara de pixel
art girando em qualquer ângulo.

**Vantagem:** movimento contínuo a 60 fps de verdade, sem desenhar 30 quadros à
mão por animação.
**Custo:** exige calibragem cuidadosa, senão vira boneco de pano.

### Medidas do esqueleto (a partir do chão)

```
Altura total ......... 62 px        Quadril ........... -28
Coxa ................. 13           Ombro ............. -48
Canela ............... 11           Braço (ombro) ..... ±6 frente / ±7 trás
Braço superior ....... 10           Perna ............. ±3
Antebraço ............. 9
```

> O braço de trás fica **mais afastado** que o da frente (7 contra 6). Com os
> dois no mesmo deslocamento ele desaparecia dentro do tronco e o personagem
> parecia ter um braço só.

### Tabela completa de animações

| Nome | Duração | Loop | Interpolação | Estado |
|---|---|---|---|---|
| `idle` | 4.2s | ✅ | suave | 🟢 respiração sutil |
| `walk` | 0.76s | ✅ | **linear** | 🟢 |
| `run` | 0.50s | ✅ | **linear** | 🟢 |
| `punch1` | 0.38s | ❌ | **linear** | 🟢 com quadro de espera no impacto |
| `punch2` | 0.46s | ❌ | **linear** | 🟢 reverso, passa para a frente do tronco |
| `interact` | 0.60s | ❌ | suave | 🟢 |
| `smoke` | 7.2s | ❌ | suave | 🟢 pega, olha, hesita, **"hoje não..."**, joga fora |
| `smokeLighter` | 10.2s | ❌ | suave | ⚪ guardada — versão com isqueiro (a chama é luz real) |
| `getout` | 1.40s | ❌ | suave | 🟢 sair do carro, subida monótona |
| `read` | 3.4s | ✅ | suave | 🟢 agachado lendo, de costas para a porta |
| `cuffed` | 4.6s | ✅ | suave | 🟢 sentado, pulsos no cano |
| `strainCuffs` | 0.44s | ✅ | **linear** | 🟢 puxando as algemas (QTE) |
| `sitDown` | 1.05s | ❌ | suave | 🟢 de pé → sentado |
| `sitImpatient` | 2.6s | ✅ | suave | 🟢 sentado batendo o pé |
| `standUp` | 0.85s | ❌ | suave | 🟢 sentado → de pé |
| `lookback` | 1.6s | ❌ | suave | ⚪ reservada para sustos |

### 🔑 A decisão mais importante: `ease: 'linear'`

Suavizar a entrada **e** a saída de *cada* pose-chave faz todo membro
**desacelerar em todo quadro-chave**. É exatamente isso que produz o balanço
mole de boneco de pano — foi a reclamação "braços muito moles, parece jogo de
sandbox".

Andar, correr e socar usam **interpolação reta**: o movimento tem direção e
para onde o animador mandou, não onde a curva deixou. Só parado, fumando e
sentando usam curva suave.

Outras regras aprendidas:

- **O balanço do braço vem do OMBRO.** No andar, o cotovelo quase não dobra
  (8 a 14 graus). Braço que dobra muito andando parece desarticulado.
- **Correndo o cotovelo TRAVA** num ângulo quase constante (~57°). Quem corre
  não abre e fecha o braço, leva ele preso perto do corpo.
- **Soco precisa de quadro de espera** logo após o impacto. Sem ele o braço
  volta deslizando e o golpe não tem peso nenhum.
- **A cabeça só gira em passos de 7°, máximo 14°.** Girar um rosto de 14px em
  ângulo qualquer reamostra os pixels e borra olho e nariz.
- **Interpolação passa por poses intermediárias.** O `getout` antigo tinha
  joelho a 104° e tronco a 26° ao mesmo tempo; no meio do caminho ele passava
  por posturas que corpo nenhum faz. Rebuild como subida monótona.

### Mira — sobreposição, não animação

O ângulo vem do mouse do jogador, então **não dá para guardar em quadros-chave**.
Depois que a animação normal é calculada, braço da frente, inclinação da cabeça
e do tronco são **sobrescritos** pelo ângulo de mira. O corpo continua
respirando por baixo.

### A figura negra

É o **próprio esqueleto do detetive**, pintado de preto puro via `silhouettePass`,
16% mais alta e 6% mais estreita. Anda com o mesmo rig — por isso se move como
gente e continua sem rosto. Como a cena é multiplicada pela luz, preto continua
preto debaixo de qualquer lâmpada.

### Ócio: o que ele faz parado

| Situação | 3s parado | 7s parado | 9s parado | Ao andar |
|---|---|---|---|---|
| **Antes do sequestro** | `idle` | `idle` | **`smoke`** (cigarro) | anda |
| **Depois** (sem nada) | `idle` | **`sitDown`** | `sitImpatient` | **`standUp`** primeiro |

> O tempo em pé antes de sentar é obrigatório. Sentar na hora parece um comando,
> não um cansaço.

---

## 8. ÁUDIO — ÁREA COMPLETA

### Filosofia

**Tudo sintetizado em tempo real**, exceto a narração. Não há um único arquivo
de efeito sonoro no projeto. Chuva, passo, soco, porta, tiro — tudo é ruído
filtrado e osciladores, montados em `js/core/audio.js`.

### Cadeia de áudio

```
                     ┌─ busMusic ────────────────┐
osciladores ─────────┼─ busSfx → duckSfxNode ────┼─→ master → saída
                     └─ busVoice ────────────────┘
                              ↑
       reverb (impulso sintético de 2,6s) ────────┘
```

> ⚠️ O **nó de abafamento é separado** do volume dos efeitos. Se os dois
> mexessem no mesmo parâmetro, a rampa de um cancelaria a atribuição do outro
> dependendo da ordem. Isso já foi um bug (B-14).

### Catálogo de sons

| Categoria | Sons |
|---|---|
| **Passos e corpo** | `step` (seco/molhado), `strain` (esforço) |
| **Combate** | `whoosh`, `punchHit`, `gunshot`, `dryClick`, `reloadClick`, `leather` |
| **Portas e objetos** | `doorCreak`, `doorSlam`, `pipeBurst`, `chainRattle` |
| **Cigarro** | `lighterFlick`, `flameWhoosh` |
| **Ambiente pontual** | `drip`, `metalCreak`, `distantThump`, `thunder`, `carPassBy` |
| **Tensão** | `startDread` / `setDread(k)` / `stopDread`, `heartbeat`, `thud`, `tinnitus` |
| **Interface** | `uiMove`, `uiConfirm`, `uiBack`, `blip` |
| **Loops** | `rain`, `wind`, `roomtone`, `hall` |
| **Música** | piano em Ré menor com reverb longo + bordão + chiado de vinil |

### Ambiente por lugar

Cada fase declara os próprios loops e os próprios sons soltos. Antes, a chuva
seguia o jogador para dentro de qualquer sala — o que dizia ao ouvido que nada
tinha mudado.

| Fase | Loops | Sons soltos |
|---|---|---|
| Beco | `rain` 0.22 · `wind` 0.04 | trovão a cada 26–70s |
| Bar | `roomtone` 0.10 · `rain` 0.035 (abafada) | gota a cada 6–15s |
| Depósito | `roomtone` 0.09 | gota a cada 4–10s |
| **Galpão** | `hall` 0.11 · `wind` 0.022 | gota 3.5–9s · metal 11–26s · batida distante 22–50s · corrente 17–40s |

> Os intervalos são **sorteados dentro de uma faixa**. Som em batida fixa deixa
> de ser ambiente e vira metrônomo.

### O tiro

Quatro camadas: estalo agudo, corpo grave filtrado, soco de baixa frequência,
e uma **cauda jogada no reverb**. Sem a cauda soa a balão estourando; com ela
soa a beco.

### A tensão da figura negra

**É comandada pela DISTÂNCIA, não pelo relógio.** Duas serras desafinadas
batendo uma contra a outra, um filtro que abre conforme ela se aproxima, e um
batimento cardíaco cujo intervalo encurta de 1,15s para 0,34s.

No golpe, **a música é cortada em 10 milissegundos**. O silêncio súbito é o
susto; a pancada e o zumbido de ouvido são só o rescaldo.

### 🟠 A narração — situação atual

| Item | Estado |
|---|---|
| Arquivo | `assets/audio/narrator.mp3`, 60,76s |
| Nível | Pico −14,1 dBFS · média −40,7 dBFS — **muito baixo** |
| Correção aplicada | Roteada pelo WebAudio com **ganho ×4 (+12 dB) + limitador** |
| Abafamento | Chuva 0.10→0.030, vento 0.03→0.010, efeitos a 30% enquanto ela fala |
| **Problema** | 🟠 **O mp3 NÃO é a gravação do roteiro atual** |

**Prova de que não corresponde (três verificações independentes):**

1. O roteiro dura 76,5s e a fala 16 começa em 62s. O arquivo tem 60,76s.
2. Forçando o áudio a se dividir em 18 grupos e comparando a duração de cada um
   com a de cada fala: **correlação r = 0,149** (nenhuma). Se batesse, seria 0,7+.
3. A primeira fala do roteiro é uma palavra só ("Engraçado..."), mas o áudio
   abre com **8 segundos de fala contínua** em qualquer limiar testado.

**Mitigação implementada:** `NARRATION_REF_DUR = 76.5` e reescalonamento
automático — o jogo lê a duração real do arquivo e estica ou comprime todas as
legendas na mesma proporção. Salva gravação mais rápida ou mais lenta; **não
salva texto diferente**.

> 📌 **Quando exportar a gravação certa:** trocar `narrator.mp3` e, se a duração
> não for ~76,5s, ajustar `NARRATION_REF_DUR` em `js/i18n.js`. Se a gravação
> nova sair normalizada (pico perto de −3 dBFS), **baixar `GANHO_VOZ` de 4.0
> para ~1.2** em `js/core/audio.js`, senão vai soar espremido.

---

## 9. STATUS GERAL

| Módulo | Status |
|---|---|
| Documentação | 🟢 |
| Distribuição em arquivo único | 🟢 **resolve o "não roda em outras máquinas"** |
| Pipeline de render 480×270 | 🟢 validado |
| Sistema de luz + bloom | 🟢 validado |
| Pós-processamento (grão, vinheta, scanline) | 🟢 e **poupa o personagem** |
| Texto pixelado sem arquivo de fonte | 🟢 acentos PT validados |
| Localização PT / EN | 🟢 |
| Menu de título animado | 🟢 |
| Save em 3 slots com miniatura | 🟡 nunca testado a fundo em jogo real |
| Menu de pausa e opções | 🟢 |
| Rig do personagem | 🟢 |
| Sobretudo + gola + aba | 🟢 |
| Rosto (olho detalhado, boca) | 🟢 |
| Andar / correr / socar | 🟢 |
| Animação do cigarro | 🟢 |
| Arma: sacar, mirar, atirar, recarregar | 🟡 validado por script, falta mão humana |
| Cutscene de abertura (carro) | 🟢 |
| Narração + legendas | 🟠 **áudio não corresponde ao roteiro** |
| Beco | 🟢 |
| Bar (destruído) | 🟢 |
| Depósito + nota | 🟢 |
| Cena da nota + figura negra | 🟢 |
| Galpão + QTE de fuga | 🟡 QTE recalibrado, **precisa de teste humano** |
| Sistema de falas (barks) | 🟢 |
| Sistema de diálogo com NPC | 🟡 pronto, **sem nenhum NPC ainda** |
| Sala de teste de animação | 🟢 |
| Capítulo 2 | ⚪ aguardando roteiro |

---

## 10. O QUE FUNCIONA

| # | Funcionalidade | Evidência |
|---|---|---|
| F-01 | Jogo roda por `file://` sem servidor | 21 módulos empacotados, boot → menu → cutscene testados |
| F-02 | Cutscene dirigida pela narração, não por relógio | Carro só freia quando a voz acaba; testado com relógio falso |
| F-03 | Legendas seguem o relógio do áudio | Nos segundos 1,07 / 4,68 / 11,93 / 17,37 a legenda certa estava na tela |
| F-04 | Reescalonamento automático de legenda | Escala 0,794 calculada sozinha para o arquivo de 60,76s |
| F-05 | Acentos PT no texto pixelado | `ç í ó ê ã á` renderizam limpos a 12px |
| F-06 | Rig articulado a 60 fps | 16 animações, interpolação por pose-chave |
| F-07 | Fogo de boca é fonte de luz real | Ilumina o beco inteiro por um quadro |
| F-08 | Mira só no eixo vertical | Movimento horizontal do mouse é lido e descartado |
| F-09 | Sequência completa da nota | crouch → read → approach → strike → black → wake → galpão |
| F-10 | Tensão comandada por distância | `setDread(k)` com k derivado da distância da figura |
| F-11 | Corte seco da música no golpe | 10ms de fade |
| F-12 | Pálpebras com duas piscadas | 0,22 → 0,03 → 0,55 → 0,30 → 1,0 |
| F-13 | Ambiente sonoro por lugar | Galpão não tem chuva nenhuma |
| F-14 | QTE de fuga | ~10 toques / 2–3s num ritmo de 5 toques/s |
| F-15 | Ócio muda depois do sequestro | Medido: 6s→idle, 9s→smoke antes; 7s→sitDown depois |
| F-16 | Laço sobrevive a um quadro ruim | 3 falhas seguidas param e mostram o erro |
| F-17 | Servidor acha porta livre e abre o navegador na hora certa | 8137 → 8138 → ... |

---

## 11. O QUE NÃO FUNCIONA / FALTA

### 🔴 Bloqueado

| Item | Motivo |
|---|---|
| Sincronia real da narração | Falta a gravação que corresponde ao roteiro. **Só você pode destravar** |

### ⚪ Não começado (escopo futuro, não é pendência)

| Item | Nota |
|---|---|
| **Nome do detetive** | Ele não tem nome até agora |
| NPCs | O sistema de diálogo existe e nunca foi usado com um NPC |
| Escolhas de diálogo | Estrutura prevista, não implementada |
| Inimigos / combate real | O soco e a arma existem, não há em quem usar |
| Sistema de sanidade | Previsto no design |
| Diário / investigação | Previsto no design |
| Inventário | Previsto no design |
| Capítulos 2 a 4 | Aguardando roteiro |
| Música original | Só o piano do menu existe |
| Dublagem | Nenhuma além da narração |
| Gamepad | Estrutura de input permite, não implementado |

---

## 12. BUGS — REGISTRO COMPLETO

### 12.1 — 🐛 Bugs ATIVOS

| ID | Descrição | Severidade | Detectado | Notas |
|---|---|---|---|---|
| B-20 | Áudio da narração não corresponde ao roteiro | 🟠 Alto | Sessão 03 | Não é bug de código. Depende de gravação nova |
| B-21 | QTE nunca completou em loop automatizado de 60 toques, apesar de acumular corretamente em medição direta | 🟡 Médio | Sessão 08 | Recalibrado na 08b e medido soltando em 10 toques. **Provavelmente artefato do ambiente de teste — precisa de teste humano** |

### 12.2 — ✅ Bugs RESOLVIDOS

| ID | Descrição | Causa raiz | Solução | Sessão |
|---|---|---|---|---|
| B-01 | 🔥 **"O jogo travou" desde a primeira execução, sem nada para copiar** | A tela de erro é escondida pelo atributo `hidden`, que só funciona pela regra `[hidden]{display:none}` do navegador. Minha regra `#crash { display:flex }` é seletor de ID, tem prioridade maior e **cancelava o `hidden`**. A tela ficava visível para sempre, com a caixa de texto vazia, e o jogo rodava normalmente atrás dela | `#crash[hidden] { display: none !important; }` | 04 |
| B-02 | 🔥 Jogo não abria em outras máquinas mesmo com Python | O código é ES modules, que navegador nenhum carrega em `file://`. Quem baixava o ZIP e clicava no `index.html` via tela preta | `ferramentas/gerar_offline.py` empacota tudo em `JOGO_OFFLINE.html`. Módulos viram funções num registro (concatenar quebraria: `pixel.js` e `i18n.js` exportam os dois um `line`) | 04 |
| B-03 | 🔥 Navegador abria antes do servidor subir | O `.bat` fazia `start` do navegador e só depois iniciava o Python. O navegador batia numa porta morta | `servidor.py` abre o navegador ele mesmo, depois que a porta já escuta | 03 |
| B-04 | Porta ocupada falhava em silêncio | No Windows um segundo servidor "ocupa" uma porta já servida, sem erro e sem receber acesso | Servidor testa a porta e anda para frente (8137 → 8138 → ...) | 03 |
| B-05 | `code 404, message File not found` assustando no terminal | Era a busca pelo áudio da narração. `SimpleHTTPRequestHandler` registra isso por `log_error`, não `log_message` — o filtro antigo não pegava | Filtrados os dois, e o servidor passou a dizer no início se achou narração | 03 |
| B-06 | `dt` do primeiro quadro podia ser **negativo** | O carimbo de tempo do `requestAnimationFrame` às vezes precede o `performance.now()` lido logo antes dele | `if (!(dt > 0)) dt = 1/60` e teto de 0.05 | 02 |
| B-07 | Narração começava junto com o fade-in | As primeiras palavras tocavam com a tela ainda preta e a primeira legenda saía apagada | A voz espera o fade (encurtado para 1,6s) e entra com a tela em 80% | 03 |
| B-08 | Personagem parecia estar de costas | Torso simétrico e dois olhos simétricos. Simetria em vista lateral lê como "de costas" | Rosto 3/4 com um olho só, nariz na silhueta, orelha; torso assimétrico | 05 |
| B-09 | Braço esquerdo se camuflava no tronco | Ombro a 5px do centro e escurecimento a 0.62 | Ombro a 7px, escurecimento a 0.80. E pernas de trás ganharam escurecimento próprio (0.64) — braço precisa aparecer, perna precisa separar | 05 |
| B-10 | 🔥 Braços moles, "parece jogo de sandbox" | `easeInOut` em **cada** par de poses-chave: todo membro freava em todo quadro-chave | `ease: 'linear'` por animação, usado por andar, correr e socar. Amplitude de cotovelo reduzida à metade | 05 |
| B-11 | Personagem com contorno azul, "parece de neon" | Luz de contorno a 0.55 + luz de apoio azulada | Contorno para 0.30, apoio dessaturado, colete escurecido | 05 |
| B-12 | Carro saía dirigindo sozinho depois que o detetive descia | Fase `cardrive` herdada de quando o carro era táxi | Carro fica estacionado; farol apaga quando ele fecha a porta | 05 |
| B-13 | Sair do carro parecia contorção | Poses-chave com joelho a 104° e tronco a 26° simultâneos; a interpolação passava por posturas impossíveis | `getout` refeito como subida monótona | 05 |
| B-14 | Abafamento dos efeitos não funcionava | O duck e o controle de volume escreviam no **mesmo `AudioParam`**; um cancelava o outro conforme a ordem | Nó de duck separado, em série depois do barramento | 03 |
| B-15 | Voz inaudível debaixo da chuva | O arquivo tem pico em −14 dBFS e média em −41. `<audio>.volume` não passa de 1.0 | Roteada pelo WebAudio: ganho ×4 → limitador → barramento de voz | 03 |
| B-16 | Grão de filme deformava o rosto | Ruído em cima de um rosto de 14px come os pixels que desenham olho e boca | Grão e scanline **pulam o personagem** (recorte par-ímpar), 25% de força em cima dele | 06 |
| B-17 | Arma aparecia deitada | Desenhada com o cano no eixo X, mas dentro da cadeia do braço o eixo "para frente" é o **+Y local** | Girada 90°, e desenhada **antes** da mão para os dedos fecharem no cabo | 06 |
| B-18 | Rosto "desmanchava do nada" | Rotação da cabeça em ângulo qualquer reamostra um sprite de 14px e borra olho e nariz | Cabeça só gira em passos de 7°, máximo 14° | 06 |
| B-19 | Órbita vazia ao lado do olho | O rosto tinha 8px de pele com o olho no meio; a bochecha vazia lia como segunda órbita | Cabelo e costeleta trazidos para frente: 2px de bochecha, olho onde olho fica | 06 |
| B-22 | 🔥 Agachamento desfeito todo quadro | A máquina de estados do jogador via velocidade zero e forçava `idle` por cima da pose da cena | Cenas marcam `player.frozen`; `update()` só avança a animação | 07 |
| B-23 | Depósito e galpão pretos | Luz calculada para um espaço da metade do tamanho; no galpão a lâmpada estava a 150px do jogador, fora do raio | Ambiente elevado, lâmpada movida para cima de onde ele acorda, preenchimento no vão do meio | 07 / 08 |
| B-24 | 🔥 **O cano nunca quebrava (QTE invencível)** | Números calibrados contra o meu script de teste, que dispara a cada 2 quadros (30/s). Mão humana a 4 toques/s ganhava 0,232/s contra 0,20/s de queda: **saldo de +0,03/s, meio minuto de martelada** | 0,085 por toque contra 0,09/s de queda, mais catraca que impede cair abaixo do último quarto. 5 toques/s enchem em ~3s | 08b |
| B-25 | Sentar era instantâneo e vinha antes do sequestro | `idleAnim` substituía o parado por inteiro; e nunca era resetado, vazando para partidas novas | `idleMode` + o cronômetro de ócio roda primeiro (7s em pé). Transições `sitDown` / `standUp`. Reset em Novo Jogo | 08b |
| B-26 | Falas do despertar não eram lidas | Tocavam por trás das pálpebras fechadas | A cena só dispara as falas quando os olhos abrem de vez (`onAwake`) | 08 |
| B-27 | Balão "OLHAR" aparecia durante as cenas | Prompt de interação não sabia que havia cena rodando | Prompt desligado durante cena e QTE; falas sobem 16px quando o prompt está na tela | 07 / 08 |
| B-28 | Portas pequenas demais | 26×46 para um homem de 62px — ele entraria de quatro | 32×74, que é a proporção real de porta para pessoa | 08 |
| B-29 | Figura negra aparecia no galpão ao acordar | Ela continuava desenhada durante a fase `wake` e reaparecia junto com o jogador | Fica invisível ao entrar na fase `black` | 08b |
| B-30 | Fala entregava o susto | "Tem alguém atrás de mim, não tem?" — o detetive não pode perceber a figura, senão o jogador para de sentir que sabe mais que ele | Trocada por "Essa letra... eu conheço essa letra." | 08b |

### 12.3 — 🔍 Erros de método (meus, registrados para não repetir)

| ID | O que aconteceu |
|---|---|
| M-01 | **Afirmei que o áudio era o meu roteiro provisório** citando duas fronteiras com erro 0,00s. Aquelas duas eram zero **por construção** — a primeira e a última fronteira de um mapeamento acumulado sempre coincidem. O erro médio real era 0,94s contra ~1,8s de um chute aleatório. Não era prova, e apresentei como se fosse |
| M-02 | **Calibrei o QTE contra ritmo de script** (30 toques/s) em vez de mão humana. Resultado: mecânica tecnicamente vencível e praticamente impossível |
| M-03 | **Deixei o servidor de captura na porta 8137**, a mesma do `ABRIR_JOGO.bat`, e derrubei o jogo do jogador no meio de uma sessão. Usar 8140 |

**Severidade:** 🔥 Crítico · 🟠 Alto · 🟡 Médio · 🔵 Cosmético

---

## 13. ⚠️ RESSALVAS — O QUE PRECISA MUDAR

### 13.1 — Corrigido nesta sessão (08b)

| # | Ressalva | Status |
|---|---|---|
| R-01 | A fala "Tem alguém atrás de mim, não tem?" durante a aproximação **cortava o clima** — entregava o susto | 🟢 Trocada por "Essa letra... eu conheço essa letra." |
| R-02 | A figura preta aparecia na sala ao acordar e sumia do nada | 🟢 Sai de cena na fase `black` |

### 13.2 — 🟠 Precisa de atenção AGORA

| # | Ressalva | O que fazer |
|---|---|---|
| R-03 | **Áudio da narração não corresponde ao roteiro** | Exportar a gravação nova e substituir `assets/audio/narrator.mp3` |
| R-04 | **QTE precisa de teste humano** | Jogar a fuga do galpão e confirmar que o cano quebra num esforço razoável |
| R-05 | **`assets/reference/` está num repositório público** | São artes conceituais e capturas de terceiros. **Apagar** ou tornar o repositório privado |
| R-06 | **O detetive não tem nome** | Decisão sua. Trava a escrita dos diálogos do Capítulo 2 |

### 13.3 — 🟡 Precisa de atenção, mas não urgente

| # | Ressalva | Nota |
|---|---|---|
| R-07 | Save em 3 slots nunca foi testado a fundo em jogo real | Salvar, sair, carregar, conferir posição e progresso |
| R-08 | Sistema de diálogo com NPC existe e nunca foi usado | Só será validado quando houver o primeiro NPC |
| R-09 | Trecho do beco entre x≈550 e x≈1000 é visualmente vazio | Falta objeto de cenário nessa faixa |
| R-10 | Arma foi validada por script, não por mão humana | Mirar, atirar, recarregar, ficar sem bala |
| R-11 | O bar ainda é escuro em algumas faixas | Entre a lâmpada pendurada e o balcão |

### 13.4 — 🔵 Cosmético / mais para a frente

| # | Ressalva |
|---|---|
| R-12 | O clarão do disparo pode ainda estar forte (ajuste em `gfx.flash`, `js/systems/player.js`) |
| R-13 | Não há indicação na tela de que se pode correr com SHIFT |
| R-14 | A sala de teste só cobre animação; não há teste de áudio nem de luz |

---

## 14. ROADMAP — CAPÍTULO 2

### 📌 PRÓXIMO PASSO: **o roteiro do Capítulo 2**

> **VOCÊ vai escrever o roteiro do Capítulo 2.** Ele cobre a história e o que
> acontece durante a gameplay. Combinado em 04/08/2026.
>
> Enquanto ele não chega, **não começar a construir conteúdo novo do capítulo** —
> só correções e sistemas que servem para qualquer roteiro.

**O que o roteiro precisa dizer, para eu conseguir construir sem adivinhar:**

| Item | Por quê |
|---|---|
| **Onde ele está** | O Capítulo 1 termina com ele forçando a porta do galpão. O que tem do outro lado? |
| **Quem aparece** | O primeiro NPC. Nome, o que quer, o que esconde |
| **O que ele descobre** | A investigação precisa de pistas concretas |
| **Quais lugares novos** | Cada lugar são ~2 a 4 horas de trabalho de arte |
| **Onde entra o horror** | Momento em que a cabeça dele começa a vazar para o mundo |
| **Se ele recupera a arma** | Muda todo o balanço |
| **O nome do detetive** | Trava os diálogos |

### Escopo já preparado que o Capítulo 2 pode usar de graça

| Sistema | Estado |
|---|---|
| Caixa de diálogo com máquina de escrever, nome de quem fala, fila | 🟢 pronto, sem uso |
| Falas soltas em cima da cabeça | 🟢 em uso |
| Cenas roteirizadas (`scene-nota.js` é o molde) | 🟢 |
| QTE | 🟢 |
| Pálpebras, tensão por distância, silhueta negra | 🟢 |
| Save em 3 slots | 🟡 |
| Sistema de luz e ambiente por fase | 🟢 |

### Ordem sugerida depois do roteiro

1. Nome do detetive + primeiro NPC (valida o sistema de diálogo)
2. Escolhas de diálogo
3. Diário / investigação
4. Primeiro inimigo de verdade (os pesadelos)
5. Sanidade
6. Capítulos 3 e 4

---

## 15. DECISÕES TÉCNICAS

### 1. Rig articulado em vez de sprite sheet

Movimento contínuo a 60 fps sem desenhar 30 quadros à mão por animação, e
liberdade para sobrepor a mira. **Troca:** exige calibragem, senão vira boneco
de pano. Se um dia chegarem sprite sheets de verdade, é só outra implementação
de `_renderRig()` — o resto do jogo só chama `play()` e `draw()`.

### 2. Texto pixelado sem arquivo de fonte

A frase é desenhada com fonte do sistema num buffer minúsculo, os pixels são
lidos e **toda a suavização é jogada fora** (alpha vira 0 ou 255). Borda dura
igual fonte bitmap, com acento e cedilha funcionando — o que importa muito num
jogo PT/EN. Cada frase fica em cache; sem isso a máquina de escrever derreteria
o jogo.

### 3. A paleta é mais clara do que a realidade

A cena inteira é **multiplicada** pelo buffer de luz. Cor "realista" vira preto.
Foi preciso clarear pele, roupa, tijolo e asfalto até parecerem errados no
arquivo — e certos na tela.

### 4. Empacotador próprio em vez de concatenar

Cada módulo vira uma função num registro mínimo, mantendo escopo próprio.
Concatenar quebraria: `pixel.js` e `i18n.js` exportam os dois um `line`. Os
exports são registrados como *getters*, para que reatribuições (`i18n` troca
`lang`) continuem visíveis para quem importou.

### 5. A cutscene é dirigida pela narração, não por relógio

O carro anda enquanto a voz fala e freia quando ela acaba, qualquer que seja a
duração da gravação. Se o arquivo não existir, cai numa tabela de tempos escrita
à mão e continua funcionando.

### 6. Interface DEPOIS da luz

Se a interface for desenhada antes de `endLights()`, ela é multiplicada junto
com o cenário e o menu sai escuro. É a regra mais fácil de quebrar no projeto.

### 7. Pós-processamento poupa o personagem

Grão e scanline usam recorte par-ímpar: força total no cenário, um quarto em
cima dele. Ruído em cima de um rosto de 14px come justamente os pixels que
desenham o olho e a boca.

### 8. Tensão por distância, não por tempo

`setDread(k)` recebe um número derivado da distância da figura. É isso que faz
o jogador querer olhar para trás — um tema que sobe sozinho não tem essa
propriedade.

---

## 16. DÚVIDAS EM ABERTO

| # | Dúvida | Impacto |
|---|---|---|
| D-01 | **Qual o nome do detetive?** | Trava diálogos e a tela de save |
| D-02 | Ele recupera a arma no Capítulo 2? | Muda o balanço do jogo inteiro |
| D-03 | A figura negra é uma pessoa ou já é um pesadelo? | Define se o horror começa aqui ou depois |
| D-04 | Quem escreveu a nota? | "Essa letra... eu conheço essa letra" abre a pergunta |
| D-05 | O jogo terá múltiplos finais? | Muda a estrutura de flags de save |
| D-06 | Vai existir música original ou só ambiente sintetizado? | Se sim, precisa de arquivos |
| D-07 | Manter 5 horas ou cortar para 3 horas excelentes? | Recomendação minha: prefira 3 horas boas a 5 irregulares |

---

## 17. LOG DE SESSÕES

### Sessão 01 — 03/08/2026 · ~4h · ~350k tokens

Fundação inteira do jogo, do zero.

Motor de render 480×270 com luz, bloom, grão, vinheta, scanline e tremor.
Texto pixelado sem arquivo de fonte. Save em 3 slots com miniatura. Áudio
totalmente sintetizado. Rig do personagem com 9 peças e as primeiras
animações. Beco e bar construídos. Cutscene de abertura com carro, narração e
legendas. Menu de título como cena viva. Localização PT/EN. Sala de teste.

**Bugs corrigidos:** B-06 (dt negativo).

### Sessão 02 — 04/08/2026 · ~35min · ~60k tokens

Narração colocada no jogo. Legendas sincronizadas por análise do envelope de
volume do áudio. Projeto subiu para o GitHub (privado no início).

**Erro de método:** M-01 — afirmei que o áudio era o meu roteiro citando
fronteiras que eram zero por construção.

### Sessão 03 — 04/08/2026 · ~40min · ~70k tokens

Voz levantada +12 dB com limitador. Ambiente abafado durante a fala. Provado
com três verificações que o áudio **não** corresponde ao roteiro. Corrigido o
lançador (B-03, B-04, B-05). Criado `DIAGNOSTICO.bat`.

**Bugs corrigidos:** B-03, B-04, B-05, B-07, B-14, B-15.

### Sessão 04 — 04/08/2026 · ~1h10 · ~120k tokens

🔥 **Descoberto o B-01:** o jogo nunca tinha travado. Uma regra de CSS deixava
a tela de erro visível para sempre, com o jogo rodando atrás dela. Os três
sintomas que o jogador deu ("nada para copiar", "sai som", "o cursor some")
eram a resposta inteira.

🔥 **Resolvido o B-02:** `JOGO_OFFLINE.html`, arquivo único que roda com dois
cliques em qualquer máquina.

Personagem: rosto 3/4, torso assimétrico, braço de trás visível, contorno
reduzido. Animações: `ease: 'linear'`. Cigarro sem isqueiro, com "hoje não...".
Carro estacionado. Grão reduzido.

**Bugs corrigidos:** B-01, B-02, B-08, B-09, B-10, B-11, B-12, B-13.

### Sessão 05 — 04/08/2026 · ~50min · ~90k tokens

**Sobretudo marrom** — a maior mudança de leitura do projeto. Gola levantada
ligando cabeça e corpo. Olho com quatro pixels de funções diferentes. Sistema
de falas soltas com 19 linhas. **Bar destruído** de verdade, com o detetive
comentando a contradição das cadeiras empilhadas no meio do estrago.

### Sessão 06 — 04/08/2026 · ~40min · ~80k tokens

Sobretudo **fechado** (o aberto era vista de frente num jogo lateral).
**Arma completa**: coldre, sacar, mirar pelo mouse no eixo Y, atirar,
recarregar, contador de balas, fogo de boca como luz real, linha pontilhada de
mira. Rosto compactado, boca com cor própria, pós-processamento poupando o
personagem.

**Bugs corrigidos:** B-16, B-17, B-18, B-19.

### Sessão 07 — 04/08/2026 · ~45min · ~90k tokens

Trilha de sangue pelo bar. Depósito com a poça e a nota. **Cena da nota**:
ele lê de costas para a porta, a figura negra se aproxima, a tensão sobe com a
distância, o golpe corta a música em 10ms, pálpebras abrem com duas piscadas e
ele acorda algemado.

**Bugs corrigidos:** B-22, B-23 (parcial), B-27 (parcial).

### Sessão 08 — 04/08/2026 · ~50min · ~100k tokens

Som ambiente por lugar. Falas com prioridade. Falas durante a aproximação.
**Galpão** substituindo a sala genérica. **QTE de fuga**. Perda de todos os
pertences. Ócio virando sentar. Portas em tamanho de gente.

**Bugs corrigidos:** B-26, B-27, B-28, B-23.

### Sessão 08b — 04/08/2026 · ~30min

🔥 **B-24: o cano nunca quebrava.** Números do QTE calibrados contra ritmo de
script. Recalibrados para mão humana.

**B-25:** sentar era instantâneo e vinha antes do sequestro.

**R-01 e R-02:** fala que entregava o susto trocada; figura negra some ao
apagar a tela.

Escrito este documento mestre.

**Bugs corrigidos:** B-24, B-25, B-29, B-30.

---

## 18. GLOSSÁRIO

| Termo | O que é |
|---|---|
| **Bark** | Fala curta em cima da cabeça do personagem, sem caixa de diálogo e sem resposta |
| **Rig** | Esqueleto de peças articuladas que substitui a sprite sheet |
| **Pose-chave** | Conjunto de ângulos de todos os membros num instante; o jogo interpola entre elas |
| **`ease: 'linear'`** | Interpolação reta entre poses. É o que tira a moleza dos braços |
| **Buffer de luz** | Imagem separada onde a luz é somada; a cena é multiplicada por ela no fim |
| **Bloom** | Halo de luz, feito reduzindo o buffer de luz a 1/4 e ampliando de volta com suavização |
| **Duck** | Abaixar automaticamente um som para outro passar por cima (a chuva abaixa para a voz) |
| **Dread** | O tema de tensão comandado pela distância da figura negra |
| **QTE** | *Quick time event* — sequência de teclas sob pressão. Aqui: A + D alternado para arrebentar o cano |
| **Pálpebras** | `gfx.eyelid`, 0 fechado e 1 aberto, com borda curva |
| **Silhueta** | Personagem pintado de uma cor só; é como a figura negra é feita |
| **Catraca** | Trava que impede o progresso do QTE de cair abaixo do último quarto conquistado |
| **`enterBarksNow`** | Falas que disparam ao entrar na fase **cortando** o que estiver sendo dito |
| **Sala de teste** | Modo acessível pelo menu para percorrer todas as animações |

---

> **Última atualização:** 04/08/2026 — Sessão 08b
> **Próximo passo:** roteiro do Capítulo 2 (a ser escrito por Luiz)
