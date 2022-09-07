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

describe('budget-manager-helper delete budget', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    pouchdbStore = usePouchDBStore()
    budgetmanager = useBudgetManagerStore()
    budgetHelper = useBudgetHelperStore()

    await new PouchDB('unit-test-dbs/helper').destroy()
    pouchdbStore.localdb = new PouchDB('unit-test-dbs/helper')

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
  beforeAll(async () => {
    setActivePinia(createPinia())
    pouchdbStore = usePouchDBStore()
    budgetmanager = useBudgetManagerStore()
    budgetHelper = useBudgetHelperStore()

    await new PouchDB('./unit-test-dbs/helper').destroy()
    pouchdbStore.localdb = new PouchDB('./unit-test-dbs/helper')

    await budgetmanager.loadMockDataIntoPouchDB(mock_budget, '5a98dc44-7982-4ecc-aa50-146fc4dc4e16')
  })

  it('create account with no starting transaction', async () => {
    const num_of_accounts = budgetmanager.accounts.length
    const accountDoc = {
      type: 'Checking',
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
      type: 'Checking',
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

    const acct = {
      type: 'CHECKING',
      checkNumber: true,
      closed: false,
      name: 'Savings',
      note: 'Savings account',
      sort: 0,
      onBudget: true,
      balanceIsNegative: false,
      _id: 'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_account_38e690f8-198f-4735-96fb-3a2ab15081c2'
    }
    expect(budgetHelper.deleteAccount(acct)).rejects.toThrowError('563')

    expect(budgetmanager.accounts.length).toBe(num_of_accounts)
  })

  it('delete account without existing transactions', async () => {
    const num_of_accounts = budgetmanager.accounts.length

    const acct = {
      type: 'CREDIT',
      checkNumber: true,
      closed: false,
      name: 'Chase',
      note: null,
      sort: 0,
      onBudget: true,
      balanceIsNegative: true,
      _id: 'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_account_84c4446c-f250-4d7e-ac09-02a8cfff2583'
    }

    expect(budgetHelper.deleteAccount(acct)).resolves.toBe('account deleted')

    expect(budgetmanager.accounts.length).toBe(num_of_accounts)
  })
})

describe('budget-manager-helper reconcile', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    pouchdbStore = usePouchDBStore()
    budgetmanager = useBudgetManagerStore()
    budgetHelper = useBudgetHelperStore()

    await new PouchDB('./unit-test-dbs/helper').destroy()
    pouchdbStore.localdb = new PouchDB('./unit-test-dbs/helper')

    await budgetmanager.loadMockDataIntoPouchDB(mock_budget, '5a98dc44-7982-4ecc-aa50-146fc4dc4e16')
  })

  it('complete with adjustment', async () => {
    const account_id = budgetmanager.accounts[0]._id.slice(-36)
    const adjAmount = 50000
    const num_of_transactions = budgetmanager.transactions.length

    const res = await budgetHelper.completeReconciliation(account_id, adjAmount)

    expect(res[0]).toBe(3)
    expect(res[1].value).toBe(-parseInt(adjAmount * 100))

    const reconciled = budgetmanager.transactionsGroupedByAccount[account_id].filter((trans) => trans.reconciled).length
    expect(reconciled).toBe(4)

    expect(budgetmanager.transactions.length).toBe(num_of_transactions + 1)
  })

  it('complete without adjustment', async () => {
    const account_id = budgetmanager.accounts[0]._id.slice(-36)
    const adjAmount = null
    const num_of_transactions = budgetmanager.transactions.length

    await expect(budgetHelper.completeReconciliation(account_id, adjAmount)).resolves.toBe(3)

    const reconciled = budgetmanager.transactionsGroupedByAccount[account_id].filter((trans) => trans.reconciled).length
    expect(reconciled).toBe(3)

    expect(budgetmanager.transactions.length).toBe(num_of_transactions)

    // zero amount should be same as null
    await expect(budgetHelper.completeReconciliation(account_id, 0)).resolves.toBe(0)
  })
})

