import Vue from "vue";
import App from "./App.vue";

import UUID from "vue-uuid";

import PouchDB from "pouchdb-browser";
import PouchLiveFind from "pouchdb-live-find";
import PouchFind from "pouchdb-find";

import Vue2Filters from "vue2-filters";

// css for vue-select
import "vue-select/dist/vue-select.css";
import vSelect from "vue-select";

import colors from "vuetify/lib/util/colors";
import vuetify from "./plugins/vuetify";
import "material-design-icons-iconfont/dist/material-design-icons.css";

import Vuelidate from "vuelidate";

import VueRouter from "vue-router"; // prints 'idb'

import store from "./store";
import Settings from "./components/Settings";
import Transactions from "./components/TransactionView/Transactions";

import Accounts from "./components/AccountView/Accounts";
import BudgetGrid from "./components/BudgetView/BudgetGrid";
import Login from "./components/Auth/Login.vue";
import Profile from "./components/Auth/Profile.vue";
import CreateBudget from "./components/CreateBudget.vue";
import Manage from "./components/Manage.vue";

/**
 * Sweet Alert
 */
import VueSweetalert2 from 'vue-sweetalert2';

const options = {
  confirmButtonColor: '#263238',
  cancelButtonColor: '#ff7674',
  // background: '#990000'
};

Vue.use(VueSweetalert2, options);
/** */

/**
 * Treeview for debugger
 */
import TreeView from "vue-json-tree-view"
Vue.use(TreeView)
/** */

Vue.use(require("vue-moment"));

Vue.use(UUID);
PouchDB.plugin(require("pouchdb-find"));
PouchDB.plugin(require("pouchdb-live-find"));
PouchDB.plugin(require("pouchdb-authentication"));
// PouchDB.plugin(require('pouchdb-load'));
PouchDB.plugin(require("pouchdb-erase"));

Vue.use(Vue2Filters);
Vue.component("VSelect", vSelect);
Vue.use(Vuelidate);


Vue.config.productionTip = false;
Vue.use(VueRouter);

const ifAnyBudgetExists = (to, from, next) => {
  if (store.getters.budgetRoots.length > 0 || from.path === "/create") {
    console.log('root', store.getters.budgetRoots.length )
    next()
    return
  }
  Vue.prototype.$swal({ title: 'Create Budget', text: 'Time to create a budget!', confirmButtonText:'Lets Get Started' })
  next('/create')
}

// eslint-disable-next-line vars-on-top
export var router = new VueRouter({
  mode: process.env.IS_ELECTRON ? 'hash' : 'history',
  routes: [
    {
      path: "*",
      redirect: "/budget"
    },
    {
      path: "/settings",
      component: Settings
      // beforeEnter: ifAuthenticated,
    },
    {
      path: "/manage",
      component: Manage,
      // beforeEnter: ifAnyBudgetExists,
    },
    {
      path: "/accounts",
      component: Accounts,
      // beforeEnter: ifAnyBudgetExists,
    },
    {
      path: "/transactions",
      name: "all_transactions",
      component: Transactions,
      // beforeEnter: ifAnyBudgetExists,
    },
    {
      path: "/transactions/:account_id",
      name: "transactions",
      component: Transactions,
      // beforeEnter: ifAnyBudgetExists,
    },
    {
      path: "/budget",
      component: BudgetGrid,
      // redirect: '/budget',
      // beforeEnter: ifAnyBudgetExists,
    },
    {
      path: "/login",
      component: Login
      // beforeEnter: ifNotAuthenticated
    },
    {
      path: "/profile",
      component: Profile
      // beforeEnter: ifNotAuthenticated
    },
    {
        path: '/create',
        component: CreateBudget,
    },
  ]
});


import { sync } from "vuex-router-sync";
sync(store, router);

const vm = new Vue({
  store,
  created() {
  
  },
  methods: {},
  vuetify,
  router,
  render: h => h(App)
}).$mount("#app");

const pouch = new PouchDB("budget_zero_local_db");
Vue.prototype.$pouch = pouch;

//TODO: Allows access to vm within Vuex store. May want to research alternative ways... this._vm may work within store?
Vue.prototype.$vm = vm; 

vm.$store.dispatch("loadLocalBudgetRoot");
