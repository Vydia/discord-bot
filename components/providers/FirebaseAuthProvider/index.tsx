import React, { createContext, Children, FC, useContext, useEffect, useRef, useState } from 'react'
import { app, User } from '../../../lib/firebase'
import useIsMounted from '../../hooks/useIsMounted'

const AuthContext = createContext<void | User>(undefined)

export const useAuthUser = () => {
  return useContext(AuthContext)
}

type Props = {
  children: JSX.Element,
}

const FirebaseAuthProvider: FC<Props> = ({ children }) => {
  const isMounted = useIsMounted()

  const didSignInRef = useRef<boolean>(false)
  const [user, setUser] = useState<void | User>(undefined)

  useEffect(() => {
    let unsubscribe

    if (isMounted && !didSignInRef.current) {
      didSignInRef.current = true
      const auth = app.auth()
      unsubscribe = auth.onAuthStateChanged((newUser) => {
        if (newUser) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          // console.log('User is signed in. User:', newUser.uid, newUser)
          setUser(newUser)
        } else {
          // console.log('User is signed out. User:', newUser)
          setUser(undefined)
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
