<template>
  <v-container fluid class="pa-0">
    <!-- Modal to create category group  -->
    <BaseDialogModalComponent v-model="isModalVisibleMasterCat">
      <template #title>
        Create a Category Group:
      </template>
      <template #body>
        <v-text-field
          id="txt_field_category_name"
          v-model="category_name"
          label="New category group"
          required
          tabindex="0"
          @keyup.enter="createMasterCategory(category_name)"
        />
      </template>
      <template #actions>
        <v-spacer />
        <v-btn color="grey" text @click.stop="isModalVisibleMasterCat = false">
          Cancel
        </v-btn>
        <v-btn id="btn-createMasterCategory" color="accent" text @click="createMasterCategory(category_name)">
          Create
        </v-btn>
      </template>
    </BaseDialogModalComponent>

    <!-- Modal to edit category group  -->
    <BaseDialogModalComponent v-model="isModalVisibleEditCategory">
      <template #title>
        Edit Category Name:
      </template>
      <template #body>
        <v-text-field
          id="txt-categoryName"
          v-model="editedCategory.name"
          label="Category name"
          required
          tabindex="0"
          @keyup.enter="saveCategory()"
        />
      </template>
      <template #actions>
        <v-spacer />
        <v-btn color="grey" text @click.stop="isModalVisibleEditCategory = false">
          Cancel
        </v-btn>
        <v-btn id="btn-save" color="accent" text @click="saveCategory()">
          Save
        </v-btn>
      </template>
    </BaseDialogModalComponent>

    <!-- Modal to add sub category  -->
    <BaseDialogModalComponent v-model="isModalVisibleCreateSubCategory">
      <template #title> Create Category for {{ editedCategory.name }}: </template>
      <template #body>
        <v-text-field
          v-model="category_name"
          label="Category"
          required
          tabindex="0"
          @keyup.enter="createCategory(category_name)"
        />
      </template>
      <template #actions>
        <v-spacer />
        <v-btn color="grey" text @click.stop="isModalVisibleCreateSubCategory = false">
          Cancel
        </v-btn>
        <v-btn color="accent" text @click="createCategory(category_name)">
          Create
        </v-btn>
      </template>
    </BaseDialogModalComponent>

    <v-row elevation="4" class="grey lighten-4 ma-0">
      <v-col align="center" justify="center">
        <v-btn small elevation="0" class="grey lighten-2" @click="PREVIOUS_MONTH()">
          <v-icon medium> mdi-chevron-left </v-icon>Previous month
        </v-btn>
        <v-btn id="btn-today" medium elevation="0" class="grey lighten-2 ml-4" @click="GO_TO_CURRENT_MONTH()">
          Today
        </v-btn>
        <v-btn small elevation="0" class="grey lighten-2 ml-4" @click="ADD_MONTH()">
          Next month
          <v-icon medium>
            mdi-chevron-right
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-divider />

    <v-row justify="space-between" class="ma-0 pt-2">
      <v-col sm="auto" />
      <v-col sm="auto">
        <BudgetHeader />
      </v-col>
    </v-row>

    <v-row class="mx-2 mt-0 mb-1" justify="end" align="end">
      <v-col class="pa-0">
        <v-btn
          id="btn-add-category-group"
          small
          color="grey lighten-2"
          elevation="0"
          class="mb-2 mr-2"
          @click.stop="isModalVisibleMasterCat = true"
        >
          <v-icon left> mdi-plus </v-icon>Category Group
        </v-btn>

        <v-btn
          id="btn-modify"
          small
          color="grey lighten-2"
          elevation="0"
          class="mb-2"
          @click.stop="isReorderingCategories = !isReorderingCategories"
        >
          <v-icon left>
            mdi-drag-horizontal-variant
          </v-icon>
          <span v-if="!isReorderingCategories"> Modify </span>
          <span v-else> Done </span>
        </v-btn>
      </v-col>
      <v-col id="budgeted-header" class="money-amount subtitle font-weight-medium">
        Budgeted
      </v-col>
      <v-col id="spent-header" class="money-amount subtitle font-weight-medium">
        Spent
      </v-col>
      <v-col id="balance-header" class="money-amount subtitle font-weight-medium">
        Balance
      </v-col>
    </v-row>

    <!-- 
      Display row for uncategorized if they exist for this month
     -->
    <v-row v-if="getBalanceValue(null) !== 0" class="elevation-0 ma-0 pa-0 yellow lighten-2">
      <v-col class="master-category-row ">
        <v-chip class="py-0">
          <span class="subtitle font-weight-medium primary--text">Uncategorized</span>
        </v-chip>
      </v-col>
      <v-col sm="auto" class="px-0 py-1" />
      <v-col sm="auto" class="px-0 py-1">
        <div class="money-amount subtitle-2 pt-1">
          {{ getSpentValue(null) | currency }}
        </div>
      </v-col>
      <v-col sm="auto" class="px-0 py-1">
        <div class="money-amount subtitle-2 red--text pt-1">
          {{ getBalanceValue(null) | currency }}
        </div>
      </v-col>
    </v-row>

    <draggable
      v-model="masterCategories"
      tag="v-row"
      class="pt-0"
      handle=".handle"
      :group="{ name: 'people', pull: 'false', put: false }"
    >
      <v-col
        v-for="cat in masterCategories.filter(cat => !cat.hidden || isReorderingCategories)"
        :key="cat._id"
        class="pa-0"
      >
        <v-row class="primary lighten-2 elevation-0 ma-0 pa-0">
          <v-col class="master-category-row">
            <v-icon v-if="isReorderingCategories" class="handle pr-2" color="white">
              mdi-drag-horizontal-variant
            </v-icon>
            <v-icon
              v-if="!isReorderingCategories && cat.collapsed"
              class="mr-2"
              color="white"
              @click="collapseMasterCategory(cat)"
            >
              mdi-chevron-right
            </v-icon>
            <v-icon
              v-if="!isReorderingCategories && !cat.collapsed"
              class="mr-2"
              color="white"
              tabindex="-1"
              @click="collapseMasterCategory(cat)"
            >
              mdi-chevron-down
            </v-icon>
            <span
              class="subtitle font-weight-medium white--text"
              :class="{ 'text-decoration-line-through': cat.hidden }"
              >{{ cat.name }}
            </span>
            <v-btn
              v-if="isReorderingCategories"
              id="btn-editCategoryGroup"
              icon
              small
              dark
              color="white"
              @click="editCategory(cat)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn v-if="isReorderingCategories" icon small dark color="white" @click="addSubCategory(cat)">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
            <v-btn v-if="isReorderingCategories" icon small dark color="white" @click="hideCategory(cat)">
              <v-icon v-if="!cat.hidden">
                mdi-eye
              </v-icon>
              <v-icon v-if="cat.hidden">
                mdi-eye-off
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <!-- Container under each master category containing all individual categories -->
        <draggable
          v-if="categoriesGroupedByMaster[cat._id.slice(-36)] && !cat.collapsed"
          tag="div"
          :class="cat._id.slice(-36)"
          :group="{ name: cat._id.slice(-36), put: true }"
          handle=".handle"
          @end="subCategoryMoveEnd"
        >
          <!-- Each individual category row -->
          <v-row
            v-for="item in categoriesGroupedByMaster[cat._id.slice(-36)]
              .sort((a, b) => (a.sort > b.sort ? 1 : -1))
              .filter(cat => !cat.hidden || isReorderingCategories)"
            :key="item._id"
            class="category-row ma-0"
            align="center"
          >
            <v-col class="py-0 pt-0">
              <v-icon v-if="isReorderingCategories" class="handle pr-1">
                mdi-drag-horizontal-variant
              </v-icon>
              <span :class="{ 'text-decoration-line-through': item.hidden }">{{ item.name }}</span>
              <v-btn
                v-if="isReorderingCategories"
                id="btn-editCategory"
                icon
                small
                dark
                color="grey darken-4"
                class="pb-1"
                @click="renameCategory(item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn v-if="isReorderingCategories" icon small dark color="grey darken-4" @click="hideCategory(item)">
                <v-icon v-if="!item.hidden">
                  mdi-eye
                </v-icon>
                <v-icon v-if="item.hidden">
                  mdi-eye-off
                </v-icon>
              </v-btn>
            </v-col>
            <!-- <v-col>{{ item.name }}</v-col> -->
            <!-- <v-col>{{ item.masterCategory }}</v-col> -->
            <!-- <v-col class="px-0 py-1">
              {{ item.sort }}
            </v-col> -->

            <v-col sm="auto" class="pa-0 black--text budget-input-col" align="top">
              <v-text-field
                id="budget-input"
                dense
                class="budgeted-amount subtitle-2 grey--text"
                :class="{
                  'budgeted-amount-neg': getBudgetedValue(item._id) < 0,
                  'budgeted-amount-zero': getBudgetedValue(item._id) == 0
                }"
                :value="getBudgetedValue(item._id)"
                prefix="$"
                hide-details
                @change="budgetValueChanged(item, $event)"
                @focus="onFocus"
              />
              <!-- <input
                data-cy="budget-input"
                class="money-amount budget-input-textfield subtitle-2"
                :value="getBudgetedValue(item._id)"
                @input="budgetValueChanged(item, $event)"
              > -->
            </v-col>

            <v-col sm="auto" class="px-0 py-1">
              <div
                class="spent-amount subtitle-2"
                :class="{
                  'primary--text': getSpentValue(item._id) < 0,
                  'grey--text': getSpentValue(item._id) == 0
                }"
              >
                {{ getSpentValue(item._id) | currency }}
              </div>
            </v-col>

            <v-col sm="auto" class="px-0 py-1">
              <div
                class="balance-amount subtitle-2"
                :class="{
                  'red--text': getBalanceValue(item._id) < 0,
                  'grey--text': getBalanceValue(item._id) == 0
                }"
                :category_uid="item._id"
              >
                {{ getBalanceValue(item._id) | currency }}
                <v-btn icon x-small tabindex="-1" @click.stop="flipOverspending(item)">
                  <v-icon v-if="getOverspendingProperty(item)" color="red" tabindex="-1">
                    mdi-arrow-right
                  </v-icon>
                  <v-icon v-else tabindex="-1">
                    mdi-arrow-right
                  </v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </draggable>
      </v-col>
    </draggable>
  </v-container>
  <!-- </section> -->
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import BaseDialogModalComponent from '../Modals/BaseDialogModalComponent.vue'
import BudgetHeader from './BudgetHeader.vue'
import _ from 'lodash'
import draggable from 'vuedraggable'
import Sortable from 'sortablejs'

