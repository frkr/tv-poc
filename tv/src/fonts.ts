const basePath = import.meta.env.BASE_URL;

// Usamos o renderizador de texto via Canvas (CanvasTextRenderer) com fontes TTF
// porque os atlas MSDF do demo cobrem apenas ASCII basico e quebrariam os
// acentos do portugues (ç, ã, ó, etc.).
export default [
  {
    fontFamily: "Roboto",
    fontUrl: basePath + "fonts/Roboto-Regular.ttf",
  },
  {
    fontFamily: "Roboto700",
    fontUrl: basePath + "fonts/Roboto-Bold.ttf",
  },
] as any;
