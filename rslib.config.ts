import { defineConfig } from "@rslib/core";

export default defineConfig({
    lib: [
        {
            format: "esm",
            syntax: "es2020",
            dts: true,
            output: {
                minify: true,
                sourceMap: true,
                target: "web",
            },
        },
        {
            format: "cjs",
            syntax: "es2020",
            dts: true,
            output: {
                minify: true,
                sourceMap: true,
                target: "node",
            },
        },
    ],
    source: {
        entry: {
            index: "./src/index.ts",
        },
    },
});
