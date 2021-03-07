import  { Socket } from 'phoenix-channels'
import { useEffect } from 'react'
// import { w3cwebsocket as W3CWebSocket } from "websocket";
import { VotTracker } from '../client'
import platform from 'platform'

const customLog = (kind, msg, data) => {
  console.log('LOGGER =>', kind, msg, data)
}

if (process.browser) {
  window.addEventListener('error', function (event) {
    console.log('all errors', event)
  }, false)
}

const Index = () => {
  const client = new VotTracker("ws://localhost:4000/socket", {
    logger: customLog // debug: true
    // token
    // user_id
  })
  client.connect()

  // setTimeout(() => {
  //   client.push({a: 2})
  // }, 5000)

  useEffect(() => {

    client.initVideo({
      html_video_element_id: 'videoItem',
      video_id: 'abc',
      video_name: 'big bunny rabbit',
      video_type: 'vod', // live/vod
      category_name: 'a/b 1',
      sub_category_name: 'a/b 1 sub 1',
      // package_name
    })
    document.getElementById('videoItem').src = 'test_video1.mp4'
  }, [])

  return (<>
    <video id="videoItem" controls style={{width: '80%', maxWidth: '600'}}></video>
  </>)
}

export default Index;