<template>
  <div class="ma-2">
    <div class="chart-container">
      <canvas id="chart" />
    </div>
  </div>
</template>

<script>
import Chart from "chart.js/auto";

export default {
  name: "LineChart",
  props: ["chartData"],
  data() {
    return {};
  },
  computed: {},
  mounted() {
    var ctx = document.getElementById("chart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        datasets: [
          {
            label: "Spent",
            data: this.chartData,
            backgroundColor: "#8E292F",
            borderColor: "#8E292F",
            borderWidth: 3,
            parsing: {
              xAxisKey: "month",
              yAxisKey: "spent"
            }
          },
          {
            label: "Income",
            data: this.chartData,
            backgroundColor: "#455A64",
            borderColor: "#263238",
            borderWidth: 3,
            parsing: {
              xAxisKey: "month",
              yAxisKey: "income"
            }
          }
        ]
      },
      options: {}
    });
  }
};
</script>

<style scoped>
.chart-container {
  position: relative;
  margin: auto;
  height: 90vh;
  width: 80vw -250px;
}
</style>
