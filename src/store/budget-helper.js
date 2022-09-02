import { defineStore } from 'pinia'
import { useBudgetManagerStore } from './pinia'
import { v4 as uuidv4 } from 'uuid'
import validator from 'validator'
import { sanitizeValueInput } from '../helper.js'

export const useBudgetHelperStore = defineStore('budgetHelper', {
  actions: {
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
    saveMirroredTransferTransaction(context, payload) {
      var mirroredTransferTransaction = Object.assign({}, payload)

      //Check if the mirrored transaction doesn't exist then we create
      if (payload.transfer) {
        const index =
          context.getters.transactionsLookupByID[
            `b_${context.getters.selectedBudgetID}_transaction_${payload.transfer}`
          ]

        mirroredTransferTransaction = Object.assign({}, context.getters.transactions[index])
      } else {
        //Creating new transaction
        mirroredTransferTransaction._id = `b_${
          context.getters.selectedBudgetID
        }_transaction_${Vue.prototype.$vm.$uuid.v4()}`

        delete mirroredTransferTransaction._rev
      }
      //Create the mirrored transaction
      mirroredTransferTransaction.value = -payload.value
      mirroredTransferTransaction.transfer = payload._id.slice(-36)
      mirroredTransferTransaction.account = payload.payee
      mirroredTransferTransaction.payee = payload.account //The payee is the _id of the other account
      mirroredTransferTransaction.memo = payload.memo
      mirroredTransferTransaction.category = null
      mirroredTransferTransaction.date = payload.date
      mirroredTransferTransaction.cleared = payload.cleared

      context.dispatch('commitDocToPouchAndVuex', mirroredTransferTransaction)

      return mirroredTransferTransaction._id.slice(-36)
    },

    /**
     * Create or update transaction
     * @param {doc} payload The transaction to create or update
     */
    async putTransaction(payload) {
      const budgetManagerStore = useBudgetManagerStore()

      //Check if this is a transfer transaction. if so, get the account ID
      //TODO: only let this be a transfer if the account actually exists?
      if (payload.payee && payload.payee.includes('Transfer: ')) {
        //account_id is the account the original transfer is going to
        const account_id = Object.keys(budgetManagerStore.account_map).find(
          (key) => budgetManagerStore.account_map[key] === payload.payee.slice(10)
        )

        payload.payee = account_id
        const mirroredTransferID = await context.dispatch('saveMirroredTransferTransaction', payload)
        payload.transfer = mirroredTransferID
        payload.category = null
      } else {
        payload.transfer = null
      }

      payload.value = sanitizeValueInput(payload.value)

      await this.getPayeeID(payload.payee).then((response) => {
        payload.payee = response
      })
      return budgetManagerStore.putDocument(payload)
    }
  }
})
