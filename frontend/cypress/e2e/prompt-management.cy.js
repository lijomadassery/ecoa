describe('Prompt Management', () => {
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

    // Navigate to Prompts
    cy.get('.v-navigation-drawer').contains('Prompts').click()
  })

  it('should create a new prompt', () => {
    // Click add prompt button
    cy.get('.v-btn').contains('Add Prompt').should('be.visible').click()

    // Fill in form using Vuetify's input selectors
    cy.get('.v-text-field').contains('Title').parent().find('input').type('Test Prompt')
    cy.get('.v-text-field').contains('Description').parent().find('input').type('Test Description')
    cy.get('.v-select').contains('Type').parent().find('input').click()
    cy.get('.v-list-item').contains('Standard').click()

    // Submit form
    cy.get('.v-card-actions .v-btn').contains('Save').click()

    // Verify success message
    cy.get('.v-snackbar').should('be.visible')
    cy.get('.v-snackbar__content').should('contain', 'Prompt created successfully')
  })

  it('should edit a prompt', () => {
    // Click on first prompt card
    cy.get('.v-card').first().click()

    // Click edit button
    cy.get('.v-btn').contains('Edit').click()

    // Update form using Vuetify's input selectors
    cy.get('.v-text-field').contains('Title').parent().find('input').clear().type('Updated Prompt')
    cy.get('.v-text-field').contains('Description').parent().find('input').clear().type('Updated Description')

    // Submit form
    cy.get('.v-card-actions .v-btn').contains('Save').click()

    // Verify success message
    cy.get('.v-snackbar').should('be.visible')
    cy.get('.v-snackbar__content').should('contain', 'Prompt updated successfully')
  })

  it('should delete a prompt', () => {
    // Click on first prompt card
    cy.get('.v-card').first().click()

    // Click delete button
    cy.get('.v-btn').contains('Delete').click()

    // Confirm deletion in dialog
    cy.get('.v-dialog').should('be.visible')
    cy.get('.v-dialog .v-card-actions .v-btn').contains('Delete').click()

    // Verify success message
    cy.get('.v-snackbar').should('be.visible')
    cy.get('.v-snackbar__content').should('contain', 'Prompt deleted successfully')
  })

  it('should search and filter prompts', () => {
    // Enter search term in Vuetify text field
    cy.get('.v-text-field input[type="text"]').type('Test')

    // Verify filtered results in card list
    cy.get('.v-card').should('have.length.at.least', 1)
    cy.get('.v-card').should('contain', 'Test')
  })

  it('should view prompt details', () => {
    // Click on first prompt card
    cy.get('.v-card').first().click()

    // Verify details panel
    cy.get('.v-card').should('be.visible')
    cy.get('.v-card').should('contain', 'Prompt Details')
    cy.get('.v-card').should('contain', 'Status')
  })

  it('should capture signatures', () => {
    // Click on first prompt card
    cy.get('.v-card').first().click()

    // Click capture signature button
    cy.get('.v-btn').contains('Capture Signature').click()

    // Verify signature pad is visible
    cy.get('.signature-pad').should('be.visible')

    // Draw a signature (simulated)
    cy.get('.signature-pad').trigger('mousedown', { clientX: 100, clientY: 100 })
    cy.get('.signature-pad').trigger('mousemove', { clientX: 200, clientY: 100 })
    cy.get('.signature-pad').trigger('mouseup')

    // Save signature
    cy.get('.v-btn').contains('Save Signature').click()

    // Verify success message
    cy.get('.v-snackbar').should('be.visible')
    cy.get('.v-snackbar__content').should('contain', 'Signature captured successfully')
  })

  it('should track prompt status', () => {
    // Click on first prompt card
    cy.get('.v-card').first().click()

    // Verify status is displayed
    cy.get('.v-card').should('contain', 'Status')
    cy.get('.v-chip').should('be.visible')
  })

  it('should perform batch operations', () => {
    // Select multiple prompts
    cy.get('.v-card').first().find('.v-checkbox').click()
    cy.get('.v-card').eq(1).find('.v-checkbox').click()

    // Click batch action button
    cy.get('.v-btn').contains('Batch Actions').click()

    // Select an action
    cy.get('.v-list-item').contains('Mark as Complete').click()

    // Verify success message
    cy.get('.v-snackbar').should('be.visible')
    cy.get('.v-snackbar__content').should('contain', 'Batch operation completed successfully')
  })

  it('should view prompt history', () => {
    // Click on first prompt card
    cy.get('.v-card').first().click()

    // Click view history button
    cy.get('.v-btn').contains('View History').click()

    // Verify history section
    cy.get('.v-card').contains('Prompt History').should('be.visible')
    cy.get('.v-card').should('contain', 'Date')
    cy.get('.v-card').should('contain', 'Action')
    cy.get('.v-card').should('contain', 'User')
  })
}) 