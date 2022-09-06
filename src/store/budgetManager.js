import { defineStore } from 'pinia'
import moment from 'moment'
import {
  schema_budget,
  schema_budget_opened,
  schema_account,
  schema_transaction,
  schema_category,
  schema_m_category,
  schema_masterCategory,
  schema_payee,
  validateSchema
} from '../validation'
import _ from 'lodash'
import { usePouchDBStore } from './pouchdbStore'

export const useBudgetManagerStore = defineStore('budgetManager', {
  state: () => ({
    budgetData: [],
    budgetID: null,
    budgetsAvailable: [],
    transactions: [],
    monthCategoryBudgets: [],
    payees: [],
    masterCategories: [],
    accounts: [],
    categories: [],
    transaction_lookup: null,
    month_category_lookup: null,
    transaction_lookup: null,
    all_months: null,
    monthlyData: null
  }),
  getters: {
    category_map() {
      return this.categories.reduce((map, obj) => {
        const id = obj._id ? obj._id.slice(-36) : null
        map[id] = obj.name
        return map
      }, {})
    },
    payee_map() {
      let payees = this.payees.reduce((map, obj) => {
        const id = obj._id ? obj._id.slice(-36) : null
        map[id] = obj.name
        return map
      }, {})
      payees['---------------------initial-balance'] = 'Initial Balance'
      return payees
    },
    account_map() {
      return this.accounts.reduce((map, obj) => {
        map[obj._id.slice(-36)] = obj.name
        return map
      }, {})
    },
    transactionsGroupedByAccount() {
      return _.groupBy(this.transactions, 'account')
    },
    accountBalances() {
      const accountBalances = this.transactions.reduce((map, obj) => {
        const amt = obj.value ? obj.value : 0

        if (!(obj.account in map)) {
          map[obj.account] = { cleared: 0, uncleared: 0, working: 0 }
        }

        if (obj.cleared) {
          map[obj.account].cleared += amt
        } else {
          map[obj.account].uncleared += amt
        }

        map[obj.account].working += amt

        return map
      }, {})

      this.accounts.forEach((account) => {
        // Add in missing account keys
        if (!(account._id.slice(-36) in accountBalances)) {
          accountBalances[account._id.slice(-36)] = { cleared: 0, uncleared: 0 }
        }
      })
      return accountBalances
    },
    categoriesGroupedByMaster() {
      return _.groupBy(this.categories, 'masterCategory')
    },
  },
  actions: {
    initializeBudget() {
      this.loadAvailableBudgets()

      this.budgetsAvailable = null
      this.transactions = this.budgetData.filter((row) => row._id.includes('_transaction_'))
      this.monthCategoryBudgets = this._month_category_budgets()
      this.payees = this.budgetData.filter((row) => row._id.includes('_payee_'))
      this.masterCategories = this.budgetData.filter((row) => row._id.includes('_master-category_'))
      this.accounts = this.budgetData.filter((row) => row._id.includes('_account_'))

      const defaultCategories = [
        {
          _id: null,
          name: 'Uncategorized'
        },
        {
          _id: 'income',
          name: 'Income This Month'
        },
        {
          _id: 'incomeNextMonth',
          name: 'Income Next Month'
        }
      ]
      this.categories = this.budgetData
        .filter((row) => row._id.includes('_category_'))
        .filter((row) => !row._id.includes('m_category'))
        .concat(defaultCategories)

      this.transaction_lookup = this._transaction_lookup()
      this.month_category_lookup = this._month_category_lookup()
      this.transaction_lookup = this._transaction_lookup()
      this.all_months = this._all_months()

      this.calculateMonthlyData()
    },

    async loadBudgetWithID(budgetID) {
      const pouchdbStore = usePouchDBStore()

      this.budgetID = budgetID
      try {
        let res = await pouchdbStore.localdb.allDocs({
          include_docs: true,
          attachments: true,
          startkey: `b_${budgetID}_`,
          endkey: `b_${budgetID}_\ufff0`
        })
        this.budgetData = res.rows.map((row) => row.doc)
        this.initializeBudget()
      } catch (err) {
        console.log('error=', err)
      }
    },

    async loadAvailableBudgets() {
      const pouchdbStore = usePouchDBStore()
      try {
        let resp = await pouchdbStore.localdb.allDocs({
          include_docs: true,
          attachments: true,
          startkey: 'budget_',
          endkey: 'budget_\ufff0'
        })
        this.budgetsAvailable = resp.rows.map((row) => row.doc)
      } catch (err) {
        console.log('error=', err)
      }
    },

    async loadMockDataIntoPouchDB(data, id) {
      const pouchdbStore = usePouchDBStore()
      try {
        await pouchdbStore.localdb.bulkDocs(data)
      } catch (err) {
        console.log('error=', err)
      }
      try {
        await this.loadBudgetWithID(id)
      } catch (err) {
        console.log('error=', err)
      }
    },

    async putDocument(doc) {
      const pouchdbStore = usePouchDBStore()
      // Validate document
      try {
        if (!this._isValidDocument(doc)) {
          throw Error('Document failed validation')
        }
      } catch (err) {
        throw err
      }

      // Check if document already exists
      // May be able to remove in the future?
      let addingNewDocument = false
      var originalDoc
      try {
        originalDoc = await pouchdbStore.localdb.get(doc._id)
        doc._rev = originalDoc._rev // update _rev just in case
      } catch (err) {
        if (err.name === 'not_found') {
          addingNewDocument = true
        } else {
          throw err
        }
      }

      let response
      try {
        response = await pouchdbStore.localdb.put(doc)
      } catch (err) {
        throw err
      }

      if (addingNewDocument) {
        this.budgetData.push(doc)
        this.initializeBudget()
      } else {
        // reload entire budget
        await this.loadBudgetWithID(this.budgetID)
      }

      return response
    },

    async putBulkDocuments(docs) {
      const pouchdbStore = usePouchDBStore()
      // Validate documents
      try {
        docs.forEach((doc) => {
          if (!this._isValidDocument(doc)) {
            throw Error('Document failed validation')
          }
        })
      } catch (err) {
        throw err
      }

      let response
      try {
        response = await pouchdbStore.localdb.bulkDocs(docs)
      } catch (err) {
        throw err
      }

      // reload entire budget
      await this.loadBudgetWithID(this.budgetID)

      return response
    },

    _isValidDocument(payload) {
      var docType = null
      var _id = null

      //Validation
      var index = null
      if (payload._id.startsWith('budget_')) {
        docType = 'budget'
        _id = payload._id.substring(7)
      } else if (payload._id.startsWith('budget-opened_')) {
        docType = 'budget-opened'
      } else {
        docType = payload._id.substring(payload._id.indexOf('_', 5) + 1, payload._id.lastIndexOf('_', 55))
      }

      var validationResult = {
        errors: 'Validation schema not found.'
      }

      switch (docType) {
        case 'transaction':
          validationResult = validateSchema.validate(payload, schema_transaction)
          break
        case 'category':
          validationResult = validateSchema.validate(payload, schema_category)
          break
        case 'master-category':
          validationResult = validateSchema.validate(payload, schema_masterCategory)
          break
        case 'account':
          validationResult = validateSchema.validate(payload, schema_account)
          break
        case 'm_category':
          validationResult = validateSchema.validate(payload, schema_m_category)
          break
        case 'payee':
          validationResult = validateSchema.validate(payload, schema_payee)
          break
        case 'budget':
          validationResult = validateSchema.validate(payload, schema_budget)
          break
        case 'budget-opened':
          //TODO: validate
          validationResult = validateSchema.validate(payload, schema_budget_opened)
          break
        default:
          console.error('Doesnt recognize doc type ', docType)
      }

      if (validationResult.errors.length > 0) {
        console.log('Failed validation:', payload)
        return false
      }

      return true
    },

    /**
     * Recalculates entire budget
     * TODO: Make more efficient and add caching
     */
    calculateMonthlyData() {
      var self = this
      var final_data = {}
      var previous_month = {}

      const t7 = performance.now()

      //Iterate each month
      this.all_months.forEach((month) => {
        final_data[month] = {}
        final_data[month].categories = {}
        var summaryData = {
          income_this_month: 0,
          overspent: 0,
          last_month_overspent: _.get(previous_month, `summaryData.overspent`, 0),
          balance_this_month: 0,
          budgeted_this_month: 0,
          available_to_budget_this_month: 0, //_.get(getters.transaction_lookup, `${month}.income`, 0)
          available_to_budget_last_month: _.get(previous_month, `summaryData.available_to_budget_this_month`, 0)
        }

        const previousMonth = moment(month).subtract(1, 'M').format('YYYY-MM')

        //Iterate over each category
        _.forEach(
          self.categories.filter((cat) => cat._id !== 'income').filter((cat) => cat._id !== 'incomeNextMonth'),
          function (category) {
            const t0 = performance.now()

            const cat_id = category._id ? category._id.slice(-36) : null
            const spent = _.get(self.transaction_lookup, `${month}.${cat_id}`, 0)
            const budgeted = _.get(self.month_category_lookup, `${month}.${cat_id}.budget`, 0)
            const activity = spent + budgeted
            const prev_month = _.get(previous_month, `categories.${cat_id}.overspending`, false)

            // const category_balance =
            //   prev_month && (prev_month.balance > 0 || prev_month.overspending)
            //     ? activity + prev_month.balance
            //     : activity;
            const isOverspending = _.get(self.month_category_lookup, `${month}.${cat_id}.overspending`, false)
            const t1 = performance.now()

            var category_balance
            var category_balance_raw = _.get(previous_month, `categories.${cat_id}.balance`, 0)
            if (category_balance_raw > 0 || prev_month) {
              category_balance = activity + category_balance_raw
            } else {
              category_balance = activity
            }

            // const category_balance =
            //   (previous_month.categories[cat_id] && previous_month.categories[cat_id] && previous_month.categories[cat_id].balance > 0) || prev_month
            //     ? activity + previous_month.categories[cat_id].balance
            //     : activity;

            if (isOverspending) {
              //Need to carry over overspent balance to next month
            }

            final_data[month]['categories'][cat_id] = {
              budgeted: budgeted,
              spent: spent,
              balance: category_balance,
              overspending: isOverspending
            }

            summaryData.overspent += category_balance < 0 && !isOverspending ? category_balance : 0
            summaryData.budgeted_this_month += budgeted

            // console.log("Call to SECTION took " + (t1 - t0) + " milliseconds.");
          }
        )

        summaryData.income_this_month =
          _.get(self.transaction_lookup, `${month}.income`, 0) +
          _.get(self.transaction_lookup, `${previousMonth}.incomeNextMonth`, 0)
        summaryData.available_to_budget_this_month =
          summaryData.available_to_budget_last_month +
          summaryData.income_this_month -
          summaryData.budgeted_this_month +
          summaryData.last_month_overspent

        previous_month = final_data[month]
        final_data[month].summaryData = summaryData
      })

      const t8 = performance.now()
      this.monthlyData = final_data
      // console.log('Call to getMonthlyData took ' + (t8 - t7) + ' milliseconds.')
    },

    /**
     * Calculates months with transactions/budgeted entries, and fills in any gaps
     * @returns array of months
     */
    _all_months() {
      const combined = this.monthCategoryBudgets.concat(this.transactions)
      var months = [...new Set(combined.map((entry) => entry.date.slice(0, 7)))].sort()
      const [lastMonth] = months.slice(-1)
      const lastMonthPlusOne = moment(lastMonth).add(1, 'M').format('YYYY-MM')
      const lastMonthPlusTwo = moment(lastMonth).add(2, 'M').format('YYYY-MM')

      return months.concat(lastMonthPlusOne).concat(lastMonthPlusTwo)
    },

    /**
     * Internal calculation
     */
    _transaction_grouping() {
      // TODO filter transactions to on budget only
      return this.transactions.reduce(function (rv, item) {
        var date_key = 'date' in item ? item.date.slice(0, 7) : 'noddd'
        ;(rv[date_key] = rv[date_key] || []).push(item)

        return rv
      }, {})
    },

    /**
     * Internal calculation
     */
    _transaction_lookup() {
      var self = this
      var final = {}

      //For each month
      for (const [key, value] of Object.entries(self._transaction_grouping())) {
        var sum = 0
        //For each transaction in the month. value is array of transactions
        final[key] = value.reduce(function (rv, item) {
          var date_key = 'date' in item ? item.date.slice(0, 7) : 'noddd'
          var amount = 'value' in item ? item.value : 0
          var id = ''

          self.categories.forEach((category) => {
            if (category._id === 'income' || category._id === 'incomeNextMonth' || category._id === null) {
              id = category._id
            } else {
              id = category._id.slice(-36)
            }
            if (item.category == id) {
              rv[id] = rv[id] ? rv[id] + item.value : item.value
            } else {
              rv[id] = rv[id] ? rv[id] : 0
            }
          })
          ;(rv['docs'] = rv['docs'] || []).push(item)
          rv['value'] = rv['value'] ? rv['value'] + item.value : item.value
          return rv
        }, {})
      }
      return self._sortDict(final)
    },

    /**
     * Internal calculation
     */
    _month_category_lookup() {
      return this.monthCategoryBudgets.reduce(function (map, obj) {
        if (!map[obj.date.slice(0, 7)]) {
          map[obj.date.slice(0, 7)] = {}
        }
        map[obj.date.slice(0, 7)][obj._id.slice(-36)] = obj

        return map
      }, {})
    },

    /**
     * Internal calculation
     */
    _month_category_budgets() {
      return this.budgetData
        .filter((row) => row._id.includes('_m_category_'))
        .map((row) => {
          // Extract date from the id and add it as a separate property
          row.date = row._id.slice(50, 60)
          return row
        })
    },

    /**
     * Sort helper function
     */
    _sortDict(obj) {
      return Object.keys(obj)
        .sort()
        .reduce(function (result, key) {
          result[key] = obj[key]
          return result
        }, {})
    },
  }
})
