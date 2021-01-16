import { FC, useCallback, useEffect, useState } from 'react'

type Props = {
  videoId: string,
  play: boolean,
  seek?: number
}

const YoutubeVideoPlayer: FC<Props> = ({ videoId, play, seek }) => {
  const internalPlayer = useCallback(() => new YT.Player('youtube-video', {
    height: '390',
    width: '640',
    videoId,
  }), [videoId])

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
