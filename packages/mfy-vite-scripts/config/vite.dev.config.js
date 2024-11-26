import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "@svgr/rollup";
import url from "rollup-plugin-url";
import { viteExternalsPlugin } from "vite-plugin-externals";
import { createHtmlPlugin } from "vite-plugin-html";
import fs from "fs";
import paths from "path";
import { getArgs } from "../utils/args.js";
import { getProxySetting } from "../utils/proxy.js";

const resolveApp = (relativePath) => paths.resolve(process.cwd(), relativePath);
const {
  case: gwCase = "goodwe",
  env = "dev",
  htmlTemplate = "public/dev.html",
  appcode,
} = getArgs();
const { PORT = 3000, HOST = "127.0.0.1" } = process.env;
export async function getViteConfig() {
  const proxySetting = await getProxySetting();
  const viteConfigSetting = fs.existsSync(resolveApp("vite.config.mjs"))
    ? (await import(resolveApp("vite.config.mjs"))).default
    : {};
  return defineConfig({
    define: {
      ENV: JSON.stringify(env),
      CASE: JSON.stringify(gwCase),
      APPCODE: appcode,
      process: {
        env: process.env,
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          math: "always",
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
      url(),
      svgr({svgo: false}),
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
    ...viteConfigSetting,
  });
}
