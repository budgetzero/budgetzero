import { defineStore } from 'pinia'
import { useBudgetManagerStore } from './budgetManager'

export const useReportsStore = defineStore('reports', {
  state: () => {
    return {}
  },
  getters: {
    incomeAndSpentByMonth() {
      const budgetManagerStore = useBudgetManagerStore()

      var incomeAndSpentByMonth = []
      var incomeNextMonth = 0
      var netWorth = 0

      Object.entries(budgetManagerStore.transaction_lookup).forEach((entry) => {
        const [key, month] = entry
        var monthItem = {}

        monthItem.month = key
        monthItem.income = (month.income + incomeNextMonth) / 100
        monthItem.spent = monthItem.income - month.value / 100
        incomeAndSpentByMonth.push(monthItem)

        netWorth = netWorth + month.value / 100
        monthItem.netWorth = netWorth

        incomeNextMonth = month.incomeNextMonth
      })

      return incomeAndSpentByMonth
    }
  }
})
