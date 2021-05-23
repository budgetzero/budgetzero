<template>
  <div class="ma-2">
    <div class="chart-container">
      <canvas id="chart" />
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  name: 'LineChart',
  props: ['chartData', 'activityData'],
  data() {
    return {
      chart: null
    }
  },
  computed: {},
  watch: {
    chartData: function() {
      console.log('changed')
      this.chart.destroy()
      this.renderLineChart()
    }
  },
  mounted() {
    this.renderLineChart()
  },
  methods: {
    renderLineChart: function() {
      var ctx = document.getElementById('chart').getContext('2d')
      this.chart = new Chart(ctx, {
        data: {
          datasets: [
            {
              type: 'bar',
              label: 'Income',
              data: this.chartData,
              backgroundColor: '#455A64',
              borderColor: '#263238',
              borderWidth: 3,
              parsing: {
                xAxisKey: 'month',
                yAxisKey: 'income'
              }
            },
            {
              type: 'bar',
              label: 'Spent',
              data: this.chartData,
              backgroundColor: '#8E292F',
              borderColor: '#8E292F',
              borderWidth: 3,
              parsing: {
                xAxisKey: 'month',
                yAxisKey: 'spent'
              }
            },
            {
              type: 'line',
              label: 'Networth',
              data: this.chartData,
              backgroundColor: '#6e479e',
              borderColor: '#6e479e',
              borderWidth: 3,
              parsing: {
                xAxisKey: 'month',
                yAxisKey: 'netWorth'
              }
            }
          ]
        },
        options: {
          scales: {
            y: {
              ticks: {
                // Include a dollar sign in the ticks
                callback: function(value, index, values) {
                  return '$' + value
                }
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  var label = context.dataset.label || ''

                  if (label) {
                    label += ': '
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(context.parsed.y)
                  }
                  return label
                }
              }
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  margin: auto;
  height: 90vh;
  width: 80vw -250px;
}
</style>
