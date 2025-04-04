// C:\Users\meciz\Documents\armonia\cypress\support\commands.ts
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="submit-button"]').click();
});