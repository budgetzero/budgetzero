<template>
  <v-col xs4 align="center">
    <v-card max-width="400">
      <v-card-title class="primary white--text pb-4">
        <span class="title">Create Budget</span>
      </v-card-title>

      <v-divider />

      <v-card-text class="pb-0">
        <slot name="body">
          <v-text-field v-model="budgetName" data-cy="budget-name" label="Name" required />
        </slot>
      </v-card-text>

      <v-divider />

      <v-card-actions class=" white--text">
        <v-spacer />
        <slot name="actions">
          <v-btn color="accent" data-cy="create-budget" @click="createBudget()">
            Create
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script>
export default {
  data() {
    return {
      budgetName: null
    }
  },
  methods: {
    createBudget() {
      this.$swal({
        title: 'Budget Created',
        text: `A budget named ${this.budgetName} has been created.`,
        icon: 'success',
        confirmButtonText: 'Ok'
      })

      this.$store.dispatch('createBudget', this.budgetName)
      this.$router.push({ path: `/budget` })
    }
  }
}
</script>
