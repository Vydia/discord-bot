import { FC, useCallback, useEffect, useState, useMemo } from 'react'
import firebase from 'firebase/app'
import { useObjectVal } from 'react-firebase-hooks/database'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'

type Props = {
  videoId: string
}

const height = 390
const width = 640
const PLAYER_STYLE = { height: `${height}px`, width: `${width}px` }

const useYouTubeIframeAPIReady = (): boolean => {
  const [isReady, setIsReady] = useState<boolean>(false)

  useEffect(() => {
    if (window.YT.Player) {
      setIsReady(true)
      return
    }

    window['onYouTubeIframeAPIReady'] = () => {
      setIsReady(true)
    }

    return () => {
      delete window['onYouTubeIframeAPIReady']
    }
  }, [setIsReady])

  return isReady
}

function useSharedPlayerState (videoId: string): {
  isPlaying: boolean,
  seek: number,
  setSeek: (seek: number) => void,
  setIsPlaying: (isPlaying: boolean) => void,
} {
  const [isPlaying] = useObjectVal(firebase.database().ref(`player/${videoId}/playing`))
  const [seek] = useObjectVal(firebase.database().ref(`player/${videoId}/seek`))

  return {
    isPlaying: !!isPlaying,
    seek: Number(seek),
    setSeek: useCallback((seek: number) => { firebase.database().ref(`player/${videoId}/seek`).set(seek) }, [videoId]),
    setIsPlaying: useCallback((isPlaying: boolean) => { firebase.database().ref(`player/${videoId}/playing`).set(isPlaying) }, [videoId]),
  }
}

const YoutubeVideoPlayer: FC<Props> = ({ videoId }) => {
  const router = useRouter()
  const { hasControl } = router.query
  const { addToast } = useToasts()
  const { isPlaying, seek, setSeek, setIsPlaying } = useSharedPlayerState(videoId)
  const youTubeIframeAPIReady = useYouTubeIframeAPIReady()

  const desiredSeek = useMemo(() => seek, [seek])

  const internalPlayer = useCallback(() => new window.YT.Player('youtube-video', {
    height: `${height}`,
    width: `${width}`,
    videoId,
    events: {
      onStateChange: ({ data, target }) => {
        switch(data) {
        case window.YT.PlayerState.PLAYING:
          // TODO: Do we even need this?
          // if(!isPlaying) target.pauseVideo()
          hasControl && setSeek(target.getCurrentTime())
          break
        case window.YT.PlayerState.PAUSED:
          if(isPlaying) target.playVideo()
          break
        default:
          break
        }
      }
      // TODO: Do we even need this?
      // onReady: () => {
      //   firebase.database().ref(`player/${videoId}/playing`).set(!!isPlaying)
      // }
    }
  }), [videoId, hasControl, setSeek, isPlaying])

  const [player, setPlayer] = useState(null)

  const handlePause = useCallback(() => {
    if(!player?.pauseVideo) return
    player.pauseVideo()
  }, [player])

  const handleSeekTo = useCallback(() => {
    if(!player?.seekTo) return

    !hasControl && player.seekTo(desiredSeek, true)
  }, [player, desiredSeek, hasControl])

  const handlePlay = useCallback(() => {
    if(!player?.playVideo) return
    console.warn('play')
    seek && !hasControl && handleSeekTo()
    player.playVideo()
  }, [player, seek, hasControl, handleSeekTo])

  useEffect(() => {
    if(!youTubeIframeAPIReady) return
    if(!player) setPlayer(internalPlayer())

    isPlaying ? handlePlay() : handlePause()
  }, [youTubeIframeAPIReady, player, handlePause, handlePlay, internalPlayer, isPlaying])

  useEffect(() => {
    desiredSeek && handleSeekTo()
  }, [desiredSeek, handleSeekTo])

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(location.protocol + '//' + location.host + location.pathname)
    addToast(
      'Copied URL to clipboard successfully!',
      {
        appearance: 'success',
        position: 'bottom-center',
        autoDismiss: true,
      }
    )
  }, [addToast])

  const handlePlayPause = useCallback(() =>
    setIsPlaying(!isPlaying)
  , [isPlaying, setIsPlaying])

  return <>
    <div id='youtube-video' style={PLAYER_STYLE} />
    <div className="mt-8 lex lg:mt-0 ml-8 lg:flex-shrink-0">
      { hasControl &&
        <div className="inline-flex rounded-md shadow">
          <button
            onClick={handlePlayPause}
            className="m-2 inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {
              !isPlaying ? 'Play' : 'Pause'
            }
          </button>
          <button
            onClick={handleCopyLink}
            className="m-2 inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Copy Link
          </button>
        </div>
      }
    </div>
  </>
}

export default YoutubeVideoPlayer
