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

describe('budget manager', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    pouchdbStore = usePouchDBStore()
    budgetmanager = useBudgetManagerStore()

    await new PouchDB('budgetzero_localdb').destroy()
    pouchdbStore.localdb = new PouchDB('budgetzero_localdb')

    await budgetmanager.loadMockDataIntoPouchDB(mock_budget, '5a98dc44-7982-4ecc-aa50-146fc4dc4e16')
  })

  beforeEach(async () => {
    // creates a fresh pinia and make it active so it's automatically picked
    // up by any useStore() call without having to pass it to it:
    // `useStore(pinia)`
  })

  it('calculates correctly', async () => {
    budgetmanager.calculateMonthlyData()
    expect(budgetmanager.monthlyData).toMatchSnapshot()
  })

  it('loaded the data', async () => {
    // Subtract budget and budget-opened docs
    const num_of_docs = mock_budget.filter((row) => row._id.includes('b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16')).length
    expect(budgetmanager.budgetData.length).toBe(num_of_docs)
  })

  it('has correct number of transactions', async () => {
    expect(budgetmanager.transactions.length).toBe(563)
  })

  it('has correct number of accounts', async () => {
    console.log(JSON.stringify(budgetmanager.accounts))
    expect(budgetmanager.accounts.length).toBe(3)
  })

  it('has correct number of categories', async () => {
    expect(budgetmanager.categories.length).toBe(30)
  })

  it('has correct number of master categories', async () => {
    expect(budgetmanager.masterCategories.length).toBe(5)
  })

  it('has correct number of payees', async () => {
    expect(budgetmanager.payees.length).toBe(21)
  })
})

describe('budget-manager transactions', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    pouchdbStore = usePouchDBStore()
    budgetmanager = useBudgetManagerStore()

    await new PouchDB('budgetzero_localdb').destroy()
    pouchdbStore.localdb = new PouchDB('budgetzero_localdb')

    await budgetmanager.loadMockDataIntoPouchDB(mock_budget, '5a98dc44-7982-4ecc-aa50-146fc4dc4e16')
  })

  it('add transaction', async () => {
    expect(budgetmanager.transactions.length).toBe(563)
    let resp = await budgetmanager.putDocument({
      account: '38e690f8-198f-4735-96fb-3a2ab15081c2',
      category: null,
      cleared: false,
      approved: false,
      value: -4444,
      date: '2015-05-10',
      memo: 'memo',
      reconciled: false,
      flag: '#ffffff',
      payee: 'c28737d0-1519-4c47-a718-9bda6df392fc',
      transfer: null,
      splits: [],
      _id: 'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_transaction_31a2483b-d0e5-4daf-b1fe-f1788ed01234'
    })
    expect(budgetmanager.transactions.length).toBe(564)
    expect(resp['ok']).toBe(true)
  })

  it('add bad transaction', async () => {
    expect(
      budgetmanager.putDocument({
        category: null,
        cleared: false,
        approved: false,
        value: -4444,
        date: '2015-05-10',
        memo: 'memo',
        reconciled: false,
        flag: '#ffffff',
        payee: 'c28737d0-1519-4c47-a718-9bda6df392fc',
        transfer: null,
        splits: [],
        _id: 'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_transaction_31a2483b-d0e5-4daf-b1fe-f1788ed01234'
      })
    ).rejects.toThrowError('Document failed validation')
  })

  it('get and modify transaction', async () => {
    const original_transaction = await pouchdbStore.localdb.get(
      'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_transaction_2b84300c-9503-497e-be96-dfc9a683027f'
    )
    original_transaction.name = 'new name'

    const num_of_trans = budgetmanager.transactions.length
    const num_of_docs = budgetmanager.budgetData.length

    let resp = await budgetmanager.putDocument(original_transaction)

    // Number of data shouldn't change for a modification
    expect(budgetmanager.transactions.length).toBe(num_of_trans)
    expect(budgetmanager.budgetData.length).toBe(num_of_docs)

    expect(resp['ok']).toBe(true)

    //Check that it was modified
    const updated_transaction = await pouchdbStore.localdb.get(
      'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_transaction_2b84300c-9503-497e-be96-dfc9a683027f'
    )
    expect(updated_transaction.name).toBe('new name')
  })

  it('get and modify malformed transaction', async () => {
    const original_transaction = await pouchdbStore.localdb.get(
      'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_transaction_2b84300c-9503-497e-be96-dfc9a683027f'
    )
    original_transaction.value = 'not a number'

    const num_of_trans = budgetmanager.transactions.length
    await expect(budgetmanager.putDocument(original_transaction)).rejects.toThrowError('Document failed validation')
    expect(budgetmanager.transactions.length).toBe(num_of_trans)
  })
})

describe('budget-manager monthlyData calculates when', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    pouchdbStore = usePouchDBStore()
    budgetmanager = useBudgetManagerStore()

    await new PouchDB('budgetzero_localdb').destroy()
    pouchdbStore.localdb = new PouchDB('budgetzero_localdb')

    await budgetmanager.loadMockDataIntoPouchDB(mock_budget, '5a98dc44-7982-4ecc-aa50-146fc4dc4e16')
  })

  it('add transaction', async () => {
    // const data = budgetmanager.monthlyData
    let resp = await budgetmanager.putDocument({
      account: '38e690f8-198f-4735-96fb-3a2ab15081c2',
      category: null,
      cleared: false,
      approved: false,
      value: -100000,
      date: '2015-05-10',
      memo: 'memo',
      reconciled: false,
      flag: '#ffffff',
      payee: 'c28737d0-1519-4c47-a718-9bda6df392fc',
      transfer: null,
      splits: [],
      _id: 'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_transaction_31a2483b-d0e5-4daf-b1fe-f1788ed0xxxx'
    })
    expect(budgetmanager.monthlyData).toMatchSnapshot()
    // const after = budgetmanager.monthlyData
    // expect(data).toStrictEqual(after)
  })

  it('modify budget amount', async () => {
    // const data = budgetmanager.monthlyData
    let resp = await budgetmanager.putDocument({
      budget: 20000,
      overspending: null,
      note: '',
      _id: 'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_m_category_2019-08-01_02ec642d-25c6-4f4b-a21f-3b4a5b4025c1'
    })
    expect(budgetmanager.monthlyData).toMatchSnapshot()
    // const after = budgetmanager.monthlyData
    // expect(data).toStrictEqual(after)
  })
})
