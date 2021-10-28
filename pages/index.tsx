import Head from 'next/head'
import React, { FC, useCallback, useEffect, useRef } from 'react'
import Router from 'next/router'
import { app } from '../lib/firebase'
import useIsMounted from '../components/hooks/useIsMounted'

function getVideoId (urlOrId: string): string | void {
  const urlMatch = urlOrId.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)

  if (urlMatch && urlMatch[2].length === 11) {
    return urlMatch[2]
  }
  const idMatch = urlOrId.match(/^[^#&?]{11}$/)

  if (idMatch) return idMatch[0]
}

type Props = {
}

const Home: FC<Props> = () => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const isMounted = useIsMounted()

  const didSignInRef = useRef<boolean>(false)
  const onAuthStateChanged = useCallback((user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      console.log('User is signed in. User:', user)
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

  return (
    <div>
      <Head>
        <title>YouTube Party</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main className="relative flex flex-col items-center justify-center min-h-screen bg-stars bg-black text-white">
        <h1 className="text-xl p-4">Enter a YouTube link to start or join a Watch Party!</h1>
        <div className="max-w-xl w-screen">
          <form onSubmit={(event) => {
            event.preventDefault()
            const urlOrId = inputRef.current && inputRef.current.value
            if (!urlOrId) return

            const videoId = getVideoId(urlOrId)

            if (videoId) {
              Router.push(`/watch/${videoId}?hasControl=true`)
            } else {
              alert('Oops! Try entering a valid YouTube URL or Video ID this time.')
            }
          }}>
            <input className="block w-full my-4 p-4 bg-white text-black" placeholder="Paste YouTube link here" defaultValue="" ref={(c: HTMLInputElement) => inputRef.current = c} />
            <button className="block w-full p-4">Go</button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default Home
