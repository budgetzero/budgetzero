<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-card>
      <v-card-title class="primary white--text pb-4">
        <span class="title"><slot name="title"/></span>
      </v-card-title>

      <v-divider />

      <v-card-text class="pb-0">
        <slot name="body">
          <v-text-field v-model="itemName" label="Name" required />
        </slot>
      </v-card-text>

      <v-divider />

      <v-card-actions class=" white--text">
        <v-spacer />
        <slot name="actions">
          <v-btn color="grey darken-2" text @click="close()">
            Cancel
          </v-btn>
          <v-btn color="accent" @click="create(itemName)">
            Create
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      itemName: '',
      valid: true
    }
  },
  computed: {
    ...mapState(['selectedBudgetID'])
  },
  methods: {
    close() {
      this.show = false
      this.itemName = ''
    },
    create() {
      this.$emit('create', this.itemName)
      this.close()
    }
  }
}
</script>
