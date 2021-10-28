import React, { ReactElement } from 'react'
import type { AppProps } from 'next/app'
import '../lib/firebase'
import 'tailwindcss/tailwind.css'
import { ToastProvider } from 'react-toast-notifications'

const MyApp = ({ Component, pageProps }: AppProps): ReactElement => {
  return <ToastProvider>
    <Component {...pageProps} />
  </ToastProvider>
}

export default MyApp
