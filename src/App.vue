<template>
  <v-app id="inspire">
    <v-overlay opacity="1" z-index="9" :value="appStore.loadingOverlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <v-overlay :value="appStore.manageBudgetOverlay">
      <v-row justify="center">
        <v-card>
          <v-card-title><v-list-item-title class="text-h5 mb-1">Manage Budgets</v-list-item-title></v-card-title>
          <v-card-text>
            <v-simple-table>
              <template #default>
                <thead>
                  <tr>
                    <th class="text-left"></th>
                    <th class="text-left">Date Created</th>
                    <th class="text-left">Name</th>
                    <th class="text-left">Currency</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="budget in budgetManagerStore.budgetsAvailable" :key="budget._id">
                    <td><v-btn small light color="white" @click="loadBudget(budget._id.slice(-36))">Load</v-btn></td>
                    <td>{{ budget.created | moment('from', 'now') }}</td>
                    <td>{{ budget.name }}</td>
                    <td>{{ budget.currency }}</td>
                    <td>
                      <v-icon icon dark class="" color="primary" @click="editItem(budget)"> edit </v-icon>
                      <v-icon icon dark class="ml-1" color="accent" @click="deleteItem(budget)"> delete </v-icon>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="showCreateBudgetDialog(budget)" color="green"
              ><v-icon left color="white">mdi-plus</v-icon>Create Budget</v-btn
            >
            <v-spacer></v-spacer>
            <v-btn @click="showImportModal()">Import</v-btn>
            <v-btn @click="budgetHelperStore.exportAllBudgetsAsJSON()">Backup</v-btn>
          </v-card-actions>
        </v-card>
      </v-row>
    </v-overlay>

    <!-- Global confirm dialog -->
    <confirm-dialog ref="confirm"></confirm-dialog>

    <!-- Modal to edit budget -->
    <BaseDialogModalComponent v-model="isModelVisibleEditBudget">
      <template #title> Manage Budget </template>
      <template #body>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="budgetItem.name" label="Budget name" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="budgetItem.currency" :items="currencies" label="Currency" required />
            </v-col>
            <v-col cols="12" sm="6" />
          </v-row>
        </v-container>
      </template>

      <template #actions>
        <v-spacer />
        <v-btn color="blue darken-1" text @click="isModelVisibleEditBudget = false"> Close </v-btn>
        <v-btn color="blue darken-1" text @click="saveBudget()"> Save </v-btn>
      </template>
    </BaseDialogModalComponent>

    <!-- Modal to import budget file -->
    <BaseDialogModalComponent v-model="isModelVisibleImportBudgetFile">
      <template #title> Import Budget </template>
      <template #body>
        <v-container>
          <v-file-input v-model="backupFile" label="Restore Backup File" @change="onFileChange" />
        </v-container>
      </template>

      <template #actions>
        <v-spacer />
        <v-btn color="grey" @click="this.isModelVisibleImportBudgetFile = false">Close</v-btn>
        <v-btn color="primary" :disabled="!backupFileParsed" @click="importBudget()">Import Budget</v-btn>
      </template>
    </BaseDialogModalComponent>

    <sidebar v-if="!appStore.manageBudgetOverlay" />

    <v-main v-if="!appStore.manageBudgetOverlay">
      <router-view class="animated" />
    </v-main>
    <v-snackbar v-model="appStore.snackBar" :color="appStore.snackBarColor">
      {{ appStore.snackBarMessage }}

      <template #action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="appStore.snackBar = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import BaseDialogModalComponent from './components/Modals/BaseDialogModalComponent.vue'
import ConfirmDialog from './components/Modals/ConfirmDialog.vue'

import { mapStores } from 'pinia'
import { useBudgetManagerStore } from './store/budgetManager'
import { useAppStore } from './store/appStore'
import mock_budget from '@/../tests/__mockdata__/mock_budget2.json'
import { useBudgetHelperStore } from './store/budgetManagerHelper'
import { usePouchDBStore } from './store/pouchdbStore'

