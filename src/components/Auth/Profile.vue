<template>
  <v-row class="pl-3">
    <v-col>
      <h1>Profile</h1>
      <v-divider class="pb-4" />

      <h3 class="mx-2 pt-2">
        Username
      </h3>
      <v-sheet class="ma-2 mr-4 pa-2" color="grey lighten-2" elevation="2" outlined rounded shaped justify="center">
        <span>{{ user.email }}</span>
      </v-sheet>

      <h3 class="ma-2 pt-2">
        Cloud Sync Database
      </h3>
      <v-sheet
        v-if="pouchdb_url"
        class="ma-2 mr-4 pa-2"
        color="grey lighten-2"
        elevation="2"
        outlined
        rounded
        shaped
        justify="center"
      >
        <span>{{ user.userData.pouchdb_url }}</span>
      </v-sheet>

      <v-sheet
        v-if="!pouchdb_url"
        class="ma-2 mr-4 pa-2"
        color="grey lighten-2"
        elevation="2"
        outlined
        rounded
        shaped
        justify="center"
      >
        <span>Database is not provisioned. Please contact support.</span>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  name: 'Profile',
  components: {},
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['user']),
    pouchdb_url() {
      return _.get(this.user, 'userData.pouchdb_url', null)
    }
  },
  methods: {}
}
</script>

<style></style>
