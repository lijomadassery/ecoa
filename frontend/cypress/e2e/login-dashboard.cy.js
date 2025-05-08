// Cypress E2E test for login and dashboard

describe('Login and Dashboard Flow', () => {
  beforeEach(() => {
    // Clear any existing session
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it('should log in and display the dashboard', () => {
    // Visit the login page
    cy.visit('/login')

    // Check if login form exists
    cy.get('.v-form').should('exist')

    // Fill in login credentials
    cy.get('.v-text-field').first().find('input').type('admin')
    cy.get('.v-text-field').last().find('input').type('admin123')

    // Click login button
    cy.get('.login-btn').click()

    // Wait for navigation to complete and verify we're on the apps page
    cy.url().should('include', '/apps')

    // Click on the ECOA app to access the dashboard
    cy.contains('ECOA').click()

    // Wait for navigation to complete and verify we're on the dashboard
    cy.url().should('include', '/dashboard')

    // Check if navigation drawer is visible
    cy.get('.v-navigation-drawer').should('be.visible')

    // Check if dashboard content exists
    cy.get('.v-main').should('exist')
  })
}) 