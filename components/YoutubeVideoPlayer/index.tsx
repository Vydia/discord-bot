import { FC, useCallback, useEffect, useMemo, useRef } from "react"
import load from 'load-script'
import useIsMounted from "../hooks/useIsMounted"

type Props = {
  videoId: string,

}

const YoutubeVideoPlayer: FC<Props> = ({ videoId }) => {
  const isMounted = useIsMounted()

  useEffect(() => {
    if(!videoRef?.current) return
    load('https://www.youtube.com/iframe_api')
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady
    return () => {}
  }, [videoRef])

  const onPlayerStateChange = useMemo((event) => {
    console.warn('dan friggin idiot', event?.data)
  }, [])

  const player = useCallback(() => new YT.Player(videoRef.current, {
      height: '390',
      width: '640',
      videoId,
      events: {
        'onStateChange': onPlayerStateChange,
      }
    }), [videoId, videoRef])

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

  return <div ref={videoRef}>

  </div>
}

export default YoutubeVideoPlayer
