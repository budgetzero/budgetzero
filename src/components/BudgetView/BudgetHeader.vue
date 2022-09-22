<template>
  <div>
    <v-row cols="12" class="pr-4">
      <v-card style="width: 300px" outlined>
        <v-card-title id="selected-month" class="headline grey lighten-4 py-2">
          {{ month_selected | moment('MMMM YYYY') }}
        </v-card-title>
        <v-card-subtitle v-if="!doesMonthDataExist" id="data-doesnt-exist-msg" class="grey lighten-4 pt-2 pb-1">
          <span>Data does not exist for this month</span>
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="pa-0">
          <div class="px-2 pt-2">
            <p style="text-align:left;" class="subtitle-2 mb-0">
              Leftover Last Month
              <span id="leftover-amount" style="float:right;">
                {{
                  monthlyData[month_selected]
                    ? monthlyData[month_selected].summaryData.available_to_budget_last_month / 100
                    : 0 | currency(currencySymbol)
                }}
              </span>
            </p>
            <p style="text-align:left;" class="subtitle-2 mb-0">
              Income This Month
              <span id="income-amount" style="float:right;">
                {{
                  monthlyData[month_selected]
                    ? monthlyData[month_selected].summaryData.income_this_month / 100
                    : 0 | currency(currencySymbol)
                }}
              </span>
            </p>
            <p style="text-align:left;" class="subtitle-2 mb-0">
              Overspent Last Month
              <span id="overspent-amount" style="float:right;">
                {{
                  monthlyData[month_selected]
                    ? monthlyData[month_selected].summaryData.last_month_overspent / 100
                    : 0 | currency(currencySymbol)
                }}
              </span>
            </p>
            <p style="text-align:left;" class="subtitle-2 mb-2">
              Budgeted This Month
              <span id="budgeted-amount" style="float:right;">
                {{
                  monthlyData[month_selected]
                    ? monthlyData[month_selected].summaryData.budgeted_this_month / 100
                    : 0 | currency(currencySymbol)
                }}
              </span>
            </p>
          </div>
          <v-divider />
          <div id="available-to-budget-text" class="text-center primary--text title grey lighten-4">
            Available To Budget
            <v-divider />
          </div>

          <div id="available-to-budget-amount" class="title text-center mb-0">
            {{
              monthlyData[month_selected]
                ? monthlyData[month_selected].summaryData.available_to_budget_this_month / 100
                : 0 | currency(currencySymbol)
            }}
          </div>
        </v-card-text>
      </v-card>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {},
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['monthlyData', 'month_selected', 'currencySymbol']),
    doesMonthDataExist() {
      return this.monthlyData.hasOwnProperty(`${this.month_selected}`)
    }
  },
  methods: {}
}
</script>
