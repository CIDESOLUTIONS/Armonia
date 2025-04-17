// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Comando para simular la carga de archivos
// Requiere instalar cypress-file-upload:
// npm install --save-dev cypress-file-upload
import 'cypress-file-upload';

// Comando para login como administrador
Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(Cypress.env('adminEmail'));
  cy.get('input[name="password"]').type(Cypress.env('adminPassword'));
  cy.contains('Iniciar Sesión').click();
  cy.url().should('include', '/dashboard');
});

// Comando para login como residente
Cypress.Commands.add('loginAsResident', () => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(Cypress.env('residentEmail'));
  cy.get('input[name="password"]').type(Cypress.env('residentPassword'));
  cy.contains('Iniciar Sesión').click();
  cy.url().should('include', '/resident');
});

// Comando para login como recepción
Cypress.Commands.add('loginAsReception', () => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(Cypress.env('receptionEmail'));
  cy.get('input[name="password"]').type(Cypress.env('receptionPassword'));
  cy.contains('Iniciar Sesión').click();
  cy.url().should('include', '/reception');
});

// Comando para cerrar sesión
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.contains('Cerrar Sesión').click();
  cy.url().should('include', '/login');
});

// Comando para verificar mensaje de éxito
Cypress.Commands.add('verifySuccessMessage', (message) => {
  cy.contains(message, { timeout: 10000 }).should('be.visible');
});

// Comando para esperar a que se cargue una tabla con datos
Cypress.Commands.add('waitForTableData', (tableSelector) => {
  cy.get(tableSelector, { timeout: 15000 }).should('be.visible');
  cy.get(`${tableSelector} tbody tr`).should('have.length.at.least', 1);
});

// Comando para restaurar la BD de pruebas
// Este comando es teórico y deberá implementarse
// según la estructura específica del proyecto
Cypress.Commands.add('restoreTestDB', () => {
  // Esta es solo una implementación de ejemplo
  // En un caso real, se debería llamar a una API o script específico
  cy.request({
    method: 'POST',
    url: '/api/testing/restore-db',
    failOnStatusCode: false,
  }).then((response) => {
    cy.log(`Base de datos restaurada: ${response.status}`);
  });
});

// Comando para navegar a una sección específica del dashboard
Cypress.Commands.add('navigateToDashboardSection', (section) => {
  cy.get('[data-testid="sidebar"]').contains(section).click();
});
