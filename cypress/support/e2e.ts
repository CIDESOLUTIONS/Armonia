// C:\Users\meciz\Documents\armonia\frontend\cypress\support\e2e.ts
import './commands'

// C:\Users\meciz\Documents\armonia\frontend\cypress\support\commands.ts
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});
// cypress/support/e2e.ts
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  if (err.message.includes('localStorage is not defined')) {
    return false;
  }
});