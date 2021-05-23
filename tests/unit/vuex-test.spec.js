import Vue from "vue";
import Vuex from "vuex";
import PouchDB from "pouchdb";

import { createLocalVue } from "@vue/test-utils";
import store from "@/store/index.js";
import mock_budget from "@/../tests/__mockdata__/mock_budget.json";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("vuex budget module", () => {

  beforeAll(() => {
    
    const pouch = new PouchDB("budgetzero_local_db");
    Vue.prototype.$pouch = pouch;

    const data = mock_budget.rows.map(row => row.doc);
    store.state.monthCategoryBudgets = data.filter(row => row._id.includes("_m_category_"));
    store.state.payees = data.filter(row => row._id.includes("_payee_"));
    store.state.pouchdb.accounts = data.filter(row => row._id.includes("_account_"));
    store.state.pouchdb.transactions = data.filter(row => row._id.includes("_transaction_"));
    store.state.pouchdb.masterCategories = data.filter(row =>
      row._id.includes("_master-category_")
    );
    store.state.pouchdb.categories = data
      .filter(row => row._id.includes("_category_"))
      .filter(row => !row._id.includes("m_category"));
    store.state.pouchdb.budgetRoots = data.filter(row => row._id.includes("budget_"));
    
  });

  it("monthlyData getter matches snapshot", async () => {
      expect(store.state).toMatchSnapshot();
    
  });

  it("deleteEntireBudget", async () => {
    store.dispatch('deleteEntireBudget', store.state.pouchdb.budgetRoots[0])
    expect(store.state.pouchdb.transactions.length).toBe(10)
  
  });
  
});
