
// ***********************************************
// Commands and custom utilities for Armonía tests
// ***********************************************

// Comando para iniciar sesión con un tipo de usuario
Cypress.Commands.add('login', (userType: string) => {
  cy.fixture('example.json').then((testData) => {
    let userData;
    
    switch (userType) {
      case 'admin':
        userData = testData.users.admin;
        break;
      case 'resident':
        userData = testData.users.resident;
        break;
      case 'reception':
        userData = testData.users.reception;
        break;
      default:
        throw new Error(`Usuario no soportado: ${userType}`);
    }
    
    cy.visit('/login');
    cy.get('input[type="email"]').type(userData.email);
    cy.get('input[type="password"]').type(userData.password);
    cy.contains('Ingresar').click();
    
    // Verificar que inicia sesión correctamente según el tipo de usuario
    if (userType === 'admin') {
      cy.url().should('include', '/dashboard');
    } else if (userType === 'resident') {
      cy.url().should('include', '/resident');
    } else if (userType === 'reception') {
      cy.url().should('include', '/reception');
    }
  });
});

// Comando para cerrar sesión
Cypress.Commands.add('logout', () => {
  cy.contains('Cerrar Sesión').click();
  // Verificar que se redirige a la página de inicio o login
  cy.url().should('not.include', '/dashboard');
});

// Comando para navegar a una sección específica del panel
Cypress.Commands.add('navigateTo', (section: string) => {
  cy.contains(section).click();
  // Esperar a que la página cargue
  cy.wait(500);
});

// Comando para verificar mensaje de alerta/éxito
Cypress.Commands.add('verifyMessage', (messageText: string) => {
  cy.contains(messageText).should('exist');
});

// Comando para generar un texto único con timestamp
Cypress.Commands.add('generateUniqueText', (baseText: string) => {
  const timestamp = Date.now();
  return `${baseText} ${timestamp}`;
});

// Comando para seleccionar una fecha en el futuro
Cypress.Commands.add('selectFutureDate', (daysFromNow: number, inputSelector: string) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysFromNow);
  const formattedDate = futureDate.toISOString().split('T')[0];
  cy.get(inputSelector).type(formattedDate);
  return formattedDate;
});

// Comando para completar un formulario básico
Cypress.Commands.add('fillForm', (formData: {[key: string]: any}) => {
  Object.entries(formData).forEach(([selector, value]) => {
    const el = cy.get(selector);
    
    if (typeof value === 'string') {
      if (el.parent().find('select').length) {
        el.select(value);
      } else {
        el.clear().type(value);
      }
    } else if (typeof value === 'boolean' && value === true) {
      el.check();
    } else if (typeof value === 'boolean' && value === false) {
      el.uncheck();
    }
  });
});

// Extender los tipos para TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      login(userType: string): Chainable<void>;
      logout(): Chainable<void>;
      navigateTo(section: string): Chainable<void>;
      verifyMessage(messageText: string): Chainable<void>;
      generateUniqueText(baseText: string): Chainable<string>;
      selectFutureDate(daysFromNow: number, inputSelector: string): Chainable<string>;
      fillForm(formData: {[key: string]: any}): Chainable<void>;
    }
  }
}

export {};
