import { useRouter } from 'next/router'
import React, { FC } from 'react'
import YouTubeVideoPlayer from '../../components/YoutubeVideoPlayer'

const Watch: FC = () => {
  const { query } = useRouter()
  if (!query?.partyId) return <div />

  return <main className="relative flex flex-col items-center justify-center min-h-screen bg-stars bg-black text-white">
    <div className="bg-black w-full">
      <div className="max-w-7xl md:w-10/12 md:w-8/12 mx-auto py-12 px-4 sm:px-6 lg:py-2 lg:px-8 lg:flex lg:items-center lg:justify-between flex-col">
        <YouTubeVideoPlayer partyId={query?.partyId as string} />
      </div>
    </div>
  </main>
}

export default Watch