export default {
  name: 'App',
  components: {
    Sidebar,
    BaseDialogModalComponent,
    ConfirmDialog
  },
  data() {
    return {
      drawer: null,
      mini: false,
      isModelVisibleEditBudget: false,
      isModelVisibleImportBudgetFile: false,
      backupFile: null,
      backupFileParsed: null,
      budgetItem: {},
      currencies: [{ value: 'USD', text: '$' }]
    }
  },
  computed: {
    ...mapStores(useBudgetManagerStore, useBudgetHelperStore, useAppStore, usePouchDBStore)
  },
  async mounted() {
    // await this.budgetManagerStore.loadMockDataIntoPouchDB(mock_budget, '5a98dc44-7982-4ecc-aa50-146fc4dc4e16')
    await this.loadAvailableBudgets()
    if (localStorage.budgetID) {
      this.loadBudget(localStorage.budgetID)
    } else {
      this.appStore.loadingOverlay = false
    }
    this.pouchdbStore.startSyncIfRemoteSet()
    this.$root.$confirm = this.$refs.confirm.open
  },
  methods: {
    onFileChange() {
      if (this.backupFile) {
        this.appStore.loadingOverlay = true

        const reader = new FileReader()
        this.accountsForImport = []
        this.selectedAccount = {}

        reader.onload = (e) => {
          const vm = this
          let data = JSON.parse(e.target.result)

          vm.backupFileParsed = data
        }
        reader.readAsText(this.backupFile)
        this.appStore.loadingOverlay = false
      }
    },
    async importBudget() {
      this.appStore.loadingOverlay = true
      await this.budgetManagerStore.putBulkDocuments(this.backupFileParsed)
      this.isModelVisibleImportBudgetFile = false
      this.appStore.loadingOverlay = false
    },
    async loadAvailableBudgets() {
      try {
        await this.budgetManagerStore.loadAvailableBudgets()
      } catch (err) {
        console.error(err)
      }
      this.showBudgetSelection = true
    },
    async loadBudget(budget_id) {
      console.log('load budget', budget_id)

      try {
        await this.budgetManagerStore.loadBudgetWithID(budget_id)
        localStorage.budgetID = budget_id
      } catch (err) {
        console.error(err)
      }
      this.appStore.manageBudgetOverlay = false
      this.appStore.loadingOverlay = false
    },
    async showCreateBudgetDialog() {
      try {
        const newBudgetName = await this.$root.$confirm('Create a new budget', ``, {
          agreeBtnColor: 'primary',
          cancelBtnColor: 'accent',
          agreeBtnText: 'Ok',
          showTextField: true,
          textFieldLabel: 'Enter budget name',
          textFieldValue: '',
          showMessage: false
        })
        if (newBudgetName) {
          this.appStore.loadingOverlay = true
          await this.budgetHelperStore.createBudget(newBudgetName)
        }
      } catch (err) {
        this.appStore.setSnackbarMessage({ snackBarMessage: err, snackBarColor: 'accent' })
      }
      this.appStore.loadingOverlay = false
    },
    showImportModal() {
      this.isModelVisibleImportBudgetFile = true
      this.backupFile = null
      this.backupFileParsed = null
    },
    async deleteItem(item) {
      if (
        await this.$root.$confirm(
          'Delete Entire Budget?',
          'Are you sure you want to delete this Budget? It will permanently delete all transactions, categories, and budget amounts and replicate deletion to any remote sync servers.',
          { cancelBtnColor: 'grey', agreeBtnColor: 'accent', agreeBtnText: 'Delete Entire Budget' }
        )
      ) {
        await this.budgetHelperStore.deleteEntireBudget(item)
      }
    },
    editItem(budgetItem) {
      this.budgetItem = JSON.parse(JSON.stringify(budgetItem))
      this.isModelVisibleEditBudget = true
    },
    async saveBudget() {
      await this.budgetManagerStore.putDocument(this.budgetItem)
      this.isModelVisibleEditBudget = false
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.swal2-title {
  font-family: SofiaPro, Roboto !important;
  font-size: 2.125rem !important;
}

.transaction-table-header {
  background-color: var(--v-header_background-base) !important;
  color: var(--v-primary-base) !important;
  font-weight: 500;
  padding-right: 5px !important;
}
tbody {
  tr:hover {
    background-color: transparent !important;
  }
}
</style>
