import Head from 'next/head'
import React, { FC, useCallback, useRef } from 'react'
import Router from 'next/router'
import { useAuthUser } from '../components/providers/FirebaseAuthProvider'
import { app } from '../lib/firebase'
import { coercePartyId, generatePartyId } from '../lib/generatePartyId'

function getVideoId (urlOrId: string): string | void {
  const urlMatch = urlOrId.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)

  if (urlMatch && urlMatch[2].length === 11) {
    return urlMatch[2]
  }
  const idMatch = urlOrId.match(/^[^#&?]{11}$/)

  if (idMatch) return idMatch[0]
}

const UNIQ_RETRIES = 100
const NO_UNIQ_MESSAGE = `Tried ${UNIQ_RETRIES} times to generate a unique party ID but failed. Too many users right now.`

type UseCreatePartyReturnType = {
  createParty: (videoId: string) => Promise<string>,
}

function useCreateParty (): UseCreatePartyReturnType {
  const user = useAuthUser()
  return {
    createParty: useCallback(async (videoId: string) => {
      const partyUserUid = user ? user.uid : null
      if (!partyUserUid) {
        alert('Pending authorization... Wait a few seconds then try again.')
      }
      let partyId: void | string

      for (let i = 0; i < UNIQ_RETRIES; i ++) {
        const randomPartyId = generatePartyId()
        // console.log(`Trying random Party ID: ${randomPartyId} (${i}/${UNIQ_RETRIES})`)
        const partyIdAlreadyExists = (await app.database().ref(`parties/${randomPartyId}`).get()).exists()
        // console.log('partyIdAlreadyExists', partyIdAlreadyExists)
        if (!partyIdAlreadyExists) {
          partyId = randomPartyId
          break
        }
      }

      if (!partyId) {
        alert(NO_UNIQ_MESSAGE)
        throw new Error(NO_UNIQ_MESSAGE)
      }

      await app.database().ref(`parties/${partyId}`).set(partyUserUid)
      await Promise.all([
        app.database().ref(`party/${partyUserUid}/${partyId}/video`).set(videoId),
        app.database().ref(`party/${partyUserUid}/${partyId}/playing`).set(false),
        app.database().ref(`party/${partyUserUid}/${partyId}/seek`).set(0)
      ])
      return partyId
    }, [user]),
  }
}

type Props = {
}

const Home: FC<Props> = () => {
  const newInputRef = useRef<HTMLInputElement | null>(null)
  const joinInputRef = useRef<HTMLInputElement | null>(null)
  const { createParty } = useCreateParty()

  return (
    <div>
      <Head>
        <title>YouTube Party</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main className="relative flex flex-col items-center justify-center min-h-screen bg-stars bg-gray-300 text-white">
        <section className="max-w-full w-full sm:w-auto px-4 md:px-24 py-2 md:py-12 bg-gray-900 rounded mb-8">
          <h1 className="max-w-xl text-xl p-4">Have a Watch Party code? Enter it here:</h1>
          <div className="max-w-xl">
            <form onSubmit={async (event) => {
              event.preventDefault()
              const partyId = coercePartyId(joinInputRef.current && joinInputRef.current.value)
              if (partyId) {
                if ((await app.database().ref(`parties/${partyId}`).get()).exists()) {
                  Router.push(`/watch/${partyId}`)
                } else {
                  alert('That code is invalid or expired. Try again!')
                }
              } else {
                alert('Oops! Party codes are four (4) characters long and consist of letters and numbers only. For example: XZ4F')
              }
            }}>
              <label className="flex flex-row max-w-full justify-start gap-x-2 px-4 mb-4">
                <div>
                  <input className="p-4 bg-white text-black" placeholder="e.g. XZ4F" defaultValue="" ref={(c: HTMLInputElement) => joinInputRef.current = c} />
                </div>
                <div>
                  <button className="p-4 bg-gray-600">Join Party</button>
                </div>
              </label>
            </form>
          </div>
        </section>
        <section className="max-w-full w-full sm:w-auto px-4 md:px-24 py-2 md:py-12 bg-gray-800 rounded mb-8">
          <h1 className="max-w-xl text-xl p-4">Or, start a new Watch Party by pasting a YouTube link:</h1>
          <div className="max-w-xl">
            <form onSubmit={async (event) => {
              event.preventDefault()
              const urlOrId = newInputRef.current && newInputRef.current.value
              const videoId = urlOrId && getVideoId(urlOrId)

              if (videoId) {
                const partyId = await createParty(videoId)
                Router.push(`/watch/${partyId}`)
              } else {
                alert('Enter a valid YouTube URL or YouTube Video ID then try again.')
              }
            }}>
              <label className="flex flex-row justify-start gap-x-2 px-4 mb-4">
                <div>
                  <input className="p-4 bg-white text-black" placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ" defaultValue="" ref={(c: HTMLInputElement) => newInputRef.current = c} />
                </div>
                <div>
                  <button className="p-4 bg-gray-600">Create Party</button>
                </div>
              </label>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home
