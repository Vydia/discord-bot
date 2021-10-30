import firebaseApp from 'firebase/app'
import firebase from 'firebase'
export default firebase
import 'firebase/database'
import { config } from '../firebaseConfig'

export type User = firebaseApp.User
export type App = firebaseApp.app.App

export let app: App

if (!firebaseApp.apps.length) {
  app = firebaseApp.initializeApp(config)
} else {
  app = firebaseApp.app()
}
