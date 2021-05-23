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
import Vue from 'vue'
import { mapGetters } from 'vuex'
import BaseDialogModalComponent from '../Modals/BaseDialogModalComponent.vue'

export default {
  components: {
    BaseDialogModalComponent
  },
  props: {
    reconcileAmount: String
  },
  data() {
    return {
      isModalVisibleForReconcileConfirmation: false
    }
  },
  computed: {
    ...mapGetters(['selectedBudgetID']),
    selected_account_balance() {
      return this.$store.getters.account_balances[this.$route.params.account_id]
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

      payload.adjustmentTransaction = {
        account: this.$route.params.account_id,
        category: 'income',
        cleared: true,
        approved: true,
        value: -parseInt(this.differenceAmount * 100),
        date: new Date().toISOString().substr(0, 10),
        memo: '',
        reconciled: true,
        flag: '#ffffff',
        payee: 'Reconcile adjustment',
        transfer: null,
        splits: [],
        _id: `b_${this.selectedBudgetID}_transaction_${Vue.prototype.$vm.$uuid.v4()}`,
        _rev: ''
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
