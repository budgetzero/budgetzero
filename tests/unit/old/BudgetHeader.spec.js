import BudgetGrid from "@/components/BudgetView/BudgetGrid.vue";
import BudgetHeader from "@/components/BudgetView/BudgetHeader.vue";
import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import Vuetify from "vuetify";
import mock_budget from "@/../tests/__mockdata__/mock_budget.json";
import store from "@/store";

const localVue = createLocalVue();

const $route = {
  path: "/fake/path",
  params: {
    account_id: "38e690f8-198f-4735-96fb-3a2ab15081c2"
  }
};

const data = mock_budget.rows.map(row => row.doc);
// Load mock budget file and parse into vuex state
// state.monthCategoryBudgets = data.filter(row => row._id.includes("_m_category_"));
// state.payees = data.filter(row => row._id.includes("_payee_"));
store.state.pouchdb.accounts = data.filter(row => row._id.includes("_account_"));
store.state.pouchdb.transactions = data.filter(row => row._id.includes("_transaction_"));
store.state.pouchdb.masterCategories = data.filter(row => row._id.includes("_master-category_"));
store.state.pouchdb.categories = data
  .filter(row => row._id.includes("_category_"))
  .filter(row => !row._id.includes("m_category"));
// store.state.pouchdb.month_selected = "2020-12",
// store.state.pouchdb.selectedBudgetID = "79de488f-448e-4b4d-97ad-61e5e4f5df31",

describe("NumberRenderer", () => {
  let vuetify;
  let wrapper;

  beforeEach(async () => {
    vuetify = new Vuetify();
    localVue.use(vuetify);
    localVue.use(Vuex);

    store.state.month_selected = "2021-01";
    wrapper = mount(BudgetHeader, {
      store,
      localVue,
      vuetify,
    });

    await store.dispatch("calculateMonthlyData");

  });

  it("renders available-to-budget-text text", () => {
    expect(wrapper.find("#available-to-budget-text").text()).toBe("Available To Budget");
  });

  it("renders does-not-exist message for that month", async () => {
    store.state.month_selected = "2019-01";
    await localVue.nextTick()
    expect(wrapper.find("#data-doesnt-exist-msg").exists()).toBeTruthy();
  });

  it("does not render does-not-exist message for that month", async () => {
    store.state.month_selected = "2020-12";
    await localVue.nextTick()
    expect(wrapper.find("#data-doesnt-exist-msg").exists()).toBeFalsy();
  });

  it("renders the correct budget amounts", async () => {
    store.state.month_selected = "2020-12";
    await localVue.nextTick()
    const available_to_budget_last_month = (store.getters.monthlyData[store.state.month_selected].summaryData.available_to_budget_last_month / 100).toFixed(2)
    const available_to_budget_this_month = (store.getters.monthlyData[store.state.month_selected].summaryData.available_to_budget_this_month / 100).toFixed(2)
    const balance_this_month = (store.getters.monthlyData[store.state.month_selected].summaryData.balance_this_month / 100).toFixed(2)
    const budgeted_this_month = (store.getters.monthlyData[store.state.month_selected].summaryData.budgeted_this_month / 100).toFixed(2)
    let income_this_month = financial(store.getters.monthlyData[store.state.month_selected].summaryData.income_this_month / 100)
    const last_month_overspent = (store.getters.monthlyData[store.state.month_selected].summaryData.last_month_overspent / 100).toFixed(2)
    const overspent = (store.getters.monthlyData[store.state.month_selected].summaryData.overspent / 100).toFixed(2)
 
    expect(wrapper.find("#available-to-budget-amount").text()).toBe(available_to_budget_this_month);
    // expect(wrapper.find("#leftover-amount").text()).toBe("37076.31");
    // expect(wrapper.find("#income-amount").text()).toBe(income_this_month);
    // expect(wrapper.find("#overspent-amount").text()).toBe(overspent);
  });



  // it("renders the correct budgeted amount", () => {
  //   expect(wrapper.find("#budgeted-amount").text()).toBe("36216");
  //   expect(wrapper.find("#budgeted-amount").text() * 100).toBe(
  //     store.getters.monthlyData[store.getters.month_selected]["summaryData"]["budgeted_this_month"]
  //   );
  // });

  // it("renders the correct budgeted amount", () => {
  //   expect(wrapper.find("#selected-month").text()).toBe(store.getters.month_selected);
  // });
});

function financial(x) {
  return Number.parseFloat(x).toFixed(2);
}