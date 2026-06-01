import "whatwg-fetch";
import { ErrorBoundary } from "solid-js";
import { createRenderer, Config, loadFonts } from "@solidtv/solid";
import { CanvasCoreRenderer, CanvasTextRenderer } from "@solidtv/renderer/canvas";
import { FocusStackProvider, lazy } from "@solidtv/solid/primitives";
import { HashRouter } from "@solidtv/solid/primitives/router";
import { Route } from "@solidjs/router";

import App from "./pages/App";
import Shell from "./pages/Shell";
import Login from "./pages/Login";
import Cursos from "./pages/Cursos";
import Categorias from "./pages/Categorias";
import Canais from "./pages/Canais";
import CursoDetail from "./pages/CursoDetail";
import fonts from "./fonts";
import theme from "theme";

const Player = lazy(() => import("./pages/Player"));

Config.debug = false;
Config.animationsEnabled = true;
Config.fontSettings.fontFamily = "Roboto";
Config.fontSettings.color = theme.textPrimary;
Config.fontSettings.fontSize = 28;
Config.domRendererEnabled = false;

Config.rendererOptions = {
  fpsUpdateInterval: 0,
  deviceLogicalPixelRatio: window.innerHeight / 1080,
  devicePhysicalPixelRatio: window.devicePixelRatio || 1,
  createImageBitmapSupport: "auto",
  boundsMargin: 100,
  fontEngines: [CanvasTextRenderer],
  renderEngine: CanvasCoreRenderer,
  enableClear: true,
};

const { render } = createRenderer();
loadFonts(fonts);

render(() => (
  <FocusStackProvider>
    <ErrorBoundary
      fallback={(err) => (
        <view width={1920} height={1080} color={theme.backgroundDark}>
          <text x={80} y={80} fontSize={28} color={theme.error} width={1700} contain="width">
            Ocorreu um erro: {String(err?.message || err)}
          </text>
        </view>
      )}
    >
    <HashRouter root={(props) => <App {...props} />}>
      <Route path="/login" component={Login} />
      <Route path="" component={Shell}>
        <Route path="/" component={Cursos} />
        <Route path="/categorias" component={Categorias} />
        <Route path="/canais" component={Canais} />
        <Route path="/curso/:id_curso" component={CursoDetail} />
      </Route>
      <Route path="/player/:id_curso/:id_episodio" component={Player} />
    </HashRouter>
    </ErrorBoundary>
  </FocusStackProvider>
));
