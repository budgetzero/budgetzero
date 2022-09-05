import BudgetGrid from "@/components/BudgetView/BudgetGrid.vue";
import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import Vuetify from "vuetify";
import mock_budget from "@/../tests/__mockdata__/mock_budget.json";
import store from "@/store";

import Vue from "vue";
Vue.use(Vuetify);
Vue.config.productionTip = false;

const localVue = createLocalVue();

const $route = {
  path: "/fake/path",
  params: {
    account_id: "38e690f8-198f-4735-96fb-3a2ab15081c2"
  }
};

// Load mock budget file and parse into vuex state
const data = mock_budget.rows.map(row => row.doc);
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

describe("Category group button", () => {
  let vuetify;
  let wrapper;

  beforeEach(() => {
    vuetify = new Vuetify();
    localVue.use(vuetify);
    localVue.use(Vuex);

    store.state.month_selected = "2020-12";
    wrapper = mount(BudgetGrid, {
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

    //Open modal for each test
    wrapper.find("#btn-add-category-group").trigger("click");
  });

  it("should exist", () => {
    expect(wrapper.find("#btn-add-category-group").exists()).toBeTruthy();
  });

  it("modal displays correct title", () => {
    expect(wrapper.find(".v-dialog .title").text()).toEqual("Create a Category Group:");
  });

  it("clicking create button calls createMasterCategory function", () => {
    const spy123 = spyOn(wrapper.vm, "createMasterCategory");

    // Find text element and input new category name
    var input = wrapper.find("#txt_field_category_name");
    input.element.value = "my test category gp name";
    input.trigger("input");

    //Click the create button in modal
    wrapper.find("#btn-createMasterCategory").trigger("click");

    expect(spy123).toBeCalledWith("my test category gp name");
  });

  it("creating with empty category name does NOT call vuex action", () => {
    wrapper.vm.$store.dispatch = jest.fn();
    wrapper.vm.category_name = "";
    wrapper.find("#btn-createMasterCategory").trigger("click");
    expect(wrapper.vm.$store.dispatch).not.toBeCalled();
  });

  it("create new category function dispatchs vuex action", () => {
    wrapper.vm.$store.dispatch = jest.fn();
    wrapper.vm.createMasterCategory("new category");
    expect(wrapper.vm.$store.dispatch).toBeCalledWith("createMasterCategory", "new category");
  });
});

describe("Modify button", () => {
  let vuetify;
  let wrapper;

  beforeEach(() => {
    vuetify = new Vuetify();
    localVue.use(vuetify);
    localVue.use(Vuex);

    store.state.month_selected = "2020-12";
    wrapper = mount(BudgetGrid, {
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

    wrapper.find("#btn-modify").trigger("click");
  });

  it("should exist", () => {
    expect(wrapper.find("#btn-modify").exists()).toBeTruthy();
  });

  it("button displays correct title when clicked", async () => {
    expect(wrapper.find("#btn-modify > span").text()).toEqual("Done");

    wrapper.find("#btn-modify").trigger("click");
    await localVue.nextTick();
    expect(wrapper.find("#btn-modify > span").text()).toEqual("Modify");
  });

  it("edit category group buttons appear with modify btn clicked", () => {
    expect(wrapper.findAll("#btn-editCategoryGroup").length).toEqual(
      store.state.pouchdb.masterCategories.length
    );
  });

  it("edit category buttons appear with modify btn clicked", () => {
    expect(wrapper.findAll("#btn-editCategory").length).toEqual(
      store.state.pouchdb.categories.length
    );
  });

  it("edit category group shows modal", async () => {
    expect(wrapper.find("#btn-modify > span").text()).toEqual("Done");

    // Open modal
    wrapper.find("#btn-editCategoryGroup:first-of-type").trigger("click");
    await localVue.nextTick();

    // Verify modal is open
    expect(wrapper.find(".v-dialog .title").text()).toEqual("Edit Category Name:");

    // Verify category name is prepopulated
    var input = wrapper.find("#txt-categoryName");
    expect(input.element.value).toEqual(store.state.pouchdb.masterCategories[0].name);
  });

  it("edit category group calls function", async () => {
    // Open modal
    wrapper.find("#btn-editCategoryGroup:first-of-type").trigger("click");
    await localVue.nextTick();

    //Edit category name
    var input = wrapper.find("#txt-categoryName");
    input.element.value = "my test category name";
    input.trigger("input");

    // Trigger save
    const spy123 = spyOn(wrapper.vm, "saveCategory");
    wrapper.find("#btn-save").trigger("click");
    expect(wrapper.vm.editedCategory.name).toEqual("my test category name");
    expect(spy123).toBeCalledWith();
  });
 
});

describe("budgetgrid component", () => {
  let vuetify;
  let wrapper;

  beforeEach(() => {
    vuetify = new Vuetify();
    localVue.use(vuetify);
    localVue.use(Vuex);

    store.state.month_selected = "2020-12";
    wrapper = mount(BudgetGrid, {
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

  it("renders correct snapshot", () => {
    expect(wrapper.html()).toMatchSnapshot();
    // expect(wrapper.vm.transactionListForTable.length).toBe(22);
  });

  it("renders correct number of category rows", () => {
    expect(wrapper.findAll(".category-row")).toHaveLength(
      wrapper.vm.$store.state.pouchdb.categories.length
    );
  });

  it("renders correct number of master category rows", () => {
    expect(wrapper.findAll(".master-category-row")).toHaveLength(5);
    expect(wrapper.findAll(".master-category-row")).toHaveLength(
      wrapper.vm.$store.getters.masterCategories.length
    );
  });

  it("renders available-to-budget-amount", () => {
    expect(wrapper.find("#available-to-budget-amount").exists()).toBeTruthy();
    // expect(wrapper.find("#available-to-budget-amount").text()).toEqual("36978.38");
  });

  it("renders budget-input for each category", () => {
    expect(wrapper.findAll("#budget-input")).toHaveLength(
      wrapper.vm.$store.state.pouchdb.categories.length
    );
  });

  it("renders budget-input for each category", async () => {
    const spy123 = spyOn(wrapper.vm, "budgetValueChanged");

    const budget_input = wrapper.find("#budget-input");
    budget_input.element.value = 500;
    // await budget_input.trigger("input");
    // await budget_input.trigger("keypress", { key: "Enter" });
    budget_input.trigger("change");

    // const item123 = {
    //   budget: 4400,
    //   overspending: null,
    //   note: "",
    //   _id:
    //     "b_79de488f-448e-4b4d-97ad-61e5e4f5df31_m_category_2020-12-01_a937afd4-17f0-48a8-b5a9-2a21e5ec2869",
    //   _rev: "2-30c16c9cf6446e71ca31111dda0e966e",
    //   date: "2020-12-01"
    // };
    // wrapper.vm.budgetValueChanged(item123, 55555);
    // expect(wrapper.html()).toMatchSnapshot();
    // expect(spy123).toHaveBeenCalledWith();
  });
});
