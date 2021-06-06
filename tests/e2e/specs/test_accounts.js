//Create new account
//Edit existing account...twice
//Delete account

// describe("Test accounts", () => {
//   //Clear db and load mock test data
//   before(function() {
//     cy.visit("http://localhost:8080/settings");
//     cy.get(".mdi-chevron-down").click();

//     cy.get("[data-cy=delete-local-db]").click(); 
//     cy.visit("http://localhost:8080/accounts");
//   });

//   it("Create new budget", () => {
//     cy.get(".v-icon--link").click();
//     cy.get(".v-list-item__content .v-btn__content").click();
//     cy.get("[data-cy=budget-name]").type("new budget");
//     cy.get("[data-cy=create-budget]").click();
//     cy.get(".swal2-confirm").click();
//   });

//   it("Create new account", () => {
//     cy.visit("http://localhost:8080/accounts");
//     cy.get("[data-cy=new-account]").click();
//     cy.get("[data-cy=account-name]").type("Chase Test Acct");
//     cy.get("[data-cy=account-save]").click();
//   });

//   it("Check if it exists immediately", () => {
//     cy.get(".account-table").contains("Chase Test Acct");
//     cy.get(".account-table").contains("Chase Test Acct");
//   });

//   it("Check if it exists after refresh", () => {
//     cy.visit("http://localhost:8080/accounts");
//     cy.get(".account-table").contains("Chase Test Acct");
//     cy.get(".sidebar").contains("Chase Test Acct");
//   });

//   it("Create new account with balance", () => {
//     cy.get("[data-cy=new-account]").click();
//     cy.get("[data-cy=account-name]").type("New-account-with-balance");
//     cy.get("[data-cy=account-starting-balance]").type("10123");
//     cy.get("[data-cy=account-save]").click();
//   });

//   it("Check if account with balance exists and has balance", () => {
//     cy.get(".sidebar").contains("New-account-with-balance");
//     cy.get(".sidebar").contains("10,123");
//   });

//   it("Check if account has starting transaction", () => {
//     cy.get(".sidebar")
//       .contains("New-account-with-balance")
//       .click();
//     cy.get(".transaction-table tbody")
//       .find("tr")
//       .should("have.length", 1);
//     cy.get(".transaction-table tbody").contains("Uncategorized");
//     cy.get(".transaction-table tbody").contains("$10,123.00");
//   });
// });
