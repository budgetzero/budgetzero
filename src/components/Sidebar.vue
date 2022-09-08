<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    class="primary"
    dark
    width="250"
    :mini-variant.sync="mini"
    permanent
    stateless
    hide-overlay
  >
    <v-list-item class="pl-0">
      <v-list-item-content v-if="!mini" class="py-1">
        <v-list-item-title class="title pl-4">
          <v-img max-height="120" max-width="250" src="../../public/logo3.png" />
        </v-list-item-title>
      </v-list-item-content>
      <v-list-item-icon v-if="mini" class="my-1 pb-2 ml-2">
        <v-btn class="mt-1" icon @click.stop="mini = !mini">
          <v-icon> mdi-chevron-right </v-icon>
        </v-btn>
      </v-list-item-icon>
      <v-list-item-icon v-if="!mini" class="my-1 pb-2">
        <v-btn class="mt-1" icon @click.stop="mini = !mini">
          <v-icon> mdi-chevron-left </v-icon>
        </v-btn>
      </v-list-item-icon>
    </v-list-item>
    <v-divider />

    <v-menu offset-x>
      <template #activator="{ on }">
        <v-list-item dense>
          <v-list-item-content v-if="!mini">
            <v-list-item-title>
              <v-chip small label>
                {{ budgetDoc ? budgetDoc.name : 'No budget loaded.' }}
              </v-chip>
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-icon>
            <v-icon id="settingsMenuBtn" color="grey lighten-1" v-on="on"> mdi-cog </v-icon>
          </v-list-item-icon>
        </v-list-item>
      </template>
      <v-list max-width="400" color="grey lighten-4">
        <v-list-item @click="useAppStore.manageBudgetOverlay = true">
          <v-list-item-avatar>
            <v-icon left color="primary"> mdi-swap-horizontal </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>Manage Budgets</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item id="settingsBtn" :to="{ path: '/settings' }">
          <v-list-item-avatar>
            <v-icon left medium color="primary"> mdi-cog-outline </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-divider />

    <v-list dark dense class="text-left pt-0 sidebar">
      <v-list-item :to="{ path: '/budget' }">
        <v-list-item-icon>
          <v-icon> mdi-cash-multiple </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title class="subtitle-1"> Budget </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item :to="{ path: '/accounts' }" id="accountsSidebarBtn">
        <v-list-item-icon>
          <v-icon>mdi-bank</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title class="subtitle-1"> Accounts </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item :to="{ path: '/reports' }">
        <v-list-item-icon>
          <v-icon>mdi-chart-line</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title class="subtitle-1"> Reports </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <!-- <v-list-item :to="{ path: '/all_transactions' }">
        <v-list-item-action>
          <v-icon>mdi-bank</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title class="subtitle-1">
            All Transactions
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item> -->

      <v-divider>Off Budget (Tracking)</v-divider>

      <v-list-item-title class="pl-2 pt-1 pb-1 font-weight-medium subtitle-2 blue-grey--text text--lighten-3">
        ON BUDGET <span class="float-right pr-4">{{ sumOfOnBudgetAccounts | currency }}</span>
      </v-list-item-title>

      <v-list-item
        v-for="item in onBudgetAccounts"
        :key="item._id"
        :to="{ path: '/transactions/' + item._id.slice(-36) }"
        active-class="primary white--text"
        class="primary darken-1"
        v-bind:id="item.name"
      >
        <v-list-item-content>
          <v-list-item-title class="font-weight-regular subtitle-2">
            {{ item.name }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon class="subtitle-2">
          {{ (budgetManagerStore.accountBalances[item._id.slice(-36)].working / 100) | currency }}
        </v-list-item-icon>
      </v-list-item>

      <v-divider />

      <v-list-item-title class="pl-2 pt-1 pb-1 font-weight-medium subtitle-2 blue-grey--text text--lighten-3">
        OFF BUDGET <span class="float-right pr-4">{{ sumOfOffBudgetAccounts | currency }}</span>
      </v-list-item-title>

      <v-list-item
        v-for="item in offBudgetAccounts"
        :key="item._id"
        :to="{ path: '/transactions/' + item._id.slice(-36) }"
        active-class="primary white--text"
        class="primary darken-1"
      >
        <v-list-item-content>
          <v-list-item-title class="font-weight-regular subtitle-2">
            {{ item.name }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon class="subtitle-2">
          {{ (budgetManagerStore.accountBalances[item._id.slice(-36)].working / 100) | currency }}
        </v-list-item-icon>
      </v-list-item>

      <v-divider />
    </v-list>

    <template #append>
      <v-list dense>
        <!-- Help Menu -->
        <v-menu offset-x max-width="250">
          <template #activator="{ on }">
            <v-list-item v-if="mini" class="pl-2">
              <v-btn icon class="accent" v-on="on">
                <v-icon color="white"> mdi-help-circle-outline </v-icon>
              </v-btn>
            </v-list-item>
            <v-list-item v-if="!mini">
              <v-btn block text outlined v-on="on">
                <v-icon left color="white"> mdi-help-circle-outline </v-icon>
                <span>Help</span>
              </v-btn>
            </v-list-item>
          </template>

          <v-list dense color="grey lighten-4">
            <v-list-item>
              <v-btn text href="https://docs.budgetzero.io/" target="_blank">
                <v-icon left color="primary"> mdi-account </v-icon>
                <span class="primary--text">Documentation</span>
              </v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { useBudgetManagerStore } from '../store/budgetManager'
import { useAppStore } from '../store/appStore'
import { mapStores } from 'pinia'

export default {
  name: 'Sidebar',
  components: {},
  data() {
    return {
      links: '',
      drawer: null,
      mini: false
    }
  },
  computed: {
    ...mapStores(useBudgetManagerStore, useAppStore),
    budgetDoc() {
      if (this.budgetManagerStore.budgetID && this.budgetManagerStore.budgetsAvailable) {
        const budgetDoc = this.budgetManagerStore.budgetsAvailable.find(
          (budget) => `budget_${this.budgetManagerStore.budgetID}` == budget._id
        )
        return budgetDoc
      } else {
        return null
      }
    },
    onBudgetAccounts() {
      return this.budgetManagerStore.accounts.filter((account) => account.onBudget == true)
    },
    offBudgetAccounts() {
      return this.budgetManagerStore.accounts.filter((account) => account.onBudget == false)
    },
    sumOfOnBudgetAccounts() {
      return this.onBudgetAccounts.reduce((acct_sum, b) => {
        const workingBalance = this.budgetManagerStore.accountBalances[b._id.slice(-36)].working
          ? this.budgetManagerStore.accountBalances[b._id.slice(-36)].working
          : 0
        return acct_sum + workingBalance / 100
      }, 0)
    },
    sumOfOffBudgetAccounts() {
      return this.offBudgetAccounts.reduce((acct_sum, b) => {
        const workingBalance = this.budgetManagerStore.accountBalances[b._id.slice(-36)].working
          ? this.budgetManagerStore.accountBalances[b._id.slice(-36)].working
          : 0
        return acct_sum + (workingBalance / 100)
      }, 0)
    }
  },
  methods: {}
}
</script>

<style scoped>
a {
  color: white;
}
.list--dense.fix .list__tile__title {
  height: 15px;
}
</style>
