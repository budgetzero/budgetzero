// https://docs.cypress.io/api/introduction/api.html

describe('My First Test', () => {
  it('Create new budget', () => {
    cy.visit('/settings')
    cy.get('#budgetNameField').type('test budget name')
    cy.get('#createBudgetBtn').click()

    cy.get('#agreeBtn').click()
    
  })

  it('Add account and it shows in table', () => {
    cy.get('#accountsSidebarBtn').click()
      
    cy.get('#addAccountBtn').click()
    cy.get('#nameField').type('myaccount')
    cy.get('#typeField').type('CHECKING', { force: true })

    cy.get('#saveAccountBtn').click()

    cy.get('.account-table').contains("myaccount")

    cy.get('#myaccount').click()
  })

  it('Add a transaction', () => {
    cy.get('#addTransactionBtn').click()
      
   
  })
})

