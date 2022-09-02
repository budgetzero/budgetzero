import { defineStore } from 'pinia'
import moment from 'moment'

export const useMainStore = defineStore('mainPinia', {
  state: () => {
    return {
      snackbarMessage: '',
      snackbarColor: '',
      snackbar: false,
      sync_state: '',
      selectedBudgetID: null,
      month_selected: moment(new Date()).format('YYYY-MM')
    }
  },
  actions: {
    setSnackbarMessage(payload) {
      this.snackbarMessage = payload.snackbarMessage
      this.snackbarColor = payload.snackbarColor

      this.snackbar = true
    },
    addMonth() {
      this.month_selected = moment(this.month_selected).add(1, 'M').format('YYYY-MM')
    },
    subtractMonth() {
      this.month_selected = moment(this.month_selected).subtract(1, 'M').format('YYYY-MM')
    },
    setCurrentMonth() {
      this.month_selected = moment(new Date()).format('YYYY-MM')
    },
  }
})