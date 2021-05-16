<template>
  <v-card
    elevation="0"
    class="mx-auto"
  >
    <v-data-table
      :headers="headers"
      :items="accounts"
      sort-by="calories"
      class="elevation-1 account-table"
      hide-default-footer
      disable-pagination
      id="accountsTable"
    >
      <template #top>
        <v-toolbar
          flat
          color="white"
        >
          <span class="text-h3">Accounts</span>
          <v-spacer />

          <AccountAddModal
            v-model="showModal"
            :editeditem="editedItem"
            @save="save"
          />

          <v-btn
            color="accent"
            dark
            class="mb-2"
            id="addAccountBtn"
            @click="create()"
          >
            Add Account
          </v-btn>
        </v-toolbar>
        <v-divider class="pb-4" />
      </template>

      <template #item.action="{ item }">
        <div
          class="crud-actions"
        >
          <v-icon
            icon
            dark
            class=""
            color="primary"
            @click="editItem(item)"
          >
            edit
          </v-icon>
          <v-icon
            icon
            dark
            class="ml-1"
            color="accent"
            @click="deleteItem(item)"
          >
            delete
          </v-icon>
        </div>
      </template>
      <template #no-data>
        <!-- <v-btn color="primary" @click="on">Add Account</v-btn> -->
      </template>
    </v-data-table>
  </v-card>
</template>
<script>
import { mapGetters, mapState } from "vuex";
import AccountAddModal from "./AccountAddModal";

/*
Account view
-------------

+ Add account
+ Delete account
+ Edit account
    ++ Rename
    ++ TODO: Add plaid association

View: Name -- Type -- Balance

{
  "type": "CREDIT",         //type one of: MORTGAGE ASSET CREDIT DEBIT INVESTMENT SAVINGS CASH
  "checkNumber": true,      //checkNumber true if check column is enabled
  "closed": false,
  "name": "Mortgage",
  "note": null,
  "sort": 7,                //sort can just all be zero initially
  "onBudget": false,
  "_id": “b_{budgetId}_account_{accountId}
}

*/
export default {
  name: "AccountGrid",
  components: {
    AccountAddModal
  },
  data() {
    return {
      headers: [
        {
          text: "Name",
          align: "left",
          sortable: false,
          value: "name"
        },
        { text: "Type", value: "type" },
        { text: "On Budget", value: "onBudget" },
        { text: "Invert Balance", value: "balanceIsNegative" },
        { text: "Closed", value: "closed" },
        { text: "Actions", value: "action", sortable: false }
      ],
      editedIndex: -1,
      editedItem: null,
      emptyItem: {
        type: "",
        checkNumber: true,
        closed: false,
        name: "",
        note: null,
        sort: 0,
        onBudget: true,
        balanceIsNegative: false,
        initialBalance: 0
      },
      showModal: false,
      nameRules: [
        v => !!v || "Name is required",
        v => (v && v.length <= 10) || "Name must be less than 10 characters"
      ]
    };
  },
  computed: {
    ...mapGetters(["accounts", "selectedBudgetID"])
  },
  mounted() {},
  created() {},
  methods: {
    create() {
      this.editedIndex = -1;
      this.editedItem = Object.assign({}, this.emptyItem)
      this.showModal = true;
    },
    editItem(item) {
      this.editedIndex = this.accounts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.showModal = true;
    },
    deleteItem(item) {
      const index = this.accounts.indexOf(item);
      confirm("Are you sure you want to delete this item?") &&
        this.$store.dispatch("deleteAccount", this.accounts[index]);
    },
    close() {
      this.showModal = false;
      setTimeout(() => {
        // this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    save() {
      console.log("save account clicked");
      if (this.editedIndex > -1) {
        // Editing existing account
        const editPayload = {
          type: this.editedItem.type,
          checkNumber: this.editedItem.checkNumber,
          closed: this.editedItem.closed,
          name: this.editedItem.name,
          note: this.editedItem.note,
          sort: this.editedItem.sort,
          onBudget: this.editedItem.onBudget,
          balanceIsNegative: this.editedItem.balanceIsNegative,
          _id: this.editedItem._id,
          _rev: this.editedItem._rev
        };
        Object.assign(this.accounts[this.editedIndex], this.editedItem);
        this.$store.dispatch("createUpdateAccount", {
          account: editPayload,
          initialBalance: false
        });
      } else {
        // Creating new account
        const newPayload = {
          type: this.editedItem.type,
          checkNumber: this.editedItem.checkNumber,
          closed: this.editedItem.closed,
          name: this.editedItem.name,
          note: this.editedItem.note,
          sort: this.editedItem.sort,
          onBudget: this.editedItem.onBudget,
          balanceIsNegative: this.editedItem.balanceIsNegative,
          _id: `b_${this.selectedBudgetID}_account_${this.$uuid.v4()}`
        };
        console.log("new acct", newPayload, this.editedItem.initialBalance);
        this.$store.dispatch("createUpdateAccount", {
          account: newPayload,
          initialBalance: this.editedItem.initialBalance
        });
        // this.desserts.push(this.editedItem); //Can't push onto vuex
      }
      this.close();
    },
  }
};
</script>

<style scoped></style>
