import Vue from "vue";
import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import store_config from "@/store";
import mock_budget2 from "@/../tests/__mockdata__/mock_budget2.json";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("vuex budget module", () => {
  let store
  let actions

  beforeAll(() => {

    const store = store_config
    Vue.prototype.$vm = localVue;

    store.dispatch("createLocalPouchDB");
    store.dispatch('commitBulkDocsToPouchAndVuex', mock_budget2)


  });

  it("monthlyData getter matches snapshot", async () => {
    console.log(localVue)
    localVue.prototype.$vm.$store.dispatch("calculateMonthlyData");
    expect(store.getters.monthlyData).toMatchSnapshot();
  });

 
});


