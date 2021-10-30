import Head from 'next/head'
import React, { FC, useCallback, useRef } from 'react'
import Router from 'next/router'
import { useAuthUser } from '../components/providers/FirebaseAuthProvider'
import firebase from 'firebase/app'

function getVideoId (urlOrId: string): string | void {
  const urlMatch = urlOrId.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)

  if (urlMatch && urlMatch[2].length === 11) {
    return urlMatch[2]
  }
  const idMatch = urlOrId.match(/^[^#&?]{11}$/)

  if (idMatch) return idMatch[0]
}
const ID_SIZE = 4
const UNIQ_RETRIES = 100
const NO_UNIQ_MESSAGE = `Tried ${UNIQ_RETRIES} times to generate a unique party ID but failed. Too many users right now.`
const UNAMBIGUOUS_CHARS = 'ABCDEFGHJKMNPQRTUVWXYZ2346789'.split('')
const UNAMBIGUOUS_CHARS_LENGTH = UNAMBIGUOUS_CHARS.length

function generatePartyId (): string {
  let id = ''
  for (let i = 0; i < ID_SIZE; i ++) {
    // TODO: secure-random
    id += UNAMBIGUOUS_CHARS[Math.floor(Math.random() * UNAMBIGUOUS_CHARS_LENGTH)]
  }
  return id
}

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
        const partyIdAlreadyExists = (await firebase.database().ref(`parties/${randomPartyId}`).get()).exists()
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

      await firebase.database().ref(`parties/${partyId}`).set(partyUserUid)
      await Promise.all([
        firebase.database().ref(`party/${partyUserUid}/${partyId}/video`).set(videoId),
        firebase.database().ref(`party/${partyUserUid}/${partyId}/playing`).set(false),
        firebase.database().ref(`party/${partyUserUid}/${partyId}/seek`).set(0)
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
        <section className="px-24 py-12 bg-gray-900 rounded mb-8">
          <h1 className="text-xl p-4">Have a Watch Party code? Enter it here:</h1>
          <div className="max-w-xl w-screen">
            <form onSubmit={async (event) => {
              event.preventDefault()
              const partyId = joinInputRef.current && joinInputRef.current.value && joinInputRef.current.value.toUpperCase()
              const partyExists = !!partyId && (await firebase.database().ref(`parties/${partyId}`).get()).exists()

              if (partyExists) {
                Router.push(`/watch/${partyId}`)
              } else {
                alert('That code is invalid or expired. Try again!')
              }
            }}>
              <label className="flex flex-row justify-start gap-x-2 px-4 mb-4">
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
        <section className="px-16 py-8 bg-gray-800 rounded">
          <h1 className="text-xl p-4">Or, start a new Watch Party by pasting a YouTube link:</h1>
          <div className="max-w-xl w-screen">
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
