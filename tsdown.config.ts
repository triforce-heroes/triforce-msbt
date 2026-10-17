import { defineConfig } from "tsdown";

// oxlint-disable-next-line import/no-anonymous-default-export
export default defineConfig({
  entry: "./src/index.ts",
  minify: true,
  platform: "node",
});
