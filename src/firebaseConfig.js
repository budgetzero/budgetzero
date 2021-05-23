import firebase from 'firebase/app'
import * as firebaseui from 'firebaseui'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/firestore'
import 'firebase/analytics'
import isElectron from 'is-electron'

var config = {
  apiKey: 'AIzaSyCqqKo0JWHbXLN3RY1JMyq1cVM78YSSN1s',
  authDomain: 'budget-zero-ffe45.firebaseapp.com',
  databaseURL: 'https://budget-zero-ffe45.firebaseio.com',
  projectId: 'budget-zero-ffe45',
  storageBucket: 'budget-zero-ffe45.appspot.com',
  messagingSenderId: '537114778293',
  appId: '1:537114778293:web:8f1abdfbe9f29f7b113cfc',
  measurementId: 'G-L1SBNKLM7C'
}

const app = firebase.initializeApp(config)
const auth = firebase.auth()

const db = app.database()
const firestore = firebase.firestore()

const platform = isElectron() ? 'electron' : 'web'
// app.analytics().setUserProperties({platform: platform});

const authUiConfig = {
  signInSuccessUrl: '/',
  signInOptions: [
    {
      provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      customParameters: {
        prompt: 'select_account'
      }
    },
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      customParameters: {
        prompt: 'select_account'
      }
    }
  ]
}

let authUi = null

// Make the authUI null if we're running unit tests. Couldn't figure out how to get it working in jest.
if (process.env.NODE_ENV !== 'test') {
  authUi = new firebaseui.auth.AuthUI(auth)
}

export default app
export { firestore, auth, authUi, authUiConfig, db, firebase }
