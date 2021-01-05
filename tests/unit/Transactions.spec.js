import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import Transactions from "@/components/TransactionView/Transactions.vue";
import Vuetify from "vuetify";
import mock_budget from "@/../tests/__mockdata__/mock_budget.json";
import store from "@/store";

import Vue from "vue";
Vue.use(Vuetify);
Vue.config.productionTip = false;

const localVue = createLocalVue();
localVue.use(Vuex);

const $route = {
  path: "/fake/path",
  params: {
    account_id: "38e690f8-198f-4735-96fb-3a2ab15081c2"
  }
};

const data = mock_budget.rows.map(row => row.doc);
let numberOfTransactions = null

describe("transaction table", () => {
  let vuetify;
  let wrapper;

  beforeAll(() => {
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
    
    numberOfTransactions = data.filter(row => row._id.includes("_transaction_")).length
  });

  
  beforeEach(() => {
    vuetify = new Vuetify();
    localVue.use(vuetify)

    store.state.month_selected = "2020-12";
    wrapper = shallowMount(Transactions, {
      store,
      localVue,
      vuetify,
      mocks: {
        $route
      },
      stubs: {
        ImportModalComponent: true
      },
    });
  });



  it("renders correct snapshot", () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it("transaction list for table is correct length", () => {
    expect(wrapper.vm.transactionListForTable.length).toBe(numberOfTransactions);
  });
  
  it("add transaction btn exists", () => {
    expect(wrapper.find("#addTransactionBtn").exists()).toBeTruthy();
  });

  // it("add transaction btn creates a new row when clicked", () => {
  //   expect(wrapper.vm.transactionListForTable.length).toBe(numberOfTransactions);
  //   wrapper.find("#addTransactionBtn").trigger('click')
  //   expect(wrapper.vm.transactionListForTable.length).toBe(numberOfTransactions+1);
  // });
  
});

describe("reconcile function", () => {
  let vuetify;
  let wrapper;

  beforeAll(() => {
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

    store.state.route = $route
    
    numberOfTransactions = data.filter(row => row._id.includes("_transaction_")).length
  });

  
  beforeEach(() => {
    vuetify = new Vuetify();
    localVue.use(vuetify)

    store.state.month_selected = "2020-12";
    wrapper = mount(Transactions, {
      store,
      localVue,
      vuetify,
      mocks: {
        $route
      },
      stubs: {
        ImportModalComponent: true
      },
    });
  });

  it("reconcile button exists", () => {
    expect(wrapper.find('#btn-reconcile').exists()).toBeTruthy();
  });

  it("reconcile button exists", () => {
    wrapper.find('#btn-reconcile').trigger('click')
    
  });


});