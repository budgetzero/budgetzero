<template>
  <v-container fluid class="pa-0">
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
          <v-icon medium> mdi-chevron-right </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-divider />

    <v-row justify="space-between" class="ma-0 pt-2">
      <v-col sm="auto" />
      <v-col sm="auto">
        <BudgetHeader :month_selected="monthSelected" />
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
          @click.stop="createMasterCategory()"
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
          <v-icon left> mdi-drag-horizontal-variant </v-icon>
          <span v-if="!isReorderingCategories"> Modify </span>
          <span v-else> Done </span>
        </v-btn>
      </v-col>
      <v-col id="budgeted-header" class="money-amount subtitle font-weight-medium"> Budgeted </v-col>
      <v-col id="spent-header" class="money-amount subtitle font-weight-medium"> Spent </v-col>
      <v-col id="balance-header" class="money-amount subtitle font-weight-medium"> Balance </v-col>
    </v-row>

    <!-- 
      Display row for uncategorized if they exist for this month
     -->
    <v-row v-if="getBalanceValue(null) !== 0" class="elevation-0 ma-0 pa-0 yellow lighten-2">
      <v-col class="master-category-row">
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
        v-for="cat in masterCategories.filter((cat) => !cat.hidden || isReorderingCategories)"
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
              @click="renameCategory(cat)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn v-if="isReorderingCategories" icon small dark color="white" @click="createSubCategory(cat)">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
            <v-btn v-if="isReorderingCategories" icon small dark color="white" @click="hideCategory(cat)">
              <v-icon v-if="!cat.hidden"> mdi-eye </v-icon>
              <v-icon v-if="cat.hidden"> mdi-eye-off </v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <!-- Container under each master category containing all individual categories -->
        <draggable
          v-if="budgetManagerStore.categoriesGroupedByMaster[cat._id.slice(-36)] && !cat.collapsed"
          tag="div"
          :class="cat._id.slice(-36)"
          :group="{ name: cat._id.slice(-36), put: true }"
          handle=".handle"
          @end="reorderSubCategory"
        >
          <!-- Each individual category row -->
          <v-row
            v-for="item in budgetManagerStore.categoriesGroupedByMaster[cat._id.slice(-36)]
              .sort((a, b) => (a.sort > b.sort ? 1 : -1))
              .filter((cat) => !cat.hidden || isReorderingCategories)"
            :key="item._id"
            class="category-row ma-0"
            align="center"
          >
            <v-col class="py-0 pt-0">
              <v-icon v-if="isReorderingCategories" class="handle pr-1"> mdi-drag-horizontal-variant </v-icon>
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
                <v-icon v-if="!item.hidden"> mdi-eye </v-icon>
                <v-icon v-if="item.hidden"> mdi-eye-off </v-icon>
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
                  <v-icon v-if="getOverspendingProperty(item)" color="red" tabindex="-1"> mdi-arrow-right </v-icon>
                  <v-icon v-else tabindex="-1"> mdi-arrow-right </v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </draggable>
      </v-col>
    </draggable>
  </v-container>
</template>

