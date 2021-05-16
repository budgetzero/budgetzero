import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import Accounts from "@/components/AccountView/Accounts.vue";
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
let numberOfAccounts = null;

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
    store.state.pouchdb.month_selected = "2020-12",
    store.state.pouchdb.selectedBudgetID = "79de488f-448e-4b4d-97ad-61e5e4f5df31",

    numberOfAccounts = data.filter(row => row._id.includes("_account_")).length; 
  });

  beforeEach(() => {
    vuetify = new Vuetify();
    localVue.use(vuetify);

    store.state.month_selected = "2020-12";
    wrapper = mount(Accounts, {
      store,
      localVue,
      vuetify,
      mocks: {
        $route
      },
      stubs: {
        ImportModalComponent: true
      }
    });
  });

  it("account renders correct snapshot", () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it("account table exists", () => {
    expect(wrapper.find("#accountsTable").exists()).toBeTruthy();
  });

  //   it("accounts vuex getter is correct length", () => {
  //     expect(wrapper.vm.accounts.length).toBe(numberOfAccounts)
  //   });

  it("clicking Add Account button shows modal", async () => {
    // Open modal
    wrapper.find("#addAccountBtn").trigger("click");
    await localVue.nextTick();

    // Verify modal is open
    expect(wrapper.find(".v-dialog .title").text()).toEqual("Edit Account");

  });

  it("submitting add account form", async () => {
    // Open modal
    wrapper.find("#addAccountBtn").trigger("click");
    await localVue.nextTick();

    wrapper.vm.editedItem = {
      type: "CHECKING",
      checkNumber: true,
      closed: false,
      name: "test",
      note: "123",
      sort: 0,
      onBudget: true,
      balanceIsNegative: false,
      initialBalance: 0
    }; 
    wrapper.vm.editedIndex = -1;

    // Trigger save
    wrapper.vm.$store.dispatch = jest.fn();
    
    // wrapper.vm.$uuid.v4() = jest.mockReturnValue('test123123123');
    spyOn(wrapper.vm, "v4").mockReturnValue('123123123')

    // jest.spyOn(wrapper.vm.$uuid, 'v4').mockReturnValueOnce('fake uuid');
    wrapper.find("#saveAccountBtn").trigger("click"); 
    wrapper.vm.save()

    expect(wrapper.vm.$store.dispatch).not.toBeCalled();

  });

  //   it("transaction list for table is correct length", () => {
  //     expect(wrapper.find("#accountsTable > table").length).toBe(7)
  //   });
  // it("add transaction btn creates a new row when clicked", () => {
  //   expect(wrapper.vm.transactionListForTable.length).toBe(numberOfTransactions);
  //   wrapper.find("#addTransactionBtn").trigger('click')
  //   expect(wrapper.vm.transactionListForTable.length).toBe(numberOfTransactions+1);
  // });
});
