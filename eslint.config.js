import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default defineConfig([
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { files: ["**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: globals.browser } },
    { files: ["**/*.{js,mjs,cjs,ts}"], plugins: { js }, extends: ["js/recommended"] },
    tseslint.configs.recommended,
    {
        extends: [
            "eslint:recommended",
            "plugin:@typescript-eslint/recommended", // Or your TypeScript ESLint plugin
            "plugin:prettier/recommended", // Add this line!
            "prettier", // Make sure this is the last entry in "extends"!
        ],
        plugins: ["prettier"], // Add this line if you haven't already
        rules: {
            "prettier/prettier": "error", // Treat Prettier violations as errors
        },
    },
]);
