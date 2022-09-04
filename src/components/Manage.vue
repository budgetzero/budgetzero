<template>
  <v-row class="px-3">

    <v-col>
      <h1>Manage Budgets</h1>
      <v-divider class="pb-4" />

      <v-btn color="accent" dark class="mb-2" small @click.stop="manageBudgetsModalVisible = true">
        Switch Budgets
      </v-btn>
    </v-col>

    <v-col cols="12">
      <v-simple-table>
        <template #default>
          <thead>
            <tr>
              <th class="text-left" width="50px">
                Selected
              </th>
              <th class="text-left">
                Date Created
              </th>
              <th class="text-left">
                Name
              </th>
              <th class="text-left">
                Currency
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="budget in budgetRoots" :key="budget._id">
              <td v-if="budget._id.slice(-36) == selectedBudgetID">
                <v-icon color="accent">
                  mdi-check-bold
                </v-icon>
              </td>
              <td v-else />
              <td>{{ budget.created }}</td>
              <td>{{ budget.name }}</td>
              <td>{{ budget.currency }}</td>
              <td>
                <v-icon icon dark class="" color="primary" @click="editItem(budget)">
                  edit
                </v-icon>
                <v-icon icon dark class="ml-1" color="accent" @click="deleteItem(budget)">
                  delete
                </v-icon>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import BaseDialogModalComponent from './Modals/BaseDialogModalComponent.vue'

export default {
  name: 'Settings',
  components: {
    BaseDialogModalComponent
  },
  data() {
    return {
      selectedBudget: null,
      manageBudgetsModalVisible: false,
      dialog: false,
      item: {},
      currencies: [
        { value: 'USD', text: '$' }
        // { value: "USD2", text: "$2" }
      ]
    }
  },
  computed: {
    ...mapGetters(['budgetRoots', 'payees', 'selectedBudgetID'])
  },
  watch: {
    selectedBudgetID: function(newBudget, oldBudget) {
      this.selectedBudget = newBudget //Assign value from vuex to local var when loads/updates
    }
  },
  methods: {
    editItem(item) {
      this.item = JSON.parse(JSON.stringify(item))
      this.dialog = true
    },
    async deleteItem(item) {
      if (
        await this.$root.$confirm(
          'Delete Entire Budget?',
          'Are you sure you want to delete this Budget? It will permanently delete all transactions, categories, and budget amounts and replicate deletion to any remote sync servers.',
          { cancelBtnColor: 'grey', agreeBtnColor: 'accent', agreeBtnText: 'Delete Entire Budget'}
        )
      ) {
        this.item = JSON.parse(JSON.stringify(item))
        await this.$store.dispatch('deleteEntireBudget', item)
        this.$store.dispatch('loadLocalBudgetRoot')
        
      } else {
        // cancel
      }
    },
    createBudget(budgetName) {
      console.log('create called', budgetName)
      this.$store.dispatch('createBudget', budgetName)
    },
    loadSelectedBudget() {
      this.$store.dispatch('setSelectedBudgetID', this.selectedBudget)
      this.manageBudgetsModalVisible = false
    },
    saveBudget() {
      this.dialog = false
      this.$store.dispatch('commitDocToPouchAndVuex', this.item)
    }
  }
}
</script>

<style></style>
