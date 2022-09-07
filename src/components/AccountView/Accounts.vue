<template>
  <v-card elevation="0" class="mx-auto">
    <v-data-table
      id="accountsTable"
      :headers="headers"
      :items="budgetManagerStore.accounts"
      sort-by="calories"
      class="elevation-1 account-table"
      hide-default-footer
      disable-pagination
    >
      <template #top>
        <v-toolbar flat color="white">
          <span class="text-h3">Accounts</span>
          <v-spacer />

          <AccountAddModal v-model="showModal" :editeditem="editedItem" @save="save()" />

          <v-btn id="addAccountBtn" color="accent" dark class="mb-2" @click="create()"> Add Account </v-btn>
        </v-toolbar>
        <v-divider class="pb-4" />
      </template>

      <template #item.action="{ item }">
        <div class="crud-actions">
          <v-icon icon dark class="" color="primary" @click="editItem(item)"> edit </v-icon>
          <v-icon icon dark class="ml-1" color="accent" @click="deleteItem(item)"> delete </v-icon>
        </div>
      </template>
      <template #no-data>
        <!-- <v-btn color="primary" @click="on">Add Account</v-btn> -->
      </template>
    </v-data-table>
  </v-card>
</template>
<script>
import AccountAddModal from './AccountAddModal.vue'
import { mapStores } from 'pinia'
import { useBudgetManagerStore } from '../../store/budgetManager'
import { useBudgetHelperStore } from '../../store/budgetManagerHelper'
import { useMainStore } from '../../store/mainPiniaStore'

export default {
  name: 'AccountGrid',
  components: {
    AccountAddModal
  },
  data() {
    return {
      headers: [
        {
          text: 'Name',
          align: 'left',
          sortable: false,
          value: 'name'
        },
        { text: 'Type', value: 'type' },
        { text: 'On Budget', value: 'onBudget' },
        { text: 'Invert Balance', value: 'balanceIsNegative' },
        { text: 'Closed', value: 'closed' },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      editedIndex: -1,
      editedItem: null,
      emptyItem: {
        type: '',
        checkNumber: true,
        closed: false,
        name: '',
        note: null,
        sort: 0,
        onBudget: true,
        balanceIsNegative: false,
        initialBalance: 0
      },
      showModal: false,
      nameRules: [
        (v) => !!v || 'Name is required',
        (v) => (v && v.length <= 10) || 'Name must be less than 10 characters'
      ]
    }
  },
  computed: {
    ...mapStores(useBudgetManagerStore, useBudgetHelperStore, useMainStore)
  },
  mounted() {},
  created() {},
  methods: {
    create() {
      this.editedIndex = -1
      this.editedItem = Object.assign({}, this.emptyItem)
      this.showModal = true
    },
    editItem(item) {
      this.editedIndex = this.budgetManagerStore.accounts.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.showModal = true
    },
    async deleteItem(item) {
      const index = this.budgetManagerStore.accounts.indexOf(item)

      await this.$root.$confirm('Delete Account', 'Are you sure you want to delete this account?', {
        onlyShowAgreeBtn: false,
        agreeBtnColor: 'accent',
        agreeBtnText: 'Delete Account',
        cancelBtnColor: 'grey'
      })

      try {
        await this.budgetHelperStore.deleteAccount(this.budgetManagerStore.accounts[index])
      } catch (err) {
        await this.$root.$confirm(
          'Deletion Failed',
          `This account still has ${err.message} transaction(s). You must delete those transactions to delete the account.`,
          {
            onlyShowAgreeBtn: true,
            agreeBtnColor: 'accent',
            agreeBtnText: 'Ok'
          }
        )
      }
    },
    close() {
      this.showModal = false
      setTimeout(() => {
        // this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1
      }, 300)
    },
    async save() {
      if (this.editedIndex > -1) {
        // Editing existing account
        const editPayload = {
          type: this.editedItem.type,
          checkNumber: this.editedItem.checkNumber,
          closed: this.editedItem.closed,
          name: this.editedItem.name,
          note: this.editedItem.note,
          sort: this.editedItem.sort,
          onBudget: this.editedItem.onBudget,
          balanceIsNegative: this.editedItem.balanceIsNegative,
          _id: this.editedItem._id,
          _rev: this.editedItem._rev
        }
        Object.assign(this.budgetManagerStore.accounts[this.editedIndex], this.editedItem)
        await this.budgetHelperStore.createUpdateAccount(editPayload, false)
      } else {
        // Creating new account
        const newPayload = {
          type: this.editedItem.type,
          checkNumber: this.editedItem.checkNumber,
          closed: this.editedItem.closed,
          name: this.editedItem.name,
          note: this.editedItem.note,
          sort: this.editedItem.sort,
          onBudget: this.editedItem.onBudget,
          balanceIsNegative: this.editedItem.balanceIsNegative,
          _id: `b_${this.budgetManagerStore.budgetID}_account_${this.$uuid.v4()}`
        }
        await this.budgetHelperStore.createUpdateAccount(newPayload, this.editedItem.initialBalance)
      }
      this.close()
    }
  }
}
</script>

<style scoped></style>
