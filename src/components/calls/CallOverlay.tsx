import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from 'lucide-react'
import type { ActiveCall } from '../../hooks/useWebRTCCall'
import { getCallMediaDevices } from '../../utils/mediaDevicePreferences'

interface CallOverlayProps {
  call: ActiveCall
  curName: string
  curAvatar: string | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  isMuted: boolean
  isVideoOff: boolean
  onAccept: () => void
  onReject: () => void
  onToggleMute: () => void
  onToggleVideo: () => void
  onEndCall: () => void
}

export function CallOverlay({
  call,
  curName,
  curAvatar,
  localStream,
  remoteStream,
  isMuted,
  isVideoOff,
  onAccept,
  onReject,
  onToggleMute,
  onToggleVideo,
  onEndCall,
}: CallOverlayProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)
  const [duration, setDuration] = useState(0)
  const incoming = call.status === 'incoming'
  const connected = call.status === 'connected'
  const isVideo = call.callType === 'video'

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream
    const outputId = getCallMediaDevices().audioOutputId
    if (outputId) {
      const mediaElements = [remoteVideoRef.current, remoteAudioRef.current].filter(Boolean)
      mediaElements.forEach(element => {
        const outputElement = element as HTMLMediaElement & { setSinkId?: (deviceId: string) => Promise<void> }
        void outputElement.setSinkId?.(outputId).catch(error => {
          console.warn('Unable to select call audio output', error)
        })
      })
    }
  }, [localStream, remoteStream])

  useEffect(() => {
    if (!connected) return
    const timer = window.setInterval(() => setDuration(value => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [connected])

  const status = incoming ? 'Incoming call'
    : connected ? `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`
      : call.status === 'ringing' ? 'Ringing...'
        : call.status === 'connecting' ? 'Connecting...'
          : call.status === 'failed' ? 'Call failed'
            : 'Calling...'

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950 text-white flex flex-col items-center justify-between p-5 md:p-10">
      {!isVideo && <audio ref={remoteAudioRef} autoPlay />}
      <div className="w-full flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="m-0 text-xl md:text-2xl font-bold truncate">{curName}</h2>
          {call.error
            ? <p role="alert" className="mt-2 mb-0 max-w-xl rounded-lg border border-red-400/30 bg-red-950/60 px-3 py-2 text-sm text-red-100">{call.error}</p>
            : <p className="mt-1 mb-0 text-sm text-slate-300">{status}</p>}
        </div>
        {isVideo && localStream && (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-24 h-32 md:w-36 md:h-44 rounded-lg bg-slate-800 object-cover border border-white/20"
          />
        )}
      </div>

      <div className="relative flex-1 w-full max-w-5xl min-h-0 flex items-center justify-center py-6">
        {isVideo && remoteStream ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full rounded-lg bg-slate-900 object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-5">
            <div className="w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden border border-white/20 bg-slate-800 flex items-center justify-center">
              {curAvatar
                ? <img src={curAvatar} alt={curName} className="w-full h-full object-cover" />
                : <span className="text-6xl font-bold">{curName.charAt(0).toUpperCase()}</span>}
            </div>
            {isVideo && <p className="m-0 text-sm text-slate-300">Waiting for camera...</p>}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 pb-3">
        {incoming ? (
          <>
            <button onClick={onReject} title="Decline call" aria-label="Decline call" className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center border-0 cursor-pointer">
              <PhoneOff size={22} />
            </button>
            <button onClick={onAccept} title="Accept call" aria-label="Accept call" className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center border-0 cursor-pointer">
              <Phone size={22} />
            </button>
          </>
        ) : (
          <>
            <button onClick={onToggleMute} title={isMuted ? 'Unmute microphone' : 'Mute microphone'} aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'} className={`w-12 h-12 rounded-full flex items-center justify-center border border-white/10 cursor-pointer ${isMuted ? 'bg-white text-slate-900' : 'bg-slate-800 text-white'}`}>
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            {isVideo && (
              <button onClick={onToggleVideo} title={isVideoOff ? 'Turn camera on' : 'Turn camera off'} aria-label={isVideoOff ? 'Turn camera on' : 'Turn camera off'} className={`w-12 h-12 rounded-full flex items-center justify-center border border-white/10 cursor-pointer ${isVideoOff ? 'bg-white text-slate-900' : 'bg-slate-800 text-white'}`}>
                {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
              </button>
            )}
            <button onClick={onEndCall} title="End call" aria-label="End call" className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center border-0 cursor-pointer">
              <PhoneOff size={22} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}