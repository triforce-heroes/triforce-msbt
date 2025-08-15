import { recommended, vitest } from "@rheactor/eslint-config-rheactor";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  ...recommended,
  ...vitest,
  globalIgnores(["dist"]),
]);
