# Sumário — App de TV (SolidTV)

> Resumo do que foi entregue e verificado. Versões: [SUMARIO.md](SUMARIO.md) (pt-BR) · [SUMARIO.en.md](SUMARIO.en.md) (en) · [SUMARIO.es.md](SUMARIO.es.md) (es).

App criado do zero em `tv/` usando o framework **SolidTV** (renderização Canvas/WebGL, navegação por controle remoto), consumindo a API já publicada em `curso.ideias.casa`.

## O que foi entregue

- **Scaffolding** SolidTV: `package.json`, `vite.config.js`, `tsconfig.json`, `index.html`, `styles.css`, `.env`, `.nvmrc`, `pnpm-workspace.yaml` e fontes Roboto (TTF) em `public/fonts`.
- **Shell + menu lateral com exatamente 3 itens**: `Cursos`, `Categorias`, `Canais` (`src/components/Sidebar.tsx`, `src/pages/Shell.tsx`).
- **Login** por código `XXX-YYY` com teclado on-screen (`src/pages/Login.tsx`), token persistido em `localStorage`.
- **Cursos** (`src/pages/Cursos.tsx`): "Continue assistindo" + "Adicionados recentemente" + atalhos de categorias.
- **Categorias** (`src/pages/Categorias.tsx`): lista de categorias + grade de cursos paginada (10/página).
- **Canais** (`src/pages/Canais.tsx`): grade dos canais do usuário.
- **CursoDetail** + **Player** com shaka-player (`src/pages/Player.tsx`): retoma do progresso, grava `POST /progresso` a cada 10s, marca `concluido` ao terminar e oferece o próximo episódio.
- **READMEs** em pt/en/es e resumo do `AGENTS.md` atualizado.

## Verificações feitas no navegador (dev server em `http://localhost:5174/`)

- Tela de login renderiza, com acentos do português corretos (atlas MSDF substituído por `CanvasTextRenderer` + TTF, pois o MSDF do demo só cobre ASCII).
- Teclado on-screen: digitação, navegação por setas e submit funcionando.
- Fetch real contra `curso.ideias.casa` (CORS OK) e tratamento de 401.
- Shell autenticado, menu com 3 itens, item ativo destacado, navegação pela sidebar entre Cursos/Categorias/Canais.
- `ErrorBoundary` por página e proteção de leitura de resources com erro — uma falha de carregamento não trava a tela nem some com o menu.

## Ponto de atenção

Para ver as telas com conteúdo real é preciso um token válido: gere **um** token em `https://curso.ideias.casa/tv` e, sem recarregar a página depois, digite-o na tela de login do app. O token é único por usuário; cada novo token invalida o anterior. O backend e o contrato foram confirmados via `curl` (ex.: curso "Aprenda React", categoria "Desenvolvimento").
