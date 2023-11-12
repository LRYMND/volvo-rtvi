/* eslint-disable no-case-declarations */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { RotatingLines } from 'react-loader-spinner'
import {
  findDevice,
  requestDevice,
  DongleConfig,
  CommandMapping,
} from 'node-carplay/web'
import { CarPlayWorker } from './worker/types'
import useCarplayAudio from './useCarplayAudio'
import { useCarplayTouch } from './useCarplayTouch'
import { InitEvent, RenderEvent } from './worker/render/RenderEvents'

import "./../../themes.scss"
import './carplay.scss';

const width = window.innerWidth
const height = window.innerHeight

const config: Partial<DongleConfig> = {
  width,
  height,
  fps: 60,
  mediaDelay: 300,
}

const RETRY_DELAY_MS = 30000


function Carplay({ applicationSettings, setPhoneState, setCarplayState, view, setView }) {
  const [receivingVideo, setReceivingVideo] = useState(false)
  const [isPlugged, setIsPlugged] = useState(false)
  const [deviceFound, setDeviceFound] = useState<Boolean | null>(null)

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(
    null,
  )

  useEffect(() => {
    console.log("Application.tsx: ", applicationSettings)
  }, []);

  const renderWorker = useMemo(() => {
    if (!canvasElement) return;

    const worker = new Worker(
      new URL('./worker/render/Render.worker.ts', import.meta.url), {
      type: 'module'
    }
    )
    const canvas = canvasElement.transferControlToOffscreen()
    // @ts-ignore
    worker.postMessage(new InitEvent(canvas), [canvas])
    return worker
  }, [canvasElement]);

  useLayoutEffect(() => {
    if (canvasRef.current) {
      setCanvasElement(canvasRef.current)
    }
  }, [])

  const carplayWorker = useMemo(
    () =>
      new Worker(
        new URL('./worker/CarPlay.worker.ts', import.meta.url), {
        type: 'module'
      }
      ) as CarPlayWorker,
    [],
  )

  const { processAudio, startRecording, stopRecording } =
    useCarplayAudio(carplayWorker)

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  // subscribe to worker messages
  useEffect(() => {
    carplayWorker.onmessage = ev => {
      const { type } = ev.data
      switch (type) {
        case 'plugged':
          setIsPlugged(true)
          setPhoneState(true)
          break
        case 'unplugged':
          setIsPlugged(false)
          setPhoneState(false)
          setCarplayState(false)
          break
        case 'video':
          // if document is hidden we dont need to feed frames
          if (!renderWorker || document.hidden) return
          if (!receivingVideo) {
            setReceivingVideo(true)
            setCarplayState(true)
          }
          clearRetryTimeout()

          const { message: video } = ev.data
          renderWorker.postMessage(new RenderEvent(video.data), [
            video.data.buffer,
          ])

          break
        case 'audio':
          clearRetryTimeout()

          const { message: audio } = ev.data
          processAudio(audio)
          break
        case 'media':
          //TODO: implement
          break
        case 'command':
          const {
            message: { value },
          } = ev.data
          switch (value) {
            case CommandMapping.startRecordAudio:
              startRecording()
              break
            case CommandMapping.stopRecordAudio:
              stopRecording()
              break
            case CommandMapping.requestHostUI:
              console.log("minimizing carplay")
              setView("Dashboard")
          }
          break
        case 'failure':
          if (retryTimeoutRef.current == null) {
            console.error(
              `Carplay initialization failed -- Reloading page in ${RETRY_DELAY_MS}ms`,
            )
            retryTimeoutRef.current = setTimeout(() => {
              window.location.reload()
            }, RETRY_DELAY_MS)
          }
          break
      }
    }
  }, [
    carplayWorker,
    clearRetryTimeout,
    processAudio,
    receivingVideo,
    renderWorker,
    startRecording,
    stopRecording,
  ])

  const checkDevice = useCallback(
    async (request: boolean = false) => {
      const device = request ? await requestDevice() : await findDevice()
      if (device) {
        setDeviceFound(true)
        carplayWorker.postMessage({ type: 'start', payload: config })
      } else {
        setDeviceFound(false)
      }
    },
    [carplayWorker],
  )

  // usb connect/disconnect handling and device check
  useEffect(() => {
    navigator.usb.onconnect = async () => {
      checkDevice()
    }

    navigator.usb.ondisconnect = async () => {
      const device = await findDevice()
      if (!device) {
        carplayWorker.postMessage({ type: 'stop' })
        setDeviceFound(false)
      }
    }

    checkDevice()
  }, [carplayWorker, checkDevice])

  const onClick = useCallback(() => {
    checkDevice(true)
  }, [checkDevice])

  const sendTouchEvent = useCarplayTouch(carplayWorker, width, height)

  const isLoading = !receivingVideo || !isPlugged

  return (
    <div
      style={{ height: '100%', width: '100%', touchAction: 'none' }}
      id={'main'}
      className={`app ${applicationSettings.app.colorTheme.value}`}
    >
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {deviceFound === false && (
            <>

              <button className="custom-button" onClick={onClick} style={{ fill: 'var(--fillActive)' }}>
                <h3>Connect or click to pair dongle.</h3>
                <svg xmlns="http://www.w3.org/2000/svg" className="navbar__icon">
                  <use xlinkHref="./svg/link.svg#link"></use>
                </svg>
              </button>
            </>
          )}
          {deviceFound === true && view === "Carplay" && (
            <RotatingLines
              strokeColor="grey"
              strokeWidth="5"
              animationDuration="0.75"
              width="96"
              visible={true}
            />
          )}
        </div>
      )}
      <div
        id="videoContainer"
        onPointerDown={sendTouchEvent}
        onPointerMove={sendTouchEvent}
        onPointerUp={sendTouchEvent}
        onPointerCancel={sendTouchEvent}
        onPointerOut={sendTouchEvent}
        style={{
          height: '100%',
          width: '100%',
          padding: 0,
          margin: 0,
          display: 'flex',
        }}
      >
        <canvas
          ref={canvasRef}
          id="video"
          style={isPlugged && view === "Carplay" ? { height: '100%' } : { display: 'none' }}
        />
      </div>
    </div>
  )
}

export default Carplay
