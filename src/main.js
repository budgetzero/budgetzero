import Vue from 'vue'
import App from './App.vue'

import UUID from 'vue-uuid'

import PouchDB from 'pouchdb-browser'

import Vue2Filters from 'vue2-filters'

// css for vue-select
import 'vue-select/dist/vue-select.css'
import vSelect from 'vue-select'

import colors from 'vuetify/lib/util/colors'
import vuetify from './plugins/vuetify'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

import Vuelidate from 'vuelidate'

import VueRouter from 'vue-router' // prints 'idb'

import store from './store'
import Settings from './components/Settings'
import Transactions from './components/TransactionView/Transactions'

import Accounts from './components/AccountView/Accounts'
import BudgetGrid from './components/BudgetView/BudgetGrid'
import Reports from './components/Reports.vue'


import { createPinia, PiniaVuePlugin } from 'pinia'
Vue.use(PiniaVuePlugin)
const pinia = createPinia()

/**
 * Sweet Alert
 */
import VueSweetalert2 from 'vue-sweetalert2'

const options = {
  confirmButtonColor: '#263238',
  cancelButtonColor: '#ff7674'
  // background: '#990000'
}

Vue.use(VueSweetalert2, options)
/** */

Vue.use(require('vue-moment'))

Vue.use(UUID)
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-live-find'))
PouchDB.plugin(require('pouchdb-authentication'))
PouchDB.plugin(require('pouchdb-erase'))

Vue.use(Vue2Filters)
Vue.component('VSelect', vSelect)
Vue.use(Vuelidate)

Vue.config.productionTip = false
Vue.use(VueRouter)

export var router = new VueRouter({
  mode: process.env.IS_ELECTRON ? 'hash' : 'history',
  routes: [
    {
      path: '*',
      redirect: '/budget'
    },
    {
      path: '/settings',
      component: Settings
    },
    {
      path: '/accounts',
      component: Accounts
    },
    {
      path: '/reports',
      component: Reports
    },
    {
      path: '/transactions',
      name: 'all_transactions',
      component: Transactions
    },
    {
      path: '/transactions/:account_id',
      name: 'transactions',
      component: Transactions
    },
    {
      path: '/budget',
      component: BudgetGrid
    },
  ]
})

import { sync } from 'vuex-router-sync'
// sync(store, router)

const vm = new Vue({
  store,
  created() {},
  methods: {},
  vuetify,
  router,
  pinia,
  render: h => h(App)
}).$mount('#app')


