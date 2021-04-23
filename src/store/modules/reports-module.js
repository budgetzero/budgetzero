import moment from "moment";
import Vue from "vue";
import validator from "validator";
import _ from "lodash";

export default {
  state: {

  },
  getters: {
    /**
     * Used to graph net worth report
     */
      incomeAndSpentByMonth: (state, getters) => {
          var incomeAndSpentByMonth = []
          var incomeNextMonth = 0
          var netWorth = 0

          Object.entries(getters.transaction_lookup).forEach(entry => {
              const [key, month] = entry;
              var monthItem = {}

              monthItem.month = key
              monthItem.income = (month.income + incomeNextMonth)/100
              monthItem.spent = monthItem.income - (month.value/100)
              incomeAndSpentByMonth.push(monthItem)

              netWorth = netWorth + (month.value/100) 
              monthItem.netWorth = netWorth
              
              incomeNextMonth = month.incomeNextMonth
          });

          return incomeAndSpentByMonth
      }
  
  },
  mutations: {
   
  },
    actions: {
    }
}

