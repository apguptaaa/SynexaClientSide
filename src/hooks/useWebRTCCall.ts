import { useCallback, useEffect, useRef, useState } from 'react'
import { socketService } from '../services/socketService'
import type { CallEndReason, CallIncomingPayload, CallType } from '../services/socketService'
import { getCallMediaDevices } from '../utils/mediaDevicePreferences'

export interface ActiveCall {
  callId: string | null
  roomId: string
  callType: CallType
  direction: 'incoming' | 'outgoing'
  status: 'incoming' | 'calling' | 'ringing' | 'connecting' | 'connected' | 'failed'
  offer?: RTCSessionDescriptionInit
  error?: string
}

type QueuedCandidate = { callId: string; candidate: RTCIceCandidateInit | null }

function getIceServers(): RTCIceServer[] {
  const configuredServers = import.meta.env.VITE_ICE_SERVERS
  if (configuredServers) {
    try {
      const servers = JSON.parse(configuredServers) as RTCIceServer[]
      if (Array.isArray(servers) && servers.length > 0) return servers
    } catch {
      console.error('VITE_ICE_SERVERS must be a JSON array of RTCIceServer values')
    }
  }
  return [{ urls: 'stun:stun.l.google.com:19302' }]
}

function getMediaErrorMessage(error: unknown, callType: CallType): string {
  const deviceName = callType === 'video' ? 'microphone or camera' : 'microphone'
  const errorName = error instanceof Error ? error.name : ''

  if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError' || errorName === 'SecurityError') {
    return `Allow ${callType === 'video' ? 'microphone and camera' : 'microphone'} access in your browser's site permissions, then try again.`
  }
  if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
    return `No ${deviceName} found. Connect or enable the required device, then try again.`
  }
  if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
    return `The ${deviceName} could not be opened. Close other apps using it and try again.`
  }
  if (errorName === 'OverconstrainedError') {
    return `The selected ${deviceName} is unavailable. Choose another device in Settings.`
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return 'Calls require a supported browser and a secure connection (HTTPS or localhost).'
  }
  return `Unable to access your ${deviceName}. Check browser permissions and device connections.`
}

