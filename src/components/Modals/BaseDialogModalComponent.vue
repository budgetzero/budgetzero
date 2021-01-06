<template>
  <v-dialog
    v-model="show"
    max-width="500px"
  >
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
    >
      <v-card>
        <v-card-title class="primary lighten-1 white--text pb-4">
          <span class="title"><slot name="title" /></span>
        </v-card-title>

        <v-divider />

        <v-card-text class="pb-0">
          <slot name="body">
            <v-text-field
              v-model="itemName"
              label="Name"
              required
            />
          </slot>
        </v-card-text>
      
        <v-divider />

        <v-card-actions class=" white--text">
          <v-spacer />
          <slot name="actions">
            <v-btn
              color="grey darken-2"
              text
              @click="close()"
            >
              Cancel
            </v-btn>
            <v-btn
              color="accent"
              @click="create(itemName)"
            >
              Create
            </v-btn>
          </slot>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: {
    value: Boolean,
  },
  data() {
    return {
      itemName: "",
      valid: false,
    };
  },
  computed: {
    ...mapState(["selectedBudgetID"]),
    show: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      }
    }
  },
  methods: {
    close() {
      this.show = false;
      this.itemName = "";
    },
    create() {
      this.$emit('create', this.itemName)
      this.close()
    }
  }
};
</script>
