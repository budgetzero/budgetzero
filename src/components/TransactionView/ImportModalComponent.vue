<template>
  <v-dialog
    v-model="show"
    max-width="500px"
  >
    <v-card>
      <v-card-title class="primary">
        <v-toolbar-title class="white--text">
          Import Transactions
        </v-toolbar-title>
      </v-card-title>

      <v-tabs
        v-model="tab"
        grow
      >
        <v-tab>
          OFX
        </v-tab>
        <v-tab>
          CSV
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item>
          <v-card-text>
            <v-file-input
              v-model="chosenFile"
              label="Upload OFX file"
              @change="onFileChange"
            />

            <div v-if="selectedAccount">
              <span>
                Select Account to Import:
              </span>
              <v-select
                v-model="selectedAccount"
                :items="accountsForImport"
                item-text="id"
                item-value="transactions"
              />

              <span
                class="heading"
              >Preview
                <strong>{{ selectedAccount ? selectedAccount.length : 0 }}</strong>
                transactions for import:</span>

              <v-simple-table height="300px">
                <template #default>
                  <thead>
                    <tr>
                      <th class="text-left">
                        Date
                      </th>
                      <th class="text-left">
                        Payee
                      </th>
                      <th class="text-left">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="item in selectedAccount"
                      :key="item.date"
                    >
                      <td>{{ item.DTPOSTED }}</td>
                      <td>{{ item.NAME }}</td>
                      <td>{{ item.TRNAMT }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
              <div v-if="accountsForImport.length === 0">
                <span>No accounts found.</span>
              </div>
            </div>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="error"
              flat
              @click.stop="show = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              flat
              @click="pushTransactionsToBackend"
            >
              Import Transactions
            </v-btn>
          </v-card-actions>
        </v-tab-item>

        <v-tab-item>
          <v-card-text>
            <vue-csv-import
              v-model="parseCsv"
              button-class="v-btn"
              table-select-class="map-fields-select"
              auto-match-fields
              auto-match-ignore-case
              :map-fields="['date', 'payee', 'amount', 'memo']"
            >
              <template
                slot="hasHeaders"
                slot-scope="{ headers, toggle }"
              >
                <label>
                  <v-checkbox
                    id="hasHeaders"
                    type="checkbox"
                    :value="headers"
                    label="Headers?"
                    @change="toggle"
                  /></label>
              </template>

              <template slot="error">
                File type is invalid
              </template>

              <template slot="thead">
                <tr>
                  <th>My Fields</th>
                  <th>Column</th>
                </tr>
              </template>

              <template
                slot="next"
                slot-scope="{ load }"
              >
                <v-btn
                  class="my-3"
                  @click.prevent="load"
                >
                  parse csv file
                </v-btn>
              </template>

              <template
                slot="submit"
                slot-scope="{ submit }"
              >
                <v-btn @click.prevent="submitCSVImport">
                  send!
                </v-btn>
              </template>
            </vue-csv-import>

            <v-divider />
            <span
              class="heading pt-3"
            >Preview
              <strong>{{ parseCsv ? parseCsv.length : 0 }}</strong>
              transactions for import:</span>

            <v-simple-table
              v-if="parseCsv"
              height="300px"
            >
              <template #default>
                <thead>
                  <tr>
                    <th class="text-left">
                      Date
                    </th>
                    <th class="text-left">
                      Payee
                    </th>
                    <th class="text-left">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in parseCsv"
                    :key="item.date"
                  >
                    <td>{{ item.date }}</td>
                    <td>{{ item.payee }}</td>
                    <td>{{ item.amount }}</td>
                    <td>{{ item.memo }}</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
            
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="error"
                flat
                @click.stop="show = false"
              >
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                flat
                :disabled="!parseCsv"
                @click="importCSVTransactions"
              >
                Import Transactions
              </v-btn>
            </v-card-actions>
          </v-card-text>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </v-dialog>
</template>

<script>
import Banking from "banking";
import { mapGetters } from "vuex";
import _ from "lodash";
import { VueCsvImport } from "vue-csv-import";
import moment from "moment";

export default {
  name: "ImportFile",
  components: { VueCsvImport },
  props: ["visible", "account"],
  data() {
    return {
      tab: null,
      parseCsv: null,
      selectedAccount: null,
      accountsForImport: [],
      importCount: {
        imported: 0,
        skipped: 0
      },
      chosenFile: null
    };
  },
  computed: {
    ...mapGetters(["accounts", "selectedBudgetID"]),
    show: {
      get() {
        return this.visible;
      },
      set(value) {
        if (!value) {
          this.$emit("close");
        }
      }
    }
  },
  watch: {
  },
  methods: {
    onFileChange() {
      this.readOFXfile(this.chosenFile);
    },
    importTransactions() {},
    readOFXfile(file) {
      const reader = new FileReader();
      this.accountsForImport = [];
      this.selectedAccount = {};

      reader.onload = e => {
        const vm = this;
        Banking.parse(e.target.result, res => {
          const potentialBankAccounts = _.get(res, "body.OFX.BANKMSGSRSV1.STMTTRNRS", []);
          const potentialCreditAccounts = _.get(res, "body.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS", []);
          var creditAccountsForImport = [];
          var bankAccountsForImport = [];

          if (Array.isArray(potentialBankAccounts)) {
            bankAccountsForImport = potentialBankAccounts;
          } else {
            bankAccountsForImport.push(potentialBankAccounts);
          }

          bankAccountsForImport = bankAccountsForImport.map(acct => {
            let standardAcct = {};
            standardAcct.id = acct.STMTRS.BANKACCTFROM.ACCTID;
            standardAcct.type = acct.STMTRS.BANKACCTFROM.ACCTTYPE;
            standardAcct.bankid = acct.STMTRS.BANKACCTFROM.BANKID;
            standardAcct.transactions = acct.STMTRS.BANKTRANLIST.STMTTRN;
            return standardAcct;
          });

          if (Array.isArray(potentialCreditAccounts)) {
            creditAccountsForImport = potentialCreditAccounts;
          } else {
            creditAccountsForImport.push(potentialCreditAccounts);
          }

          creditAccountsForImport = creditAccountsForImport.map(acct => {
            let standardAcct = {};
            standardAcct.id = acct.CCSTMTRS.CCACCTFROM.ACCTID;
            standardAcct.type = "CREDIT";
            standardAcct.bankid = acct.CCSTMTRS.CCACCTFROM.ACCTID;
            standardAcct.transactions = acct.CCSTMTRS.BANKTRANLIST.STMTTRN;
            return standardAcct;
          });

          console.log(bankAccountsForImport, creditAccountsForImport)
          vm.accountsForImport = vm.accountsForImport.concat(
            bankAccountsForImport,
            creditAccountsForImport
          );

          // TODO: Make import button enabled here
        });
      };
      reader.readAsText(file);
    },
    async pushTransactionsToBackend() {
      const transactionListToImport = [];
      this.selectedAccount.forEach(trn => {
        //Create a custom importID that appends account to the FITID
        const importID = `${this.account}_${trn.FITID}`;
        if (
          this.$store.getters.listOfImportIDs.includes(importID) &&
          trn.FITID !== "" &&
          trn.FITID !== null
        ) {
          console.log("import skipped");
          this.importCount.skipped++;
        } else {
          const jsonData = {
            account: this.account,
            category: null,
            cleared: false,
            approved: false,
            value: Math.round(trn.TRNAMT * 100), 
            date: `${trn.DTPOSTED.substring(0, 4)}-${trn.DTPOSTED.substring(
              4,
              6
            )}-${trn.DTPOSTED.substring(6, 8)}`,
            memo: null,
            reconciled: false,
            flag: "#ffffff",
            payee: trn.NAME ? trn.NAME : null,
            importID: importID,
            transfer: null,
            splits: [],
            _id: `b_${this.selectedBudgetID}_transaction_${this.$uuid.v4()}`
          };

          this.importCount.imported++;
          transactionListToImport.push(jsonData);
        }
      });

      // this.$swal({
      //   title: "Auto close alert!",
      //   html: "I will close in <b></b> milliseconds.",
      //   preConfirm: login => {
      //   }
      // }).then(result => {
      //   /* Read more about handling dismissals below */
      //   // if (result.dismiss === Swal.DismissReason.timer) {
      //   //   console.log("I was closed by the timer");
      //   // }
      // });

      // this.$swal.showLoading();
      this.$swal({
        title: "Loading...",
        html: "Importing transactions. Please wait...",
        didOpen: () => {
          Vue.prototype.$swal.showLoading();
        },
        showConfirmButton: false,
        showCancelButton: false
      });

      await this.commitTransactions(transactionListToImport);

      this.importComplete();
      this.$emit("close");
    },
    async importCSVTransactions() {
      const transactionListToImport = [];

      this.parseCsv.forEach(trn => {
        
        //This should probably go somewhere else. 
        //Necessary to ensure we strip commas from soon-to-be imported transactions
        const val = trn.amount.toString().replace(/[^0-9.-]/g, '');

        //Create a custom importID that appends account to the FITID
        const jsonData = {
            account: this.account,
            category: null,
            cleared: false,
            approved: false,
            value: Math.round(val * 100),
            date: moment(trn.date).format('YYYY-MM-DD'),
            memo: trn.memo,
            reconciled: false,
            flag: "#ffffff",
            payee: trn.payee,
            transfer: null,
            splits: [],
            _id: `b_${this.selectedBudgetID}_transaction_${this.$uuid.v4()}`
          };
          this.importCount.imported++;
          transactionListToImport.push(jsonData);
        }
      );

      this.$swal({
        title: "Loading...",
        html: "Importing transactions. Please wait...",
        didOpen: () => {
          Vue.prototype.$swal.showLoading();
        },
        showConfirmButton: false,
        showCancelButton: false
      });

      await this.commitTransactions(transactionListToImport);

      this.parseCsv = null
      this.importComplete();
      this.$emit("close");
    },
    async commitTransactions(transactionListToImport) {
      var asyncFunctions = [];

      for (const transaction of transactionListToImport) {
        console.log("import transaction", transaction);
        
        await this.$store.dispatch("updateTransaction", transaction);
      }

      return Promise.resolve();
    },
    importComplete() {
      const msg = `Transactions Skipped: ${this.importCount.skipped} \nTransactions Imported: ${this.importCount.imported}`;
      this.$swal("Import Complete", msg, "success");

      this.resetData();
    },
    submitCSVImport() {
      console.log("csv import");
    },
    resetData() {
      this.selectedAccount = [];
      this.accountsForImport = [];
      (this.importCount = {
        imported: 0,
        skipped: 0
      }),
        (this.chosenFile = null);
    }
  }
};
</script>

<style>
.map-fields-select {
  border: 1px solid grey !important;
}
</style>
