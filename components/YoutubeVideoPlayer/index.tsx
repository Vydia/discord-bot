import { FC, useCallback, useEffect, useState } from 'react'
import firebase from 'firebase/app'
import { useObjectVal } from 'react-firebase-hooks/database'

type Props = {
  videoId: string,
  play: boolean,
  seek?: number
}

const YoutubeVideoPlayer: FC<Props> = ({ videoId, play, seek }) => {
  const [value] = useObjectVal(firebase.database().ref(`player/${videoId}`))
  const isPaused = !!(value && !value['playing'])

  const internalPlayer = useCallback(() => new YT.Player('youtube-video', {
    height: '390',
    width: '640',
    playerVars: { 'autoplay': 1 },
    videoId,
    events: {
      onReady: () => {
        firebase.database().ref(`player/${videoId}`).set({
          'playing': !isPaused,
        })
      }
    }
  }), [videoId, isPaused])

  const [player, setPlayer] = useState(null)

  const handlePause = useCallback(() => {
    if(!player?.pauseVideo) return
    player.pauseVideo()
  }, [player])

  const handlePlay = useCallback(() => {
    if(!player?.playVideo) return
    player.playVideo()
  }, [player])

  const handleSeekTo = useCallback((seekSeconds: number) => {
    if(!player?.seekTo) return
    player.seekTo(seekSeconds, true)
  }, [player])

  useEffect(() => {
    if(!player) setPlayer(internalPlayer())
    // console.warn(player)
    play ? handlePlay() : handlePause()
    seek && handleSeekTo(seek)
  }, [play, player, seek, handlePause, handlePlay, handleSeekTo, internalPlayer])

  return <div id='youtube-video' />
}

export default YoutubeVideoPlayer
