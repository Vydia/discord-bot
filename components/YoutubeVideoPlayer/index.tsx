import { FC, useCallback, useEffect, useState } from 'react'
import load from 'load-script'
type Props = {
  videoId: string,
  play: boolean,
  seek: number
}

const YouTubeVideoPlayer: FC<Props> = ({ videoId, play, seek }) => {
  const [player, setPlayer] = useState(null)

  useEffect(() => {
    load('https://www.youtube.com/iframe_api')
    if (!player) setPlayer(internalPlayer())
    return () => {
      setPlayer(null)
    }
  }, [player, setPlayer, internalPlayer])

  useEffect(() => {
    if(!player) return

    seek && handleSeekTo(seek)
    play ? handlePlay() : handlePause()
  }, [play, seek, handlePause, handlePlay, handleSeekTo, player])

  const internalPlayer = useCallback(() => new window['YT'].Player('youtube-video', {
    height: '390',
    width: '640',
    videoId,
  }), [videoId])

  const handlePause = useCallback(() => {
    player.pauseVideo()
  }, [player])

  const handlePlay = useCallback(() => {
    player.playVideo()
  }, [player])

  const handleSeekTo = useCallback((seekSeconds: number) => {
    player.seekTo(seekSeconds, true)
  }, [player])

  return <div id='youtube-video' />
}

export default YouTubeVideoPlayer
