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
| **Status** | 🟡 Sessão 09 — **Capítulos 1 e 2 jogáveis do início ao fim.** Aguardando teste humano completo |

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
J  ou  ESPAÇO ......... socar (com a ripa na mão, golpear)

BOTÃO DIREITO (segurar) saca a arma e mira
MOUSE ↑ / ↓ ........... levanta e abaixa o cano (horizontal é IGNORADO)
BOTÃO ESQUERDO ........ atirar               R ................... recarregar

--- Capítulo 2 ---
TAB ................... abre o casaco (inventário) — NÃO pausa o jogo
Q ..................... abre o caderno       M ................... o mapa
F ..................... isqueiro             SHIFT (escondido) ... prender a respiração
ARRASTAR / R .......... mover e girar item dentro do casaco
E (no casaco) ......... usar o item sob o cursor
E · ENTER · ESC · A · D · J ................. sair de um esconderijo

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
│   │   ├── levels.js          as 5 fases do Cap. 1 + carro + rua da cutscene
│   │   ├── levels-ch2.js      os 8 setores do Capítulo 2
│   │   └── fx.js              chuva, névoa, partículas, poeira
│   ├── systems/
│   │   ├── player.js          controle, arma, porrete, dano, falas, ócio
│   │   ├── dialogue.js        caixa de diálogo, ESCOLHAS, legendas, balão
│   │   ├── cutscene.js        abertura (carro + narração)
│   │   ├── scene-nota.js      cena da nota, figura negra, nocaute, despertar
│   │   ├── scene-espelho.js   o espelho em PRIMEIRA PESSOA (Cap. 2)
│   │   ├── sanity.js          o medidor que não aparece na tela
│   │   ├── journal.js         o caderno, e as páginas que ele não escreveu
│   │   ├── inventory.js       o inventário É O SOBRETUDO
│   │   ├── enemies.js         os 3 inimigos, o Credor e o DIRETOR
│   │   ├── npc.js             o Vigia e a Telefonista
│   │   └── chase.js           a perseguição do Credor
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
| `swing1` | 0.62s | ❌ | **linear** | 🟡 golpe de porrete, com quadro de espera |
| `swing2` | 0.70s | ❌ | **linear** | 🟡 volta de baixo para cima |
| `hurt` | 0.44s | ❌ | **linear** | 🟡 recuo de quem apanhou |
| `collapse` | 1.05s | ❌ | suave | 🟡 cair (usada pelos inimigos) |
| `crawl` | 0.94s | ✅ | **linear** | 🟡 **os Empilhados**, de quatro |
| `shamble` | 1.30s | ✅ | **linear** | 🟡 **os Sem-Rosto**, sem pressa |
| `dragWalk` | 1.12s | ✅ | **linear** | 🟡 **o Credor**, arrastando o cano |
| `hide` | 3.4s | ✅ | suave | 🟡 agachado num esconderijo |
| `sitChair` | 5.2s | ✅ | suave | 🟡 sentado numa cadeira (o Vigia) |
| `switchboard` | 4.6s | ✅ | suave | 🟡 a Telefonista trabalhando |

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

### Os inimigos — a ficha médica de um detetive

**`js/art/creatures.js`.** Na sessão 09 eles eram o detetive recolorido, e o
resultado era honesto: dois NPCs que eram *a mesma pessoa*, um sentado e o
outro quase de quatro. Agora cada criatura tem **as peças dela** — cabeça,
tronco, membros — e herda as animações do rig de graça.

A regra: nenhum pode ser um monstro genérico. Cada um tem que ser
reconhecível como **uma ideia**, e a ideia tem que ser um trauma que a
profissão dele produz.

