import { useEffect, useRef } from 'react'
import { VotTracker } from '../client'

const customLog = (kind, msg, data) => {
  console.log('LOGGER =>', kind, msg, data)
}

if (process.browser) {
  window.addEventListener('error', function (event) {
    console.log('all errors', event)
  }, false)
}

const Index = () => {
  const playerRef = useRef(null)
  const client = new VotTracker("ws://localhost:4000/socket", {
    logger: customLog // debug: true
    // token
    // user_id
  })
  client.connect()

  const addSrcPlay = (src) => {
    playerRef.current.src = src
    playerRef.current.play()
  }

  useEffect(() => {

    client.initVideo({
      html_video_element_id: 'videoItem',
      video_id: '123',
      video_name: 'big bunny rabbit',
      video_type: 'vod', // live/vod
      category_name: 'a/b 1',
      sub_category_name: 'a/b 1 sub 1',
      // package_name
    })
    // document.getElementById('videoItem').src = 'test_video1.mp4'
  }, [])

  return (<div className={styles.main}>
    <button style={{margin: 12}} onClick={(e) => {
      addSrcPlay('test_video.mp4')
    }}>Play valid video</button>
    <button onClick={(e) => {
      addSrcPlay('test_video1.mp4')
    }}>Play 404 video</button>
    <br/>
    <video ref={playerRef} id='videoItem' controls style={{width: '80%', maxWidth: '600'}}></video>
  </div>)
}

export default Index;

const styles = {
  main: { margin: 0, padding: 0 }
}