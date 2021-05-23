import Vue from "vue";
import Vuex from "vuex";
import PouchDB from "pouchdb";

import { createLocalVue } from "@vue/test-utils";
import store_config from "@/store";
import mock_budget2 from "@/../tests/__mockdata__/mock_budget2.json";
import { config } from '@vue/test-utils'

const localVue = createLocalVue();
localVue.use(Vuex);

describe("vuex budget module", () => {
  let store;

  beforeAll(() => {

    // const pouch = new PouchDB("budgetzero_local_db");
    // Vue.prototype.$pouch = pouch;
    // config.mocks['$pouch'] = pouch

    store = store_config

    store.dispatch("createLocalPouchDB");


  });

  it("monthlyData getter matches snapshot", async () => {
    store.dispatch("calculateMonthlyData");

    expect(store.getters.monthlyData).toMatchSnapshot();
  });

 
});


