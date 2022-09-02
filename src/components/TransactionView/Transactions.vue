<template>
  <v-container fill-height fluid class="ma-0 pa-0">
    <!-- Modal to input reconcile amount  -->
    <BaseDialogModalComponent v-model="isModalVisibleForReconcile">
      <template #title> Enter current amount balance: </template>
      <template #body>
        <v-text-field
          id="txt_field_reconcileAmt"
          v-model="reconcileAmount"
          prefix="$"
          label="Account balance"
          required
          @keyup.enter="startReconcile()"
        />
      </template>
      <template #actions>
        <v-spacer />
        <v-btn color="grey" @click.stop="isModalVisibleForReconcile = false"> Cancel </v-btn>
        <v-btn id="btn-createMasterCategory" color="accent" @click="startReconcile()"> Start Reconcile </v-btn>
      </template>
    </BaseDialogModalComponent>

    <TransactionHeader :selected_account="selected_account" @showReconcileModal="showReconcileModal" />
    <ReconcileHeader v-if="isReconciling" :reconcile-amount="reconcileAmount" @reconcileComplete="reconcileComplete" />

    <v-divider />
    <v-row class="transaction-toolbar ma-0">
      <v-col class="pt-2 pb-0">
        <v-btn id="addTransactionBtn" small color="accent darken-1" dark outlined class="mb-2" @click="addTransaction">
          <v-icon color="accent" left medium> mdi-plus </v-icon>
          Transaction
        </v-btn>
      </v-col>
      <v-col class="py-1 body-1 font-weight-bold">
        <v-menu v-model="editMenuOpen" bottom offset-x close-on-content-click close-on-click>
          <template #activator="{ on, attrs }">
            <v-btn small class="white--text" color="grey darken-4" dark outlined v-bind="attrs" v-on="on">
              Edit ({{ selected.length }})
              <v-icon dark color="grey darken-4" right> mdi-chevron-down </v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="approveSelectedTransactions">
              <v-icon dark color="primary" left> mdi-check-circle </v-icon>
              <v-list-item-title>Approve</v-list-item-title>
            </v-list-item>

            <v-list-item @click="clearSelectedTransactions">
              <v-icon dark color="primary" left> mdi-alpha-c-circle </v-icon>
              <v-list-item-title>Clear</v-list-item-title>
            </v-list-item>

            <v-list-item @click="deleteSelectedTransactions">
              <v-icon dark color="red" left> mdi-delete </v-icon>
              <v-list-item-title>Delete</v-list-item-title>
            </v-list-item>

            <v-menu bottom offset-x close-on-content-click close-on-click open-on-hover>
              <template #activator="{ on, attrs }">
                <v-list-item v-bind="attrs" left v-on="on"> Categorize as: </v-list-item>
              </template>

              <v-list>
                <v-list-item
                  v-for="category in categoriesForDropdown"
                  :key="category._id"
                  @click.stop="categorizeSelectedTransactions(category)"
                >
                  <v-list-item-title> {{ category.name }} </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-list>
        </v-menu>

        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn icon class="ml-3" @click="deleteSelectedTransactions">
              <v-icon dark color="grey darken-1" v-on="on"> mdi-delete </v-icon>
            </v-btn>
          </template>
          <span>Delete</span>
        </v-tooltip>

        <v-btn icon class="white--text" color="grey darken-1" @click="$store.dispatch('getAllDocsFromPouchDB')">
          <v-icon> mdi-refresh </v-icon>
        </v-btn>
      </v-col>
      <v-col class="pt-2 pb-0">
        <v-btn small class="mb-2 ml-2" color="grey lighten-2" elevation="0" @click.stop="importModalVisible = true">
          <v-icon left> mdi-cloud-upload </v-icon>
          <span>Import</span>
        </v-btn>
      </v-col>
      <v-col class="pt-0 pb-0">
        <v-text-field
          v-model="search"
          class="pt-0"
          append-icon="search"
          label="Search"
          single-line
          hide-details
          clearable
        />
      </v-col>
    </v-row>
    <v-divider />

    <v-row class="ma-0">
      <v-col class="pa-0 ma-0">
        <!-- Modal component for import transactions -->
        <ImportModalComponent
          :visible="importModalVisible"
          :account="selected_account_id"
          @close="importModalVisible = false"
        />

        <v-form ref="transactions_table_form">
          <v-data-table
            ref="transaction_table"
            v-model="selected"
            :headers="headersForSingleAccount"
            :items="filteredTransactions"
            item-key="_id"
            show-select
            :expanded.sync="expanded"
            single-expand
            sort-by="date"
            :sort-desc="true"
            class="elevation-1 transaction-table"
            :height="windowHeight"
            :items-per-page="items_per_page"
            fixed-header
          >
            <template #item="{ item, expand, isExpanded, index, isSelected, select }">
              <tr
                :key="item._id"
                :class="{ selectedRow: item._id === editedItem._id, 'un-approved': !item.approved }"
                @dblclick="
                  editItem(item)
                  expand(item)
                "
              >
                <!-- Checkbox -->
                <td class="pr-0">
                  <div class="pt-2 editing-cell-container">
                    <v-simple-checkbox color="accent" :value="isSelected" :ripple="false" @input="select($event)" />
                  </div>
                </td>

                <!-- Cleared -->
                <td class="pa-0" style="width: 20px">
                  <div class="editing-cell-container">
                    <v-btn icon @click="flipCleared(item)">
                      <v-icon v-if="item.cleared" color="primary"> mdi-alpha-c-circle </v-icon>
                      <v-icon v-if="!item.cleared" color="grey"> mdi-alpha-c-circle-outline </v-icon>
                    </v-btn>
                  </div>
                </td>

                <!-- Date input -->

                <td v-if="item._id === editedItem._id" id="edit-date-input" class="pr-0 pl-1 editing-cell-container">
                  <div class="editing-cell-container">
                    <v-menu
                      v-model="dateMenu"
                      :close-on-content-click="false"
                      nudge-right="-20"
                      nudge-bottom="-20"
                      transition="scale-transition"
                      offset-x
                      offset-y
                      min-width="290px"
                    >
                      <template #activator="{ on }">
                        <v-text-field
                          v-model="editedItem.date"
                          label=""
                          class="pa-0 pb-1 editing-cell-element"
                          v-on="on"
                          :rules="[rules.date]"
                        />
                      </template>
                      <v-date-picker v-model="editedItem.date" @input="dateMenu = false" />
                    </v-menu>
                  </div>
                </td>
                <td v-else class="date-cell">
                  <div>
                    {{ item.date }}
                  </div>
                </td>

                <!-- Account input -->
                <td v-if="item._id === editedItem._id && !isSingleAccount" class="pr-0 pl-1 editing-cell-container">
                  <div class="editing-cell-container">
                    <v-select
                      v-model="editedItem.account"
                      :items="budgetManager.accounts"
                      label=""
                      class="pa-0 pb-1 editing-cell-element"
                      item-text="name"
                      item-value="id"
                    />
                  </div>
                </td>
                <td v-if="item.id !== editedItem.id && !isSingleAccount">
                  <div class="editing-cell-container">
                    {{ account_map[item.account] }}
                  </div>
                </td>

                <!-- Payee -->
                <!-- payee data entered through 1) type w/autocomplete 2) select from dropdown -->
                <!--  -->
                <!--  -->
                <td v-if="item._id === editedItem._id" class="pr-0 pl-1 editing-cell-container">
                  <div class="editing-cell-container">
                    <v-combobox
                      v-model="payee"
                      :items="payeesForDropdown"
                      class="pa-0 pb-1 editing-cell-element"
                      :search-input.sync="payeeSearchText"
                      item-text="name"
                      data-cy="payee-input"
                    >
                      <!-- <template v-slot:selection="props">
                    {{ props }}
                  </template> -->
                      <template #no-data>
                        <v-list-item>
                          <span class="subheading">Payee {{ payeeSearchText }} not found and will be created.</span>
                        </v-list-item>
                      </template>
                      <!-- <template v-slot:selection="{ attrs, item, parent, selected }">
                    <span v-if="item in payee_map">
                      {{ payee_map[item] }}
                    </span>
                    <span v-else>
                      {{ item }}
                    </span>
                  </template> -->
                    </v-combobox>
                  </div>
                </td>
                <td v-else>
                  <div v-if="item.transfer">
                    <span class="chip-label"
                      >Transfer:
                      {{
                        budgetManagerStore.account_map[item.payee]
                          ? budgetManagerStore.account_map[item.payee]
                          : item.payee
                      }}
                      <v-icon color="primary"> mdi-arrow-left-right-bold </v-icon></span
                    >
                  </div>
                  <div v-else>
                    <span class="chip-label">{{
                      budgetManagerStore.payee_map[item.payee]
                        ? budgetManagerStore.payee_map[item.payee].substring(0, 25)
                        : item.payee
                    }}</span>
                  </div>
                </td>

                <!-- Category input -->
                <td v-if="item._id === editedItem._id" class="pr-0 pl-1 editing-cell-container">
                  <div class="editing-cell-container">
                    <v-select
                      v-model="editedItem.category"
                      :items="categoriesForDropdown"
                      class="pa-0 pb-1"
                      item-text="name"
                      item-value="truncated_id"
                      data-cy="category-input"
                    >
                      <template #item="{ item }">
                        <v-list-tile-content>
                          <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                        </v-list-tile-content>
                        <v-spacer />
                        <v-list-item-action>
                          <!-- TODO: 'month_selected' should probably be the transaction month -->
                          <v-list-item-action-text>
                            {{ (getBalance(item) / 100) | currency }}
                          </v-list-item-action-text>
                        </v-list-item-action>
                      </template>
                      <!--                     
                    <template slot="item" slot-scope="data">
                      <v-list-tile-content>
                        <v-list-tile-title v-html="data.item.name" />
                        <v-list-tile-subtitle>test</v-list-tile-subtitle>
                      </v-list-tile-content>
                    </template> -->
                    </v-select>
                  </div>
                </td>
                <td v-else>
                  <div>
                    <span v-if="item.transfer"><v-chip color="grey lighten-2">Transfer</v-chip></span>
                    <span v-else-if="item.payee == '---------------------initial-balance'">
                      <v-chip color="grey lighten-2">Initial Balance</v-chip>
                    </span>
                    <span v-else-if="!item.category">
                      <v-chip color="yellow lighten-3">{{ budgetManagerStore.category_map[item.category] }} </v-chip>
                    </span>
                    <span v-else>{{ budgetManagerStore.category_map[item.category] }}</span>
                  </div>
                </td>

                <!-- Memo input -->
                <td v-if="item._id === editedItem._id" class="pr-0 pl-1 editing-cell-container">
                  <div class="editing-cell-container">
                    <v-text-field
                      v-model="editedItem.memo"
                      class="pa-0 pb-1 editing-cell-element"
                      data-cy="memo-input"
                    />
                  </div>
                </td>
                <td v-else>
                  <div>
                    {{ item.memo }}
                  </div>
                </td>

                <!-- Inflow -->
                <td v-if="item._id === editedItem._id" class="pr-0 pl-1 editing-cell-container inflow">
                  <div class="editing-cell-container">
                    <v-text-field
                      v-model="inflowAmount"
                      prefix="$"
                      class="pa-0 pb-1 editing-cell-element"
                      color="green"
                      id="inflow-input"
                      :rules="currencyRule"
                    />
                  </div>
                </td>
                <td v-else align="right" id="inflow">
                  <div>
                    {{ item.value > 0 ? item.value / 100 : '' | currency }}
                  </div>
                </td>

                <!-- Outflow -->
                <td v-if="item._id === editedItem._id" class="pr-0 pl-1 editing-cell-container outflow">
                  <div class="editing-cell-container">
                    <v-text-field
                      v-model="outflowAmount"
                      prefix="$"
                      class="pa-0 pb-1 editing-cell-element"
                      color="red"
                      id="outflow-input"
                      :rules="currencyRule"
                    />
                  </div>
                </td>
                <td v-else align="right" id="outflow">
                  <div>
                    {{ item.value < 0 ? -(item.value / 100) : '' | currency }}
                  </div>
                </td>

                <!-- Reconciled -->
                <td class="pa-0" style="width: 20px">
                  <div>
                    <!-- <v-btn
                  icon
                > -->
                    <v-icon v-if="item.reconciled" color="green lighten-1"> mdi-lock </v-icon>
                    <!-- <v-icon
                    v-if="!item.reconciled"
                    color="grey"
                  >
                    mdi-lock
                  </v-icon> -->
                    <!-- </v-btn> -->
                  </div>
                </td>

                <!-- Actions -->
                <td class="actions-cell">
                  <div
                    v-if="(item._id !== editedItem._id || creatingNewTransaction) && editedIndex === -1"
                    class="crud-actions"
                  >
                    <v-btn
                      icon
                      small
                      dark
                      class=""
                      color="primary"
                      @click="
                        editItem(item)
                        expand(item)
                      "
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon small dark class="ml-1" color="accent" @click="deleteTransaction(item)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </td>
              </tr>
            </template>

            <template #expanded-item="{ headers, item, expand, isExpanded }">
              <td :colspan="headers.length" class="mr-0 pr-0 grey lighten-2">
                <div class="actions">
                  <v-btn small class="my-2" rounded color="green" id="save-btn" @click="save(item)">
                    <v-icon left> mdi-check </v-icon>
                    Save
                  </v-btn>
                  <v-btn small class="my-2 mb-2 mx-2" rounded color="accent" id="cancel-btn" @click="cancel()">
                    <v-icon left> mdi-cancel </v-icon>
                    Cancel
                  </v-btn>
                </div>
              </td>
            </template>

            <template #no-data>
              <span>No transactions in this account.</span>
            </template>
          </v-data-table>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Vue from 'vue'
