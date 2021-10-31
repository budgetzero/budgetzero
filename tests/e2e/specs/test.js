// https://docs.cypress.io/api/introduction/api.html

describe('My First Test', () => {
  it('Create new budget', () => {
    cy.visit('http://localhost:8080/settings')
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
    
    cy.get('#inflow-input').type('55.55', { force: true })
    cy.get('#save-btn').click()

    cy.get(".transaction-table tbody").find("tr").should("have.length", 1);
    cy.get("#inflow").should("contain", "55.55");
  })

  it('Add a transaction 2', () => {
    cy.get('#addTransactionBtn').click()
    
    cy.get('#outflow-input').type('66.55', { force: true })
    cy.get('#save-btn').click()

    cy.get(".transaction-table tbody").find("tr").should("have.length", 2);
    cy.get(".transaction-table tbody").should("contain", "66.55");
  })

  it('test malformed', () => {
    cy.get('#addTransactionBtn').click()
    
    cy.get('#outflow-input').type('7ff5.g58', { force: true })
    cy.get('#save-btn').click()

    cy.get(".transaction-table tbody").find("tr").should("have.length", 3);
    cy.get(".transaction-table tbody").should("contain", "75.58");
  })

  
})

