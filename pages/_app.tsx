import React, { ReactElement } from 'react'
import type { AppProps } from 'next/app'
import '../lib/firebase'
import FirebaseAuthProvider from '../components/providers/FirebaseAuthProvider'
import 'tailwindcss/tailwind.css'
import { ToastProvider } from 'react-toast-notifications'

const MyApp = ({ Component, pageProps }: AppProps): ReactElement => {
  return <ToastProvider>
    <FirebaseAuthProvider>
      <Component {...pageProps} />
    </FirebaseAuthProvider>
  </ToastProvider>
}

export default MyApp
