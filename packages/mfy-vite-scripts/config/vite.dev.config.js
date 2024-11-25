import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitePluginSvgr from "../plugins/svgr.plugin.js";
import { viteExternalsPlugin } from "vite-plugin-externals";
import { createHtmlPlugin } from "vite-plugin-html";
import { getArgs } from "../utils/args.js";
import { getProxySetting } from "../utils/proxy.js";

const { case: gwCase = "goodwe", env = "dev", htmlTemplate = "public/dev.html" } = getArgs();
const { PORT = 3000, HOST = "127.0.0.1" } = process.env;
export async function getViteConfig() {
  const proxySetting = await getProxySetting();
  return defineConfig({
    define: {
      ENV: JSON.stringify(env),
      CASE: JSON.stringify(gwCase),
      process: {
        env: process.env,
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          math: 'always',
        },
      },
    },
    plugins: [
      createHtmlPlugin({
        minify: true,
        entry: "/src/index.tsx",
        template: htmlTemplate,
        inject: {
          data: {
            configPrefix: "",
          },
        },
      }),
      viteExternalsPlugin({
        mqtt: "mqtt",
        moment: "moment",
      }),
      react(),
      // svgr options: https://react-svgr.com/docs/options/
      vitePluginSvgr({
        svgrOptions: {
          exportType: "named",
          ref: true,
          svgo: false,
          titleProp: true,
        },
      }),
    ],
    root: process.cwd(),
    mode: "development",
    publicDir: false,
    build: {
      assetsInlineLimit: 10000,
    },
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    server: {
      port: PORT,
      open: true,
      proxy: proxySetting,
    },
  });
}