export function useWebRTCCall(onCallNotice?: (message: string) => void) {
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const activeCallRef = useRef<ActiveCall | null>(null)
  const peerRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const localCandidates = useRef<(RTCIceCandidateInit | null)[]>([])
  const remoteCandidates = useRef<QueuedCandidate[]>([])
  const callAttempt = useRef(0)

  const updateCall = useCallback((call: ActiveCall | null) => {
    activeCallRef.current = call
    setActiveCall(call)
  }, [])

  const releaseMedia = useCallback(() => {
    peerRef.current?.close()
    peerRef.current = null
    localStreamRef.current?.getTracks().forEach(track => track.stop())
    localStreamRef.current = null
    remoteStreamRef.current = null
    localCandidates.current = []
    remoteCandidates.current = []
    setLocalStream(null)
    setRemoteStream(null)
    setIsMuted(false)
    setIsVideoOff(false)
  }, [])

  const finishCall = useCallback((notifyPeer: boolean) => {
    const call = activeCallRef.current
    callAttempt.current += 1
    if (notifyPeer && call?.callId) {
      socketService.emitCallEvent('call:end', { callId: call.callId })
    }
    releaseMedia()
    updateCall(null)
  }, [releaseMedia, updateCall])

  const flushRemoteCandidates = useCallback(async (callId: string) => {
    const peer = peerRef.current
    if (!peer?.remoteDescription) return
    const queued = remoteCandidates.current.filter(item => item.callId === callId)
    remoteCandidates.current = remoteCandidates.current.filter(item => item.callId !== callId)
    await Promise.all(queued.map(item => peer.addIceCandidate(item.candidate).catch(error => {
      console.warn('Unable to apply queued ICE candidate', error)
    })))
  }, [])

  const createPeer = useCallback((stream: MediaStream) => {
    const peer = new RTCPeerConnection({ iceServers: getIceServers() })
    peerRef.current = peer
    stream.getTracks().forEach(track => peer.addTrack(track, stream))

    peer.onicecandidate = event => {
      const candidate = event.candidate?.toJSON() ?? null
      const current = activeCallRef.current
      if (!current?.callId) {
        localCandidates.current.push(candidate)
        return
      }
      socketService.emitCallEvent('call:ice-candidate', { callId: current.callId, candidate })
    }

    peer.ontrack = event => {
      const streamWithTrack = event.streams[0] ?? remoteStreamRef.current ?? new MediaStream()
      if (!event.streams[0] && !streamWithTrack.getTracks().some(track => track.id === event.track.id)) {
        streamWithTrack.addTrack(event.track)
      }
      remoteStreamRef.current = streamWithTrack
      setRemoteStream(streamWithTrack)
    }

    peer.onconnectionstatechange = () => {
      const current = activeCallRef.current
      if (peer.connectionState === 'connected' && current) {
        updateCall({ ...current, status: 'connected' })
      } else if (peer.connectionState === 'failed' && current) {
        updateCall({ ...current, status: 'failed', error: 'Could not establish the call connection.' })
      }
    }

    return peer
  }, [updateCall])

  const getLocalMedia = useCallback(async (callType: CallType, attempt: number) => {
    const selectedDevices = getCallMediaDevices()
    let stream: MediaStream
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Media capture is unavailable')
      stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedDevices.audioInputId
          ? { deviceId: { exact: selectedDevices.audioInputId } }
          : true,
        video: callType === 'video'
          ? selectedDevices.videoInputId
            ? { deviceId: { exact: selectedDevices.videoInputId } }
            : true
          : false,
      })
    } catch (error) {
      throw new Error(getMediaErrorMessage(error, callType), { cause: error })
    }
    if (attempt !== callAttempt.current) {
      stream.getTracks().forEach(track => track.stop())
      return null
    }
    localStreamRef.current = stream
    setLocalStream(stream)
    return stream
  }, [])

  const startCall = useCallback(async (roomId: string, callType: CallType) => {
    if (activeCallRef.current) throw new Error('A call is already active.')
    const attempt = ++callAttempt.current
    const call: ActiveCall = { callId: null, roomId, callType, direction: 'outgoing', status: 'calling' }
    updateCall(call)
    try {
      await socketService.waitUntilConnected()
      if (attempt !== callAttempt.current) return
      const stream = await getLocalMedia(callType, attempt)
      if (!stream || attempt !== callAttempt.current) return
      const peer = createPeer(stream)
      const offer = await peer.createOffer()
      if (attempt !== callAttempt.current) return
      await peer.setLocalDescription(offer)
      if (attempt !== callAttempt.current) return
      const localOffer = peer.localDescription?.toJSON()
      if (!localOffer) throw new Error('Could not create the call offer.')
      socketService.emitCallEvent('call:start', { roomId, callType, offer: localOffer })
    } catch (error) {
      if (attempt !== callAttempt.current) return
      releaseMedia()
      const message = error instanceof Error ? error.message : 'Unable to start the call.'
      updateCall({ ...call, status: 'failed', error: message })
    }
  }, [createPeer, getLocalMedia, releaseMedia, updateCall])

  const acceptCall = useCallback(async () => {
    const call = activeCallRef.current
    if (!call || call.direction !== 'incoming' || !call.offer || !call.callId) return
    const attempt = callAttempt.current
    updateCall({ ...call, status: 'connecting' })
    try {
      const stream = await getLocalMedia(call.callType, attempt)
      if (!stream || attempt !== callAttempt.current) return
      const peer = createPeer(stream)
      await peer.setRemoteDescription(call.offer)
      if (attempt !== callAttempt.current) return
      await flushRemoteCandidates(call.callId)
      const answer = await peer.createAnswer()
      if (attempt !== callAttempt.current) return
      await peer.setLocalDescription(answer)
      if (attempt !== callAttempt.current) return
      const localAnswer = peer.localDescription?.toJSON()
      if (!localAnswer) throw new Error('Could not create the call answer.')
      socketService.emitCallEvent('call:accept', { callId: call.callId, answer: localAnswer })
    } catch (error) {
      if (attempt !== callAttempt.current) return
      const message = error instanceof Error ? error.message : 'Unable to accept the call.'
      socketService.emitCallEvent('call:reject', { callId: call.callId })
      releaseMedia()
      updateCall({ ...call, status: 'failed', error: message })
    }
  }, [createPeer, flushRemoteCandidates, getLocalMedia, releaseMedia, updateCall])

  const endCall = useCallback(() => finishCall(true), [finishCall])

  const rejectCall = useCallback(() => {
    const call = activeCallRef.current
    if (call?.direction === 'incoming' && call.callId) {
      socketService.emitCallEvent('call:reject', { callId: call.callId })
    }
    finishCall(false)
  }, [finishCall])

  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted
    localStreamRef.current?.getAudioTracks().forEach(track => { track.enabled = !nextMuted })
    setIsMuted(nextMuted)
  }, [isMuted])

  const toggleVideo = useCallback(() => {
    const nextVideoOff = !isVideoOff
    localStreamRef.current?.getVideoTracks().forEach(track => { track.enabled = !nextVideoOff })
    setIsVideoOff(nextVideoOff)
  }, [isVideoOff])

  useEffect(() => {
    const handleRinging = ({ callId }: { callId: string }) => {
      const call = activeCallRef.current
      if (!call || call.direction !== 'outgoing') return
      const updated = { ...call, callId, status: 'ringing' as const }
      updateCall(updated)
      localCandidates.current.splice(0).forEach(candidate => {
        socketService.emitCallEvent('call:ice-candidate', { callId, candidate })
      })
      void flushRemoteCandidates(callId)
    }
    const handleIncoming = (payload: CallIncomingPayload) => {
      if (activeCallRef.current) {
        socketService.emitCallEvent('call:reject', { callId: payload.callId })
        return
      }
      updateCall({
        callId: payload.callId,
        roomId: payload.roomId,
        callType: payload.callType,
        direction: 'incoming',
        status: 'incoming',
        offer: payload.offer,
      })
    }
    const handleAccepted = async ({ callId, answer }: { callId?: string; answer: RTCSessionDescriptionInit }) => {
      const call = activeCallRef.current
      if (!call || (callId && call.callId !== callId) || call.direction !== 'outgoing' || !peerRef.current) return
      try {
        await peerRef.current.setRemoteDescription(answer)
        updateCall({ ...call, status: 'connecting' })
        if (call.callId) await flushRemoteCandidates(call.callId)
      } catch (error) {
        updateCall({ ...call, status: 'failed', error: error instanceof Error ? error.message : 'Invalid call answer.' })
      }
    }
    const handleCandidate = async ({ callId, candidate }: QueuedCandidate) => {
      if (activeCallRef.current?.callId !== callId || !peerRef.current?.remoteDescription) {
        remoteCandidates.current.push({ callId, candidate })
        return
      }
      await peerRef.current.addIceCandidate(candidate).catch(error => {
        console.warn('Unable to apply ICE candidate', error)
      })
    }
    const handleEnded = ({ callId, reason }: { callId: string; reason: CallEndReason }) => {
      const call = activeCallRef.current
      if (call?.callId !== callId || call.status === 'failed') return
      const messages: Record<CallEndReason, string> = {
        rejected: 'The call was declined.',
        ended: 'The call ended.',
        'no-answer': 'There was no answer.',
        disconnected: 'The call was disconnected.',
      }
      onCallNotice?.(messages[reason] ?? 'The call ended.')
      finishCall(false)
    }
    const handleCallError = ({ callId, message, error }: { callId?: string; message?: string; error?: string }) => {
      const call = activeCallRef.current
      if (!call || (callId && call.callId && call.callId !== callId)) return
      callAttempt.current += 1
      releaseMedia()
      updateCall({ ...call, status: 'failed', error: message ?? error ?? 'The call could not be completed.' })
    }

    socketService.onCallEvent('call:ringing', handleRinging)
    socketService.onCallEvent('call:incoming', handleIncoming)
    socketService.onCallEvent('call:accepted', handleAccepted)
    socketService.onCallEvent('call:ice-candidate', handleCandidate)
    socketService.onCallEvent('call:ended', handleEnded)
    socketService.onCallEvent('call:error', handleCallError)
    return () => {
      socketService.offCallEvent('call:ringing', handleRinging)
      socketService.offCallEvent('call:incoming', handleIncoming)
      socketService.offCallEvent('call:accepted', handleAccepted)
      socketService.offCallEvent('call:ice-candidate', handleCandidate)
      socketService.offCallEvent('call:ended', handleEnded)
      socketService.offCallEvent('call:error', handleCallError)
      releaseMedia()
    }
  }, [finishCall, flushRemoteCandidates, onCallNotice, releaseMedia, updateCall])

  return {
    activeCall,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  }
}