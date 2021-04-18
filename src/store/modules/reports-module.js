import moment from "moment";
import Vue from "vue";
import validator from "validator";
import _ from "lodash";

export default {
  state: {

  },
  getters: {
    /**
     * Dict of on-budget transactions grouped by YYYY-MM
     * Used to graph net worth report
     */
    netWorth: (state, getters) => {
      return getters.transactionsOnBudget.reduce(function(rv, item) {
          var date_key = "date" in item ? item.date.slice(0, 7) : null;

          if (date_key) {
              rv[date_key] = rv[date_key] || 0
              rv[date_key] += item.value / 100
          }
        return rv;
      }, {});
    },

  
  },
  mutations: {
   
  },
    actions: {
    }
}
