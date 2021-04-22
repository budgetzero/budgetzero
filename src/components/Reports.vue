<template>
  <v-row class="px-3 pt-2">
    <v-col>
      <span class="text-h3 pt-4">Reports</span>
      <v-divider class="pb-4" />

      <v-row>
        <v-col cols="3">
          <v-menu
            v-model="menu"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                v-model="dateRange"
                class="pt-1"
                label="Date Range"
                :rules="[v => v.length == 2 || 'Must select date range']"

                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-date-picker
              v-model="dateRange"

              range
              type="month"
              @input="dateMenu = false"
            />
          </v-menu>
        </v-col>
      </v-row>

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
      menu: false,
      dateRange: []
    };
  },
  computed: {
    ...mapGetters(["incomeAndSpentByMonth"]),
    dateRangeText() {
      return this.dateRange.join(" - ");
    }
  },
  watch: {},
  mounted() {},

  methods: {}
};
</script>
