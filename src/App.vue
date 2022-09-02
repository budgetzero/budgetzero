<template>
  <v-app id="inspire">
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

    <sidebar />

    <v-main>
      <router-view class="animated" />
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
      budgetName: null
    }
  },
  computed: {
    ...mapStores(useBudgetManagerStore, useMainStore),
    isModalVisibleCreateBudget() {
      return !this.$store.getters.budgetExists
    },
  },
  mounted() {
    console.log(this)
    this.mainPiniaStore.setSnackbarMessage({snackbarMessage: 'ok', snackBarColor: 'blue'})
    this.budgetManagerStore.loadMockDataIntoPouchDB(mock_budget, '5a98dc44-7982-4ecc-aa50-146fc4dc4e16')
    // this.$root.$confirm = this.$refs.confirm.open
  },
  methods: {
    async createBudget() {
      this.$store.dispatch('loadLocalBudgetRoot')
      this.$store.dispatch('createBudget', this.budgetName)

      if (
        await this.$root.$confirm('Budget Created!', `A budget named ${this.budgetName} has been created!`, {
          onlyShowAgreeBtn: true,
          agreeBtnColor: 'accent',
          agreeBtnText: 'Ok'
        })
      ) {
        this.$router.push({ path: `/budget` })
      }
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
