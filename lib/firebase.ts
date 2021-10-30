import 'firebase'
import firebase from 'firebase/app'
import 'firebase/database'
import { config } from '../firebaseConfig'

export type User = firebase.User
export type App = firebase.app.App

export let app: App

if (!firebase.apps.length) {
  app = firebase.initializeApp(config)
} else {
  app = firebase.app()
}
