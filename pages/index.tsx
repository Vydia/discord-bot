import Head from 'next/head'
import React, { FC } from 'react'

type Props = {
}

const Home: FC<Props> = () => {
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
        Hello!
      </main>
    </div>
  )
}

export default Home
