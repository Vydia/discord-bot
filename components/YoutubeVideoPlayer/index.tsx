import { FC, useCallback, useEffect, useState } from "react"

type Props = {
  videoId: string,
  play: boolean
}

const YoutubeVideoPlayer: FC<Props> = ({ videoId, play }) => {
  const [player, setPlayer] = useState(null)

  useEffect(() => {
    if (!player) setPlayer(internalPlayer())
    if (play) {
      if(!player) return

      handlePlay()
    } else {
      if(!player) return

      handlePause()
    }
    return () => {}
  }, [play])

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
