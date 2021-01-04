<template>
  <v-row class="px-3">
    <BaseDialogModalComponent v-model="manageBudgetsModalVisible">
      <template #title>
        Budgets
      </template>
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
        <v-btn
          color="grey"
          @click.stop="manageBudgetsModalVisible = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="accent"
          @click="loadSelectedBudget()"
        >
          Load Budget
        </v-btn>
      </template>
    </BaseDialogModalComponent>

    <v-col>
      <h1>Manage Budgets</h1>
      <v-divider class="pb-4" />

      <v-btn
        color="accent"
        dark
        class="mb-2"
        small
        @click.stop="manageBudgetsModalVisible = true"
      >
        Switch Budgets
      </v-btn>
    </v-col>

    <v-col cols="12">
      <v-simple-table>
        <template #default>
          <thead>
            <tr>
              <th
                class="text-left"
                width="50px"
              >
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
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="budget in budgetRoots"
              :key="budget._id"
            >
              <td v-if="budget._id.slice(-36) == selectedBudgetID">
                <v-icon color="accent">
                  mdi-check-bold
                </v-icon>
              </td>
              <td v-else />
              <td>{{ budget.created }}</td>
              <td>{{ budget.name }}</td>
              <td>{{ budget.currency }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
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
      selectedBudget: null,
      manageBudgetsModalVisible: false
    };
  },
  computed: {
    ...mapGetters(["budgetRoots", "payees", "selectedBudgetID"])
  },
  watch: {
    selectedBudgetID: function(newBudget, oldBudget) {
      this.selectedBudget = newBudget; //Assign value from vuex to local var when loads/updates
    }
  },
  methods: {
    createBudget(budgetName) {
      console.log("create called", budgetName);
      this.$store.dispatch("createBudget", budgetName);
    },
    loadSelectedBudget() {
      this.$store.dispatch("setSelectedBudgetID", this.selectedBudget);
      this.manageBudgetsModalVisible = false;
    }
  }
};
</script>

<style></style>
