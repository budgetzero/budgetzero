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
                clearable
                class="pt-1"
                label="Date Range"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-date-picker v-model="dateRange" range type="month" @input="dateMenu = false" />
          </v-menu>
        </v-col>
      </v-row>

      <div class="px-5">
        <line-chart :chart-data.sync="filteredChartData" :activity-data.sync="accountActivityByMonth" />
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'
import LineChart from './Reports/LineChart.vue'
import _ from 'lodash'

export default {
  name: 'Reports',
  components: {
    LineChart
  },
  data() {
    return {
      menu: false,
      dateRange: []
    }
  },
  computed: {
    ...mapGetters(['incomeAndSpentByMonth', 'transactionsOnBudget']),
    dateRangeText() {
      return this.dateRange.join(' - ')
    },
    /**
     * Returns array of months -> accounts: sum-of-activity
     */
    accountActivityByMonth() {
      var grouped = _.groupBy(this.transactionsOnBudget, function(item) {
        return item.date.substring(0, 7)
      })

      var final = []

      //Iterate over each month
      Object.keys(grouped).forEach(month => {
        var monthgroup = _.groupBy(grouped[month], 'account')

        var item = {}

        //Iterate over each account
        Object.keys(monthgroup).forEach(acct => {
          //Iterate over each account within each month
          const val = monthgroup[acct].reduce((val, trans) => {
            //Sum the transactions
            return val + trans.value
          }, 0)

          item.activity = val
          item.account = acct
          item.month = month

          final.push(item)
        })
      })
      return final
    },
    filteredChartData() {
      if (!this.dateRange || this.dateRange.length < 2) {
        return this.incomeAndSpentByMonth
      }

      var startDate = new Date(this.dateRange[0])
      var endDate = new Date(this.dateRange[1])

      var filteredData = this.incomeAndSpentByMonth.filter(function(month) {
        var d = new Date(month.month)
        return d >= startDate && d <= endDate
      })
      return filteredData
    }
  },
  watch: {},
  mounted() {},

  methods: {}
}
</script>