describe('budget-manager-helper categories', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    pouchdbStore = usePouchDBStore()
    budgetmanager = useBudgetManagerStore()
    budgetHelper = useBudgetHelperStore()

    await new PouchDB('./unit-test-dbs/helper').destroy()
    pouchdbStore.localdb = new PouchDB('./unit-test-dbs/helper')

    await budgetmanager.loadMockDataIntoPouchDB(mock_budget, '5a98dc44-7982-4ecc-aa50-146fc4dc4e16')
  })

  it('reorder master categories', async () => {
    let originalOrder = budgetmanager.masterCategories

    //swap order of two categories
    let newOrder = originalOrder
    newOrder[0] = originalOrder[2]
    newOrder[2] = originalOrder[0]

    const res = await budgetHelper.reorderMasterCategories(newOrder)

    expect(res).toBe('Reordering complete')
    let newCategories = budgetmanager.masterCategories
    expect(newCategories.map((cat) => (cat._rev = ''))).toStrictEqual(newOrder.map((cat) => (cat._rev = '')))
  })

  it('reorder sub category', async () => {
    const reorderEvent = {
      from: {
        // old master category
        className: '24b7dd4b-7449-4a91-932a-0ce14b54d159'
      },
      to: {
        // new master category
        className: '2b8b142a-588f-407d-a54d-88d7d30e3564'
      },
      oldIndex: 0,
      newIndex: 1
    }
    const originalCategory = budgetmanager.categoriesGroupedByMaster[reorderEvent.from.className][reorderEvent.oldIndex]
  
    const res = await budgetHelper.reorderSubCategory(reorderEvent)
    expect(res).toBe('Reordering complete')

    const newCategory = budgetmanager.categories.filter((cat) => cat._id == originalCategory._id)[0]

    // sub category should be in new category group
    expect(newCategory.masterCategory).toBe(reorderEvent.to.className)
    expect(newCategory.sort).toBe(reorderEvent.newIndex)

  })
})

describe('budget-manager-helper transactions', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    pouchdbStore = usePouchDBStore()
    budgetmanager = useBudgetManagerStore()
    budgetHelper = useBudgetHelperStore()

    await new PouchDB('./unit-test-dbs/helper').destroy()
    pouchdbStore.localdb = new PouchDB('./unit-test-dbs/helper')

    await budgetmanager.loadMockDataIntoPouchDB(mock_budget, '5a98dc44-7982-4ecc-aa50-146fc4dc4e16')
  })

  it('add transaction', async () => {
    const num_trans = budgetmanager.transactions.length

    let resp = await budgetHelper.putTransaction({
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
    expect(budgetmanager.transactions.length).toBe(num_trans + 1)
    expect(resp['ok']).toBe(true)
  })

  it('create mirrored transfer transaction', async () => {
    const num_trans = budgetmanager.transactions.length

    let resp = await budgetHelper.saveMirroredTransferTransaction({
      account: '38e690f8-198f-4735-96fb-3a2ab15081c2',
      category: null,
      cleared: false,
      approved: false,
      value: -4444,
      date: '2015-05-10',
      memo: 'memo',
      reconciled: false,
      flag: '#ffffff',
      payee: '84c4446c-f250-4d7e-ac09-02a8cfff2583',
      transfer: null,
      splits: [],
      _id: 'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_transaction_31a2483b-d0e5-4daf-b1fe-f1788ed01234'
    })
    expect(budgetmanager.transactions.length).toBe(num_trans + 1)

    const mirrored = {
      account: '84c4446c-f250-4d7e-ac09-02a8cfff2583',
      category: null,
      cleared: true,
      approved: true,
      value: 4444,
      date: '2015-05-10',
      memo: 'memo',
      reconciled: false,
      flag: '#ffffff',
      payee: '38e690f8-198f-4735-96fb-3a2ab15081c2',
      transfer: null,
      splits: [],
    }
    resp = JSON.parse(JSON.stringify(resp))
    const mirrorID =resp._id.slice(-36)
    // delete resp._rev
    delete resp._id
    // expect(resp).toStrictEqual(mirrored)

    //
    // edit existing transfer
    //

    let resp_existing = await budgetHelper.saveMirroredTransferTransaction({
      account: '38e690f8-198f-4735-96fb-3a2ab15081c2',
      category: null,
      cleared: false,
      approved: false,
      value: -5555,
      date: '2015-05-11',
      memo: 'memo',
      reconciled: false,
      flag: '#ffffff',
      payee: '84c4446c-f250-4d7e-ac09-02a8cfff2583',
      transfer: mirrorID,
      splits: [],
      _id: 'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_transaction_31a2483b-d0e5-4daf-b1fe-f1788ed06665'
    })
    expect(budgetmanager.transactions.length).toBe(num_trans+1)

    const mirrored_existing = {
      account: '84c4446c-f250-4d7e-ac09-02a8cfff2583',
      category: null,
      cleared: true,
      approved: true,
      value: 5555,
      date: '2015-05-11',
      memo: 'memo',
      reconciled: false,
      flag: '#ffffff',
      payee: '38e690f8-198f-4735-96fb-3a2ab15081c2',
      transfer: '31a2483b-d0e5-4daf-b1fe-f1788ed06665',
      splits: [],
    }
    resp_existing = JSON.parse(JSON.stringify(resp_existing))
    delete resp_existing._rev
    delete resp_existing._id
    expect(resp_existing).toStrictEqual(mirrored_existing)
  })

  it('add transfer transaction', async () => {
    const num_trans = budgetmanager.transactions.length

    let resp = await budgetHelper.putTransaction({
      account: '38e690f8-198f-4735-96fb-3a2ab15081c2',
      category: null,
      cleared: false,
      approved: false,
      value: -4444,
      date: '2015-05-10',
      memo: 'memo',
      reconciled: false,
      flag: '#ffffff',
      payee: 'Transfer: Chase',
      transfer: null,
      splits: [],
      _id: 'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_transaction_31a2483b-d0e5-4daf-b1fe-f1788ed03232'
    })
    expect(budgetmanager.transactions.length).toBe(num_trans + 2)
    expect(resp['ok']).toBe(true)
  })



  // it('add transfer transaction', async () => {
  //   const num_trans = budgetmanager.transactions.length

  //   let resp = await budgetHelper.putTransaction({
  //     account: '38e690f8-198f-4735-96fb-3a2ab15081c2',
  //     category: null,
  //     cleared: false,
  //     approved: false,
  //     value: -4444,
  //     date: '2015-05-10',
  //     memo: 'memo',
  //     reconciled: false,
  //     flag: '#ffffff',
  //     payee: 'Transfer: newaccount',
  //     transfer: null,
  //     splits: [],
  //     _id: 'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_transaction_31a2483b-d0e5-4daf-b1fe-f1788ed01234'
  //   })
  //   expect(budgetmanager.transactions.length).toBe(num_trans + 2)
  //   expect(resp['ok']).toBe(true)
  // })
})

