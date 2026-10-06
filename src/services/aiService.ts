import { api } from './api'

interface AIStreamEvent {
  event: string
  data: string
}

interface AIConversationEvent {
  conversationId?: string
}

interface AIChunkEvent {
  text?: string
}

interface AIErrorEvent {
  message?: string
}

function parseEvent(frame: string): AIStreamEvent | null {
  let event = 'message'
  const data: string[] = []

  for (const line of frame.split('\n')) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      data.push(line.slice(5).trimStart())
    }
  }

  return data.length > 0 ? { event, data: data.join('\n') } : null
}

export const aiService = {
  streamChat: async (
    message: string,
    onChunk: (text: string) => void,
    signal?: AbortSignal
  ): Promise<{ conversationId: string }> => {
    const response = await api.postStream('/api/ai/chat/stream', { message }, signal)
    if (!response.body) {
      throw new Error('The AI response stream was empty.')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let conversationId = ''
    let completed = false

    const handleFrame = (frame: string) => {
      const parsed = parseEvent(frame)
      if (!parsed) return

      let data: AIConversationEvent & AIChunkEvent & AIErrorEvent
      try {
        data = JSON.parse(parsed.data) as AIConversationEvent & AIChunkEvent & AIErrorEvent
      } catch {
        throw new Error('The AI response stream contained invalid data.')
      }

      if (parsed.event === 'start') {
        conversationId = data.conversationId ?? conversationId
      } else if (parsed.event === 'chunk') {
        if (typeof data.text !== 'string') {
          throw new Error('The AI response stream contained an invalid text chunk.')
        }
        onChunk(data.text)
      } else if (parsed.event === 'done') {
        conversationId = data.conversationId ?? conversationId
        completed = true
      } else if (parsed.event === 'error') {
        throw new Error(data.message ?? 'The AI response failed.')
      }
    }

    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')

        let frameEnd = buffer.indexOf('\n\n')
        while (frameEnd !== -1) {
          handleFrame(buffer.slice(0, frameEnd))
          buffer = buffer.slice(frameEnd + 2)
          frameEnd = buffer.indexOf('\n\n')
        }
      }

      buffer += decoder.decode()
      if (buffer.trim()) handleFrame(buffer)
      if (!completed) {
        throw new Error('The AI response stream ended before completion.')
      }
      return { conversationId }
    } finally {
      reader.releaseLock()
    }
  },
}
