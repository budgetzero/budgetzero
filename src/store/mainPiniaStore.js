import { defineStore } from 'pinia'
import moment from 'moment'

export const useMainStore = defineStore('mainPinia', {
  state: () => {
    return {
      snackBarMessage: '',
      snackBarColor: '',
      snackBar: false,
      sync_state: '',
      selectedBudgetID: null,
      month_selected: moment(new Date()).format('YYYY-MM'),
      manageBudgetOverlay: true,
      loadingOverlay: true,
    }
  },
  actions: {
    setSnackbarMessage(payload) {
      this.snackBarMessage = payload.snackBarMessage
      this.snackBarColor = payload.snackBarColor

      this.snackBar = true
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