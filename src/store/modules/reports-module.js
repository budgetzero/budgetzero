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
      netWorth: (state, getters) => {
          var networth = []
          var incomeNextMonth = 0
          Object.entries(getters.transaction_lookup).forEach(entry => {
              const [key, month] = entry;
              var monthItem = {}

              monthItem.month = key
              monthItem.income = (month.income + incomeNextMonth)/100
              monthItem.spent = month.value/100
              networth.push(monthItem)

              incomeNextMonth = month.incomeNextMonth
          });

          return networth
      }
  
  },
  mutations: {
   
  },
    actions: {
    }
}

