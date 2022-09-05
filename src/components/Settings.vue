<template>
  <v-row class="px-3 pt-2">
    <v-col>
      <span class="text-h3 pt-4">Settings</span>
      <span class="subtitle pl-2">{{ packageVersion }}</span>
      <v-divider class="pb-4" />

      <br />

      <h3>Sync to Server <span class="subtitle-1 ml-3">sync state?</span></h3>
      <span
        >Sync to remote CouchDB server:
        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-icon color="grey" v-on="on"> mdi-information </v-icon>
          </template>
          <span
            >Examples: <code>http://localhost:5984/mybudget</code> or
            <code>http://username:password@192.168.1.10:5984/mybudget</code>
          </span>
        </v-tooltip>
      </span>
      <v-row align="center" class="mt-2">
        <v-col cols="7">
          <v-text-field v-model="remoteSyncURLInput" label="Remote CouchDB URL" required />
        </v-col>
        <v-col cols="5">
          <v-btn color="primary" dark small @click="startRemoteSync()">Start Sync</v-btn>
          <v-btn color="primary" outlined dark class="ml-2" small @click="stopRemoteSync()">Stop Sync</v-btn>
        </v-col>
      </v-row>
    </v-col>

    <v-col cols="12">
      <h3 class="mx-2 py-2">Payees</h3>
      <v-data-table
        :headers="headers"
        :items="budgetManagerStore.payees.sort((a, b) => (a.name > b.name ? 1 : -1))"
        class="elevation-1"
      />
    </v-col>
  </v-row>
</template>

<script>
import { mapStores } from 'pinia'
import { useBudgetManagerStore } from './../store/budgetManager'
import { usePouchDBStore } from './../store/pouchdbStore'

export default {
  name: 'Settings',
  components: {},
  data() {
    return {
      remoteSyncURLInput: 'http://admin:changeme@localhost:5984/budgetzero_remotedb',
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'id', value: '_id' }
      ],
      isProd: process.env.NODE_ENV === 'production'
    }
  },
  computed: {
    ...mapStores(useBudgetManagerStore, usePouchDBStore),
    packageVersion() {
      return process.env.PACKAGE_VERSION || '0'
    }
  },
  methods: {
    startRemoteSync() {
      this.pouchdbStore.remoteSyncDB = this.remoteSyncURLInput
      this.pouchdbStore.startRemoteSync()
    },
    stopRemoteSync() {
      this.pouchdbStore.stopRemoteSync()
    }
  }
}
</script>

<style></style>
