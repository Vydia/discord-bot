import { FC, useEffect, useMemo, useRef } from "react"
import load from 'load-script'

type Props = {
  videoId: string,

}

const YoutubeVideoPlayer: FC<Props> = ({ videoId }) => {
  useEffect(() => {
    load('https://www.youtube.com/iframe_api')
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady
    return () => {}
  }, [])

  const onPlayerStateChange = useMemo((event) => {
    console.warn('dan friggin idiot', event?.data)
  }, [])

  const player = useMemo(() => (
    new YT.Player(videoRef.current, {
      height: '390',
      width: '640',
      videoId,
      events: {
        'onStateChange': onPlayerStateChange,
      }
    })
  ), [videoId])

  const onYouTubeIframeAPIReady = () => {
    player()
  }

  const videoRef = useRef(null)

  const handlePause = () => {
    player.pauseVideo()
  }

  const handlePlay = () => {
    player.playVideo()
  }

  const seekTo = (seekSeconds: number) => {
    player.seekTo(seekSeconds, true)
  }

  return <div ref={(ref) => {
    videoRef.current = ref
  }}>

  </div>
}

export default YoutubeVideoPlayer