| Quem | O trauma | O desenho |
|---|---|---|
| **Os Sem-Rosto** | as pessoas que ele não conseguiu salvar, e de quem já não lembra a cara | Roupa de trabalho comum. Crânio, cabelo e silhueta de gente — e **nenhum traço dentro do rosto**. Uma mancha escura no peito, onde ele não estancou nada |
| **Os Empilhados** | os corpos. Guardados com pressa, e mal | Dobrado sobre si mesmo, andando de quatro. Lençol de necrotério ainda amarrado, costelas marcando por baixo, e uma **etiqueta amarela amarrada no pé** |
| **O Ecoador** | a ligação que chegou tarde | Vulto magro e translúcido com um **fone de telefone preto no lugar do rosto**, arrastando um fio que não termina em lugar nenhum. Não ataca: TOCA |
| **O Credor** | a conta | Avental de açougueiro ensanguentado por cima do sobretudo, **cabeça de porco costurada em pano de saco**, e uma **motosserra** que nunca desliga |

> A motosserra começa a roncar no instante em que a fuga começa, do outro
> lado do galpão, e o volume dela **é a distância dele**. O jogador ouve o
> Credor muito antes de ver — que é a regra de ouro da perseguição.

**As duas pessoas** também têm desenho próprio: o **zelador** de macacão
verde desbotado que não larga o esfregão nem sentado, e a **telefonista** de
cabelo preso e vestido vinho com gola branca.

Duas técnicas sustentam a troca:

- **`det.parts`** — o rig procura cada peça no conjunto da criatura e cai no
  detetive para o que não estiver definido. Peça `null` simplesmente não é
  desenhada: é assim que os Sem-Rosto não têm gola nem coldre.
- **`tintPass`** (`pixel.js`) — continua existindo para recolorir sem apagar
  a sombra interna, com buffer próprio para não brigar com a luz de contorno.

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
| **Galpão (cela)** | `hall` 0.11 · `wind` 0.022 | gota 3.5–9s · metal 11–26s · batida distante 22–50s · corrente 17–40s |
| Corredor de carga | `hall` 0.12 · `wind` 0.02 | gota · metal · batida · corrente |
| Escritório | `roomtone` 0.10 | gota a cada 8–20s |
| Estantes | `hall` 0.10 | metal 8–20s · batida 18–40s |
| Vestiário | `roomtone` 0.11 | gota a cada 9–22s |
| **Câmara fria** | `freezer` 0.13 | metal 7–18s · gota 5–13s |
| Sala de máquinas | `hall` 0.09 · **`hum` 0.05** | metal · batida |
| Mezanino | `hall` 0.10 · `wind` 0.03 | metal · corrente |
| **Doca 3** | `hall` 0.07 · **`rain` 0.05** | trovão a cada 20–50s |

> A chuva **volta a ser ouvida na doca**, abafada. É o primeiro sinal, em uma
> hora inteira de jogo, de que existe um lado de fora.

### Sons novos do Capítulo 2

`clubHit` (madeira em corpo, mais seca e grave que o soco) · `clubBreak` (dois
estalos, o segundo mais grave — madeira nunca racha de uma vez) · `phoneRing`
(campainha de martelo contra sino, com abafamento por distância) · `whisper` ·
`writing` · `pageTurn` · `machineStart` · `dragMetal` · `lockerBang` ·
`breath` (com modo "presa") · loops `hum` e `freezer`.

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
| Sistema de diálogo com NPC | 🟢 **com escolhas, e com dois NPCs usando** |
| Sala de teste de animação | 🟢 |
| **CAPÍTULO 2 — os 8 setores** | 🟡 construídos e percorridos por script |
| Sanidade (4 estados, sem barra) | 🟡 recalibrada na 09, **falta sentir jogando** |
| Caderno / diário | 🟡 |
| Inventário (o sobretudo) | 🟡 arrastar com o mouse, **falta mão humana** |
| Inimigos (3 tipos) + Diretor | 🟡 |
| Combate com porrete | 🟡 |
| O espelho em primeira pessoa | 🟡 |
| A perseguição do Credor | 🟡 |
| A escada do cigarro (degrau 1) | 🟢 quatro recusas ciclando |

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
| F-18 | Os 8 setores do Cap. 2 montam no boot sem erro | 29 módulos empacotados, 521 KB |
| F-19 | Diálogo com escolhas | Vigia: 3 perguntas, "EU\|" vira fala do detetive; pergunta já feita fica apagada na lista |
| F-20 | Item pego SOME do cenário | `itensSoltos()`: ripa, munição, maço, pistola, caderno, mapa |
| F-21 | Combate com porrete fecha | Empilhado de 3 de vida morre em 3 golpes; a ripa cai para 0.62 de vida |
| F-22 | Emboscada da pistola | Luzes a 25%, `machineStart`, 3 Sem-Rosto pela porta de entrada |
| F-23 | Escada do cigarro | 4 recusas em ciclo, disparadas ao usar o maço dentro do casaco |
| F-24 | Alucinação da câmara fria | 5 fases: balanço → "tem algo ali" → isqueiro → casaco → apaga → não tem nada |
| F-25 | Perseguição entre setores | O Credor entra na fase do jogador ~6s depois, pelo lado de fora da tela |
| F-26 | Esconder e prender a respiração | Barra de fôlego, batimento pela distância, `E` para sair |
| F-27 | A câmera SOBE durante conversa com NPC | `cam.offsetY = 40`; sem isso a caixa de diálogo tapava quem estava falando |
| F-28 | Gente ganha de móvel no `nearest()` | `prio`: NPC 2, pegar/porta 1, examinar 0 |

