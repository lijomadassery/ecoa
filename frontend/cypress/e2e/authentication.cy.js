describe('Authentication Scenarios', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.visit('/login')
  })

  it('should handle invalid login attempts', () => {
    // Verify login form exists
    cy.get('.v-form').should('exist')
    
    // Fill in invalid credentials
    cy.get('.v-text-field').first().find('input').type('invalid')
    cy.get('.v-text-field').last().find('input').type('invalid123')
    cy.get('.login-btn').click()
    
    // Verify error message - using a more specific selector
    cy.get('.v-snackbar__content').should('be.visible')
      .and('contain', 'Invalid credentials')
  })

  it('should prevent empty form submission', () => {
    // Verify login form exists
    cy.get('.v-form').should('exist')
    
    // Try to submit empty form
    cy.get('.login-btn').click()
    
    // Verify validation messages
    cy.get('.v-text-field').first().find('.v-messages')
      .should('be.visible')
      .and('contain', 'This field is required')
    cy.get('.v-text-field').last().find('.v-messages')
      .should('be.visible')
      .and('contain', 'This field is required')
  })

  it('should mask password field', () => {
    // Verify password field is masked
    cy.get('.v-text-field').last().find('input')
      .should('have.attr', 'type', 'password')
    
    // Toggle password visibility using the append-inner icon
    cy.get('.v-text-field').last().find('.v-input__append').click()
    
    // Verify password is now visible
    cy.get('.v-text-field').last().find('input')
      .should('have.attr', 'type', 'text')
  })

  it('should handle logout', () => {
    // Login with valid credentials
    cy.get('.v-text-field').first().find('input').type('admin')
    cy.get('.v-text-field').last().find('input').type('admin123')
    cy.get('.login-btn').click()
    
    // Wait for navigation to complete
    cy.url().should('include', '/apps')
    
    // Click on ECOA app
    cy.contains('ECOA').click()
    
    // Wait for navigation to complete
    cy.url().should('include', '/dashboard')
    
    // Click user menu and logout - using more specific selectors
    cy.get('.v-avatar').first().click()
    cy.get('.v-list-item').contains('Logout').click()
    
    // Verify redirect to login page
    cy.url().should('include', '/login')
  })
}) 