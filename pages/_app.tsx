import React, { ReactElement } from 'react'
import type { AppProps } from 'next/app'
import 'tailwindcss/tailwind.css'
import firebase from 'firebase/app'
import 'firebase/database'
import { config } from '../firebaseConfig'
import { ToastProvider } from 'react-toast-notifications'

if (!firebase.apps.length) {
  firebase.initializeApp(config)
} else {
  firebase.app()
}

const MyApp = ({ Component, pageProps }: AppProps): ReactElement => {
  return <ToastProvider>
    <Component {...pageProps} />
  </ToastProvider>
}

export default MyApp
