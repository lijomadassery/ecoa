describe('Access Control', () => {
  beforeEach(() => {
    // Clear any existing session
    cy.clearLocalStorage()
    cy.clearCookies()

    // Login before each test
    cy.visit('/login')
    cy.get('.v-form').should('exist')
    cy.get('.v-text-field').first().find('input').type('admin')
    cy.get('.v-text-field').last().find('input').type('admin123')
    cy.get('.login-btn').click()

    // Wait for navigation to complete and verify we're on the apps page
    cy.url().should('include', '/apps')

    // Click on the ECOA app to access the dashboard
    cy.contains('ECOA').click()

    // Wait for navigation to complete and verify we're on the dashboard
    cy.url().should('include', '/dashboard')
  })

  it('should restrict access based on user role', () => {
    // Logout and login as non-admin user
    cy.get('.v-avatar').click()
    cy.get('.v-list-item').contains('Logout').click()
    cy.url().should('include', '/login')

    cy.get('.v-form').should('exist')
    cy.get('.v-text-field').first().find('input').type('user')
    cy.get('.v-text-field').last().find('input').type('user123')
    cy.get('.login-btn').click()

    // Wait for navigation to complete and verify we're on the apps page
    cy.url().should('include', '/apps')

    // Click on the ECOA app to access the dashboard
    cy.contains('ECOA').click()

    // Wait for navigation to complete and verify we're on the dashboard
    cy.url().should('include', '/dashboard')

    // Try to access admin page
    cy.visit('/admin')
    cy.url().should('include', '/dashboard')
  })

  it('should enforce permission boundaries', () => {
    // Logout and login as non-admin user
    cy.get('.v-avatar').click()
    cy.get('.v-list-item').contains('Logout').click()
    cy.url().should('include', '/login')

    cy.get('.v-form').should('exist')
    cy.get('.v-text-field').first().find('input').type('user')
    cy.get('.v-text-field').last().find('input').type('user123')
    cy.get('.login-btn').click()

    // Wait for navigation to complete and verify we're on the apps page
    cy.url().should('include', '/apps')

    // Click on the ECOA app to access the dashboard
    cy.contains('ECOA').click()

    // Wait for navigation to complete and verify we're on the dashboard
    cy.url().should('include', '/dashboard')

    // Try to access admin features
    cy.get('.v-navigation-drawer').should('not.contain', 'Admin')
  })

  it('should prevent access to restricted areas', () => {
    // Try to access admin page directly
    cy.visit('/admin')
    cy.url().should('include', '/dashboard')
  })

  it('should show appropriate features for admin users', () => {
    // Verify admin features are visible
    cy.get('.v-navigation-drawer').should('contain', 'Admin')
    cy.get('.v-navigation-drawer').should('contain', 'Settings')
  })
}) 