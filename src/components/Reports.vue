<template>
  <v-row class="px-3 pt-2">
    Reports
    <div class="small">
      <line-chart :chart-data="datacollection" />
      <button @click="fillData()">
        Randomize
      </button>
    </div>
  </v-row>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import LineChart from "./Reports/LineChart.js";

export default {
  name: "Reports",
  components: {
    LineChart
  },
  data() {
    return {
      datacollection: null
    };
  },
    computed: {
    ...mapGetters(["monthlyData"])
  },
  watch: {},
  mounted() {
    this.fillData();
  },

  methods: {
    fillData() {
      this.datacollection = {
        labels: [this.getRandomInt(), this.getRandomInt()],
        datasets: [
          {
            label: "Data One",
            backgroundColor: "#f87979",
            data: [this.getRandomInt(), this.getRandomInt()]
          },
          {
            label: "Data One",
            backgroundColor: "#f87979",
            data: [this.getRandomInt(), this.getRandomInt()]
          }
        ]
      };
    },
    getRandomInt() {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5;
    }
  }
};
</script>
