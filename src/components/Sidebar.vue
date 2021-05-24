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
    <BaseDialogModalComponent v-model="manageBudgetsModalVisible">
      <template #title> Budgets </template>
      <template #body>
        <v-select
          v-model="selectedBudget"
          :items="budgetRoots"
          label=""
          class="pa-0 pb-1"
          item-text="name"
          item-value="short_id"
        />
      </template>
      <template #actions>
        <v-btn color="grey" @click.stop="manageBudgetsModalVisible = false">
          Cancel
        </v-btn>
        <v-btn color="accent" @click="loadSelectedBudget()">
          Load Budget
        </v-btn>
      </template>
    </BaseDialogModalComponent>

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
                {{ budgetName ? budgetName : 'No budget loaded.' }}
              </v-chip>
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-icon>
            <v-icon id="settingsMenuBtn" color="grey lighten-1" v-on="on"> mdi-cog </v-icon>
          </v-list-item-icon>
        </v-list-item>
      </template>
      <v-list max-width="400" color="grey lighten-4">
        <v-list-item :to="{ path: '/manage' }">
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
        <v-list-item>
          <v-list-item-content>
            <v-btn class="accent" @click="createBudget()">
              <v-icon left color="white"> mdi-pencil </v-icon>
              <span class="white--text">Create Budget</span>
            </v-btn>
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

      <v-list-item :to="{ path: '/accounts' }">
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

      <!-- <v-list-group value="true">
        <template v-slot:activator> -->
      <v-list-item-title class="pl-2 pt-1 pb-1 font-weight-medium subtitle-2 blue-grey--text text--lighten-3">
        ON BUDGET <span class="float-right pr-4">{{ sumOfOnBudgetAccounts | currency }}</span>
      </v-list-item-title>

      <!-- </template> -->

      <v-list-item
        v-for="item in accountsOnBudget"
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
          {{ (account_balances[item._id.slice(-36)].working / 100) | currency }}
        </v-list-item-icon>
      </v-list-item>

      <v-divider />

      <!-- <v-list-group value="true">
        <template v-slot:activator> -->
      <v-list-item-title class="pl-2 pt-1 pb-1 font-weight-medium subtitle-2 blue-grey--text text--lighten-3">
        OFF BUDGET <span class="float-right pr-4">{{ sumOfOffBudgetAccounts | currency }}</span>
      </v-list-item-title>
      <!-- </template> -->

      <v-list-item
        v-for="item in accountsOffBudget"
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
          {{ (account_balances[item._id.slice(-36)].working / 100) | currency }}
        </v-list-item-icon>
      </v-list-item>

      <v-divider />

      <!-- </v-list-group> -->
    </v-list>

    <template #append>
      <v-list dense>
        <v-list-item v-if="mini && !user.loggedIn" class="pl-2">
          <v-btn icon class="accent" :to="{ path: '/login' }">
            <v-icon color="white"> mdi-login </v-icon>
          </v-btn>
        </v-list-item>
        <v-list-item v-if="!mini && !user.loggedIn">
          <v-btn block class="accent" :to="{ path: '/login' }">
            <v-icon left color="white"> mdi-login </v-icon>
            <span>Login</span>
          </v-btn>
        </v-list-item>
      </v-list>

      <v-menu v-if="user.loggedIn" offset-x max-width="150">
        <template #activator="{ on }">
          <v-list-item>
            <v-list-item-icon class="mr-3">
              <v-btn icon class="primary lighten-2" v-on="on">
                <v-icon color="grey lighten-1"> mdi-account </v-icon>
              </v-btn>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="subtitle-2 font-weight-bold">
                {{ user.email }}
              </v-list-item-title>
              <v-list-item-subtitle class="font-weight-bold">
                {{ sync_state }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </template>

        <v-list dense color="grey lighten-4">
          <v-list-item>
            <v-list-item-content>
              <v-btn class="blue-grey darken-5" :to="{ path: '/profile' }">
                <v-icon left color="white"> mdi-account </v-icon>
                <span class="white--text">Profile</span>
              </v-btn>
            </v-list-item-content>
          </v-list-item>

          <v-list-item v-if="user.loggedIn">
            <v-btn block class="accent" @click="$store.dispatch('LOGOUT')">
              <v-icon left color="white"> mdi-logout </v-icon>Logout
            </v-btn>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseDialogModalComponent from './Modals/BaseDialogModalComponent'

export default {
  name: 'Sidebar',
  components: {
    BaseDialogModalComponent
  },
  data() {
    return {
      selectedBudget: null,
      links: '',
      drawer: null,
      mini: false,
      manageBudgetsModalVisible: false
    }
  },
  computed: {
    ...mapGetters([
      'account_balances',
      'accounts',
      'sync_state',
      'accountsOnBudget',
      'accountsOffBudget',
      'selectedBudgetID',
      'budgetRoots',
      'budgetRootsMap',
      'user'
    ]),
    budgetName() {
      if (this.selectedBudget) {
        return this.budgetRootsMap[this.selectedBudget] ? this.budgetRootsMap[this.selectedBudget].name : 'None'
      } else {
        return ''
      }
    },
    sumOfOnBudgetAccounts() {
      return this.accountsOnBudget.reduce(
        (acct_sum, b) => acct_sum + this.account_balances[b._id.slice(-36)].working / 100,
        0
      )
    },
    sumOfOffBudgetAccounts() {
      return this.accountsOffBudget.reduce(
        (acct_sum, b) => acct_sum + this.account_balances[b._id.slice(-36)].working / 100,
        0
      )
    }
  },
  watch: {
    selectedBudgetID: function(newBudget, oldBudget) {
      this.selectedBudget = newBudget //Assign value from vuex to local var when loads/updates
    }
  },
  methods: {
    createBudget() {
      this.$router.push({ path: `/create` })
    },
    plaid_link() {
      const linkHandler = Plaid.create({
        env: 'sandbox',
        clientName: 'Plaid Sandbox',
        // Replace '<PUBLIC_KEY>' with your own `public_key`
        key: '1313814b396f2092dfda37b0697f4f',
        product: ['auth'],
        apiVersion: 'v2',
        onSuccess(public_token, metadata) {
          // Send the public_token to your app server here.
          // The metadata object contains info about the
          // institution the user selected and the
          // account_id, if selectAccount is enabled.
          console.log(public_token)
          this.public_token = public_token

          const dicttosend2 = {
            name: 'Account name - autoadded',
            type: 'Plaid',
            public_token
          }

          fetch('http://192.168.1.4:8000/accounts/', {
            method: 'POST',
            body: JSON.stringify(dicttosend2),
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            }
          }).then(
            response => {
              response.status //= > number 100–599
              response.statusText //= > String
              response.headers //= > Headers
              response.url //= > String
              return response.text()
            },
            error => {
              error.message //= > String
              console.log('Put failed')
            }
          )
        },
        onExit(err, metadata) {
          // The user exited the Link flow.
          if (err != null) {
            // The user encountered a Plaid API error
            // prior to exiting.
          }
          // metadata contains information about the
          // institution that the user selected and the
          // most recent API request IDs. Storing this
          // information can be helpful for support.
        }
      })

      linkHandler.open()
    }
  }
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