---

## 11. O QUE NÃO FUNCIONA / FALTA

### 🔴 Bloqueado

| Item | Motivo |
|---|---|
| Sincronia real da narração | Falta a gravação que corresponde ao roteiro. **Só você pode destravar** |

### ⚪ Não começado (escopo futuro, não é pendência)

| Item | Nota |
|---|---|
| Sobrenome do David | Só fará falta quando aparecer um documento, uma ficha ou uma lápide |
| Capítulos 3 e 4 | O Capítulo 3 precisa do **degrau 4 da escada do cigarro** |
| Música original | Só o piano do menu existe |
| Dublagem | Nenhuma além da narração |
| Gamepad | Estrutura de input permite, não implementado |
| Empilhar item igual no inventário | Duas caixas de munição ocupam dois espaços |
| Mapa desenhado à mão no caderno | A categoria LUGARES existe e está vazia |

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
| B-31 | 🔥 **Corredor de carga preto** — o setor que existe para MOSTRAR o tamanho do lugar era onde não se via nada | O mesmo erro do B-23, de novo: luz calibrada para uma sala usada num corredor de 1700px. Lâmpadas a 450px uma da outra deixam o meio do caminho preto | Ambiente de `#1c212b` para `#2a3242`; lâmpada forte a cada ~400px **mais preenchimento fraco a cada ~200px na altura do chão**. Mesma correção nas Estantes, Máquinas e Mezanino | 09 |
| B-32 | 🔥 **A sanidade zerava em meio minuto** | Escuro tirava 1,35/s e ver um inimigo 1,6/s. Trinta segundos no Setor B levavam o medidor de 100 a 16 — o capítulo acabaria no estado RENDIDO antes do vestiário | Escuro 0,45/s (e só depois de 3s parado), ver inimigo 0,5/s, câmara fria 0,9/s, escondido 1,1/s. Setor seguro devolve 1,6/s e escrever no caderno +7 | 09 |
| B-33 | Item continuava desenhado depois de pego | Cenário é pintado uma vez na camada e só deslocado — pixel pintado não some. A ripa continuava encostada na coluna depois de ele levar a ripa embora | `itensSoltos()`: esses poucos objetos passam a ser desenhados por quadro, e só enquanto ainda estão lá | 09 |
| B-34 | Inimigo tingido ficava sem luz de contorno | `tintPass` e `rimPass` gravavam no MESMO buffer auxiliar; um apagava o outro | Buffer próprio para o tingimento (`tintBuf`) | 09 |
| B-35 | Os Empilhados eram um borrão claro rastejando | Tingimento a 0.78 cobre quase toda a sombra interna do boneco e o corpo perde volume | `tintK` para 0.62, e o tom clareado (a cena é multiplicada pela luz: cor "realista" vira preto) | 09 |
| B-36 | A mesa telefônica ganhava da telefonista | `nearest()` escolhia só por distância, e o móvel estava 2px mais perto do que a mulher sentada nele. O jogador examinava a mesa a noite inteira sem conseguir falar com ela | Campo `prio`: gente 2, pegar/porta 1, examinar 0 | 09 |
| B-37 | Quem falava ficava escondido atrás da própria fala | A caixa de diálogo ocupa o terço de baixo, e o chão fica em y≈254 | `cam.offsetY = 40` enquanto há conversa com NPC | 09 |
| B-38 | Painel de escolhas cobria o nome do falante | O nome é desenhado 12px acima da caixa, e o painel começava 5px acima dela | Vão de 16px | 09 |
| B-39 | A ripa encostava no chão e sumia dentro do assoalho | Sprite de 15px saindo de uma mão que fica a ~20px do chão | 12px | 09 |
| B-40 | O casaco pendurado no gancho não aparecia | Ele era desenhado num ponto que a chama do isqueiro não alcança — o jogador ouvia "um casaco, marrom" e não via nada | Luz fraca própria no gancho enquanto `casaco > 0` | 09 |
| B-41 | O portão da doca lia "13" | Uma barra vertical desenhada ao lado do "3" | Barra removida | 09 |
| B-42 | 🔥 **O save não salvava — só teleportava** | O save guardava fase, X e os itens pegos **da sala atual**. Tudo o mais era o que estivesse na sessão. Carregar no meio da fuga devolvia o galpão apagado, com a música de tensão, **sem o Credor**, sem o porrete e com o portão da doca fechado: o capítulo ficava impossível de terminar | Save versão 2: estado de **todos** os setores (`_estadoDoMundo`), a perseguição inteira (`chase.save/load`, inclusive quais setores já estavam no escuro), inventário, caderno, sanidade, vida, munição e tentativas de cigarro | 10 |
| B-43 | 🔥 **Preso no esconderijo, com o Credor girando em cima** | Duas falhas somadas: `dir` invertia de sinal a cada quadro quando ele estava exatamente em cima do jogador, e `setFacing` refazia a virada — daí o giro. E sair só respondia ao `E` | Zona morta de 14px no alvo do Credor; sair agora aceita **E, ENTER, ESC, A, D e J**, e empurra o jogador 16px na direção contrária à de quem está caçando | 10 |
| B-44 | 🔥 **O porrete e a bala não acertavam** | Tudo era distância em X. Um bicho andando de quatro ocupa 34px de altura e não 62, e ninguém checava altura nenhuma. Pior: o tiro **descartava qualquer ângulo acima de 22°**, ou seja, mirar para baixo — o único jeito de acertar quem está no chão — era erro garantido | Cada criatura declara `altura`/`largura`; o golpe virou sobreposição de caixa (`caixaGolpe` desce até o chão) e a bala virou uma reta de verdade testada contra a caixa (`naLinhaDoTiro`) | 10 |
| B-45 | 🔥 **O Credor não matava** | `chase.onDano` nunca foi ligado no jogo. Ele chegava, encostava e não acontecia nada | Ligado, com recarga de 1,6s e um `stun` de 1,5s nele depois de acertar — é essa janela que dá para correr | 10 |
| B-46 | 🔥 **Trocar de sala não adiantava: ele já estava lá** | `chegada` era acertado uma vez, no começo. Depois da primeira chegada ficava em zero, e cada porta atravessada punha o Credor em cima do jogador no mesmo quadro | `chegada` volta a 7–11s **toda vez** que o jogador muda de setor | 10 |
| B-47 | 🔥 O efeito da perseguição tapava a tela | Vinheta chegava a 2,15 (0,9 + k·0,75 + pulso·0,5) e o tremor da sanidade disparava **a cada quadro** no estado VAZANDO | Vinheta com teto de 1,35, pulso com um quarto da força, grão pela metade, e o tremor contínuo **removido** — agora só há tremor em baque grande (≥8 de dano) | 10 |
| B-48 | **O mouse não existia no inventário** | `body.playing { cursor: none }` esconde o ponteiro do sistema, e não havia cursor desenhado. O inventário era de arrastar e ninguém via o que arrastava | Cursor de pixel desenhado dentro do jogo, vermelho enquanto arrasta; se o mouse ainda não se moveu, ele começa no meio da tela | 10 |
| B-49 | O mapa era um item sem tela | Nunca foi feita a interface | `M` abre a planta baixa: papel dobrado, setores em caixinha, só o que ele já pisou, o atual em vermelho e a marca a lápis na doca 3 | 10 |
| B-50 | O espelho ficava acima da cabeça dele | Pendurado em y=44 na parede do vestiário — dois metros do chão | Mudou de sala: agora é um **banheiro**, com o espelho em cima da pia, na altura do rosto de um homem em pé | 10 |
| B-51 | As falas sumiam antes de dar para ler | 2,6s fixos para qualquer frase, e a fila engatilhava três de uma vez ao entrar numa sala | Duração pelo **tamanho do texto** (2,6s a 7,0s), respiro de 0,9s entre falas, fila com teto de 2, e a primeira espera 1s pelo fade-in acabar | 10 |
| B-52 | Texto ilegível em várias falas | Georgia a 10px atravessa o corte duro de alpha e perde os traços finos | Fonte `type` (Courier, negrito) em toda fala, diálogo, caderno e interface — haste grossa é o que sobrevive ao corte, e é a letra de relatório policial | 10 |

