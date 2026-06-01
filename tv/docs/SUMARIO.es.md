# Resumen — App de TV (SolidTV)

> Resumen de lo entregado y verificado. Versiones: [SUMARIO.md](SUMARIO.md) (pt-BR) · [SUMARIO.en.md](SUMARIO.en.md) (en) · [SUMARIO.es.md](SUMARIO.es.md) (es).

App creada desde cero en `tv/` usando el framework **SolidTV** (renderizado Canvas/WebGL, navegación por control remoto), consumiendo la API ya publicada en `curso.ideias.casa`.

## Qué se entregó

- **Scaffolding** SolidTV: `package.json`, `vite.config.js`, `tsconfig.json`, `index.html`, `styles.css`, `.env`, `.nvmrc`, `pnpm-workspace.yaml` y fuentes Roboto (TTF) en `public/fonts`.
- **Shell + menú lateral con exactamente 3 ítems**: `Cursos`, `Categorias`, `Canais` (`src/components/Sidebar.tsx`, `src/pages/Shell.tsx`).
- **Login** por código `XXX-YYY` con teclado en pantalla (`src/pages/Login.tsx`), token persistido en `localStorage`.
- **Cursos** (`src/pages/Cursos.tsx`): "Continuar viendo" + "Agregados recientemente" + accesos directos de categorías.
- **Categorías** (`src/pages/Categorias.tsx`): lista de categorías + grilla de cursos paginada (10/página).
- **Canales** (`src/pages/Canais.tsx`): grilla de los canales del usuario.
- **DetalleCurso** + **Player** con shaka-player (`src/pages/Player.tsx`): reanuda desde el progreso, envía `POST /progresso` cada 10s, marca `concluido` al terminar y ofrece el siguiente episodio.
- **READMEs** en pt/en/es y resumen de `AGENTS.md` actualizado.

## Verificaciones en el navegador (dev server en `http://localhost:5174/`)

- La pantalla de login renderiza con los acentos del portugués correctos (atlas MSDF reemplazado por `CanvasTextRenderer` + TTF, ya que el MSDF del demo solo cubre ASCII).
- Teclado en pantalla: escritura, navegación con flechas y envío funcionando.
- Fetch real contra `curso.ideias.casa` (CORS OK) y manejo del 401.
- Shell autenticado, menú de 3 ítems, ítem activo resaltado, navegación por la barra lateral entre Cursos/Categorías/Canales.
- `ErrorBoundary` por página y lectura protegida de recursos con error — un fallo de carga ya no congela la pantalla ni oculta el menú.

## Nota

Para ver las pantallas con contenido real se necesita un token válido: genera **un** token en `https://curso.ideias.casa/tv` y, sin recargar la página después, escríbelo en la pantalla de login de la app. El token es único por usuario; cada nuevo token invalida el anterior. El backend y el contrato se confirmaron vía `curl` (p. ej., curso "Aprenda React", categoría "Desenvolvimento").
