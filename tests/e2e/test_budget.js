describe('Test transactions', () => {
    before(function () {
      cy.visit('http://localhost:8080/budget')
    });
    
    it('Visit the first account page', () => {
        cy.get('[data-cy=budget-input]').get('input').last().clear().type('800')
        cy.contains('Available To Budget').click()
        cy.contains('Available To Budget').contains(900)
    })
  
});

  
