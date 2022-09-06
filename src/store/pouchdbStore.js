import { defineStore } from 'pinia'
import PouchDB from 'pouchdb'
import { useMainStore } from './mainPiniaStore'
import { useStorage } from '@vueuse/core'


export const usePouchDBStore = defineStore('pouchdb', {
  state: () => {
    return {
      localdb: new PouchDB('budgetzero_localdb'),
      remoteSyncDB: useStorage('remoteSyncDB', ''),
      syncHandler: null,
      lastSyncTimestamp: '',
    }
  },
  actions: {
    startRemoteSync() {
      const mainStore = useMainStore()
      var self = this;
      this.syncHandler = this.localdb
        .sync(this.remoteSyncDB, {
          live: true,
        })
        .on('change', function () {
          self.lastSyncTimestamp = new Date().toISOString()
        })
        .on('complete', function () {
          self.lastSyncTimestamp = new Date().toISOString()
        })
        .on('paused', function (info) {
          self.lastSyncTimestamp = new Date().toISOString()
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

        mainStore.setSnackbarMessage({ snackBarMessage: 'Sync started', snackBarColor: 'primary' })

    },
    stopRemoteSync() {
      const mainStore = useMainStore()
      mainStore.setSnackbarMessage({ snackBarMessage: 'Sync stopped', snackBarColor: 'dark-grey' })
      if (this.syncHandler) {
        this.syncHandler.cancel()
      } 
    },
    startSyncIfRemoteSet() {
      if (this.remoteSyncDB !== '') {
      this.startRemoteSync() 
      }
    },
    
  }
})