### 12.3 — 🔍 Erros de método (meus, registrados para não repetir)

| ID | O que aconteceu |
|---|---|
| M-01 | **Afirmei que o áudio era o meu roteiro provisório** citando duas fronteiras com erro 0,00s. Aquelas duas eram zero **por construção** — a primeira e a última fronteira de um mapeamento acumulado sempre coincidem. O erro médio real era 0,94s contra ~1,8s de um chute aleatório. Não era prova, e apresentei como se fosse |
| M-02 | **Calibrei o QTE contra ritmo de script** (30 toques/s) em vez de mão humana. Resultado: mecânica tecnicamente vencível e praticamente impossível |
| M-03 | **Deixei o servidor de captura na porta 8137**, a mesma do `ABRIR_JOGO.bat`, e derrubei o jogo do jogador no meio de uma sessão. Usar 8140 |
| M-04 | **Repeti o B-23 inteiro** (sessão 09): construí o corredor de carga com luz calibrada para uma sala, num espaço 3× maior. A lição já estava escrita neste documento e eu não a apliquei. **A regra agora é numérica, não é sensibilidade:** lâmpada forte a cada ~400px e preenchimento fraco a cada ~200px na altura do chão, em qualquer fase maior que 800px |
| M-05 | **Escrevi números de sanidade sem medir** (sessão 09). Trinta segundos de jogo levavam o medidor de 100 a 16. Números de ritmo têm que ser medidos rodando, e não escolhidos porque "parecem certos" — é o mesmo erro do M-02 com outra roupa |
| M-06 | **Declarei a sessão 09 "testada" tendo testado só o que não trava** (sessão 10). Meus scripts percorreram os oito setores e não acharam um erro sequer — porque script não salva no meio da fuga, não se esconde de nada, não erra um golpe e não repara que o mouse é invisível. Os quatro bugs fatais estavam todos em coisas que só uma **pessoa jogando** faz. "Zero erros no laço" nunca foi sinônimo de "funciona": só quer dizer que nada explodiu. Testar sozinho vale para regressão, não para validação — **é do jogador que vem a validação, e eu preciso dizer isso em vez de escrever ✅** |

