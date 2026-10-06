import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Bot, Send, ShieldAlert, Sparkles, User } from 'lucide-react'
import { aiService } from '../../services/aiService'

interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const suggestions = [
  'Explain a technical concept simply',
  'Help me write a clear email',
  'Give me ideas for a project',
]

export function AIChatView() {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const componentId = useId()
  const feedRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const requestRef = useRef<AbortController | null>(null)

  useEffect(() => () => requestRef.current?.abort(), [])

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (message = input) => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || sending) return
    if (trimmedMessage.length > 10_000) {
      setError('Messages must be 10,000 characters or fewer.')
      return
    }

    const messageNumber = messages.length / 2
    const userMessageId = `${componentId}-user-${messageNumber}`
    const assistantMessageId = `${componentId}-assistant-${messageNumber}`
    const controller = new AbortController()
    requestRef.current = controller
    setSending(true)
    setError(null)
    setInput('')
    setMessages(previous => [
      ...previous,
      { id: userMessageId, role: 'user', content: trimmedMessage },
      { id: assistantMessageId, role: 'assistant', content: '' },
    ])

    try {
      await aiService.streamChat(trimmedMessage, text => {
        setMessages(previous => previous.map(item =>
          item.id === assistantMessageId
            ? { ...item, content: item.content + text }
            : item
        ))
      }, controller.signal)
    } catch (requestError) {
      if (!controller.signal.aborted) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to get an AI response.')
      }
    } finally {
      if (requestRef.current === controller) requestRef.current = null
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendMessage()
    }
  }

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-white font-sans dark:bg-[#0b0f19]">
      <header className="flex items-center gap-3 border-b border-gray-200 bg-[#fafbfc] px-4 py-3 dark:border-slate-800 dark:bg-[#0f172a] md:px-6 md:py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
          <Sparkles size={20} />
        </div>
        <div>
          <h1 className="m-0 text-base font-bold text-gray-900 dark:text-slate-100">Synexa AI</h1>
          <p className="m-0 text-xs font-medium text-gray-500 dark:text-slate-400">Ask anything, one conversation at a time</p>
        </div>
      </header>

      <div ref={feedRef} className="flex-1 overflow-y-auto px-4 py-5 md:px-8">
        {messages.length === 0 ? (
          <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center py-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
              <Sparkles size={28} />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-slate-100">What can I help with?</h2>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-gray-500 dark:text-slate-400">
              Your Synexa AI conversation is private to your account and remembers recent messages for context.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => { void sendMessage(suggestion) }}
                  disabled={sending}
                  className="rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-blue-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {messages.map(message => (
              <article key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    <Bot size={17} />
                  </div>
                )}
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'rounded-tr-sm bg-blue-600 text-white'
                    : 'rounded-tl-sm bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-100'
                }`}>
                  {message.content || (sending && message.role === 'assistant' ? 'Thinking…' : '')}
                </div>
                {message.role === 'user' && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-slate-300">
                    <User size={17} />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-[#fafbfc] px-3 py-3 dark:border-slate-800 dark:bg-[#0f172a] md:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[0.72rem] leading-relaxed text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200">
            <ShieldAlert size={15} className="mt-0.5 shrink-0" />
            <span>AI chats are stored separately as plaintext and sent to Groq for processing. Do not share E2EE room secrets here.</span>
          </div>
          {error && (
            <p role="alert" className="mb-2 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
          )}
          <form
            onSubmit={event => {
              event.preventDefault()
              void sendMessage()
            }}
            className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm focus-within:border-blue-400 dark:border-slate-700 dark:bg-slate-800"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={event => {
                setInput(event.target.value)
                if (error) setError(null)
              }}
              onKeyDown={handleKeyDown}
              maxLength={10_000}
              rows={1}
              placeholder="Message Synexa AI…"
              aria-label="Message Synexa AI"
              className="max-h-36 min-h-10 flex-1 resize-y border-0 bg-transparent px-2 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <span className="pb-3 text-[0.65rem] text-gray-400">{input.length}/10000</span>
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-0 bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-slate-700"
            >
              <Send size={16} />
            </button>
          </form>
          <p className="mb-0 mt-1.5 text-center text-[0.68rem] text-gray-400 dark:text-slate-500">Enter to send · Shift+Enter for a new line</p>
        </div>
      </div>
    </section>
  )
}
