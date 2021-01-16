import Head from 'next/head'
import React, { FC, useRef } from 'react'
import Router from 'next/router'

function getVideoId (url: string): string | void {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)

  if (match && match[2].length === 11) {
    return match[2]
  }
}

type Props = {
}

const Home: FC<Props> = () => {
  const inputRef = useRef<HTMLInputElement>(null)

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
            const url = inputRef.current.value
            if (!url) return

            const videoId = getVideoId(url)

            if (videoId) {
              Router.push(`/watch/${videoId}`)
            } else {
              alert('Oops! Try entering a valid YouTube URL this time.')
            }
          }}>
            <input className="block w-full my-4 p-4" placeholder="Paste YouTube link here" defaultValue="" ref={(c: HTMLInputElement) => inputRef.current = c} />
            <button className="block w-full p-4">Go</button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default Home
