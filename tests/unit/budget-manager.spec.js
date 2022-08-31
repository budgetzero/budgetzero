import { BudgetManager } from '../../src/store/budget-manager'
import mock_budget from '@/../tests/__mockdata__/mock_budget2.json'
import PouchDB from 'pouchdb'

new PouchDB('budgetzero_local_db12333')
  .destroy()
  .then(function () {
    // database destroyed
  })
  .catch(function (err) {
    // error occurred
  })
let budgetmanager = new BudgetManager()

describe('budget-manager', () => {
  beforeAll(() => {
    budgetmanager.loadData(mock_budget)
  })

  it('calculates correctly', async () => {
    budgetmanager.calculateMonthlyData()
    expect(budgetmanager.monthlyData).toMatchSnapshot()
  })

  //   it('loaded the data', async () => {
  //     expect(budgetmanager.budgetData.length).toBe(620)
  //   })

  it('has correct number of transactions', async () => {
    expect(budgetmanager.transactions.length).toBe(563)
  })

  it('has correct number of accounts', async () => {
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

describe('budget-manager', () => {
  beforeAll(() => {
    budgetmanager.loadData(mock_budget)
  })

  it('add transaction', async () => {
    expect(budgetmanager.transactions.length).toBe(563)
    let resp = await budgetmanager.addDocument({
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

  it('add duplicate transaction', async () => {
    expect(
      budgetmanager.addDocument({
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
    ).rejects.toBe('conflict')
  })

  it('add bad transaction', async () => {
    expect(
      budgetmanager.addDocument({
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
    ).rejects.toEqual('Document failed validation')
  })

  it('get and modify transaction', async () => {
    const original_transaction = await budgetmanager.pouchdbManager.localdb.get(
      'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_transaction_31a2483b-d0e5-4daf-b1fe-f1788ed01234'
    )
    original_transaction.name = 'new name'

    const num_of_trans = budgetmanager.transactions.length
    let resp = await budgetmanager.addDocument(original_transaction)
    expect(budgetmanager.transactions.length).toBe(num_of_trans + 1)
    expect(resp['ok']).toBe(true)
  })

  it('get and modify malformed transaction', async () => {
    const original_transaction = await budgetmanager.pouchdbManager.localdb.get(
      'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_transaction_31a2483b-d0e5-4daf-b1fe-f1788ed01234'
    )
    original_transaction.value = 'not a number'

    const num_of_trans = budgetmanager.transactions.length
    expect(budgetmanager.addDocument(original_transaction)).rejects.toEqual('Document failed validation')
    expect(budgetmanager.transactions.length).toBe(num_of_trans)
  })
})
