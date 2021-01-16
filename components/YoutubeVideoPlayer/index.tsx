import { FC, useCallback, useEffect, useState } from "react"

type Props = {
  videoId: string,

}

const YoutubeVideoPlayer: FC<Props> = ({ videoId }) => {
  const [player, setPlayer] = useState(null)

  useEffect(() => {
    setPlayer(internalPlayer())
    return () => {}
  }, [])

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
