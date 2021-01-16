import { FC, useCallback, useEffect, useState } from "react"

type Props = {
  videoId: string,
  play: boolean,
  seek: number
}

const YoutubeVideoPlayer: FC<Props> = ({ videoId, play, seek }) => {
  const [player, setPlayer] = useState(null)

  useEffect(() => {
    if (!player) setPlayer(internalPlayer())
    return () => {}
  }, [])

  useEffect(() => {
    if(!player) return
    seek && seekTo(seek)
    !play ? handlePlay() : handlePause()
  }, [play, seek])

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

  const seekTo = (seekSeconds: number) => {
    player.seekTo(seekSeconds, true)
  }

  return <div id='youtube-video' />
}

export default YoutubeVideoPlayer
