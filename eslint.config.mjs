
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import nextPlugin from "@next/eslint-plugin-next";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  
  // Configuración específica para archivos Jest
  {
    files: ["**/*.config.js", "**/jest.*.js", "**/__mocks__/**/*.js", "jest.mocks.js", "jest.setup.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
        jest: "readonly",
        global: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly"
      }
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": "warn"
    }
  },
  { 
    ignores: [
      // Archivos de configuración
      "tailwind.config.ts",
      "jest.config.ts",
      "next.config.mjs",
      "babel.config.cjs",
      "postcss.config.mjs",
      
      // Scripts de utilidad
      "scripts/**",
      "prisma/seed.ts",
      "seedUsers.js",
      "analyze-project.js",
      "createTestUsers.js",
      "recreateUsers.js",
      
      // Archivos de configuración Jest
      "jest.mocks.js",
      "jest.setup.js",
      
      // Archivos generados
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "coverage/**",
      
      // Archivos de prueba
      "**/__mocks__/**",
      "**/mocks/**",
      "**/__tests__/fileMock.js",
      "jest/**",
      
      // Archivos webpack generados
      "**/*.webpack.js",
      "**/*webpack*.js",
      
      // Archivos de declaración de tipos con any
      "**/types/declarations.d.ts"
    ] 
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      // Reglas de React
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
      
      // Reglas de TypeScript
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          "selector": "variable",
          "format": ["camelCase", "PascalCase", "UPPER_CASE"]
        },
        {
          "selector": "function",
          "format": ["camelCase", "PascalCase"]
        },
        {
          "selector": "typeLike",
          "format": ["PascalCase"]
        }
      ]
    },
  },
];
