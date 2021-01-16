import { useRouter } from 'next/router'
import React, { FC } from 'react'
import YouTubeVideoPlayer from '../../components/YoutubeVideoPlayer'
import firebase from 'firebase/app'
import { useObjectVal } from 'react-firebase-hooks/database'


const Watch: FC = () => {
  const { query } = useRouter()
  if (!query?.slug) return <div />

  return <WatchInner slug={query?.slug} />
}

type Props = {
  slug: string
}

const WatchInner: FC<Props> = ({ slug }) => {
  const [isPlaying] = useObjectVal(firebase.database().ref(`player/${slug}/playing`))

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-stars bg-black text-white">
      <div className="bg-black">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <YouTubeVideoPlayer
              videoId={slug as string}
              play={!!isPlaying}
              seek={10}
            />
          </h2>
          {/* <div className="mt-8 lex lg:mt-0 ml-8 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow"></div>
              <button
                onClick={() =>
                  firebase.database().ref(`player/${slug}/playing`).set(!isPlaying)
                }
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {
                  !isPlaying ? 'Watch Now' : 'Pause'
                }
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </main>
  )
}

export default Watch
