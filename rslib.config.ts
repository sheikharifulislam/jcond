import { defineConfig } from "@rslib/core";

export default defineConfig({
    lib: [
        {
            format: "esm",
            syntax: "es2020",
            dts: true,
            bundle: true,
            output: {
                minify: true,
                target: "web",
            },
            autoExternal: {
                dependencies: false,
                peerDependencies: true,
            },
        },
        {
            format: "cjs",
            syntax: "es2020",
            dts: true,
            bundle: true,
            output: {
                minify: true,
                target: "node",
            },
            autoExternal: {
                dependencies: false,
                peerDependencies: true,
            },
        },
    ],
    source: {
        entry: {
            index: "./src/index.ts",
        },
    },
});
