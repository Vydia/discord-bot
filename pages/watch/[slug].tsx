import { useRouter } from 'next/router'
import React, { FC } from 'react'
import YoutubeVideoPlayer from '../../components/YoutubeVideoPlayer'

type Props = {
}

const Watch: FC<Props> = () => {
  const { query } = useRouter()
  if (!query?.slug) return <div />

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-stars bg-black text-white">
        <div class="bg-black">
          <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              <YoutubeVideoPlayer videoId={query.slug} />
            </h2>
            <div class="mt-8 lex lg:mt-0 ml-8 lg:flex-shrink-0">
              <div class="inline-flex rounded-md shadow">
                <a href="#" class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                  Watch Now
                </a>
              </div>
            </div>
          </div>
        </div>
    </main>
  )
}

export default Watch
