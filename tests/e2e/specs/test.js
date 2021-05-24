// https://docs.cypress.io/api/introduction/api.html

describe('My First Test', () => {
  it('Visits the app root url', () => {
    cy.visit('/settings')
    cy.get('#budgetNameField').type('test budget name')
    cy.get('#createBudgetBtn').click()

    cy.get('#agreeBtn').click()
    
  })
})

