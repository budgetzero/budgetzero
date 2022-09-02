import { defineStore } from 'pinia'
import PouchDB from 'pouchdb'

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
  }
})