// TODO need to rewrite
// describe('budget-manager putBulkDocuments', () => {
//   beforeAll(async () => {
//    await budgetmanager.loadMockDataIntoPouchDB(mock_budget, '5a98dc44-7982-4ecc-aa50-146fc4dc4e16')
//   })

//   it('add bulk transaction', async () => {

//     const num_of_trans = budgetmanager.transactions.length
//     const num_of_docs = budgetmanager.budgetData.length

//     const bulk = [{
//       account: '38e690f8-198f-4735-96fb-3a2ab15081c2',
//       category: null,
//       cleared: false,
//       approved: false,
//       value: -100000,
//       date: '2015-05-10',
//       memo: 'memo',
//       reconciled: false,
//       flag: '#ffffff',
//       payee: 'c28737d0-1519-4c47-a718-9bda6df392fc',
//       transfer: null,
//       splits: [],
//       _id: 'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_transaction_31a2483b-d0e5-4daf-b1fe-f1788ed0yyyy'
//     },{
//       account: '38e690f8-198f-4735-96fb-3a2ab15081c2',
//       category: null,
//       cleared: false,
//       approved: false,
//       value: -150000,
//       date: '2015-05-10',
//       memo: 'memo',
//       reconciled: false,
//       flag: '#ffffff',
//       payee: 'c28737d0-1519-4c47-a718-9bda6df392fc',
//       transfer: null,
//       splits: [],
//       _id: 'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_transaction_31a2483b-d0e5-4daf-b1fe-f1788ed0zzzz'
//       }]

//     let resp = await budgetmanager.putBulkDocuments(bulk)

//     // Number of data shouldn't change for a modification
//     expect(budgetmanager.transactions.length).toBe(num_of_trans + bulk.length)
//     expect(budgetmanager.budgetData.length).toBe(num_of_docs + bulk.length)
//   })

//   it('add bad transaction', async () => {
//     await expect(
//       budgetmanager.putBulkDocuments([{
//         category: null,
//         cleared: false,
//         approved: false,
//         value: -4444,
//         date: '2015-05-10',
//         memo: 'memo',
//         reconciled: false,
//         flag: '#ffffff',
//         payee: 'c28737d0-1519-4c47-a718-9bda6df392fc',
//         transfer: null,
//         splits: [],
//         _id: 'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_transaction_31a2483b-d0e5-4daf-b1fe-f1788ed01234'
//       }])
//     ).rejects.toThrowError('Document failed validation')
//   })

//   it('add bad transaction with wrong length ID', async () => {
//     await expect(
//       budgetmanager.putBulkDocuments([{
//         account: '38e690f8-198f-4735-96fb-3a2ab15081c2',
//         category: null,
//         cleared: false,
//         approved: false,
//         value: -4444,
//         date: '2015-05-10',
//         memo: 'memo',
//         reconciled: false,
//         flag: '#ffffff',
//         payee: 'c28737d0-1519-4c47-a718-9bda6df392fc',
//         transfer: null,
//         splits: [],
//         _id: 'b_5a98dc44-7982-4ecc-aa50-146fc4dc4e16_transaction_31a2483b-d0e5-4da'
//       }])
//     ).rejects.toThrowError('Document failed validation')
//   })

// })