export default {
  name: 'BudgetGrid',
  components: {
    draggable,
    BaseDialogModalComponent,
    BudgetHeader
  },
  data() {
    return {
      isReorderingCategories: false,
      category_name: '',
      isModalVisibleMasterCat: false,
      isModalVisibleCategory: false,
      isModalVisibleEditCategory: false,
      isModalVisibleCreateSubCategory: false,
      masterCategoryForModalForm: '',
      editedCategory: {},
      headers: [
        {
          text: 'Category name',
          align: 'left',
          value: 'name'
        },
        // { text: "Category", value: "id" },
        { text: 'Budgeted', value: 'budgeted', width: '25px' },
        { text: 'Spent', value: 'spent', width: '25px' },
        { text: 'Balance', value: 'balance', width: '25px' }
        // { text: "masterCategory", value: "masterCategory" }
      ]
    }
  },
  computed: {
    ...mapGetters(['selectedBudgetID', 'monthlyData', 'month_selected', 'month_category_lookup']),
    masterCategories: {
      get() {
        return this.$store.getters.masterCategories
      },
      set(value) {
        this.$store.dispatch('reorderMasterCategories', value)
      }
    },
    categoriesGroupedByMaster: {
      get() {
        return this.$store.getters.categoriesGroupedByMaster
      },
      set(value) {
        this.$store.dispatch('reorderMasterCategories', value)
      }
    },
    categories: {
      get() {
        return this.$store.getters.categories
      },
      set(value) {
        this.$store.commit('setPages', value)
      }
    }
  },
  mounted() {},
  created() {},
  methods: {
    ...mapActions(['updateBudgetAmount', 'deleteDocFromPouchAndVuex']),
    ...mapMutations(['PREVIOUS_MONTH', 'ADD_MONTH', 'GO_TO_CURRENT_MONTH']),
    onFocus(param) {
      this.$nextTick(() => {
        param.target.select()
      })
    },
    collapseMasterCategory(cat) {
      this.$store.dispatch('flipMasterCategoryCollapsed', cat)
    },
    hideCategory(cat) {
      this.$store.dispatch('flipCategoryHidden', cat)
    },
    subCategoryMoveEnd(event) {
      // console.log(event.to.className.slice(-36)); //ID of new master category
      // console.log(event.newIndex); //Sort index of sub category

      // console.log(event.from.className.slice(-36)); //ID of old master category
      // console.log(event.oldIndex); //Sort index of sub category
      // console.log(event);
      this.$store.dispatch('reorderSubCategory', event)
    },
    editCategory(category) {
      this.editedCategory = JSON.parse(JSON.stringify(category))
      this.isModalVisibleEditCategory = true
    },
    addSubCategory(category) {
      this.editedCategory = JSON.parse(JSON.stringify(category))
      this.isModalVisibleCreateSubCategory = true
    },
    saveCategory() {
      this.$store.dispatch('updateCategory', this.editedCategory)
      this.doneEditing()
    },
    doneEditing() {
      this.editedCategory = {}
      this.isModalVisibleEditCategory = false
    },
    budgetValueChanged(item, event) {
      console.log('budget change', event)
      var payload = {}
      payload.doc = {
        budget: Math.round(event * 100),
        overspending: null,
        note: '',
        _id: `b_${this.selectedBudgetID}_m_category_${this.month_selected}-01_${item._id.slice(-36)}`
      }

      //Check if already exists
      if (
        this.month_category_lookup[this.month_selected] &&
        this.month_category_lookup[this.month_selected][item._id.slice(-36)]
      ) {
        payload.doc._id = this.month_category_lookup[this.month_selected][item._id.slice(-36)]._id
        payload.doc._rev = this.month_category_lookup[this.month_selected][item._id.slice(-36)]._rev
      }

      console.log('payload for budget', payload.doc)
      if (!isNaN(payload.doc.budget)) {
        this.$store.dispatch('updateBudgetAmount', payload.doc)
      }
    },
    getBudgetedValue(full_id) {
      const id = full_id ? full_id.slice(-36) : null

      return (_.get(this.monthlyData, `${this.month_selected}.categories.${id}.budgeted`, 0) / 100).toFixed(2)
    },
    getSpentValue(full_id) {
      const id = full_id ? full_id.slice(-36) : null

      return _.get(this.monthlyData, `${this.month_selected}.categories.${id}.spent`, 0) / 100
    },
    getBalanceValue(full_id) {
      const id = full_id ? full_id.slice(-36) : null

      return _.get(this.monthlyData, `${this.month_selected}.categories.${id}.balance`, 0) / 100
    },
    getOverspendingProperty(item) {
      const id = item._id ? item._id.slice(-36) : null

      return _.get(this.month_category_lookup, `${this.month_selected}.${id}.overspending`, false)
    },
    deleteCategory(item) {
      this.deleteDocFromPouchAndVuex(item)
    },
    createMasterCategory(newCategoryGroupName) {
      if (newCategoryGroupName.length > 0) {
        this.$store.dispatch('createMasterCategory', newCategoryGroupName)
      }
      this.clear()
    },
    createCategory() {
      const payload = {
        masterCategoryForModalForm: this.editedCategory._id.slice(-36),
        category_name: this.category_name
      }
      this.$store.dispatch('createCategory', payload)
      this.clear()
    },
    clear() {
      this.isModalVisibleCreateSubCategory = false
      this.masterCategoryForModalForm = ''
      this.isModalVisibleMasterCat = false
      this.isModalVisibleCategory = false
      this.category_name = ''
    },
    flipOverspending(item) {
      this.$store.dispatch('flipOverspending', item)
    },
    async renameCategory(item) {
      let newItem = JSON.parse(JSON.stringify(item))
      const { value: newCategoryName } = await this.$swal({
        title: 'Rename category',
        input: 'text',
        inputValue: item.name,
        inputAttributes: {
          autocapitalize: 'off',
          autocorrect: 'off'
        },
        inputValidator: value => {
          if (!value) {
            return 'You need to write something!'
          }
        }
      })
      if (newCategoryName) {
        newItem.name = newCategoryName
        this.$store.dispatch('commitDocToPouchAndVuex', newItem)
      }
    }
  }
}
</script>

