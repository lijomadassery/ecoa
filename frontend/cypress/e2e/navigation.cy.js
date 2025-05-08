describe('Dashboard Navigation', () => {
  beforeEach(() => {
    // Clear any existing session
    cy.clearLocalStorage()
    cy.clearCookies()

    // Visit the login page
    cy.visit('/login')

    // Check if login form exists
    cy.get('[data-v-app] .v-form').should('exist')

    // Fill in login credentials with more specific selectors
    cy.get('[data-v-app] .v-text-field input[type="text"]').first().type('admin')
    cy.get('[data-v-app] .v-text-field input[type="password"]').type('admin123')

    // Click login button
    cy.get('.login-btn').click()

    // Wait for navigation to complete and verify we're on the apps page
    cy.url().should('include', '/apps')

    // Click on the ECOA app to access the dashboard
    cy.contains('.v-card', 'ECOA').click()

    // Wait for navigation to complete and verify we're on the dashboard
    cy.url().should('include', '/dashboard')
  })

  it('should navigate through navigation drawer', () => {
    // Verify navigation drawer is visible
    cy.get('[data-v-app] .v-navigation-drawer').should('be.visible')

    // Navigate to Roster with more specific selectors
    cy.get('.v-list-item__content').contains('Roster').click()
    cy.url().should('include', '/roster')

    // Navigate to Prompts
    cy.get('.v-list-item__content').contains('Prompts').click()
    cy.url().should('include', '/prompts')

    // Navigate to Reports
    cy.get('.v-list-item__content').contains('Reports').click()
    cy.url().should('include', '/reports')
  })

  it('should display correct page titles', () => {
    // Check Roster page title
    cy.get('.v-list-item__content').contains('Roster').click()
    cy.get('.v-toolbar-title__placeholder').should('contain', 'ECOA')

    // Check Prompts page title
    cy.get('.v-list-item__content').contains('Prompts').click()
    cy.get('.v-toolbar-title__placeholder').should('contain', 'ECOA')

    // Check Reports page title
    cy.get('.v-list-item__content').contains('Reports').click()
    cy.get('.v-toolbar-title__placeholder').should('contain', 'ECOA')
  })

  it('should handle responsive layout', () => {
    // Test mobile view
    cy.viewport('iphone-6')
    cy.get('.v-app-bar__nav-icon').should('be.visible')
    cy.get('[data-v-app] .v-navigation-drawer').should('not.be.visible')

    // Open navigation drawer
    cy.get('.v-app-bar__nav-icon').click()
    cy.get('[data-v-app] .v-navigation-drawer').should('be.visible')

    // Test desktop view
    cy.viewport('macbook-13')
    cy.get('[data-v-app] .v-navigation-drawer').should('be.visible')
    cy.get('.v-app-bar__nav-icon').should('be.visible')
  })
}) 