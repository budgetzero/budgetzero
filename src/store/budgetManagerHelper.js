import { defineStore } from 'pinia'
import { useBudgetManagerStore } from './budgetManager'
import { usePouchDBStore } from './pouchdbStore'

import { v4 as uuidv4 } from 'uuid'
import validator from 'validator'
import { sanitizeValueInput } from '../helper.js'
import _ from 'lodash'

var FileSaver = require('file-saver')

export const useBudgetHelperStore = defineStore('budgetHelper', {
  actions: {
    /**
     * Creates new budget and commits to pouchdb
     * @param {string} budgetName The name of the budget to be created
     */
    async createBudget(budgetName) {
      const budgetManagerStore = useBudgetManagerStore()
      const budget_id = uuidv4()
      const budget = {
        name: budgetName,
        currency: 'USD',
        created: new Date().toISOString(),
        checkNumber: false,
        _id: `budget_${budget_id}`
      }

      var budget_opened = {
        opened: new Date().toISOString(),
        _id: `budget-opened_${budget_id}`
      }

      await budgetManagerStore.putDocument(budget)
      await budgetManagerStore.putDocument(budget_opened)

      // initalize budget categories
      await this.initializeBudgetCategories(budget_id)

      return budget_id
    },

    /**
     * Deletes entire budget
     * @param {*} budgetDoc budget_ document
     */
    async deleteEntireBudget(budgetDoc) {
      const pouchdbStore = usePouchDBStore()
      const budgetManagerStore = useBudgetManagerStore()

      const budget_id = budgetDoc._id.slice(-36)

      const result = await pouchdbStore.localdb.allDocs({
        include_docs: true,
        attachments: true,
        startkey: `b_${budget_id}_`,
        endkey: `b_${budget_id}_\ufff0`
      })

      //Add deleted key to each
      const rowsToDelete = {}
      rowsToDelete.docs = result.rows.map((v) => ({ ...v.doc, _deleted: true }))

      //Bulk delete
      await budgetManagerStore.putBulkDocuments(rowsToDelete.docs, false)

      const budgetOpenedDoc = await pouchdbStore.localdb.get(`budget-opened_${budget_id}`)
      budgetOpenedDoc._deleted = true
      await budgetManagerStore.putDocument(budgetOpenedDoc, false)

      budgetDoc._deleted = true
      await budgetManagerStore.putDocument(budgetDoc, false)

      return budget_id
    },

    /**
     * Initialize categories in a new budget
     */
    async initializeBudgetCategories(budget_id) {
      const budgetManagerStore = useBudgetManagerStore()
      const starterCategories = {
        Giving: ['Tithing', 'Charitable'],
        'Everyday Expenses': ['Restaurants', 'Groceries', 'Household Goods', 'Spending Money'],
        'Monthly Bills': [
          'Medical/Dental',
          'Internet',
          'Rent/Mortgage',
          'Clothing',
          'Water',
          'Renters Insurance',
          'Car Insurance',
          'Phone',
          'Fuel',
          'Car Maintenance',
          'Electricity',
          'Cable TV'
        ],
        Debt: ['Student Loan Payment', 'Car Payment'],
        'Savings Goals': [
          'Rainy Day Funds',
          'Christmas',
          'Birthdays',
          'Emergency Fund',
          'Car Replacement',
          'Retirement',
          'Vacation'
        ]
      }
      for (let [master, subCategories] of Object.entries(starterCategories)) {
        const masterCategoryID = uuidv4()
        const masterCategory = {
          _id: `b_${budget_id}_master-category_${masterCategoryID}`,
          name: master,
          sort: 1,
          collapsed: false
        }

        await budgetManagerStore.putDocument(masterCategory)

        subCategories.forEach(async (sub) => {
          await this.createCategory(budget_id, sub, masterCategoryID)
        })
      }
    },

    /**
     *
     * @param {*} categoryName
     * @param {*} masterCategoryID
     */
    async createCategory(budgetID, categoryName, masterCategoryID) {
      const budgetManagerStore = useBudgetManagerStore()
      const sort_length = 0 //context.getters.categoriesGroupedByMaster[payload.masterCategoryForModalForm]
      // ? context.getters.categoriesGroupedByMaster[payload.masterCategoryForModalForm].length
      // : 0

      const category = {
        name: categoryName,
        hidden: false,
        masterCategory: masterCategoryID,
        sort: sort_length,
        _id: `b_${budgetID}_category_${uuidv4()}`
      }

      await budgetManagerStore.putDocument(category)
    },

    /**
     * Create payee doc.
     * This should only be called from getPayeeID() action.
     * @param {String} payload Plaintext payee name
     * @returns
     */
    createPayee(payload) {
      const budgetManagerStore = useBudgetManagerStore()
      var payee = {
        _id: `b_${budgetManagerStore.budgetID}_payee_${uuidv4()}`,
        name: payload
      }
      return budgetManagerStore.putDocument(payee)
    },

    /**
     * Returns the payee UUID for any payee name. Dispatches action to create the payee if it doesn't exist yet.
     * @param {String} payload Plaintext payee name. e.g. 'Grocery Store'
     * @returns Payee UUID
     */
    async getPayeeID(payload) {
      const budgetManagerStore = useBudgetManagerStore()

      //First, check if this payee has already been created
      const payeeLookup = Object.keys(budgetManagerStore.payee_map).find(
        (key) => budgetManagerStore.payee_map[key] === payload
      )

      if (payeeLookup) {
        return payeeLookup
      } else if (validator.isUUID(`${payload}`)) {
        // If the payload is already UUID then return.
        return payload
      } else if (payload === '---------------------initial-balance') {
        //If it's initial balance then return
        return payload
      } else if (typeof payload === 'undefined' || payload === null || payload === '') {
        // If payload is an object, then it's an existing payee. Otherwise we need to create the payee.
        return null
      } else if (typeof payload != 'string') {
        return payload._id
      } else {
        // Payload is a string. Need to create payee to get an uuid
        let payee = await this.createPayee(payload)
        return payee.id.slice(-36)
      }
    },

    /**
     * Create/update the mirrored transfer transaction
     */
    async saveMirroredTransferTransaction(originalTransaction) {
      const budgetManagerStore = useBudgetManagerStore()
      console.log('the id', originalTransaction._id.slice(-36))
      let mirrorTransaction = {
        _id: `b_${budgetManagerStore.budgetID}_transaction_${uuidv4()}`,
        value: -originalTransaction.value,
        transfer: originalTransaction._id.slice(-36),
        account: originalTransaction.payee,
        payee: originalTransaction.account, //The payee is the _id of the other account
        memo: originalTransaction.memo,
        category: null,
        reconciled: false,
        approved: true,
        flag: '#ffffff',
        date: originalTransaction.date,
        cleared: true,
        splits: []
      }

      //Check if the mirrored transaction doesn't exist then we create
      if (originalTransaction.transfer) {
        const mirrorTransactionExisting = budgetManagerStore.transactions.find((trans) => {
          return trans._id == `b_${budgetManagerStore.budgetID}_transaction_${originalTransaction.transfer}`
        })
        mirrorTransaction._id = `b_${budgetManagerStore.budgetID}_transaction_${originalTransaction.transfer}`

        // Update some values
        mirrorTransaction._id = mirrorTransactionExisting._id
        mirrorTransaction._rev = mirrorTransactionExisting._rev
        mirrorTransaction.transfer = originalTransaction._id.slice(-36)
        console.log('existing', mirrorTransaction)
      }

      console.log('put', JSON.stringify(mirrorTransaction))
      const resp = await budgetManagerStore.putDocument(mirrorTransaction)
      mirrorTransaction._rev = resp.rev

      return mirrorTransaction
    },

    /**
     * Create or update transaction
     * @param {doc} payload The transaction to create or update
     */
    async putTransaction(payload) {
      const budgetManagerStore = useBudgetManagerStore()

      //Check if this is a transfer transaction. if so, get the account ID
      if (payload.payee && payload.payee.includes('Transfer: ')) {
        //account_id is the account the original transfer is going to
        const account_id = Object.keys(budgetManagerStore.account_map).find(
          (key) => budgetManagerStore.account_map[key] === payload.payee.slice(10)
        )
        payload.payee = account_id
        const mirroredTransactionDoc = await this.saveMirroredTransferTransaction(payload)

        //TODO: only let this be a transfer if the account actually exists?
        if (!validator.isUUID(account_id)) {
          throw Error('Cannot find mirrored account')
        }

        payload.transfer = mirroredTransactionDoc._id.slice(-36)
        payload.category = null
      } else {
        payload.transfer = null
      }

      payload.value = sanitizeValueInput(payload.value)

      await this.getPayeeID(payload.payee).then((response) => {
        payload.payee = response
      })
      return budgetManagerStore.putDocument(payload)
    },

    async createUpdateAccount(accountDoc, initialTransactionValue) {
      const budgetManagerStore = useBudgetManagerStore()

      const accountResponse = await budgetManagerStore.putDocument(accountDoc)

      if (initialTransactionValue) {
        const initTransaction = {
          account: accountResponse.id.slice(-36),
          category: null,
          cleared: true,
          approved: true,
          value: sanitizeValueInput(initialTransactionValue) * 100,
          date: new Date().toISOString().slice(0, 10),
          memo: null,
          reconciled: true,
          flag: '#ffffff',
          payee: `---------------------initial-balance`,
          transfer: null,
          splits: [],
          _id: `b_${budgetManagerStore.budgetID}_transaction_${uuidv4()}`
        }
        await budgetManagerStore.putDocument(initTransaction)
      }
    },

    async deleteAccount(accountDoc) {
      const budgetManagerStore = useBudgetManagerStore()
      const pouchdbStore = usePouchDBStore()

      const accountID = accountDoc._id.slice(-36)
      const existingTransactions = await pouchdbStore.localdb.query((doc, emit) => {
        if (doc.account === accountID) {
          emit(doc)
        }
      })

      if (existingTransactions.total_rows > 0) {
        // Account still has transactions, so resolve with amount of transactions in account for error message.
        throw new Error(existingTransactions.total_rows)
      } else {
        // Dispatch account for deletion
        accountDoc._deleted = true
        budgetManagerStore.putDocument(accountDoc, false)
        return 'account deleted'
      }
    },

    /**
     * Complete reconciliation
     * @param accountID
     * @param adjustmentAmount
     */
    async completeReconciliation(accountID, adjustmentAmount) {
      const budgetManagerStore = useBudgetManagerStore()
      let payload

      if (adjustmentAmount) {
        payload = {
          account: accountID,
          category: 'income',
          cleared: true,
          approved: true,
          value: -parseInt(adjustmentAmount * 100),
          date: new Date().toISOString().substr(0, 10),
          memo: '',
          reconciled: true,
          flag: '#ffffff',
          payee: 'Reconcile adjustment',
          transfer: null,
          splits: [],
          _id: `b_${budgetManagerStore.budgetID}_transaction_${uuidv4()}`
        }
        await this.putTransaction(payload)
      }

      //Search for transactions to lock
      let transactionsToLock = budgetManagerStore.transactionsGroupedByAccount[accountID]
        .filter((trans) => !trans.reconciled)
        .filter((trans) => trans.cleared)

      //Update reconciled field
      transactionsToLock.map((trans) => (trans.reconciled = true))

      //Commit to pouchdb
      await budgetManagerStore.putBulkDocuments(transactionsToLock)

      if (adjustmentAmount) {
        return [transactionsToLock.length, payload]
      }
      return transactionsToLock.length
    },

    ///
    /// Reorder Categories
    ///
    async reorderSubCategory(reorderEvent) {
      const budgetManagerStore = useBudgetManagerStore()
      //Get the category that was moved

      const originalCategory = JSON.parse(
        JSON.stringify(budgetManagerStore.categoriesGroupedByMaster[reorderEvent.from.className][reorderEvent.oldIndex])
      )

      //Assign sort value and fix off-by-one errors
      if (reorderEvent.newIndex > reorderEvent.oldIndex) {
        originalCategory.sort = reorderEvent.newIndex + 0.5
      } else {
        originalCategory.sort = reorderEvent.newIndex - 0.5
      }
      originalCategory.masterCategory = reorderEvent.to.className //Assign new master category

      //First, we update the subcategory to it's correct mastercategory
      await budgetManagerStore.putDocument(originalCategory)

      // Rewrite ordering for new masterCategory
      let subCategories = budgetManagerStore.categoriesGroupedByMaster[reorderEvent.to.className]

      subCategories.forEach(function (part, index) {
        subCategories[index].sort = index
      })
      await budgetManagerStore.putBulkDocuments(subCategories)

      return 'Reordering complete'
    },

    /**
     * Reorder master categories
     * @param newMasterCategoryOrdering
     */
    async reorderMasterCategories(newMasterCategoryOrdering) {
      const budgetManagerStore = useBudgetManagerStore()

      newMasterCategoryOrdering.forEach(function (part, index) {
        newMasterCategoryOrdering[index].sort = index
      })

      await budgetManagerStore.putBulkDocuments(newMasterCategoryOrdering)
      return 'Reordering complete'
    },

    async exportAllBudgetsAsJSON() {
      const pouchdbStore = usePouchDBStore()
      const budgetManagerStore = useBudgetManagerStore()

      try {
        const allDocs = await pouchdbStore.localdb.allDocs({
          include_docs: true,
          attachments: true
        })

        const export_date = new Date()

        const reformattedExport = allDocs.rows
          .filter((row) => budgetManagerStore._isValidDocument(row.doc)) //only export valid docs
          .map((row) => row.doc)
          .map((row) => {
            delete row['_rev'] //Delete rev field to prevent conflicts on restore
            return row
          })

        var blob = new Blob([JSON.stringify(reformattedExport)], {
          type: 'text/plain;charset=utf-8'
        })
        FileSaver.saveAs(blob, `BudgetZero_Export_${export_date.toISOString()}.txt`)
      } catch (err) {
        console.log(err)
      }
      return true
    }
  }
})
