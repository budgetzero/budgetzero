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

    it('import transactions', () => {
        cy.get('#myaccount').click()

        cy.get('#importBtn').click()
        cy.get('#csvTab').click()

        cy.get('[name=csv]').click()

        cy.get('.form-control-file').click();

        cy.get('.form-control-file').click();

        cy.get('.form-control-file').attachFile('fake_data.csv');

        cy.get('.my-3 > .v-btn__content').click();
        cy.get('tr:nth-child(1) .map-fields-select').select('9/1/2019')
        cy.get('tr:nth-child(2) .map-fields-select').select('Test Payee 13');
        cy.get('tr:nth-child(3) .map-fields-select').select('-105.51');

        cy.get('#importTransactionsBtn').click({force: true })

        cy.get(".transaction-table tbody")
          .find("tr")
          .should("have.length", 1);
        
    })
  })
  
  