import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import legacy from "@vitejs/plugin-legacy";
import hexColorTransform from "@lightningtv/vite-hex-transform";
import path from "path";

export default defineConfig(({ mode }) => ({
  define: {
    __DEV__: mode !== "production",
    __RTT__: true,
    __renderTextBatching__: true,
    __enableCompressedTextures__: true,
    __calculateFps__: true,
    LIGHTNING_DOM_RENDERING: true,
  },
  plugins: [
    hexColorTransform({
      include: ["src/**/*.{ts,tsx,js,jsx}"],
    }),
    solidPlugin({
      solid: {
        moduleName: "@solidtv/solid",
        generate: "universal",
        builtIns: [],
      },
    }),
    legacy({
      targets: ["chrome>=38", "not IE 11"],
      additionalLegacyPolyfills: ["whatwg-fetch"],
      modernPolyfills: ["es.global-this"],
    }),
  ],
  build: {
    minify: "terser",
    terserOptions: {
      compress: false,
      mangle: false,
      format: { comments: false, beautify: true },
    },
    sourcemap: false,
  },
  resolve: {
    alias: {
      theme: path.resolve(__dirname, "src/theme.ts"),
    },
    conditions: ["@solidtv/source", "browser", ...(mode !== "production" ? ["development"] : [])],
    dedupe: [
      "solid-js",
      "solid-js/universal",
      "@solidjs/router",
      "@solidtv/renderer",
      "@solidtv/solid",
      "@solidtv/solid/primitives",
    ],
  },
  optimizeDeps: {
    exclude: ["@solidtv/solid", "@solidtv/renderer"],
  },
  server: {
    port: 5174,
    hmr: true,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
}));
