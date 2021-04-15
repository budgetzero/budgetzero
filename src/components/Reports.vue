<template>
  <v-row class="px-3 pt-2">
    <v-col>
      <span class="text-h3 pt-4">Reports</span>
      <div class="pa-5">
        <line-chart :chart-data.sync="monthlyData" />
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
    };
  },
  computed: {
    ...mapGetters(["monthlyData"])
  },
  watch: {},
  mounted() {},

  methods: {}
};
</script>
