<template>
  <v-row class="px-3 pt-2">
    <v-col>
      <span class="text-h3 pt-4">Reports</span>
      <v-divider class="pb-4" />

      <v-row>
        <v-col>
          <v-menu
          v-model="menu2"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="date"
              :label=dateRangeText
              prepend-icon="mdi-calendar"
              readonly
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
                    <v-date-picker v-model="dateRange" range @input="dateMenu = false" type="month" /> 

        </v-menu>

          </v-col
      ></v-row>

      <div class="pa-5">
        <line-chart :chart-data.sync="incomeAndSpentByMonth" />
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import LineChart from "./Reports/LineChart.vue";

export default {
  name: "Reports",
  components: {
    LineChart
  },
  data() {
    return {
      dateRange: []
    };
  },
  computed: {
    ...mapGetters(["incomeAndSpentByMonth"]),
    dateRangeText() {
      return this.dateRange.join(' - ')
    }
  },
  watch: {},
  mounted() {},

  methods: {}
};
</script>
