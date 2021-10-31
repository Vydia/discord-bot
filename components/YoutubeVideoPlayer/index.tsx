import { FC, useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { app } from '../../lib/firebase'
import { useObjectVal } from 'react-firebase-hooks/database'
import { useToasts } from 'react-toast-notifications'
import useInterval from '../hooks/useInterval'
import { useAuthUser } from '../providers/FirebaseAuthProvider'

type Props = {
  partyId: string
}

const height = 390
const width = 640
const ROUGH_ATTENDEE_SEEK_DELAY_MS = 500
const ROUGH_PLAYER_LOAD_DELAY_MS = 1000

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

function useSharedPlayerState (partyId: string): {
  hasControl: boolean,
  isPlaying: void | boolean,
  isPlayingRef: { current: void | boolean },
  seekRef: { current: void | number },
  seek: void | number,
  setSeek: (seek: number) => void,
  setIsPlaying: (isPlaying: boolean) => void,
  videoId: void | string,
} {
  const user = useAuthUser()
  const [partyUserUid] = useObjectVal(app.database().ref(`parties/${partyId}`))
  const [videoId] = useObjectVal<void | string>(app.database().ref(`party/${partyUserUid}/${partyId}/video`))
  const [isPlaying] = useObjectVal<void | boolean>(app.database().ref(`party/${partyUserUid}/${partyId}/playing`))
  const [seek] = useObjectVal<void | number>(app.database().ref(`party/${partyUserUid}/${partyId}/seek`))
  const isPlayingRef = useRef<void | boolean>(isPlaying)
  const seekRef = useRef<void | number>(seek)

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    seekRef.current = Number(seek)
  }, [seek])

  const hasControl = !!(user && user.uid === partyUserUid)

  return {
    hasControl,
    isPlaying,
    isPlayingRef,
    seek,
    seekRef,
    setSeek: useCallback((seek: number) => { app.database().ref(`party/${partyUserUid}/${partyId}/seek`).set(seek) }, [partyUserUid, partyId]),
    setIsPlaying: useCallback((isPlaying: boolean) => { app.database().ref(`party/${partyUserUid}/${partyId}/playing`).set(isPlaying) }, [partyUserUid, partyId]),
    videoId,
  }
}

const YoutubeVideoPlayer: FC<Props> = ({ partyId }) => {
  const { addToast } = useToasts()
  const {
    videoId,
    hasControl,
    isPlaying,
    isPlayingRef,
    seek,
    seekRef,
    setSeek,
    setIsPlaying,
  } = useSharedPlayerState(partyId)

  const youTubeIframeAPIReady = useYouTubeIframeAPIReady()
  const [playerState, setPlayerState] = useState<number>(-2)

  const internalPlayer = useCallback((videoId: string) => new window.YT.Player('youtube-video', {
    height: `${height}`,
    width: `${width}`,
    videoId,
    events: {
      onReady: ({ target }) => {
        setTimeout(() => {
          if (!hasControl) {
            if (isPlayingRef.current) {
              target.playVideo()
            } else {
              target.pauseVideo()
            }
          }
          if (seekRef.current) target.seekTo(seekRef.current + (ROUGH_ATTENDEE_SEEK_DELAY_MS / 1000), true)
        }, ROUGH_PLAYER_LOAD_DELAY_MS)
      },
      onStateChange: ({ data, target }) => {
        switch(data) {
        case window.YT.PlayerState.PLAYING:
          setPlayerState(data)
          if (hasControl) {
            setSeek(target.getCurrentTime())
            setIsPlaying(true)
          } else {
            // Prevent attendees from playing their local video on their own.
            if (!isPlayingRef.current) target.pauseVideo()
          }
          break
        case window.YT.PlayerState.PAUSED:
          setPlayerState(data)
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
  }), [hasControl, setSeek, setIsPlaying, isPlayingRef, seekRef])

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
    if(!player && videoId) setPlayer(internalPlayer(videoId))

    if (hasControl) return

    isPlaying ? handlePlay() : handlePause()
  }, [youTubeIframeAPIReady, player, handlePause, handlePlay, internalPlayer, isPlaying, hasControl, videoId])

  // Auto-seek. Helps new attendees join and catch up from where the video is, without the host having to stop and start the video and update seek that way.
  useEffect(() => {
    if (seek) handleSeekTo(seek + (ROUGH_ATTENDEE_SEEK_DELAY_MS / 1000))
  }, [handleSeekTo, seek])

  useInterval(
    () => {
      if (hasControl && isPlaying && player?.getCurrentTime) setSeek(player?.getCurrentTime())
    },
    // Update seek every 1 second. Or null to disable interval.
    hasControl && isPlaying && player?.getCurrentTime ? 1000 : null,
  )

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
        <h3 className="p-4">You are host of party <strong>{partyId}</strong></h3>
        <button
          onClick={handleCopyLink}
          className="m-2 flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Copy Share Link
        </button>
      </> : <div>
        <h3 className="p-4">Someone else is host of party <strong>{partyId}</strong></h3>
      </div> }
    </div>
    { /* https://stackoverflow.com/a/49887085/2696867 */ }
    <style dangerouslySetInnerHTML={{__html: `
      .video-container {
        position: relative;
        overflow: hidden;
        height: 0;
        padding-bottom: 56.25%; /* creates a 16:9 aspect ratio */
      }

      .video-container iframe,
      .video-container embed {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        max-width: 100%;
      }

      .video-wrap {
        width: 100%;
      }
    `}} />
    <div className='video-wrap'>
      <div className='video-container'>
        <div id='youtube-video' />
      </div>
    </div>

    {
      hasControl ? <div className="p-4">
        <p>As host, when you play/pause the video or seek to a new timestamp, all attendees watching also do the same.</p>
      </div> : <div className="p-4">
        { !youTubeIframeAPIReady
          ? 'Loading...'
          : playerState === window.YT.PlayerState.PLAYING
            ? <p>{'The host is playing the video for all attendees.'}</p>
            : playerState === window.YT.PlayerState.PAUSED
              ? <p>{'The host has paused the video for all attendees.'}</p>
              : <p>{`Click on the video until it loads (${ isPlaying ? 'Host is playing video' : 'Host has paused video' }).`}</p>}
      </div>
    }
  </>
}

export default YoutubeVideoPlayer
