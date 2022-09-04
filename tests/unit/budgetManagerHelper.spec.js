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

describe('budget-manager helper', () => {
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
