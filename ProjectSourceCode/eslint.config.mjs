import js from "@eslint/js";
import {defineConfig} from "eslint/config";
import globals from "globals";
import jestPlugin from "eslint-plugin-jest";

export default defineConfig([
  js.configs.recommended,
  {
    languageOptions : {
      globals : {
        ...globals.node,
        ...globals.browser,
        ...jestPlugin.environments.globals.globals,
      },
    },
  },
]);
