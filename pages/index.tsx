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
  const inputRef = useRef<HTMLInputElement | null>(null)
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

      <main className="relative flex flex-col items-center justify-center min-h-screen bg-stars bg-black text-white">
        <h1 className="text-xl p-4">Enter a YouTube link to start or join a Watch Party!</h1>
        <div className="max-w-xl w-screen">
          <form onSubmit={async (event) => {
            event.preventDefault()
            const urlOrId = inputRef.current && inputRef.current.value
            if (!urlOrId) return

            const videoId = getVideoId(urlOrId)

            if (videoId) {
              const partyId = await createParty(videoId)
              Router.push(`/watch/${partyId}?hasControl=true`) // TODO: Use resulting user.uid from parties/:id in firebase to determine if user has control or not.
            } else {
              alert('Enter a valid YouTube URL or YouTube Video ID then try again.')
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