**Severidade:** 🔥 Crítico · 🟠 Alto · 🟡 Médio · 🔵 Cosmético

---

## 13. ⚠️ RESSALVAS — O QUE PRECISA MUDAR

### 13.1 — Corrigido nas sessões 09 e 10

| # | Ressalva | Status |
|---|---|---|
| R-06 | O detetive não tinha nome | 🟢 **DAVID** (pronúncia inglesa). Sobrenome continua em aberto, e por enquanto não faz falta: ninguém neste jogo pergunta o nome dele |
| R-15 | O corredor de carga estava preto | 🟢 B-31 |
| R-16 | A sanidade zerava em meio minuto | 🟢 B-32 |
| R-17 | Item pego continuava no cenário | 🟢 B-33 |
| R-18 | O Capítulo 2 nunca tinha sido jogado por uma pessoa | 🟢 Foi, na sessão 10 — e trouxe doze problemas, quatro fatais |
| R-20 | O inventário nunca tinha visto um mouse | 🟢 B-48 |
| R-21 | Os NPCs eram o detetive com outra cor | 🟢 Zelador e telefonista com peças próprias |
| R-22 | Os inimigos não eram ideia nenhuma | 🟢 `creatures.js` — cada um é um trauma da profissão |
| R-23 | O Credor era a mesma silhueta preta do Cap. 1 | 🟢 Máscara de porco, avental e motosserra |

