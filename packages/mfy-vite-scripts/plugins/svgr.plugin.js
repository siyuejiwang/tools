import { createFilter } from "@rollup/pluginutils";
import fs from "fs";
import { transformWithEsbuild } from "vite";
export default function vitePluginSvgr({ svgrOptions, esbuildOptions, include = "**/*.svg", exclude, } = {}) {
    const filter = createFilter(include, exclude);
    const postfixRE = /[?#].*$/s;
    return {
        name: "vite-plugin-svgr",
        enforce: "pre", // to override `vite:asset`'s behavior
        async load(id) {
            if (filter(id)) {
                const { transform } = await import("@svgr/core");
                const { default: jsx } = await import("@svgr/plugin-jsx");
                const filePath = id.replace(postfixRE, "");
                const svgCode = await fs.promises.readFile(filePath, "utf8");
                const base64 =
        "data:image/svg+xml;base64," + Buffer.from(svgCode).toString("base64");
                const componentCode = await transform(svgCode, svgrOptions, {
                    filePath,
                    caller: {
                        defaultPlugins: [jsx],
                    },
                });
                const res = await transformWithEsbuild(componentCode, id, {
                    loader: "jsx",
                    ...esbuildOptions,
                });
                return {
                    code: res.code + `\n export default "${base64}"`,
                    map: null,
                };
            }
        },
    };
}

