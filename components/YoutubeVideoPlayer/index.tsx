import { FC, useCallback, useEffect, useState } from 'react'

type Props = {
  videoId: string,
  play: boolean,
  seek: number
}

const YouTubeVideoPlayer: FC<Props> = ({ videoId, play, seek }) => {
  const [player, setPlayer] = useState(null)

  useEffect(() => {
    if (!player) setPlayer(internalPlayer())
    return () => {
      setPlayer(null)
    }
  }, [player, setPlayer, internalPlayer])

  useEffect(() => {
    if(!player) return
    seek && seekTo(seek)
    play ? handlePlay() : handlePause()
  }, [play, seek, handlePause, handlePlay, seekTo, player])

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

  const seekTo = useCallback((seekSeconds: number) => {
    player.seekTo(seekSeconds, true)
  }, [player])

  return <div id='youtube-video' />
}

export default YouTubeVideoPlayer
