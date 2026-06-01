# Projeto para assistir Cursos

> Este arquivo é a fonte da verdade para todas as IA.

Este projeto é um site, um aplicativo para todas as TV's e um backend para o aplicativo.
Para assistir Cursos, os publicadores de cursos poderão acessar o site e enviar seus conteúdos e quais emails tem acesso a cada episódio do curso.
Tanto o Site quanto o Aplicativo de TV, vai mostrar quais Canais disponíveis ele tem e quais cursos estão disponíveis.
Cada Publicadora vai informar os links de seus recursos. O backend vai validar se os links são imagens e videos nos tamanhos corretos.
E assim marcar como publicado.

Estado atual:
- O **backend** (Cloudflare Workers + React Router, em `site`) está implementado e publicado em `curso.ideias.casa`, incluindo a API da TV em `api/v1/tv/*` (home, cursos, categorias, canais, episódios, progresso), autenticação por token `XXX-YYY` (página `/tv`), as tabelas `Categoria`/`CursoCategoria`, o campo `data_publicacao` em `Curso`/`Episodio` e o CRUD global de categorias no painel administrativo.
- O **aplicativo de TV** (framework SolidTV, em `tv`) está implementado: login por código, menu lateral com 3 itens (Cursos com "Continue assistindo" + recentes, Categorias e Canais), detalhe do curso e player de vídeo (shaka-player) com retomada e gravação de progresso. Rodar com `cd tv && pnpm install && pnpm start`. Ver [tv/README.md](tv/README.md).

> Lembre-se, que este resumo `acima` deve-se ser atualizado !sempre!.

## Diretrizes para o desenvolvimento:

- diretório `tv` será o projeto TV
- diretório `roku` será para o projeto Roku, que ainda não vai ser feito.
- diretório `site` para o site e o backend.
- Eu vou escrever muitas coisas em português do Brasil porque é minha lingua nativa, mas toda documentação que esteja fora do AGENTS.md, por favor deixe assim:
    - README.md - Em português do Brasil
    - README.en.md - Em inglês
    - README.es.md - Em espanhol
- Os nomes dos arquivos "README" são um exemplo como toda documentação deve ser feita em arquivos Markdown (Gráficos em Mermaid JS) e traduzidas nessas línguas usando esse formato de arquivo.
- wrangler.jsonc - tem os recursos e variáveis de ambiente desse projeto conectado na Cloudflare.
- Variáveis de ambiente da Cloudflare (bindings) devem estar em MAIÚSCULO e os nomes dos recursos (bucket/queue) em minúsculo. Exemplo: (Queue) foi renomeada para `mqcfgateway` (Binding: `MQCFGATEWAY`).
- Todas as Rotas do React Router: "site/src/front/routes.ts"
- Todas as rotas do React Router tem um arquivo de inicialização aqui: "site/src/front/routes"
- O Arquivo de inicialização "site/src/front/routes" deve conter apenas um facade para referenciar funcoes externas. Use o exemplo "panel.ts" e o "panel.tsx" para entender como fazer.
- Os modulos do backend devem ficar em "site/src/front/.server" use de exemplo o Panel: "site/src/front/.server/panel"
- Qualquer SQL que for usado no sistema, não deve ficar em formato de string dentro de arquivos TypeScript. Em vez disso, coloque-as centralizadas no arquivo `database.jsonc` que deverá ficar no mesmo diretorio do arquivo TS do backend (site/src/front/.server/*).
- As rotas de autenticação/login devem seguir o padrão: `login/google` e `login/callback`.
- Para fazer deploy do site na Cloudflare, execute sempre o comando `pnpm run deploy` dentro do diretório `site`.
- Ao criar ou modificar testes unitários, os resultados da execução desses testes devem ser incluídos no corpo do pull request. No entanto, arquivos `.log` ou `.txt` (como `pr_comments.txt` ou saídas de log) usados para armazenar temporariamente esses resultados NÃO devem ser "comitados", para não sujar o histórico do git.
- É obrigatório manter os testes (e2e, unitários) e os documentos (READMEs, relatórios de teste) atualizados sempre que houver novas implementações ou alterações de código.


# A Arquitetura do aplicativo para todas as TV's são esses:
- https://solid-tv.github.io/solid/#/essentials/ai_context
- [AI_CODING_GUIDELINES.md](AI_CODING_GUIDELINES.md)
- [Demo TV App](https://github.com/solid-tv/solid-demo-app)

# O backend será feito para cloudflare
- https://developers.cloudflare.com/agents/model-context-protocol/mcp-servers-for-cloudflare/
- [MCP Docs](https://docs.mcp.cloudflare.com/mcp)
- [CF_Workers.md](CF_Workers.md)
