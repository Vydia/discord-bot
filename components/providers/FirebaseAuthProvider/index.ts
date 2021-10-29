import { Children, useCallback, useEffect, useRef } from 'react'
import { app } from '../../../lib/firebase'
import useIsMounted from '../../hooks/useIsMounted'

const FirebaseAuthProvider = ({ children }) => {
  const isMounted = useIsMounted()

  const didSignInRef = useRef<boolean>(false)
  const onAuthStateChanged = useCallback((user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      console.log('User is signed in. User:', user.uid, user)
    } else {
      console.log('User is signed out. User:', user)
    }
  }, [])

  useEffect(() => {
    let unsubscribe

    if (isMounted && !didSignInRef.current) {
      didSignInRef.current = true
      const auth = app.auth()
      unsubscribe = auth.onAuthStateChanged(onAuthStateChanged)
      auth.signInAnonymously()
    }

    return unsubscribe
  }, [onAuthStateChanged, isMounted])

  return Children.only(children)
}
export default FirebaseAuthProvider
