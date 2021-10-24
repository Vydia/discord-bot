import { FC, useCallback, useEffect, useRef, useState, useMemo } from 'react'
import firebase from 'firebase/app'
import { useObjectVal } from 'react-firebase-hooks/database'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'
import useInterval from '../hooks/useInterval'

type Props = {
  videoId: string
}

const height = 390
const width = 640
const ROUGH_ATTENDEE_SEEK_DELAY_MS = 500
const ROUGH_PLAYER_LOAD_DELAY_MS = 1000
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
  isPlayingRef: { current: boolean },
  seekRef: { current: number },
  seek: number,
  setSeek: (seek: number) => void,
  setIsPlaying: (isPlaying: boolean) => void,
} {
  const [isPlaying] = useObjectVal(firebase.database().ref(`player/${videoId}/playing`))
  const [seek] = useObjectVal(firebase.database().ref(`player/${videoId}/seek`))
  const isPlayingRef = useRef<boolean>(!!isPlaying)
  const seekRef = useRef<number>(Number(seek))

  useEffect(() => {
    isPlayingRef.current = !!isPlaying
  }, [isPlaying])

  useEffect(() => {
    seekRef.current = Number(seek)
  }, [seek])

  return {
    isPlaying: !!isPlaying,
    isPlayingRef,
    seek: Number(seek),
    seekRef,
    setSeek: useCallback((seek: number) => { firebase.database().ref(`player/${videoId}/seek`).set(seek) }, [videoId]),
    setIsPlaying: useCallback((isPlaying: boolean) => { firebase.database().ref(`player/${videoId}/playing`).set(isPlaying) }, [videoId]),
  }
}

const YoutubeVideoPlayer: FC<Props> = ({ videoId }) => {
  const router = useRouter()
  const { hasControl } = router.query
  const { addToast } = useToasts()
  const {
    isPlaying,
    isPlayingRef,
    seek,
    seekRef,
    setSeek,
    setIsPlaying,
  } = useSharedPlayerState(videoId)
  const youTubeIframeAPIReady = useYouTubeIframeAPIReady()

  const internalPlayer = useCallback(() => new window.YT.Player('youtube-video', {
    height: `${height}`,
    width: `${width}`,
    videoId,
    events: {
      onReady: ({ target }) => {
        setTimeout(() => {
          if (hasControl) {
            if (!seekRef.current) setSeek(target.getCurrentTime())
            setIsPlaying(false)
            target.pauseVideo()
          } else {
            if (isPlayingRef.current) {
              target.playVideo()
            } else {
              target.pauseVideo()
            }
          }
          target.seekTo(seekRef.current + (ROUGH_ATTENDEE_SEEK_DELAY_MS / 1000), true)
        }, ROUGH_PLAYER_LOAD_DELAY_MS)
      },
      onStateChange: ({ data, target }) => {
        switch(data) {
        case window.YT.PlayerState.PLAYING:
          if (hasControl) {
            setSeek(target.getCurrentTime())
            setIsPlaying(true)
          } else {
            // Prevent attendees from playing their local video on their own.
            if (!isPlayingRef.current) target.pauseVideo()
          }
          break
        case window.YT.PlayerState.PAUSED:
          if (hasControl) {
            setIsPlaying(false)
          } else {
            // Prevent attendees from pausing their local video on their own.
            if (isPlayingRef.current) target.playVideo()
          }
          break
        default:
          break
        }
      },
    }
  }), [videoId, hasControl, setSeek, setIsPlaying, isPlayingRef, seekRef])

  const [player, setPlayer] = useState(null)

  const handlePause = useCallback(() => {
    if(!player?.pauseVideo) return
    player.pauseVideo()
  }, [player])

  const handleSeekTo = useCallback((to: void | number = undefined) => {
    if (hasControl || !player?.getCurrentTime || !player?.seekTo) return
    if (!to) to = seekRef.current
    if (!to) return

    // Only seek if desired seek position is at least 1 second away from current location.
    if (Math.abs(to - player.getCurrentTime()) < 1) return

    !hasControl && player.seekTo(to, true)
  }, [player, seekRef, hasControl])

  const handlePlay = useCallback(() => {
    if(!player?.playVideo) return
    seek && !hasControl && handleSeekTo()
    player.playVideo()
  }, [player, seek, hasControl, handleSeekTo])

  useEffect(() => {
    if(!youTubeIframeAPIReady) return
    if(!player) setPlayer(internalPlayer())

    if (hasControl) return

    isPlaying ? handlePlay() : handlePause()
  }, [youTubeIframeAPIReady, player, handlePause, handlePlay, internalPlayer, isPlaying, hasControl])

  // Auto-seek. Helps new attendees join and catch up from where the video is, without the host having to stop and start the video and update seek that way.
  useEffect(() => {
    handleSeekTo(seek + (ROUGH_ATTENDEE_SEEK_DELAY_MS / 1000))
  }, [handleSeekTo, seek])

  useInterval(
    () => {
      if (hasControl && isPlaying && player?.getCurrentTime) setSeek(player?.getCurrentTime())
    },
    // Update seek every 1 second. Or null to disable interval.
    hasControl && isPlaying && player?.getCurrentTime ? 1000 : null,
  )

  // TODO: Remove debugging
  // useInterval(
  //   () => {
  //     console.log('player', player, player?.getPlayerState())
  //   },
  //   1000,
  // )

  const shareLink = useMemo(() => location.protocol + '//' + location.host + location.pathname, [])
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareLink)
    addToast(
      'Link Copied to clipboard. Send the link to everyone who wants to watch along with you!',
      {
        appearance: 'success',
        position: 'bottom-center',
        autoDismiss: true,
      }
    )
  }, [addToast, shareLink])

  return <>
    <div className="flex items-center">
      { hasControl ? <>
        <h3>You are host</h3>
        <button
          onClick={handleCopyLink}
          className="m-2 flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Click to Copy Share Link
        </button>
      </> : <div>
        <h3>{'Someone else is host.'}</h3>
      </div> }
    </div>
    <div id='youtube-video' style={PLAYER_STYLE} />

    {
      hasControl ? <div>
        <p>As host, when you play or pause the video, or seek to a new timestamp, all attendees watching do the same!</p>
      </div> : <div>
        <p>{'If the video doesn\'t start, click on the video player until it loads.'}</p>
        <p>{'If that doesn\'t work, it probably means the host has paused the video for everyone.'}</p>
      </div>
    }
  </>
}

export default YoutubeVideoPlayer