### 13.2 — 🟠 Precisa de atenção AGORA

| # | Ressalva | O que fazer |
|---|---|---|
| R-03 | **Áudio da narração não corresponde ao roteiro** | Exportar a gravação nova e substituir `assets/audio/narrator.mp3` |
| R-04 | **QTE precisa de teste humano** | Jogar a fuga do galpão e confirmar que o cano quebra num esforço razoável |
| R-05 | **`assets/reference/` está num repositório público** | São artes conceituais e capturas de terceiros. **Apagar** ou tornar o repositório privado |
| R-19 | **A duração de 1 hora continua sendo estimativa** | Cronometrar uma partida de verdade. Se der 25 minutos, faltam objetos para examinar, não faltam corredores |
| R-24 | 🔥 **Nada da sessão 10 foi jogado por uma pessoa ainda** | Salvar no meio da fuga, sair de um esconderijo com o Credor em cima, bater num Empilhado, arrastar item no casaco: tudo isso foi verificado por script e por captura de tela. **Foi exatamente esse tipo de coisa que escondeu os quatro bugs fatais da sessão 09** (ver M-06) |
| R-25 | **O save vive no `localStorage`, não numa pasta** | Você pediu uma pasta `saves/` no jogo. Um jogo que roda por `file://` **não pode escrever no disco** — o navegador proíbe, e é por isso que ele roda com dois cliques sem instalar nada. O `localStorage` é permanente e sobrevive a fechar o jogo, mas é do navegador: limpar dados do site apaga. **Se quiser arquivo de verdade, dá para fazer botões EXPORTAR/IMPORTAR** que baixam e leem um `.save` — diga e eu faço |
| R-26 | **O fim do capítulo nunca foi visto por uma pessoa** | Ele existe: chegar na doca 3 durante a fuga dispara as três falas e o Credor parado olhando. Só nunca foi alcançado jogando |

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

## 14. ROADMAP — O QUE VEM AGORA

### 📌 PRÓXIMO PASSO: **jogar o Capítulo 2 inteiro, com as mãos**

> Tudo abaixo foi construído e percorrido **por script**, não por uma pessoa.
> O que só mão humana mede: se uma hora é uma hora, se o combate é justo, se
> a sanidade incomoda na medida, e se a fuga assusta ou irrita.
>
> Abrir `JOGO_OFFLINE.html`, jogar do começo ao fim, e anotar onde entedia.

### O Capítulo 2, como ficou

```
 1 CORREDOR DE CARGA  1700px  revela a escala. O PORRETE.        Sem-Rosto
 2 ESCRITORIO          560px  o CADERNO, o MAPA, o ZELADOR.      respiro
2b ARQUIVO MORTO       620px  a gaveta do D. A CHAVE.            Sem-Rosto
 3 SETOR B: ESTANTES  1500px  primeiro combate. A MUNICAO.       Empilhados + Sem-Rosto
 4 VESTIARIO          1150px  o MACO.                            respiro
4b BANHEIRO            420px  ★ O ESPELHO.                       respiro
 5 CAMARA FRIA         900px  o isqueiro. A alucinacao.          Empilhados
 6 SALA DE MAQUINAS    950px  a PISTOLA, e a emboscada.          Sem-Rosto
 7 MEZANINO           1000px  a TELEFONISTA.                     ninguem
 8 DOCA 3              760px  a saida, e quem fica olhando.      ninguem
```

> A escada do mezanino fica **trancada**. A chave está no arquivo morto, do
> outro lado do galpão — e como a perseguição só começa quando ele desce de
> lá, isso garante que o Credor nunca apareça com o detetive de mãos vazias.

### Sistemas novos, e o que cada um ainda deve

