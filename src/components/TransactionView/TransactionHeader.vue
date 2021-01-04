<template>
  <v-row class="ma-0 header_background">
    <v-col
      sm="auto"
      class="pa-0 "
    >
      <v-card
        flat
        class="header_background"
      >
        <v-card-title class="headline font-weight-bold primary--text">
          {{ selected_account.name }}
        </v-card-title>
        <v-card-subtitle>
          <span class="subtitle-2 grey--text text--darken-2">{{ selected_account.type }} ACCOUNT</span>
        </v-card-subtitle>
      </v-card>
    </v-col>

    <v-col
      sm="auto"
      class="pa-0"
    >
      <v-card
        flat
        class="header_background"
      >
        <v-card-title class="title font-weight-bold primary--text">
          {{ (selected_account_balance.cleared / 100) | currency }}<br></span>
        </v-card-title>
        <v-card-subtitle>
          <span class="subtitle-2 grey--text text--darken-2">CLEARED</span>
        </v-card-subtitle>
      </v-card>
    </v-col>

    <v-col
      sm="auto"
      style="display: inline-flex; align-items: center;"
      class="pa-0 header_background"
    >
      <span class="headline pa-0 grey--text">+</span>
    </v-col>

    <v-col
      sm="auto"
      class="pa-0"
    >
      <v-card
        flat
        class="header_background"
      >
        <v-card-title class="title font-weight-bold primary--text">
          {{ (selected_account_balance.uncleared / 100) | currency }}<br></span>
        </v-card-title>
        <v-card-subtitle>
          <span class="subtitle-2">UNCLEARED</span>
        </v-card-subtitle>
      </v-card>
    </v-col>


    <v-col
      sm="auto"
      style="display: inline-flex; align-items: center;"
      class="pa-0 header_background"
    >
      <span class="headline pa-0 grey--text">=</span>
    </v-col>

    <v-col
      sm="auto"
      class="pa-0"
    >
      <v-card
        flat
        class="header_background"
      >
        <v-card-title class="headline-5 font-weight-bold primary--text">
          {{
            (selected_account_balance.cleared / 100 + selected_account_balance.uncleared / 100)
              | currency
          }}<br></span>
        </v-card-title>
        <v-card-subtitle>
          <span class="subtitle-2 grey--text text--darken-2">WORKING BALANCE</span>
        </v-card-subtitle>
      </v-card>
    </v-col>
    <v-col
      cols="1"
      class="ml-auto"
    >
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-btn
            id="btn-reconcile"
            large
            class="white--text mb-2 ml-2"
            color="primary"
            icon
            tile
            @click="$emit('showReconcileModal')"
          >
            <v-icon
              large
              color="primary lighten-1"
              v-on="on"
            >
              mdi-lock
            </v-icon>
          </v-btn>
        </template>
        <span>Reconcile</span>
      </v-tooltip>
    </v-col>
  </v-row>
</template>

<script>
import Vue from "vue";

export default {
  props: ['selected_account'],
  data() {
    return {};
  },
  computed: {
    selected_account_balance() { 
      return this.$store.getters.account_balances[this.$store.state.route.params.account_id];
    },
  },
  methods: {
  }
};
</script>
