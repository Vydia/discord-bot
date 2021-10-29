import React, { createContext, Children, useContext, useEffect, useRef, useState } from 'react'
import { app } from '../../../lib/firebase'
import useIsMounted from '../../hooks/useIsMounted'

type UserType = {
  uid: string,
}
const AuthContext = createContext<void | UserType>(null)

export const useAuthUser = () => {
  return useContext(AuthContext)
}

const FirebaseAuthProvider = ({ children }) => {
  const isMounted = useIsMounted()

  const didSignInRef = useRef<boolean>(false)
  const [user, setUser] = useState<void | UserType>(null)

  useEffect(() => {
    let unsubscribe

    if (isMounted && !didSignInRef.current) {
      didSignInRef.current = true
      const auth = app.auth()
      unsubscribe = auth.onAuthStateChanged((newUser: void | UserType) => {
        if (newUser) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          // console.log('User is signed in. User:', newUser.uid, newUser)
          setUser(newUser)
        } else {
          // console.log('User is signed out. User:', newUser)
          setUser(null)
        }
      })
      auth.signInAnonymously()
    }

    return unsubscribe
  }, [isMounted])

  return (<AuthContext.Provider value={user}>
    { Children.only(children) }
  </AuthContext.Provider>)
}
export default FirebaseAuthProvider