<script>
import BaseDialogModalComponent from '../Modals/BaseDialogModalComponent.vue'
import BudgetHeader from './BudgetHeader.vue'
import _ from 'lodash'
import draggable from 'vuedraggable'
import { mapStores } from 'pinia'
import { useBudgetManagerStore } from '../../store/budgetManager'
import { useBudgetHelperStore } from '../../store/budgetManagerHelper'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'BudgetGrid',
  components: {
    draggable,
    BaseDialogModalComponent,
    BudgetHeader
  },
  data() {
    return {
      monthSelected: new Date().toISOString().slice(0, 7),
      isReorderingCategories: false,
      category_name: '',
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
    ...mapStores(useBudgetManagerStore, useBudgetHelperStore),
    masterCategories: {
      get() {
        return this.budgetManagerStore.masterCategories.sort((a, b) => a.sort - b.sort)
      },
      set(value) {
        this.budgetHelperStore.reorderMasterCategories(value)
      }
    },
  },
  mounted() {},
  created() {},
  methods: {
    ADD_MONTH() {
      this.monthSelected = moment(this.monthSelected).add(1, 'M').format('YYYY-MM')
    },
    PREVIOUS_MONTH() {
      this.monthSelected = moment(this.monthSelected).subtract(1, 'M').format('YYYY-MM')
    },
    GO_TO_CURRENT_MONTH() {
      this.monthSelected = new Date().toISOString().slice(0, 7)
    },
    onFocus(param) {
      this.$nextTick(() => {
        param.target.select()
      })
    },
    async collapseMasterCategory(cat) {
      let updatedCategory = JSON.parse(JSON.stringify(cat))
      updatedCategory.collapsed = !updatedCategory.collapsed
      await this.budgetManagerStore.putDocument(updatedCategory)
    },
    async hideCategory(cat) {
      let updatedCategory = JSON.parse(JSON.stringify(cat))
      updatedCategory.hidden = !updatedCategory.hidden
      await this.budgetManagerStore.putDocument(updatedCategory)
    },
    reorderSubCategory(event) {
      // console.log(event.from.className.slice(-36)) //ID of old master category
      // console.log(event.oldIndex) //Sort index of sub category

      // console.log(event.to.className.slice(-36)) //ID of new master category
      // console.log(event.newIndex) //Sort index of sub category

      this.budgetHelperStore.reorderSubCategory(event)
    },
    async createSubCategory(masterCategory) {
      try {
        const newCategoryName = await this.$root.$confirm(`${masterCategory.name}: create sub category`, ``, {
          agreeBtnColor: 'primary',
          cancelBtnColor: 'accent',
          agreeBtnText: 'Create',
          showTextField: true,
          textFieldValue: '',
          textFieldLabel: `Enter new category name`,
          showMessage: false
        })
        if (newCategoryName) {
          const sort_length = this.budgetManagerStore.categoriesGroupedByMaster[masterCategory._id.slice(-36)]
            ? this.budgetManagerStore.categoriesGroupedByMaster[masterCategory._id.slice(-36)].length
            : 0

          const newCategory = {
            _id: `b_${this.budgetManagerStore.budgetID}_category_${uuidv4()}`,
            name: newCategoryName,
            hidden: false,
            masterCategory: masterCategory._id.slice(-36),
            sort: sort_length
          }
          await this.budgetManagerStore.putDocument(newCategory)
        }
      } catch (err) {
        console.error(err)
      }
    },
    async createMasterCategory() {
      try {
        const newCategoryName = await this.$root.$confirm(`Create New Category Group`, ``, {
          agreeBtnColor: 'primary',
          cancelBtnColor: 'accent',
          agreeBtnText: 'Create',
          showTextField: true,
          textFieldValue: '',
          textFieldLabel: `Enter new category group name`,
          showMessage: false
        })
        if (newCategoryName) {
          const newCategory = {
            _id: `b_${this.budgetManagerStore.budgetID}_master-category_${uuidv4()}`,
            name: newCategoryName,
            sort: this.budgetManagerStore.masterCategories.length,
            collapsed: false
          }

          await this.budgetManagerStore.putDocument(newCategory)
        }
      } catch (err) {
        console.error(err)
      }
    },
    async budgetValueChanged(item, event) {
      var payload = {}
      payload.doc = {
        budget: Math.round(event * 100),
        overspending: null,
        note: '',
        _id: `b_${this.budgetManagerStore.budgetID}_m_category_${this.monthSelected}-01_${item._id.slice(-36)}`
      }

      //Check if already exists
      if (
        this.budgetManagerStore.month_category_lookup[this.monthSelected] &&
        this.budgetManagerStore.month_category_lookup[this.monthSelected][item._id.slice(-36)]
      ) {
        payload.doc._id = this.budgetManagerStore.month_category_lookup[this.monthSelected][item._id.slice(-36)]._id
        payload.doc._rev = this.budgetManagerStore.month_category_lookup[this.monthSelected][item._id.slice(-36)]._rev
      }

      if (!isNaN(payload.doc.budget)) {
        await this.budgetManagerStore.putDocument(payload.doc)
      }
    },
    getBudgetedValue(full_id) {
      const id = full_id ? full_id.slice(-36) : null

      return (
        _.get(this.budgetManagerStore.monthlyData, `${this.monthSelected}.categories.${id}.budgeted`, 0) / 100
      ).toFixed(2)
    },
    getSpentValue(full_id) {
      const id = full_id ? full_id.slice(-36) : null

      return _.get(this.budgetManagerStore.monthlyData, `${this.monthSelected}.categories.${id}.spent`, 0) / 100
    },
    getBalanceValue(full_id) {
      const id = full_id ? full_id.slice(-36) : null

      return _.get(this.budgetManagerStore.monthlyData, `${this.monthSelected}.categories.${id}.balance`, 0) / 100
    },
    getOverspendingProperty(item) {
      const id = item._id ? item._id.slice(-36) : null

      return _.get(this.budgetManagerStore.month_category_lookup, `${this.monthSelected}.${id}.overspending`, false)
    },
    async flipOverspending(item) {
      let payload = {
        budget: 0,
        overspending: true,
        note: '',
        _id: `b_${this.budgetManagerStore.budgetID}_m_category_${this.monthSelected}-01_${item._id.slice(-36)}`,
        date: `${this.monthSelected}-01`
      }

      //Check if already exists
      if (
        this.budgetManagerStore.month_category_lookup[this.monthSelected] &&
        this.budgetManagerStore.month_category_lookup[this.monthSelected][item._id.slice(-36)]
      ) {
        payload = JSON.parse(
          JSON.stringify(this.budgetManagerStore.month_category_lookup[this.monthSelected][item._id.slice(-36)])
        )

        payload.overspending = !payload.overspending
      }
      await this.budgetManagerStore.putDocument(payload)
    },
    async renameCategory(item) {
      let newItem = JSON.parse(JSON.stringify(item))

      try {
        const newCategoryName = await this.$root.$confirm('Rename category', ``, {
          agreeBtnColor: 'primary',
          cancelBtnColor: 'accent',
          agreeBtnText: 'Ok',
          showTextField: true,
          textFieldValue: item.name,
          textFieldLabel: 'Enter new category name',
          showMessage: false
        })
        if (newCategoryName) {
          newItem.name = newCategoryName
          await this.budgetManagerStore.putDocument(newItem)
        }
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>

<style scoped>
.budgeted-amount >>> input {
  text-align: right !important;
}
/* .budgeted-amount-neg >>> input {
} */
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