| Sistema | Estado | O que falta |
|---|---|---|
| Sanidade (4 estados) | 🟡 | sentir jogando. Números recalibrados na 09 |
| Caderno | 🟡 | 17 páginas escritas; 3 são "as que ele não escreveu" |
| Inventário (o sobretudo) | 🟡 | arrastar com um mouse de verdade |
| Inimigos + Diretor | 🟡 | ver se o teto de 3 e os 40–60s de silêncio bastam |
| Combate com porrete | 🟡 | 3 golpes matam um Empilhado; a ripa dura ~9 golpes |
| Perseguição do Credor | 🟡 | conferir se dá para escapar sem ser injusto |
| Diálogo com escolhas | 🟢 | — |
| O espelho em 1ª pessoa | 🟡 | é uma carta que só se joga uma vez |

### Ordem sugerida depois do teste

1. **Ajustar o ritmo do Capítulo 2** com base no que a mão humana disser
2. Gravar a narração que corresponde ao roteiro (R-03 destrava sozinho)
3. Escrever o Capítulo 3 — e nele o **degrau 4 da escada do cigarro**, que é
   onde o personagem finalmente cede
4. Sobrenome do David, quando aparecer um documento que precise dele
5. Capítulo 4 e a revelação da letra

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
| ~~D-01~~ | ~~Qual o nome do detetive?~~ | ✅ **DAVID**, pronúncia inglesa. Sobrenome em aberto |
| ~~D-02~~ | ~~Ele recupera a arma no Capítulo 2?~~ | ✅ **Sim, na Sala de Máquinas** — e paga por ela |
| D-03 | A figura negra é uma pessoa ou já é um pesadelo? | Define se o horror começa aqui ou depois. O Capítulo 2 escolheu não responder |
| D-04 | Quem escreveu a nota? | "Essa letra... eu conheço essa letra". O caderno já plantou a resposta: a letra é dele mesmo, de sete anos atrás |
| D-05 | O jogo terá múltiplos finais? | Muda a estrutura de flags de save |
| D-06 | Vai existir música original ou só ambiente sintetizado? | Se sim, precisa de arquivos |
| D-07 | Manter 5 horas ou cortar para 3 horas excelentes? | Recomendação minha: prefira 3 horas boas a 5 irregulares |
| D-08 | **O Credor volta no Capítulo 3?** | Ele foi embora "sem cobrar hoje". Isso é uma promessa, e promessa não paga irrita |
| D-09 | **Onde exatamente o cigarro destrava?** | O degrau 4 é uma das cenas mais importantes do jogo inteiro. Não pode ser num corredor qualquer |

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

### Sessão 09 — 04/08/2026 · ~3h

🎬 **O CAPÍTULO 2 INTEIRO — "GENTILEZA".**

Luiz entregou o roteiro (`ROTEIRO.txt`) e travou as quatro decisões que
faltavam: a **Telefonista** no mezanino, **os três inimigos**, a **emboscada**
ao pegar a pistola, e o fim na **doca com o Credor olhando**.

**Oito setores novos** (`levels-ch2.js`, ~1300 linhas): corredor de carga,
escritório, estantes, vestiário, câmara fria, sala de máquinas, mezanino,
doca. Com pincéis industriais novos — estante de três níveis, empilhadeira,
portão de doca, relógio de ponto parado em 02h14, armários de vestiário,
ganchos de açougue, caldeiras, mesa telefônica, porta de câmara fria.

**Seis sistemas novos:**

- `sanity.js` — quatro estados, **sem barra na tela**. O medidor é a própria
  imagem: a vinheta fecha, o som mente, e aparecem coisas que não estão lá.
- `journal.js` — ele anota sozinho, com animação de escrita à mão. E abaixo
  de 50 começam a aparecer **páginas que ele não escreveu**.
- `inventory.js` — o inventário **é o sobretudo**, visto por dentro. Não pausa
  o jogo. O porrete não cabe em bolso nenhum.
- `enemies.js` — Empilhados, Sem-Rosto, Ecoador e o Credor, todos feitos do
  mesmo rig do detetive usado errado. Mais o **Diretor**, que decide quando
  vale a pena pôr alguém em cena (teto de 3, nunca no campo de visão,
  40–60s de silêncio depois de uma briga).
