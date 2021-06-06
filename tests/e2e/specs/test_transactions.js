// // https://docs.cypress.io/api/introduction/api.html

// // describe("My First Test", () => {
// //   it("Check that the web app loaded", () => {
// //     cy.visit("http://localhost:8080/budget");
// //     cy.contains('[tabindex="-1"] > .v-list-item__content > .v-list-item__title', "Budget Zero");
// //   });
// // });

// describe("Test transactions", () => {
//     //Clear db and load mock test data
//   before(function() {
//     cy.visit("http://localhost:8080/settings");
//     cy.get(".mdi-chevron-down").click();

//     cy.get("[data-cy=delete-local-db]").click(); 
//     cy.contains("Mock").click();
//     cy.visit("http://localhost:8080/accounts");
//   });
  
//   it("Visit the first account page", () => {
//     cy.contains("USAA").click();
//   });

//   it("count transactions",
//     () => {
//       cy.get(".transaction-table tbody").find("tr").should("have.length", 9);
//     });

//   it("create and save transaction", () => {
//     cy.contains("New Transaction").click();
//     //Type payee
//     cy.get("[data-cy=payee-input]").type("New Payee Test");

//     //Select a category
//     // cy.get("#list-item-420-5 > .v-list-item__content").click();

//     // cy.get("[data-cy=memo-input]")
//     //   .get("input")
//     //   .type("memo test input");

//     cy.get("[data-cy=inflow-input]").type("1000");

//     cy.get("[data-cy=save]").click();
//   });

//   it("check if new transaction is now in table", () => {
//     cy.get(".transaction-table tbody").find("tr").should("have.length", 10);
//   });

//   it('Check if it exists after refresh', () => {
//     cy.reload()
//     cy.get(".transaction-table tbody").find("tr").should("have.length", 10);
//   })
  
// });
