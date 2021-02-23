<template lang="html">
  <div>
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        style="position: relative;top: 13%;max-width: 350px;"
        class="text-xs-center"
      >
        <h3 v-if="this.$store.getters.user.loggedIn">
          Welcome {{ this.$store.getters.user.email }}!
        </h3>
        <v-card flat>
          <v-card-title primary-title>
            <h4 v-if="!this.$store.getters.user.loggedIn">
              Login
            </h4>
          </v-card-title>
          <v-form>
            <v-text-field
              v-if="!this.$store.getters.user.loggedIn"
              v-model="username"
              prepend-icon="person"
              name="Username"
              label="Username"
            />
            <v-text-field
              v-if="!this.$store.getters.user.loggedIn"
              v-model="password"
              prepend-icon="lock"
              name="Password"
              label="Password"
              type="password"
            />
            <v-card-actions>
              <v-btn
                v-if="!this.$store.getters.user.loggedIn"
                primary
                large
                block
                color="primary"
                @click.stop="submit"
              >
                Login
              </v-btn>
              <v-btn
                v-if="this.$store.getters.user.loggedIn"
                primary
                large
                block
                color="grey"
                @click.stop="logout"
              >
                Logout
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        align="center"
        justify="center"
        cols="6"
        class="pt-5"
      >
        <v-divider class="mb-5" />
        <!-- <div v-if="env == 'development'"> -->
        <!-- <div id="firebaseui-auth-container" /> -->
        <!-- </div> -->

        <span
          class="heading-6"
        >BudgetZero cloud sync is not currently open for sign-up. Provide your email below request
          an early access account!</span>

        <v-form
          v-model="valid"
          class="mt-5"
        >
          <v-text-field
            v-model="email"
            label="Email address"
            :rules="emailRules"
          />
          <v-btn
            :disabled="!valid"
            color="primary"
            @click="requestButtonPressed"
          >
            Request Access
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { firestore, authUi, authUiConfig, firebase } from "../../firebaseConfig";
import "firebaseui/dist/firebaseui.css";

export default {
  name: "Login",
  data() {
    return {
      valid: null,
      email: null,
      emailRules: [
        v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || "E-mail must be valid"
      ],
      username: null,
      password: null,
    };
  },
  computed: {
    env() {
      return process.env.NODE_ENV;
    },
  },
  mounted() {
    authUi.start("#firebaseui-auth-container", authUiConfig);
  },
  methods: {
    submit() {
      firebase
        .auth()
        .signInWithEmailAndPassword(this.username, this.password)
        .then(data => {
          this.$store.commit('SET_SNACKBAR_MESSAGE', 'Successfully logged in!')
          this.username = ''
          this.password = ''
        })
        .catch(err => {
          this.$store.commit('SET_SNACKBAR_MESSAGE', err.message)
          this.password = ''
        });
    },
    requestButtonPressed() {
      if (this.email.length > 0) {
        this.firebasePush();
      }
    },
    logout() {
      this.$store.dispatch('LOGOUT')
    },
    firebasePush() {
      // Add a new document in collection "cities"
      firestore
        .collection("emails")
        .doc(this.email)
        .set({
          email: this.email
        })
        .then(response => {
          this.$swal({ text: "Email received! We will contact you when your account is ready." });
          console.log("Document successfully written!");
        })
        .catch(error => {
          this.$swal({ text: "Email received! We will contact you when your account is ready." });
          console.error("Error writing document: ", error);
        });
    }
  }
};
</script>
