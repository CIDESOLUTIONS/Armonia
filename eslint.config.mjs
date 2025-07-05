import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

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
      "tailwind.config.js",
      "tailwind.config.ts",
      "jest.config.js",
      "next.config.js",
      "babel.config.js",
      "postcss.config.js",
      
      // Scripts de utilidad
      "scripts/**",
      "prisma/seed.js",
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
    rules: {
      // Reglas de React
      "react/react-in-jsx-scope": "off", // Desactiva la necesidad de importar React
      "react/jsx-uses-react": "off",     // Opcional, para consistencia
      
      // Reglas de TypeScript para reducir errores críticos
      "@typescript-eslint/no-explicit-any": "warn", // Cambiar de error a advertencia
      "@typescript-eslint/no-unused-vars": "warn"  // Cambiar de error a advertencia
    },
  },
];