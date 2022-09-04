<template>
  <BaseDialogModalComponent v-model="dialog" :style="{ zIndex: options.zIndex }" @keydown.esc="cancel">
    <template #title>
      {{ title }}
    </template>
    <template #body>
      <div v-if="options.showMessage" class="mb-4 subtitle-1 font-weight-medium">{{ message }}</div>
      <v-text-field v-model="textInput" v-if="options.showTextField" :label=options.textFieldLabel></v-text-field>
    </template>
    <template #actions>
      <v-btn id="cancelBtn" v-if="!options.onlyShowAgreeBtn" :color="options.cancelBtnColor" @click.native="cancel">
        Cancel
      </v-btn>
      <v-btn id="agreeBtn" :color="options.agreeBtnColor" @click.native="agree">
        {{ options.agreeBtnText }}
      </v-btn>
    </template>
  </BaseDialogModalComponent>
</template>

<script>
import BaseDialogModalComponent from './BaseDialogModalComponent'

/**
  Yoinked/adapted from https://gist.github.com/eolant/ba0f8a5c9135d1a146e1db575276177d
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
    textInput: null,
    options: {
      onlyShowAgreeBtn: false,
      agreeBtnText: 'Agree',
      agreeBtnColor: 'primary',
      cancelBtnColor: 'red',
      color: 'primary',
      width: 290,
      zIndex: 200,
      showMessage: true,
      showTextField: false,
      textFieldLabel: '',
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
      const returnMessageInResolve = this.textInput ? this.textInput : true
      this.resolve(returnMessageInResolve)
      this.dialog = false
    },
    cancel() {
      this.resolve(false)
      this.dialog = false
    }
  }
}
</script>
