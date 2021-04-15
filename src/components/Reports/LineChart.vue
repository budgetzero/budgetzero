<template>
  <div class="ma-2">
    <div class="chart-container">
      <canvas id="chart" />
    </div>
  </div>
</template>

<script>
import Chart from "chart.js/auto";
import { mapGetters } from "vuex";

export default {
  name: "LineChart",
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["monthlyData"]),
    monthlyDataToArrayForChart() {
      var arr = []
      for (const [key, value] of Object.entries(this.monthlyData)) {
        value.x = key
        arr.push(value)
      }
      return arr
    }
  },
  mounted() {
    var ctx = document.getElementById("chart").getContext("2d");
    var myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(this.monthlyData),
        datasets: [
          {
            label: "ATB this Month",
            data: this.monthlyDataToArrayForChart,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
            ],
            borderWidth: 1,
            parsing: {
                xAxisKey: "x",
                yAxisKey: "summary_data.available_to_budget_this_month"
              }
          }
          ,
           {
            label: "ATB this Month",
            data: this.monthlyDataToArrayForChart,
            backgroundColor: [
              "rgba(54, 162, 235, 0.2)",
            ],
            borderColor: [
              "rgba(54, 162, 235, 1)",
            ],
            borderWidth: 1,
            parsing: {
                xAxisKey: "x",
                yAxisKey: "summary_data.income_this_month"
              }
          }
        ]
      },
      options: {
         
         
      }
    });
  }
};
</script>

<style scoped>

.chart-container {
  position: relative;
  margin: auto;
  height: 90vh;
  width: 80vw;
}
</style>
