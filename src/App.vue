<template>
  <v-app id="inspire">
    <sidebar />

    <v-main>
      <router-view class="animated" />
    </v-main>
    <v-snackbar
      v-model="snackbar"
      color="accent"
    >
      {{ error_msg }}
  
      <template #action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import Sidebar from "./components/Sidebar.vue";

export default {
  name: "App",
  components: {
    Sidebar
  },
  data() {
    return {
      drawer: null,
      mini: false
    };
  },
  computed: {
    error_msg() {
      return this.$store.getters.error_msg;
    },
    snackbar: {
      get() {
        return this.$store.getters.snackbar;
      },
      set(value) {
        this.$store.dispatch("setSnackBarBoolean", value);
      }
    },
  },
  mounted() {
    this.$store.dispatch("AUTH_CHECK");
  }
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.swal2-title {
  font-family: SofiaPro, Roboto !important;
  font-size: 2.125rem !important;
}

.transaction-table-header {
  background-color: var(--v-header_background-base) !important;
  color: var(--v-primary-base) !important;
  font-weight: 500;
  padding-right: 5px !important;

}
</style>
