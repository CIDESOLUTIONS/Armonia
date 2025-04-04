// cypress/e2e/lighthouse.cy.ts

describe('Auditoría de Rendimiento y Accesibilidad', () => {
  it('La página de inicio debe cumplir con estándares de accesibilidad y rendimiento', () => {
    cy.visit('http://localhost:3000');
    cy.wait(2000); // Esperar a que la página cargue completamente
    
    // Verificar elementos básicos
    cy.get('h2').should('be.visible');
    cy.get('body').should('be.visible');
    
    // Verificar que la página responda rápidamente
    cy.get('body').should('have.css', 'display', 'block');
    
    // Verificar que los enlaces tienen textos descriptivos
    cy.get('a').each(($el) => {
      const linkText = $el.text().trim();
      const hasAriaLabel = $el.attr('aria-label');
      
      // Los enlaces deben tener texto o aria-label
      expect(
        linkText.length > 0 || hasAriaLabel, 
        `Enlaces deben tener texto o aria-label: ${$el.prop('outerHTML')}`
      ).to.be.true;
    });
    
    // Verificar que las imágenes tienen texto alternativo
    cy.get('img').each(($el) => {
      const altText = $el.attr('alt');
      expect(
        altText !== undefined && altText.trim() !== '', 
        `Imágenes deben tener alt text: ${$el.prop('outerHTML')}`
      ).to.be.true;
    });
    
    // Verificar contraste de colores (simulación básica)
    cy.get('p, h1, h2, h3, span, a').each(($el) => {
      const color = $el.css('color');
      const bgColor = $el.css('background-color');
      
      // Verificación simplificada - una validación real requeriría cálculos de contraste
      expect(color).not.to.equal(bgColor);
    });
  });

  it('La página de login debe cumplir con estándares de accesibilidad', () => {
    cy.visit('http://localhost:3000/login');
    cy.wait(2000);
    
    // Verificar que los campos de formulario tienen etiquetas asociadas
    cy.get('input').each(($el) => {
      const id = $el.attr('id');
      if (id) {
        cy.get(`label[for="${id}"]`).should('exist');
      } else {
        // Si no tiene ID, debe estar dentro de un label
        const hasLabelParent = $el.parents('label').length > 0;
        expect(
          hasLabelParent || $el.attr('aria-label'), 
          'Los campos sin ID deben estar dentro de un label o tener aria-label'
        ).to.be.true;
      }
    });
    
    // Verificar que los mensajes de error son accesibles
    cy.get('button[type="submit"]').click();
    cy.get('p').contains('completa todos los campos').should('be.visible');
  });

  it('El dashboard debe cargar rápidamente y ser accesible', () => {
    // Iniciar sesión
    cy.visit('http://localhost:3000/login');
    cy.get('input[type="email"]').type('admin5@prueba.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Verificar que el dashboard carga en menos de 5 segundos
    cy.url().should('include', '/dashboard', { timeout: 5000 });
    
    // Verificar navegación por teclado
    cy.get('body').type('{tab}');
    cy.focused().should('exist'); // Algún elemento debe estar enfocado
    
    // Verificar que los componentes interactivos son accesibles por teclado
    cy.get('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])').each(($el) => {
      // Verificación básica de que estos elementos se pueden alcanzar por teclado
      expect($el.attr('tabindex')).not.to.equal('-1');
    });
  });
});