import BaseDialogModalComponent from '../Modals/BaseDialogModalComponent.vue'
import ImportModalComponent from './ImportModalComponent.vue'
import ReconcileHeader from './ReconcileHeader'
import TransactionHeader from './TransactionHeader'
import _ from 'lodash'
import { sanitizeValueInput } from '../../helper.js'
import { mapStores } from 'pinia'
import { useBudgetManagerStore } from '../../store/budgetManager'
import { useBudgetHelperStore } from '../../store/budgetManagerHelper'

export default {
  name: 'Transactions',
  components: {
    ImportModalComponent,
    ReconcileHeader,
    TransactionHeader,
    BaseDialogModalComponent
  },
  data() {
    return {
      editMenuOpen: false,
      pagination: {
        sortBy: 'name'
      },
      selected: [],
      search: '',
      timeout: 1000,
      payeeSearchText: '',
      date: new Date().toISOString().substr(0, 10),
      dateMenu: false,
      expanded: [],
      editedIndex: -1,
      editedItem: {
        account: '',
        category: null,
        cleared: true,
        approved: true,
        value: 0,
        date: new Date().toISOString().substr(0, 10),
        memo: '',
        reconciled: false,
        flag: '#ffffff',
        payee: null,
        transfer: null,
        splits: [],
        _id: '',
        _rev: ''
      },
      defaultItem: {
        account: '',
        category: null,
        cleared: true,
        approved: true,
        value: 0,
        date: new Date().toISOString().substr(0, 10),
        memo: '',
        reconciled: false,
        flag: '#ffffff',
        payee: null,
        transfer: null,
        splits: [],
        _id: '',
        _rev: ''
      },
      headers: [
        {
          value: 'data-table-select',
          class: 'transaction-table-header',
          text: ''
        },
        {
          text: '',
          align: 'center',
          value: 'cleared',
          width: '20px',
          sortable: false,
          class: 'transaction-table-header'
        },
        {
          text: 'Date',
          align: 'left',
          value: 'date',
          width: '110px',
          class: 'transaction-table-header'
        },
        {
          text: 'Account',
          align: 'left',
          value: 'account',
          class: 'transaction-table-header'
        },
        {
          text: 'Payee',
          align: 'left',
          value: 'payee',
          class: 'transaction-table-header'
        },
        {
          text: 'Category',
          align: 'left',
          value: 'category',
          class: 'transaction-table-header'
        },
        {
          text: 'Memo',
          align: 'left',
          value: 'memo',
          width: '120px',
          class: 'transaction-table-header'
        },
        {
          text: 'Inflow',
          align: 'left',
          value: 'inflow',
          width: '90px',
          class: 'transaction-table-header'
        },
        {
          text: 'Outflow',
          align: 'left',
          value: 'outflow',
          width: '90px',
          class: 'transaction-table-header'
        },
        {
          text: '',
          align: 'right',
          value: 'action',
          sortable: false,
          class: 'transaction-table-header'
        },
        {
          text: '',
          align: 'left',
          value: 'reconciled',
          width: '0px',
          sortable: false,
          class: 'transaction-table-header'
        }
      ],
      creatingNewTransaction: false,
      importModalVisible: false,
      reconcileModal: false,
      windowHeight: 0,
      items_per_page: 0,
      reconcileAmount: null,
      isReconciling: false,
      isModalVisibleForReconcile: false,
      currencyRule: [
        (v) => {
          if (isNaN(parseFloat(v)) && v.length > 0) return 'Numbers only'
          return true
        }
      ],
      rules: {
        date: (value) => {
          const pattern = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/
          return pattern.test(value) || 'Invalid date.'
        }
      }
    }
  },
  computed: {
    ...mapStores(useBudgetManagerStore, useBudgetHelperStore),
    inflowAmount: {
      get() {
        return this.editedItem.value > 0 ? Math.round(this.parseInflowOutflow(this.editedItem.value)) / 100 : ''
      },
      set(newValue) {
        this.editedItem.value = Math.round(this.parseInflowOutflow(newValue) * 100)
      }
    },
    outflowAmount: {
      get() {
        return this.editedItem.value < 0 ? Math.round(this.parseInflowOutflow(this.editedItem.value)) / 100 : ''
      },
      set(newValue) {
        this.editedItem.value = -Math.round(this.parseInflowOutflow(newValue) * 100)
      }
    },
    payee_names() {
      return this.budgetManagerStore.payees.map((obj) => obj.name)
    },
    payee() {
      if (this.editedItem.payee in this.budgetManagerStore.payee_map) {
        return this.budgetManagerStore.payee_map[this.editedItem.payee]
      } else if (this.editedItem.payee in this.budgetManagerStore.account_map) {
        return 'Transfer: ' + this.budgetManagerStore.account_map[this.editedItem.payee]
      } else {
        return 'Error'
      }
    },
    payeesForDropdown() {
      const accountNames = this.budgetManagerStore.accounts.map((acc) => 'Transfer: ' + acc.name)
      return this.budgetManagerStore.payees.concat(accountNames)
    },
    isSingleAccount() {
      // Is this viewing a single account or all transactions for all accounts?
      return typeof this.$route.params.account_id !== 'undefined' // Checks if param was passed through route
    },
    headersForSingleAccount() {
      // Only need the Account column if viewing all accounts.
      if (this.isSingleAccount) {
        return this.headers.filter((col) => col.text !== 'Account')
      } else {
        return this.headers
      }
    },
    categoriesForDropdown() {
      // All categories for transaction editing dropdown.
      // TODO: Sort by order...and group by master category?
      return this.budgetManagerStore.categories
        .map((cat) => {
          cat.truncated_id = cat._id && cat._id.length >= 36 ? cat._id.slice(-36) : cat._id
          return cat
        })
        .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
    },
    filteredTransactions() {
      let trans = []

      // Filter transactions by account if viewing single account
      if (this.isSingleAccount) {
        trans = _.get(this.budgetManagerStore.transactionsGroupedByAccount, this.$route.params.account_id, [])
      } else {
        trans = this.budgetManagerStore.transactions
      }

      // Add additional row if creating new transaction
      if (this.creatingNewTransaction) {
        const tpo = [...trans]
        tpo.unshift(this.defaultItem)
        return tpo
      }

      // Returns early if not searching
      if (!this.search) return trans

      // Implements search
      return trans.filter((row) => {
        if (this.budgetManagerStore.payee_map[row.payee] !== undefined) {
          return (
            this.budgetManagerStore.payee_map[row.payee].toUpperCase().includes(this.search.toUpperCase()) ||
            JSON.stringify(row).toUpperCase().includes(this.search.toUpperCase())
          )
        } else {
          return false
        }
      })
    },
    selected_account() {
      if (this.isSingleAccount) {
        const find = this.budgetManagerStore.accounts.find(
          ({ _id }) => _id.slice(-36) === this.$route.params.account_id
        )
        return find
      }
      return { _id: null, name: 'All Accounts', type: '' }
    },
    selected_account_id() {
      return this.$route.params.account_id
    },
    isTransactionsValid() {
      return this.$refs.transactions_table_form.validate()
    }
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
      this.onResize()
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    parseInflowOutflow(inputCurrency) {
      //Remove all non=digit chars except for period
      return inputCurrency.toString().replace(/[^0-9.]/g, '')
    },
    getBalance(item) {
      const id = item.truncated_id
      const transaction_month = this.editedItem.date.substring(0, 7)

      const balance = _.get(this.budgetManagerStore.monthlyData, `${transaction_month}.categories.${id}.balance`, 0)
      return balance
    },
    addTransaction() {
      this.creatingNewTransaction = true
      this.expanded.push(this.defaultItem)
    },
    editItem(item) {
      if (item.reconciled) {
        this.$swal({
          title: 'Edit This Transaction?',
          text: 'This transaction has been reconciled and is locked. Are you sure you want to edit?',
          icon: 'warning',
          showCancelButton: true,
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Edit Anyway',
          confirmButtonColor: '#990000'
        }).then((continueEdit) => {
          if (continueEdit.value) {
            this.creatingNewTransaction = false
            this.editedIndex = this.budgetManager.transactions.indexOf(item)
            this.editedItem = JSON.parse(JSON.stringify(this.budgetManagerStore.transactions[this.editedIndex])) // Removes reactivity to avoid mutating vuex state illegally
          } else {
            this.cancel()
            return
          }
        })
      } else {
        //TODO: Repeating code here from above. Boo
        this.creatingNewTransaction = false
        this.editedIndex = this.budgetManagerStore.transactions.indexOf(item)
        this.editedItem = JSON.parse(JSON.stringify(this.budgetManagerStore.transactions[this.editedIndex])) // Removes reactivity to avoid mutating vuex state illegally
      }
    },
    deleteTransaction(item) {
      this.creatingNewTransaction = false

      this.$swal({
        title: 'Delete This Transaction?',
        text: 'Are you sure you want to delete?',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Delete',
        confirmButtonColor: '#990000',
        cancelButtonColor: '#263238'
      }).then((continueDelete) => {
        if (continueDelete.value) {
          this.$store.dispatch('deleteDocFromPouchAndVuex', JSON.parse(JSON.stringify(item)))
          this.expanded = []
          this.cancel()
          return
        } else {
          this.cancel()
          return
        }
      })
    },
    save() {
      // Check if transaction is valid
      if (this.isTransactionsValid) {
        this.editedItem.payee = this.payeeSearchText //TODO: hacky?

        if (this.isSingleAccount) {
          this.editedItem.account = this.selected_account_id
        }

        if (this.creatingNewTransaction) {
          this.editedItem._id = `b_${this.selectedBudgetID}_transaction_${Vue.prototype.$vm.$uuid.v4()}`
        }
        this.editedItem.approved = true

        console.log('put', this.editedItem)
        this.budgetHelperStore.putTransaction(this.editedItem)
        this.cancel()
      } else {
        this.$store.commit('SET_SNACKBAR_MESSAGE', {
          snackbarMessage: 'Transaction is not formatted correctly.',
          snackbarColor: 'error'
        })
      }
    },
    flipCleared(item) {
      var item = JSON.parse(JSON.stringify(item))
      item.cleared = !item.cleared
      item.approved = true
      this.budgetManagerStore.putDocument(item)
    },
    clearTransaction(item) {
      var item = JSON.parse(JSON.stringify(item))
      item.cleared = true
      item.approved = true
      this.budgetManagerStore.putDocument(item)
    },
    approveSelectedTransactions() {
      var payload = JSON.parse(JSON.stringify(this.selected))
      payload.map((trans) => (trans.approved = true))

      this.budgetManagerStore.putDocument(payload)
      this.selected = []
    },
    clearSelectedTransactions() {
      var payload = JSON.parse(JSON.stringify(this.selected))
      payload.map((trans) => (trans.cleared = true))
      payload.map((trans) => (trans.approved = true))
      this.budgetManagerStore.putBulkDocuments(payload)
      this.selected = []
    },
    deleteSelectedTransactions() {
      var payload = JSON.parse(JSON.stringify(this.selected))

      this.$store.dispatch('deleteBulkDocumentsFromPouchAndVuex', payload)
      this.selected = []
    },
    categorizeSelectedTransactions(category) {
      var payload = JSON.parse(JSON.stringify(this.selected))
      const id = category._id ? category._id.slice(-36) : null
      payload.map((trans) => (trans.category = id))

      this.budgetManagerStore.putBulkDocuments(payload)
      this.selected = []
      this.editMenuOpen = false
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending
      } else {
        this.pagination.sortBy = column
        this.pagination.descending = false
      }
    },
    onResize() {
      this.windowHeight = window.innerHeight - 195
      this.items_per_page = parseInt(this.windowHeight / 40) - 1
    },
    reconcileAccount() {
      this.isReconciling = true
      this.reconcileModal = false
    },
    showReconcileModal() {
      this.isModalVisibleForReconcile = true
    },
    startReconcile() {
      this.reconcileAmount = sanitizeValueInput(this.reconcileAmount)
      this.isReconciling = true
      this.isModalVisibleForReconcile = false
    },
    reconcileComplete() {
      this.isReconciling = false
    },
    cancel() {
      this.isModalVisibleForReconcile = false
      this.editedItem = JSON.parse(JSON.stringify(this.defaultItem)) // Reset row data
      this.editedIndex = -1
      this.creatingNewTransaction = false
      this.reconcileComplete()
      this.expanded = []
    }
  }
}
</script>

<style>
.transaction-toolbar {
  /* background-color: var(--v-header_background-base) !important; */
}

.selectedRow {
  background-color: var(--v-header_background-base) !important; /*Overrides the hover color*/
  height: 20px;
  border: 2px solid blue;
}
/* tr.selectedRow {
  height: 20px !important;
} */
.editing-cell-element {
  /* background-color: var(--v-header_background-base) !important; */
}
.editing-cell-container {
  height: 40px;
  margin: auto;
}
.actions {
  text-align: right;
}
.actions-cell {
  min-width: 55px;
  width: 75px;
}

.v-input {
  font-size: 1em;
}
.crud-actions {
  opacity: 0;
  transition: 0.2s ease-in-out;
  /* min-width: 40px; */
  width: 60px;
  /* max-width: 60px; */
}
tr:hover .crud-actions {
  opacity: 1;
}
.inflow {
  width: 20px !important;
}
.outflow {
  width: 20px !important;
}
.date-cell {
  min-width: 103px;
  width: 150px;
  max-width: 103px;
  padding-top: 15px;
}

.chip-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.un-approved {
  font-weight: 600;
}
</style>