- `chase.js` — a perseguição. As luzes apagam setor por setor vindo na
  direção dele, e o som do cano arrastando chega **antes** dele.
- `scene-espelho.js` — a única cena em primeira pessoa do jogo.

**Onze animações novas** no rig, mais `tintPass` para recolorir sem apagar a
sombra interna. **Diálogo com escolhas.** **Onze sons novos**, e os loops
`hum` e `freezer`.

**Bugs corrigidos:** B-31 a B-41.
**Erros de método:** M-04 (repeti o B-23 inteiro), M-05 (números de ritmo
escritos sem medir).

### Sessão 10 — 04/08/2026 · ~3h · a sessão do primeiro teste humano

Luiz jogou o Capítulo 2 e trouxe **doze problemas**, quatro deles capazes de
travar a partida. Esta sessão é inteira sobre eles.

🔥 **O save não salvava.** Ele anotava a fase e o X e teleportava o
personagem; o resto do mundo ficava como estivesse. Carregar no meio da fuga
devolvia um galpão apagado, com a música de tensão tocando, sem o Credor,
sem o porrete e com a saída fechada. Agora o save carrega o **mundo inteiro**
— todos os setores, todos os itens já pegos, e a perseguição em curso.
Mais uma **tela de carregamento** de 9,5s, com quatro frases da narração.

🔥 **Preso no esconderijo.** O Credor parava em cima do jogador e girava para
sempre (o sinal da direção invertia a cada quadro), e sair só respondia ao
`E`. Zona morta de 14px, e agora seis teclas diferentes tiram você de lá.

🔥 **O combate não acertava.** Tudo era distância em X — quem anda de quatro
tem 34px de altura e ninguém checava altura nenhuma. E o tiro descartava
qualquer ângulo acima de 22°, ou seja, mirar para baixo era erro garantido.
Caixas de colisão de verdade, e a bala virou uma reta.

🔥 **O Credor não matava.** O gancho de dano nunca tinha sido ligado.

🎨 **Design novo para tudo que é gente ou quase.** `js/art/creatures.js`:
os Sem-Rosto (as pessoas que ele não salvou), os Empilhados (os corpos, com
lençol e etiqueta no pé), o Ecoador (fone de telefone no lugar do rosto) e
o Credor (avental de açougueiro, cabeça de porco em pano de saco,
motosserra que nunca desliga). Mais o zelador e a telefonista.

Também: **duas barras** no topo (CORPO e CABEÇA), **o mapa** em `M`, **cursor
no inventário**, **fonte de máquina de escrever** em todo texto falado,
falas com duração pelo tamanho do texto, o efeito da perseguição reduzido,
**duas salas novas** (o banheiro — onde o espelho agora fica na altura do
rosto — e o arquivo morto), e **a chave** que tranca a escada do mezanino
até ele estar armado.

**Bugs corrigidos:** B-42 a B-52.
**Erro de método:** M-06.

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
| **Diretor** | Quem decide quando vale a pena pôr um inimigo em cena. Não é gerador de ondas |
| **Migalha** | Uma coisa que não fecha, plantada sem comentário. Sete famílias delas, listadas no ROTEIRO |
| **A escada do cigarro** | O cigarro é item, e ele não consegue fumar até o Capítulo 3. Cada tentativa é uma recusa diferente |
| **`tintPass`** | Recolore o boneco inteiro sem apagar a sombra de dentro. É como um NPC deixa de ser o detetive |
| **`itensSoltos`** | Os poucos objetos desenhados por quadro, porque precisam sumir quando pegos |
| **Conveniência** | A regra do Capítulo 2: tudo que ele precisa aparece na hora exata. Não é preguiça de design — é enredo, e ele comenta |

---

> **Última atualização:** 04/08/2026 — Sessão 10
> **Próximo passo:** 🔥 **jogar de novo, e principalmente: salvar no meio da
> fuga, esconder-se com ele em cima, e chegar até a doca 3.** Foram esses os
> quatro caminhos que travaram da última vez — ver R-24 e M-06.
