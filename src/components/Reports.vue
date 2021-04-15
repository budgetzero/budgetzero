<template>
  <v-row class="px-3 pt-2">
    Reports
    <div class="small">
      <line-chart />
    </div>
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
  mounted() {
  },

  methods: {
  
  }
};
</script>
