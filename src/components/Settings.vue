<template>
  <v-row class="px-3">
    <v-col>
      <h1>Settings</h1>
      <v-divider class="pb-4" />

      <h3 class="mx-2 py-2">
        Backup
      </h3>

      <v-btn
        color="grey darken-2"
        dark
        class="mb-2"
        small
        @click="$store.dispatch('exportBudgetAsJSON')"
      >
        Backup Budget Data
      </v-btn>

      <span class="pl-2">Export data for backup.</span>

      <h3 class="mx-2 pt-2">
        Restore
      </h3>
      
      <v-sheet
        
        class="ma-2 mr-4 pa-2"
        color="grey lighten-2"
        elevation="2"
        outlined
        rounded
        shaped
        justify="center"
      >
        <v-alert
          dense
          type="info"
        >
          Before restoring, delete your database or all documents
        </v-alert>
        <v-file-input
          v-model="backupFile"
          label="Restore Backup File"
          @change="onFileChange"
        />
        <v-btn
          color="accent"
          dark
          class="mb-2"
          small
          :disabled="!backupFileParsed"
          @click="$store.dispatch('commitBulkDocsToPouchAndVuex', backupFileParsed)"
        >
          Restore From File
        </v-btn>
      </v-sheet>

     
      <br>

      <!-- v-if="!isProd" -->
      <v-expansion-panels>
        <v-expansion-panel
          class="grey lighten-3"
        >
          <v-expansion-panel-header>
            <h3>
              Debugging
            </h3>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <tree-view
              :data="transactions"
              :options="{maxDepth: 0}"
            />
            <tree-view
              :data="accounts"
              :options="{maxDepth: 0}"
            />
            <tree-view
              :data="monthlyData"
              :options="{maxDepth: 0}"
            />
            <v-alert
              type="warning"
            >
              Warning: Do not use these unless you know what you're doing.
            </v-alert>
            <v-btn
              color="red"
              dark
              class="mb-2"
              small
              data-cy="delete-local-db"
              @click="deleteLocalDatabase"
            >
              Erase Local Database
            </v-btn>
            <span
              class="pl-2"
            >Deletes local PouchDB database. If connected to a remote database it will re-sync all
              the data.</span>
            <v-btn
              color="red"
              dark
              class="mb-2"
              small
              @click="eraseAllDocs"
            >
              Delete All Docs from db
            </v-btn>
            <span
              class="pl-2"
            >Deletes all docs (transactions, accounts, budget amounts, etc). This will replicate
              deletion to remote databases.</span>
            <br>
            <v-btn
              color="grey darken-2"
              dark
              class="mb-2"
              small
              @click="$store.dispatch('loadLocalBudgetRoot')"
            >
              Reload Budget
            </v-btn>
            <span class="pl-2">Reload Budget Root (for debugging purposes)</span>
            <br>

            <v-btn
              color="purple"
              dark
              class="mb-2"
              small
              @click="loadMockData"
            >
              Load Mock Data 
            </v-btn>
            <span class="pl-2">Loads fake data for testing purposes.</span>
            <br>

            <v-btn
              color="purple"
              dark
              class="mb-2"
              small
              @click="$store.dispatch('createMockTransactions')"
            >
              createMockTransactions
            </v-btn>
            <span class="pl-2">Loads fake data for testing purposes.</span>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>

    <v-col cols="12">
      <h3 class="mx-2 py-2">
        Payees
      </h3>
      <v-data-table
        :headers="headers"
        :items="payees.sort((a, b) => (a.name > b.name ? 1 : -1))"
        class="elevation-1"
      />
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import BaseDialogModalComponent from "./Modals/BaseDialogModalComponent.vue";

export default {
  name: "Settings",
  components: {
    BaseDialogModalComponent
  },
  data() {
    return {
      backupFile: null,
      backupFileParsed: null,
      newBudgetModal: false,
      tab: null,
      selected_budget: null,
      headers: [
        { text: "Name", value: "name" },
        { text: "id", value: "_id" }
      ],
      isProd: process.env.NODE_ENV === 'production',
    };
  },
  computed: {
    ...mapGetters(["transactions", "accounts", "monthlyData", "payees", "selectedBudgetID"]),
    packageVersion() {
      return process.env.PACKAGE_VERSION || '0'
    } ,
  },
  methods: {
    ...mapActions([
      "deleteAllDocs",
      "eraseAllDocs",
      "deleteLocalDatabase",
      "loadMockData",
      "createNewBudget"
    ]),
    onFileChange() {
      console.log(this.backupFile)

      const reader = new FileReader();
      this.accountsForImport = [];
      this.selectedAccount = {};

      reader.onload = e => {
        const vm = this;
        let data = JSON.parse(e.target.result)

        vm.backupFileParsed = data
      };
      reader.readAsText(this.backupFile);
    },
    createBudget(budgetName) {
      console.log("create called", budgetName);
      this.$store.dispatch("createBudget", budgetName);
    }
  }
};
</script>

<style></style>
