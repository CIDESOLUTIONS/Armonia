// C:\Users\meciz\Documents\armonia\frontend\cypress.config.ts
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    video: false,
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
