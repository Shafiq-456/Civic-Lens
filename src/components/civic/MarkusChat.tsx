'use client'

// Markus — Civic Lenz AI assistant for quick government Q&A.
// Grounded on the platform's verified database snapshot (server-side);
// answers are conversational, source-aware and never fabricated.

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bot,
  RotateCcw,
  Send,
  Sparkles,
  X,
  BadgeCheck,
  AlertTriangle,
} from 'lucide-react'
import Markdown from 'react-markdown'
import type { PortalId } from '@/components/civic/Header'

type ChatRole = 'user' | 'assistant'
interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  ts: number
  fallback?: boolean
}

const STORAGE_KEY = 'civic-lenz-markus-chat'
const MAX_HISTORY = 12 // turns sent to the API (server trims further)

const SUGGESTIONS: Array<{ label: string; prompt: string }> = [
  { label: 'Who is the CM of Tamil Nadu?', prompt: 'Who is the current Chief Minister of Tamil Nadu and what are the key ministers?' },
  { label: 'Active schemes', prompt: 'List the active government schemes and who is eligible.' },
  { label: 'MLA of my area', prompt: 'Which constituency do you want the MLA for? Example: "Who is the MLA of Kolathur?"' },
  { label: 'File a complaint', prompt: 'How do I file a civic complaint on Civic Lenz?' },
  { label: 'Latest announcements', prompt: 'What are the latest government announcements?' },
  { label: 'Departments', prompt: 'Which departments does Civic Lenz track and what services do they run?' },
]

