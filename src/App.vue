<template>
  <v-app id="inspire">
    <v-overlay :value="mainPiniaStore.loadingOverlay">
      <v-row justify="center">
        <v-card>
          <v-card-title>Manage Budgets</v-card-title>
          <v-card-text>
            <v-simple-table>
              <template #default>
                <thead>
                  <tr>
                    <th class="text-left"></th>
                    <th class="text-left" width="50px">Selected</th>
                    <th class="text-left">Date Created</th>
                    <th class="text-left">Name</th>
                    <th class="text-left">Currency</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="budget in budgetManagerStore.budgetsAvailable" :key="budget._id">
                    <td><v-btn @click="loadBudget(budget)">Load</v-btn></td>

                    <td v-if="budget._id.slice(-36) == budgetManagerStore.budgetID">
                      <v-icon color="accent"> mdi-check-bold </v-icon>
                    </td>
                    <td v-else />
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
            <v-btn @click="showCreateBudgetDialog(budget)">Create Budget</v-btn>
          </v-card-actions>
        </v-card>
      </v-row>
    </v-overlay>

    <!-- Global confirm dialog -->
    <confirm-dialog ref="confirm"></confirm-dialog>

    <!-- Modal to input reconcile amount  -->
    <BaseDialogModalComponent v-model="isModalVisibleCreateBudget">
      <template #title> Let's get started! </template>
      <template #body>
        <v-text-field v-model="budgetName" id="budgetNameField" label="Enter a name for your budget" required />
      </template>
      <template #actions>
        <v-spacer />
        <v-btn id="createBudgetBtn" color="accent" @click="createBudget()"> Create Budget </v-btn>
      </template>
    </BaseDialogModalComponent>

    <sidebar v-if="!mainPiniaStore.loadingOverlay" />

    <v-main v-if="!mainPiniaStore.loadingOverlay">
      <router-view  class="animated" />
    </v-main>
    <v-snackbar v-model="mainPiniaStore.snackbar" :color="mainPiniaStore.snackBarColor">
      {{ mainPiniaStore.snackbarMessage }}

      <template #action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="mainPiniaStore.snackbar = false"> Close </v-btn>
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
import { useMainStore } from './store/mainPiniaStore'
import mock_budget from '@/../tests/__mockdata__/mock_budget2.json'
import { useBudgetHelperStore } from './store/budgetManagerHelper'

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
      budgetName: null,
    }
  },
  computed: {
    ...mapStores(useBudgetManagerStore, useBudgetHelperStore, useMainStore),
    isModalVisibleCreateBudget() {
      return false
    }
  },
  async mounted() {
    console.log(this)
    this.mainPiniaStore.setSnackbarMessage({ snackbarMessage: 'ok', snackBarColor: 'blue' })
    this.budgetManagerStore.loadMockDataIntoPouchDB(mock_budget, '5a98dc44-7982-4ecc-aa50-146fc4dc4e16')
    this.loadAvailableBudgets()
    this.$root.$confirm = this.$refs.confirm.open
  },
  methods: {
    async loadAvailableBudgets() {
      try {
        await this.budgetManagerStore.loadAvailableBudgets()
      } catch (err) {
        console.error(err)
      }
      console.log('available budgets loaded', this.budgetManagerStore.budgetsAvailable)
      this.showBudgetSelection = true
    },
    async loadBudget(budget) {
      const budget_id = budget._id.slice(-36)
      console.log('load budget', budget_id)
      try {
        await this.budgetManagerStore.loadBudgetWithID(budget_id)
      } catch (err) {
        console.error(err)
      }
      this.mainPiniaStore.loadingOverlay = false
    },
    async showCreateBudgetDialog() {
      try {
        const newBudgetName = await this.$root.$confirm(
          'Budget Created!',
          `A budget named ${this.budgetName} has been created!`,
          {
            agreeBtnColor: 'primary',
            cancelBtnColor: 'accent',
            agreeBtnText: 'Ok',
            showTextField: true,
            textFieldLabel: 'Enter budget name',
            showMessage: false
          }
        )
        if (newBudgetName) {
          await this.budgetHelperStore.createBudget(newBudgetName)
        }
        this.mainPiniaStore.setSnackbarMessage({ snackbarMessage: newBudgetName, snackBarColor: 'blue' })
      } catch (err) {
        console.error(err)
      }

      // this.$store.dispatch('createBudget', this.budgetName)

      // if (
      //   await this.$root.$confirm('Budget Created!', `A budget named ${this.budgetName} has been created!`, {
      //     onlyShowAgreeBtn: true,
      //     agreeBtnColor: 'accent',
      //     agreeBtnText: 'Ok'
      //   })
      // )
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
</style>
