<template>
  <v-row class="grey lighten-1 ma-0" align="center">
    <!-- Modal to input reconcile amount  -->
    <BaseDialogModalComponent v-model="isModalVisibleForReconcileConfirmation">
      <template #title>
        Enter adjustment transaction?
      </template>
      <template #body>
        <span class="subtitle-1"
          >There is a difference between your cleared balance and your bank balance. If you continue this will create an
          adjustment transaction of <v-chip>{{ -parseInt(differenceAmount) | currency }}</v-chip></span
        >
      </template>
      <template #actions>
        <v-spacer />
        <v-btn color="grey" text @click.stop="isModalVisibleForReconcileConfirmation = false">
          Go Back
        </v-btn>
        <v-btn id="btn-completeReconcile" color="accent" @click="addReconciliationTransaction()">
          Confirm
        </v-btn>
      </template>
    </BaseDialogModalComponent>
    <v-col sm="auto" class="pa-0">
      <v-card flat class="grey lighten-1">
        <v-card-title class="title font-weight-bold primary--text">
          {{ (selected_account_balance.cleared / 100) | currency }}<br />
        </v-card-title>
        <v-card-subtitle>
          <span class="subtitle-2 primary--text">CLEARED</span>
        </v-card-subtitle>
      </v-card>
    </v-col>

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
          {{ differenceAmount | currency }}<br />
        </v-card-title>
        <v-card-subtitle>
          <span class="subtitle-2 primary--text">DIFFERENCE</span>
        </v-card-subtitle>
      </v-card>
    </v-col>
    <v-divider vertical />
    <v-col class="pa-0" />

    <v-col cols="2" align="right" class="align-center">
      <v-btn class="d-flex justify-end" color="green" @click="completeReconciliation">
        Confirm
      </v-btn>
      <v-btn text class="d-flex justify-end" color="accent" @click="cancelReconciliation">
        Cancel
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
import { mapStores } from 'pinia'
import { useBudgetManagerStore } from '../../store/budgetManager'

export default {
  props: {
    reconcileAmount: Number
  },
  data() {
    return {}
  },
  computed: {
    ...mapStores(useBudgetManagerStore),
    selected_account_balance() {
      return this.budgetManagerStore.accountBalances[this.$route.params.account_id]
    },
    differenceAmount() {
      return this.selected_account_balance.cleared / 100 - this.reconcileAmount
    }
  },
  methods: {
    completeReconciliation() {
      if (this.differenceAmount != 0) {
        this.isModalVisibleForReconcileConfirmation = true
      } else {
        const payload = {
          adjustmentTransaction: null,
          account: this.$route.params.account_id
        }
        this.$store.dispatch('completeReconciliation', payload)
        this.$emit('reconcileComplete')
      }
    },
    addReconciliationTransaction() {
      const payload = {
        adjustmentTransaction: null,
        account: this.$route.params.account_id
      }



      this.$store.dispatch('completeReconciliation', payload)
      this.$emit('reconcileComplete')
    },
    cancelReconciliation() {
      this.$emit('reconcileComplete')
    }
  }
}
</script>
