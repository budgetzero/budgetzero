import Vue from 'vue'
import Vuex from 'vuex'
import budget from './modules/budget-module'
import reports from './modules/reports-module'
import pouchdb from './modules/pouchdb-module'
import moment from 'moment'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    budget,
    pouchdb,
    reports,
  },
  state: {
    snackbarMessage: '',
    snackbarColor: '',
    snackbar: false,
    sync_state: '',
    selectedBudgetID: null,
    month_selected: moment(new Date()).format('YYYY-MM')
  },
  getters: {
    snackbarMessage: state => state.snackbarMessage,
    snackbarColor: state => state.snackbarColor,
    sync_state: state => state.sync_state,
    snackbar: state => state.snackbar,
    selectedBudgetID: state => state.selectedBudgetID,
    month_selected: state => state.month_selected
  },
  mutations: {
    SET_STATUS_MESSAGE(state, message) {
      // console.log('failure');
      state.sync_state = `${message}`
    },
    SET_SNACKBAR_MESSAGE(state, payload) {
      state.snackbarMessage = payload.snackbarMessage
      state.snackbarColor = payload.snackbarColor

      state.snackbar = true
    },
    SET_SNACKBAR(state, snackbar) {
      state.snackbar = snackbar
    },
    ADD_MONTH(state) {
      state.month_selected = moment(state.month_selected)
        .add(1, 'M')
        .format('YYYY-MM')
    },
    PREVIOUS_MONTH(state) {
      state.month_selected = moment(state.month_selected)
        .subtract(1, 'M')
        .format('YYYY-MM')
    },
    GO_TO_CURRENT_MONTH(state) {
      state.month_selected = moment(new Date()).format('YYYY-MM')
    },
    UPDATE_SELECTED_BUDGET(state, payload) {
      state.selectedBudgetID = payload
      localStorage.budgetID = payload
    }
  },
  actions: {
    setSnackBarBoolean(context, snackbar) {
      context.commit('SET_SNACKBAR', snackbar)
    },
    setSelectedBudgetID(context, payload) {
      context.commit('UPDATE_SELECTED_BUDGET', payload)
      context.dispatch('loadLocalBudgetRoot')
    }
  }
})
