// import { resolve } from 'core-js/fn/promise'
import _, { reject } from 'lodash'
import moment from 'moment'
import PouchDB from 'pouchdb'
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
} from './validation'

export class PouchDBManager {
  constructor() {
    this.localdb = new PouchDB(new Date().toISOString())
    this.remoteSyncDB = null
    this.syncHandler = null
  }

  setRemoteSyncDB(remoteURL) {
    this.remoteSyncDB = new PouchDB(remoteURL)
  }

  startRemoteSync() {
    if (this.remoteSyncDB) {
      this.syncHandler = PouchDB.sync(this.remoteSyncDB, this.localdb, { live: true })
        .on('paused', function (info) {
          console.info('replication paused', info)
        })
        .on('active', function () {
          console.info('replication active')
        })
        .on('denied', function (err) {
          console.error('replication denied', err)
        })
        .on('error', function (err) {
          console.error('replication error', err)
        })
    } else {
      console.error('No remote sync URL found')
    }
  }

  stopRemoteSync() {
    this.syncHandler.cancel()
  }
}
