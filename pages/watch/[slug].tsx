import { useRouter } from 'next/router'
import React, { FC } from 'react'
import YouTubeVideoPlayer from '../../components/YoutubeVideoPlayer'

const Watch: FC = () => {
  const { query,  } = useRouter()
  if (!query?.slug) return <div />

  return <WatchInner slug={query?.slug} />
}

type Props = {
  slug: string | string[]
}

const WatchInner: FC<Props> = ({ slug }) => {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-stars bg-black text-white">
      <div className="bg-black">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <YouTubeVideoPlayer videoId={slug as string} />
          </h2>
        </div>
      </div>
    </main>
  )
}

export default Watch
