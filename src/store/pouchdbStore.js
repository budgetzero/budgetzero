import { defineStore } from 'pinia'
import PouchDB from 'pouchdb'

var FileSaver = require('file-saver')

export const usePouchDBStore = defineStore('pouchdb', {
  state: () => {
    return {
      localdb: new PouchDB(new Date().toISOString()),
      remoteSyncDB: null,
      syncHandler: null
    }
  },
  actions: {
    setRemoteSyncDB(remoteURL) {
      this.remoteSyncDB = new PouchDB(remoteURL)
    },
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
    },
    stopRemoteSync() {
      this.syncHandler.cancel()
    },
    async exportAllBudgetsAsJSON() {
      try {
        const allDocs = await this.localdb.allDocs({
          include_docs: true,
          attachments: true
        })
        console.log('exportBudgetAsJSON', JSON.stringify(allDocs))
        const export_date = new Date()

        const reformattedExport = allDocs.rows
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
