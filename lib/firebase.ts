import firebaseApp from 'firebase/app'
import firebase from 'firebase'
export default firebase
import 'firebase/database'
import { config } from '../firebaseConfig'

export let app
if (!firebaseApp.apps.length) {
  app = firebaseApp.initializeApp(config)
} else {
  app = firebaseApp.app()
}
