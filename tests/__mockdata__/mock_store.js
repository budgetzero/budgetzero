

import budget from "@/store/modules/budget-module";
import pouchdb from "@/store/modules/pouchdb-module";

import { cloneDeep } from 'lodash'


const mock_store = {
  state: {

  },
  modules: {
    budget: cloneDeep(budget),
    pouchdb: cloneDeep(pouchdb),
  },
  getters: {
    // accounts: state => state.accounts,
    // transactions: state => state.transactions,
    // monthlyData: state => state.monthlyData,
    // masterCategories: state => state.masterCategories,
    // categories: state => state.categories,
    // month_selected: state => state.month_selected,
    // account_balances: () => {
    //   return account_balances;
    // },
    // transactions_by_account: () => {
    //   return transactions_by_account;
    // },
    // month_category_lookup: () => {
    //   return month_category_lookup;
    // },
    // categoriesGroupedByMaster: () => {
    //   return categoriesGroupedByMaster;
    // },
    // selectedBudgetID: state => state.selectedBudgetID,
  }
};

export { mock_store };