function newId() {
  return `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

function loadMessages(): ChatMessage[] {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ChatMessage[]
    return Array.isArray(parsed) ? parsed.slice(-40) : []
  } catch {
    return []
  }
}

function saveMessages(messages: ChatMessage[]) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)))
  } catch {
    /* storage full or unavailable — ignore */
  }
}

/** Lightweight markdown styling for bot replies (bullets, bold, links, tables). */
const markdownComponents = {
  p: (props: React.ComponentProps<'p'>) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
  ul: (props: React.ComponentProps<'ul'>) => <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0" {...props} />,
  ol: (props: React.ComponentProps<'ol'>) => <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0" {...props} />,
  li: (props: React.ComponentProps<'li'>) => <li className="pl-1 marker:text-teal-600" {...props} />,
  strong: (props: React.ComponentProps<'strong'>) => <strong className="font-semibold text-slate-900" {...props} />,
  a: (props: React.ComponentProps<'a'>) => (
    <a className="font-medium text-teal-700 underline decoration-teal-300 underline-offset-2 hover:text-teal-800" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  code: (props: React.ComponentProps<'code'>) => (
    <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[12px] text-slate-700" {...props} />
  ),
  h1: (props: React.ComponentProps<'h1'>) => <h1 className="mb-1 text-sm font-bold text-slate-900" {...props} />,
  h2: (props: React.ComponentProps<'h2'>) => <h2 className="mb-1 text-sm font-bold text-slate-900" {...props} />,
  h3: (props: React.ComponentProps<'h3'>) => <h3 className="mb-1 text-sm font-semibold text-slate-900" {...props} />,
  table: (props: React.ComponentProps<'table'>) => (
    <div className="mb-2 max-w-full overflow-x-auto">
      <table className="w-full min-w-max text-left text-xs" {...props} />
    </div>
  ),
  th: (props: React.ComponentProps<'th'>) => <th className="border-b border-slate-200 px-2 py-1 font-semibold text-slate-700" {...props} />,
  td: (props: React.ComponentProps<'td'>) => <td className="border-b border-slate-100 px-2 py-1 align-top" {...props} />,
}

export default function MarkusChat({ portal }: { portal: PortalId }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [groundedAt, setGroundedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [nudge, setNudge] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const portalRef = useRef<PortalId>(portal)

  useEffect(() => {
    portalRef.current = portal
  }, [portal])

  // hydrate once (client-only)
  useEffect(() => {
    queueMicrotask(() => {
      setMessages(loadMessages())
    })
  }, [])

  // fetch data freshness whenever the panel opens
  useEffect(() => {
    if (!open) return
    let alive = true
    fetch('/api/markus')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d?.groundedAt) setGroundedAt(d.groundedAt) })
      .catch(() => { /* freshness chip is cosmetic */ })
    return () => { alive = false }
  }, [open])

  // autoscroll
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, busy, open])

  // gentle nudge after 8s on first visit of the session
  useEffect(() => {
    if (open || messages.length > 0) return
    const t = setTimeout(() => setNudge(true), 8000)
    return () => clearTimeout(t)
  }, [open, messages.length])

  // esc to close
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    setError(null)
    setBusy(true)
    setInput('')

    const userMsg: ChatMessage = { id: newId(), role: 'user', content: trimmed, ts: Date.now() }
    const history = messages.slice(-MAX_HISTORY).map((m) => ({ role: m.role, content: m.content }))
    setMessages((prev) => [...prev, userMsg])
    saveMessages([...messages, userMsg])

    try {
      const res = await fetch('/api/markus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history, page: portalRef.current }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.reply) throw new Error(data?.error || 'Markus is unavailable right now.')

      const botMsg: ChatMessage = {
        id: newId(),
        role: 'assistant',
        content: String(data.reply),
        ts: Date.now(),
        fallback: Boolean(data.fallback),
      }
      setMessages((prev) => {
        const next = [...prev, botMsg]
        saveMessages(next)
        return next
      })
      if (data.groundedAt) setGroundedAt(data.groundedAt)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }, [busy, messages])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
    try { window.sessionStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    inputRef.current?.focus()
  }, [])

  const groundedLabel = groundedAt
    ? `Data as of ${new Date(groundedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : 'Verified database grounding'

  return (
    <>
      {/* Floating trigger */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        <AnimatePresence>
          {nudge && !open && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              onClick={() => { setOpen(true); setNudge(false) }}
              className="max-w-[220px] rounded-2xl rounded-br-sm border border-slate-200 bg-white px-3.5 py-2.5 text-left text-xs font-medium text-slate-700 shadow-lg"
            >
              <span className="flex items-center gap-1.5 font-semibold text-teal-700">
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> Markus here!
              </span>
              Ask me anything about your government — leaders, schemes, projects & more.
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => { setOpen((v) => !v); setNudge(false) }}
          initial={false}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-expanded={open}
          aria-label={open ? 'Close Markus chat assistant' : 'Open Markus chat assistant'}
          className="relative flex h-14 items-center gap-2 rounded-full bg-teal-700 px-4 text-white shadow-xl shadow-teal-900/20 ring-1 ring-teal-800/40 transition-colors hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          {!open && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-amber-400" />
            </span>
          )}
          {open ? <X className="h-6 w-6" aria-hidden /> : <Bot className="h-6 w-6" aria-hidden />}
          {!open && (
            <span className="hidden text-sm font-semibold sm:block">Ask Markus</span>
          )}
        </motion.button>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.section
            key="markus-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            role="dialog"
            aria-label="Markus — Civic Lenz AI assistant"
            className="fixed inset-x-2 bottom-[4.75rem] z-50 flex max-h-[80dvh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 sm:inset-x-auto sm:bottom-24 sm:right-6 sm:h-[600px] sm:max-h-[calc(100dvh-8rem)] sm:w-[400px]"
          >
            {/* Header */}
            <header className="flex items-center gap-3 border-b border-slate-200 bg-gradient-to-r from-teal-700 to-teal-600 px-4 py-3 text-white">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                <Bot className="h-6 w-6" aria-hidden />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-teal-600 bg-emerald-400" aria-hidden title="Online" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-bold leading-tight">
                  Markus
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                    <BadgeCheck className="h-2.5 w-2.5" aria-hidden /> AI
                  </span>
                </p>
                <p className="truncate text-[11px] leading-tight text-teal-100">
                  Civic Lenz government Q&amp;A assistant
                </p>
              </div>
              <button
                type="button"
                onClick={clearChat}
                aria-label="Clear conversation"
                title="Clear conversation"
                className="rounded-lg p-1.5 text-teal-100 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-lg p-1.5 text-teal-100 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </header>

            {/* Freshness strip */}
            <div className="flex items-center gap-1.5 border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-[11px] font-medium text-amber-800">
              <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {groundedLabel} · answers cite the platform&apos;s verified directory. Always cross-check critical facts on official portals.
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-3 py-4" role="log" aria-live="polite" aria-label="Chat messages">
              {messages.length === 0 && (
                <div className="px-1">
                  <div className="rounded-2xl rounded-tl-md border border-teal-100 bg-white p-3.5 shadow-sm">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                      <Sparkles className="h-4 w-4 text-teal-600" aria-hidden /> Vanakkam! I&apos;m Markus.
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Ask me quick questions about the government — current leaders, schemes, departments,
                      projects, MLAs/MPs, announcements, or how to file a complaint. I answer from
                      Civic Lenz&apos;s verified database and tell you when something needs official confirmation.
                    </p>
                  </div>
                  <p className="mb-1.5 mt-3 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Try asking
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => send(s.prompt)}
                        className="rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-medium text-teal-800 shadow-sm transition-colors hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                m.role === 'user' ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-teal-700 px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-sm">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white shadow-sm" aria-hidden>
                      <Bot className="h-4 w-4" />
                    </span>
                    <div className={`max-w-[85%] rounded-2xl rounded-tl-md border px-3.5 py-2.5 text-sm text-slate-700 shadow-sm ${
                      m.fallback ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'
                    }`}>
                      <Markdown components={markdownComponents}>{m.content}</Markdown>
                    </div>
                  </div>
                )
              ))}

              {busy && (
                <div className="flex items-start gap-2" aria-label="Markus is typing">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white shadow-sm" aria-hidden>
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <span className="flex items-center gap-1" aria-hidden>
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:300ms]" />
                    </span>
                    <span className="sr-only">Markus is thinking…</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="mx-1 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700" role="alert">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              className="flex items-center gap-2 border-t border-slate-200 bg-white px-3 py-2.5"
              onSubmit={(e) => { e.preventDefault(); send(input) }}
            >
              <label htmlFor="markus-input" className="sr-only">Ask Markus a question</label>
              <input
                id="markus-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about leaders, schemes, projects…"
                maxLength={500}
                autoComplete="off"
                disabled={busy}
                className="min-w-0 flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white shadow-sm transition-colors hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" aria-hidden />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
