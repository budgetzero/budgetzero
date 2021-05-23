import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import Accounts from "@/components/AccountView/Accounts.vue";
import Vuetify from "vuetify";
import mock_budget from "@/../tests/__mockdata__/mock_budget.json";
import store from "@/store";
import uuid from "uuid";
import Vue from "vue";
Vue.use(Vuetify);

const localVue = createLocalVue();
localVue.use(Vuex);

const $route = {
  path: "/fake/path",
  params: {
    account_id: "38e690f8-198f-4735-96fb-3a2ab15081c2"
  }
};

const $uuid = uuid;

const data = mock_budget.rows.map(row => row.doc);
let numberOfAccounts = null;

describe("accounts table", () => {
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
    store.state.pouchdb.month_selected = "2020-12";
    store.state.selectedBudgetID = "cc28ac0b-19fe-4735-a2e7-9bb91d54b6cc";
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
        $route,
        $uuid
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
    await wrapper.find("#addAccountBtn").trigger("click");

    // Verify modal is open
    expect(wrapper.find(".v-dialog .title").text()).toEqual("Edit Account");
  });

  it("create new account", async () => {
    // Open modal
    await wrapper.find("#addAccountBtn").trigger("click");

    //Mocks & setup
    wrapper.vm.$store.dispatch = jest.fn();
    jest.spyOn(wrapper.vm.$uuid, "v4").mockReturnValueOnce("3528ac0b-19fe-4735-a2e7-9bb91d54b6ba");

    await wrapper.find("#nameField").setValue("nameofnewAccount");
    await wrapper.find("#typeField").setValue("CHECKING");
    await wrapper.find("#noteField").setValue("test note");

    await wrapper.find("#saveAccountBtn").trigger("click");

    expect(wrapper.vm.$store.dispatch).toBeCalledWith("createUpdateAccount", {
      account: {
        _id: "b_cc28ac0b-19fe-4735-a2e7-9bb91d54b6cc_account_3528ac0b-19fe-4735-a2e7-9bb91d54b6ba",
        type: "CHECKING",
        checkNumber: true,
        closed: false,
        name: "nameofnewAccount",
        note: "test note",
        sort: 0,
        onBudget: true,
        balanceIsNegative: false
      },
      initialBalance: 0
    });
  });
});
