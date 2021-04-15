<template>
  <div>
    <canvas
      id="myChart"
      width="400"
      height="400"
    />
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
    var ctx = document.getElementById("myChart").getContext("2d");
    var myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(this.monthlyData),
        datasets: [
          {
            label: "# of Votes",
            data: this.monthlyDataToArrayForChart,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)"
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)"
            ],
            borderWidth: 1,
          
          }
        ]
      },
      options: {
         parsing: {
              xAxisKey: "x",
              yAxisKey: "summmary_data.available_to_budget_last_month"
            }
         
      }
    });
  }
};
</script>
