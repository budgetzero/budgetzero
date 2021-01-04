import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import store from "@/store";
import mock_budget from "@/../tests/__mockdata__/mock_budget.json";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("vuex budget module", () => {
  //Set month to desired test month
  beforeAll(() => {
    // Load mock budget file and parse into vuex state
    const data = mock_budget.rows.map(row => row.doc);
    // state.monthCategoryBudgets = data.filter(row => row._id.includes("_m_category_"));
    // state.payees = data.filter(row => row._id.includes("_payee_"));
    store.state.pouchdb.accounts = data.filter(row => row._id.includes("_account_"));
    store.state.pouchdb.transactions = data.filter(row => row._id.includes("_transaction_"));
    store.state.pouchdb.masterCategories = data.filter(row =>
      row._id.includes("_master-category_")
    );
    store.state.pouchdb.categories = data
      .filter(row => row._id.includes("_category_"))
      .filter(row => !row._id.includes("m_category"));
    // store.state.pouchdb.month_selected = "2020-12",
    // store.state.pouchdb.selectedBudgetID = "79de488f-448e-4b4d-97ad-61e5e4f5df31",
  });

  it("monthlyData getter matches snapshot", async () => {
    await store.dispatch("calculateMonthlyData");
    expect(store.getters.monthlyData).toMatchSnapshot();
  });

  it("transactions_by_account getter matches snapshot", async () => {
    expect(Object.keys(store.getters.transactions_by_account).length).toBe(1);
    expect(store.getters.transactions_by_account).toMatchSnapshot();
  });
});
