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
  computed: {
    monthlyDataToArrayForChart() {
      var arr = [];
      for (const [key, value] of Object.entries(this.chartData)) {
        value.x = key;
        arr.push(value);
      }
      return arr;
    }
  },
  mounted() {
    var ctx = document.getElementById("chart").getContext("2d");
    var myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(this.chartData),
        datasets: [
          {
            label: "ATB this Month",
            data: this.monthlyDataToArrayForChart,
            backgroundColor: "#455A64",
            borderColor: "#263238",
            borderWidth: 3,
            parsing: {
              xAxisKey: "x",
              yAxisKey: "summaryData.available_to_budget_this_month"
            }
          },
          {
            label: "ATB this Month",
            data: this.monthlyDataToArrayForChart,
            backgroundColor: "#8E292F",
            borderColor: "#8E292F",
            borderWidth: 3,
            parsing: {
              xAxisKey: "x",
              yAxisKey: "summaryData.income_this_month"
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
