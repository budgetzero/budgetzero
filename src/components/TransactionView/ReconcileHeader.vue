<template>
  <v-row class="grey lighten-1 ma-0" align="center">
    <v-divider vertical />

    <v-col sm="auto" class="pa-0">
      <v-card flat class="grey lighten-1">
        <v-card-title class="title font-weight-bold primary--text">
          {{ reconcileAmount | currency }}<br />
        </v-card-title>
        <v-card-subtitle>
          <span class="subtitle-2 primary--text">STATEMENT</span>
        </v-card-subtitle>
      </v-card>
    </v-col>

    <v-divider vertical />

    <v-col class="pa-0" sm="auto">
      <v-card flat class="grey lighten-1">
        <v-card-title class="title font-weight-bold primary--text">
          {{ (differenceAmount / 100) | currency }}<br />
        </v-card-title>
        <v-card-subtitle>
          <span class="subtitle-2 primary--text">DIFFERENCE</span>
        </v-card-subtitle>
      </v-card>
    </v-col>
    <v-divider vertical />
    <v-col class="pa-0" />

    <v-col cols="2" align="right" class="align-center">
      <v-btn class="d-flex justify-end" color="green" @click="completeReconciliation"> Confirm </v-btn>
      <v-btn text class="d-flex justify-end" color="accent" @click="cancelReconciliation"> Cancel </v-btn>
    </v-col>
  </v-row>
</template>

<script>
import { mapStores } from 'pinia'
import { useBudgetManagerStore } from '../../store/budgetManager'
import { useBudgetHelperStore } from '../../store/budgetManagerHelper'

export default {
  props: {
    reconcileAmount: Number
  },
  data() {
    return {}
  },
  computed: {
    ...mapStores(useBudgetManagerStore, useBudgetHelperStore),
    selected_account_balance() {
      return this.budgetManagerStore.accountBalances[this.$route.params.account_id]
    },
    differenceAmount() {
      return this.selected_account_balance.cleared - this.reconcileAmount * 100
    }
  },
  methods: {
    async completeReconciliation() {
      if (this.differenceAmount != 0) {
        const confirmReconciliation = await this.$root.$confirm(
          'Adjustment transaction',
          `There is a difference between your cleared balance and your bank balance. If you continue this will create an
          adjustment transaction of ${-parseInt(this.differenceAmount) / 100}`,
          {
            agreeBtnColor: 'primary',
            cancelBtnColor: 'grey',
            agreeBtnText: 'Confirm',
            showMessage: true,
            showTextField: false
          }
        )
        if (confirmReconciliation) {
          console.log(this.differenceAmount)
          this.budgetHelperStore.completeReconciliation(this.$route.params.account_id, this.differenceAmount / 100)
          this.$emit('reconcileComplete')
        }
      }
    },
    cancelReconciliation() {
      this.$emit('reconcileComplete')
    }
  }
}
</script>
