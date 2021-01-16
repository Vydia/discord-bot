import { FC, useCallback, useEffect, useState } from 'react'
import firebase from 'firebase/app'
import { useObjectVal } from 'react-firebase-hooks/database'

type Props = {
  videoId: string,
  play: boolean,
  seek?: number
}

const YoutubeVideoPlayer: FC<Props> = ({ videoId, play, seek }) => {
  const [isPlaying] = useObjectVal(firebase.database().ref(`player/${videoId}/playing`))

  const internalPlayer = useCallback(() => new window.YT.Player('youtube-video', {
    height: '390',
    width: '640',
    playerVars: { 'autoplay': 1 },
    videoId,
    events: {
      onStateChange: ({ data, target }) => {
        switch(data) {
        case window.YT.PlayerState.PLAYING:
          if(!isPlaying) target.pauseVideo()
          break
        case YT.PlayerState.PAUSED:
          if(isPlaying) target.playVideo()
          break
        default:
          break
        }
      }
      // onReady: () => {
      //   firebase.database().ref(`player/${videoId}/playing`).set(!!isPlaying)
      // }
    }
  }), [videoId, isPlaying])

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

    play ? handlePlay() : handlePause()
    seek && handleSeekTo(seek)
  }, [play, player, seek, handlePause, handlePlay, handleSeekTo, internalPlayer])

  return <div id='youtube-video' />
}

export default YoutubeVideoPlayer