<style scoped>
.budgeted-amount >>> input {
  text-align: right !important;
}
.budgeted-amount-neg >>> input {
}
.budgeted-amount-pos >>> input {
  color: var(--v-primary-base);
}
.budgeted-amount-zero >>> input {
  color: grey;
}

.crud-actions {
  width: 200px;
  opacity: 0;
  transition: 0.2s ease-in-out;
}
tr:hover .crud-actions {
  opacity: 1;
}

.money-amount {
  text-align: right;
  min-width: 90px;
  width: 90px;
  max-width: 90px;
  padding-left: 0;
  padding-right: 5px;
}
.budgeted-amount {
  text-align: right;
  width: 100px;
  padding-left: 0;
  padding-right: 5px;
}
.spent-amount {
  text-align: right;
  width: 100px;
  padding-left: 0;
  padding-right: 5px;
}
.balance-amount {
  text-align: right;
  width: 100px;
  padding-left: 0;
  padding-right: 5px;
}

.header {
  text-align: right;
}
.category-row {
  border-bottom: 1px solid rgb(182, 182, 182);
  height: 30px;
}

.master-category-row {
  padding: 5px 0px 5px 5px;
}

.uncategorized-row {
  border-top: 1px solid rgb(182, 182, 182);
  height: 50px;
}

.budget-input-col {
  margin-top: -1px;
  height: 30px;
}
</style>

<style lang="scss">
// .v-row-group__header {
//   height: 10px;
// }
</style>
