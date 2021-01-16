import { FC, useCallback, useEffect, useState } from 'react'
import firebase from 'firebase/app'
import { useObjectVal } from 'react-firebase-hooks/database'

type Props = {
  videoId: string
}

const setSeek = (value, slug) => {
  firebase.database().ref(`player/${slug}/seek`).set(value)
}

const YoutubeVideoPlayer: FC<Props> = ({ videoId }) => {
  const [isPlaying] = useObjectVal(firebase.database().ref(`player/${videoId}/playing`))
  const [seek] = useObjectVal(firebase.database().ref(`player/${videoId}/seek`))

  const internalPlayer = useCallback(() => new window.YT.Player('youtube-video', {
    height: '390',
    width: '640',
    playerVars: { 'autoplay': 1 },
    videoId,
    events: {
      onStateChange: ({ data, target }) => {
        switch(data) {
        case window.YT.PlayerState.PLAYING:
          setSeek(target.getCurrentTime(), videoId)
          // if(!isPlaying) target.pauseVideo()
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

    isPlaying ? handlePlay() : handlePause()
    seek && handleSeekTo(seek)
  }, [player,  handlePause, handlePlay, handleSeekTo, internalPlayer, isPlaying])

  return <div id='youtube-video' />
}

export default YoutubeVideoPlayer
