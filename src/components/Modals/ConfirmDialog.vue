<template>
  <BaseDialogModalComponent v-model="dialog" :style="{ zIndex: options.zIndex }" @keydown.esc="cancel">
    <template #title>
      {{ title }}
    </template>
    <template #body>
      {{ message }}
    </template>
    <template #actions>
      <v-btn color="grey" @click.native="cancel">
        Cancel
      </v-btn>
      <v-btn color="accent" @click.native="agree">
        Load Budget
      </v-btn>
    </template>
  </BaseDialogModalComponent>
</template>

<script>
import BaseDialogModalComponent from './BaseDialogModalComponent'

/**
  Yoinked from https://gist.github.com/eolant/ba0f8a5c9135d1a146e1db575276177d
 */
export default {
  components: {
    BaseDialogModalComponent
  },
  data: () => ({
    dialog: false,
    resolve: null,
    reject: null,
    message: null,
    title: null,
    options: {
      color: 'primary',
      width: 290,
      zIndex: 200
    }
  }),
  methods: {
    open(title, message, options) {
      this.dialog = true
      this.title = title
      this.message = message
      this.options = Object.assign(this.options, options)
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    agree() {
      this.resolve(true)
      this.dialog = false
    },
    cancel() {
      this.resolve(false)
      this.dialog = false
    }
  }
}
</script>
