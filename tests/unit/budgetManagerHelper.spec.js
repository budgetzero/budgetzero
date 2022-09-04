// stores/counter.spec.ts
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetManagerStore } from '../../src/store/budgetManager'
import { useBudgetHelperStore } from '../../src/store/budgetManagerHelper'
import { usePouchDBStore } from '../../src/store/pouchdbStore'

import validator from 'validator'
import { v4 as uuidv4 } from 'uuid'

import mock_budget from '@/../tests/__mockdata__/mock_budget2.json'
import PouchDB from 'pouchdb'

let budgetmanager
let budgetHelper
let pouchdbStore


describe('budget-manager delete budget', () => {
  beforeEach(async () => {
    // creates a fresh pinia and make it active so it's automatically picked
    // up by any useStore() call without having to pass it to it:
    // `useStore(pinia)`
    setActivePinia(createPinia())
    budgetmanager = useBudgetManagerStore()
    budgetHelper = useBudgetHelperStore()
    await budgetmanager.loadMockDataIntoPouchDB(mock_budget, '5a98dc44-7982-4ecc-aa50-146fc4dc4e16')
  })

  it('delete entire budget', async () => {
    const budgetDoc = {
      _id: 'budget_5a98dc44-7982-4ecc-aa50-146fc4dc4e16',
      _rev: '1-7d4d2301b0962944c2be27a713a05c8b',
      checkNumber: false,
      created: '2020-12-29T01:30:14.886Z',
      currency: 'USD',
      name: 'TestBudget'
    }
    let resp = await budgetHelper.deleteEntireBudget(budgetDoc)

    expect(resp).toBe('5a98dc44-7982-4ecc-aa50-146fc4dc4e16')
    expect(budgetmanager.budgetData.length).toBe(0)
  })
})

describe('budget-manager-helper accounts', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    budgetmanager = useBudgetManagerStore()
    budgetHelper = useBudgetHelperStore()
    await budgetmanager.loadMockDataIntoPouchDB(mock_budget, '5a98dc44-7982-4ecc-aa50-146fc4dc4e16')
  })

  it('create account with no starting transaction', async () => {
    const num_of_accounts = budgetmanager.accounts.length
    const accountDoc = {
      type: "Checking",
      checkNumber: false,
      closed: false,
      name: 'test account',
      note: '',
      sort: 1,
      onBudget: true,
      balanceIsNegative: true,
      _id: `b_${budgetmanager.budgetID}_account_${uuidv4()}`
    }
    await budgetHelper.createUpdateAccount(accountDoc, false)

    expect(budgetmanager.accounts.length).toBe(num_of_accounts + 1)
  })

  it('create account with a starting transaction', async () => {
    const num_of_accounts = budgetmanager.accounts.length
    const num_of_transactions = budgetmanager.transactions.length
    const accountDoc = {
      type: "Checking",
      checkNumber: false,
      closed: false,
      name: 'test account',
      note: '',
      sort: 1,
      onBudget: true,
      balanceIsNegative: true,
      _id: `b_${budgetmanager.budgetID}_account_${uuidv4()}`
    }
    await budgetHelper.createUpdateAccount(accountDoc, '1100')

    expect(budgetmanager.accounts.length).toBe(num_of_accounts + 1)
    expect(budgetmanager.transactions.length).toBe(num_of_transactions + 1)
  })

  it('delete account with existing transactions', async () => {
    const num_of_accounts = budgetmanager.accounts.length
    
    const acct =  {
      "type": "CHECKING",
      "checkNumber": true,
      "closed": false,
      "name": "Savings",
      "note": "Savings account",
      "sort": 0,
      "onBudget": true,
      "balanceIsNegative": false,
      "_id": "b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_account_38e690f8-198f-4735-96fb-3a2ab15081c2"
    }
    expect(budgetHelper.deleteAccount(acct)).rejects.toThrowError('563')

    expect(budgetmanager.accounts.length).toBe(num_of_accounts)
  })

  it('delete account without existing transactions', async () => {
    const num_of_accounts = budgetmanager.accounts.length
    
    const acct =    {
      "type": "CREDIT",
      "checkNumber": true,
      "closed": false,
      "name": "Chase",
      "note": null,
      "sort": 0,
      "onBudget": true,
      "balanceIsNegative": true,
      "_id": "b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_account_84c4446c-f250-4d7e-ac09-02a8cfff2583"
    }
    
    expect(budgetHelper.deleteAccount(acct)).resolves.toBe('account deleted')

    expect(budgetmanager.accounts.length).toBe(num_of_accounts)
  })
})
