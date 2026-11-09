// Markus — Civic Lenz AI assistant API.
// POST /api/markus  { message, history?, page? } -> { reply, groundedAt, fallback? }
// GET  /api/markus  -> { ok, groundedAt, coverage }

import { NextRequest } from 'next/server'
import { z } from 'zod'
import ZAI from 'z-ai-web-dev-sdk'
import { handleError, ok, bad } from '@/lib/api-helpers'
import { getMarkusContext } from '@/lib/civic/markus-context'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ── Validation ────────────────────────────────────────────────────────────────

const historyItem = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(1200),
})

const markusRequest = z.object({
  message: z.string().min(2, 'Message is too short').max(600, 'Message is too long (max 600 chars)'),
  history: z.array(historyItem).max(12).optional().default([]),
  page: z.enum(['info', 'accountability', 'updates', 'admin', 'trust', 'news']).optional().default('info'),
})

// ── Simple in-memory rate limit (20 messages / 5 min / IP) ───────────────────

const RATE_LIMIT = 20
const RATE_WINDOW_MS = 5 * 60 * 1000
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 500) {
    // opportunistic cleanup to bound memory
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k)
    }
  }
  return false
}

// ── SDK singleton & AI Provider integration ───────────────────────────────────

let zaiPromise: Promise<Awaited<ReturnType<typeof ZAI.create>>> | null = null
function getZAI() {
  if (!zaiPromise) zaiPromise = ZAI.create()
  return zaiPromise
}

async function generateMarkusCompletion(messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<string> {
  const apiKey = (
    process.env.GROQ_API_KEY ||
    process.env.GROK_API_KEY ||
    process.env.XAI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.AI_API_KEY
  )?.trim()

  if (apiKey) {
    let baseUrl = process.env.AI_BASE_URL
    let model = process.env.AI_MODEL

    if (!baseUrl) {
      if (apiKey.startsWith('gsk_') || process.env.GROQ_API_KEY) {
        baseUrl = 'https://api.groq.com/openai/v1'
        model = model || 'openai/gpt-oss-120b'
      } else if (apiKey.startsWith('xai-') || process.env.GROK_API_KEY || process.env.XAI_API_KEY) {
        baseUrl = 'https://api.x.ai/v1'
        model = model || 'grok-2-latest'
      } else if (process.env.GEMINI_API_KEY) {
        baseUrl = 'https://generativelanguage.googleapis.com/v1beta/openai'
        model = model || 'gemini-2.5-flash'
      } else {
        baseUrl = 'https://api.openai.com/v1'
        model = model || 'gpt-4o-mini'
      }
    } else {
      model = model || 'openai/gpt-oss-120b'
    }

    const cleanBaseUrl = baseUrl.replace(/\/+$/, '')
    const url = cleanBaseUrl.endsWith('/chat/completions') ? cleanBaseUrl : `${cleanBaseUrl}/chat/completions`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`AI API request failed with status ${res.status}: ${errText}`)
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) throw new Error('Empty completion from AI API')
    return content
  }

  // Fall back to z-ai-web-dev-sdk (.z-ai-config)
  const zai = await getZAI()
  const completion = await zai.chat.completions.create({
    messages,
    thinking: { type: 'disabled' },
  })

  const reply = completion.choices?.[0]?.message?.content?.trim()
  if (!reply) throw new Error('Empty completion from z-ai SDK')
  return reply
}

// ── System prompt ─────────────────────────────────────────────────────────────

const PAGE_HINTS: Record<string, string> = {
  info: 'The user is currently on the Government Information Portal.',
  accountability: 'The user is currently on the Public Accountability Portal (complaints, projects, financials).',
  updates: 'The user is currently on the Government Scheme Updates Portal (recent scheme revisions, welfare enhancements, and launch notifications).',
  admin: 'The user is currently on the Government Administration Portal (login-gated workflows).',
  trust: 'The user is currently on the Trust, Data Governance & Deployment portal.',
  news: 'The user is currently on the Government News & Public Information Portal (verified news and press briefings for Government of India & Tamil Nadu).',
}

function compactSnapshot(snapshot: string, query: string): string {
  const lines = snapshot.split('\n')
  const out: string[] = []
  let inACs = false
  let inPCs = false
  const lowerQuery = query.toLowerCase()
  const words = lowerQuery.split(/\s+/).filter((w) => w.length > 2)

  for (const line of lines) {
    if (line.includes('== TAMIL NADU ASSEMBLY CONSTITUENCIES')) {
      inACs = true
      inPCs = false
      out.push(line)
      out.push('Summary: 234 Assembly seats across Tamil Nadu (delimitation numbering 1-234). Key seats include: AC 13 Kolathur (M.K. Stalin - CM), AC 86 Edappadi (Edappadi K. Palaniswami - LoP).')
      continue
    }
    if (line.includes('== TAMIL NADU PARLIAMENTARY CONSTITUENCIES')) {
      inACs = false
      inPCs = true
      out.push(line)
      out.push('Summary: 39 Lok Sabha seats across Tamil Nadu.')
      continue
    }
    if (line.startsWith('== ')) {
      inACs = false
      inPCs = false
      out.push(line)
      continue
    }

    if (inACs || inPCs) {
      const lineLower = line.toLowerCase()
      if (words.some((w) => lineLower.includes(w))) {
        out.push(line)
      }
      continue
    }

    out.push(line)
  }

  return out.join('\n')
}

function buildSystemPrompt(groundedAt: string, snapshot: string, page: string, query = ''): string {
  const activeSnapshot = compactSnapshot(snapshot, query)
  return `You are **Markus**, the official AI assistant of Civic Lenz — an open-government transparency platform for India with a Tamil Nadu focus. You answer quick questions about governments, leaders, schemes, departments, projects, constituencies, announcements and civic services. You are neutral, factual and helpful. ${PAGE_HINTS[page] ?? ''}

GROUNDING RULES (highest priority):
1. The "PLATFORM SNAPSHOT" at the end of this prompt is the authoritative record of what Civic Lenz has verified. For questions about who holds an office, scheme status, departments, projects, announcements or complaint statistics — answer ONLY from the snapshot.
2. Never fabricate: no invented names, designations, parties, dates, statistics, URLs, schemes, government orders (GOs) or appointments. If the snapshot does not contain the answer and you are not certain, say clearly: "I can't confirm this from Civic Lenz's verified data" — then recommend checking the official source: india.gov.in, pmindia.gov.in, pib.gov.in, tn.gov.in, eci.gov.in, ceo.tn.gov.in or data.gov.in.
3. Political officeholders change frequently. NEVER answer officeholder questions from general memory — only from the snapshot. If the snapshot marks a record [PENDING_VERIFICATION] or [OUTDATED], tell the user that record still needs verification.
4. Report the data date: when you cite officeholders or statistics, add "(platform data as of ${groundedAt})" once.
5. General civics knowledge (how Parliament works, what a Governor does, RTI process, etc.) may be answered from general knowledge — it does not require the snapshot.

STYLE:
- Reply in the same language the user writes in (English, Tamil, or Tanglish).
- Concise: under 180 words. Use short bullet lists and **bold** for names/titles. Markdown is allowed (including small tables).
- Friendly, professional, politically neutral. Present facts only — never opinions, praise or criticism of parties or leaders.
- Never reveal private citizen details (contacts are masked on the platform).

NAVIGATION:
- Guide users to the right place: Government Information Portal (maps, leadership, constituencies & MLAs/MPs, schemes, departments, announcements, calendar) · Public Accountability Portal (file/track complaints, projects, financials, verification) · Administration Portal (department staff) · Trust & Docs (data governance, sources, security, roadmap).
- Filing a complaint: Public Accountability Portal → "File Complaint" tab; tickets look like CL-YYYY-NNNNNN.

SCOPE & SAFETY:
- Politely decline anything unrelated to government/civic topics or the platform, any request for political persuasion, propaganda, defamation, speculation about individuals, or harmful content.

=== PLATFORM SNAPSHOT (generated ${groundedAt}) ===
${activeSnapshot}`
}

// ── Fallback reply when the LLM is unavailable ────────────────────────────────

const FALLBACK_REPLY = `I'm sorry — I couldn't generate an answer right now (my AI service is temporarily unavailable).

While I'm offline you can still:
- **Information Portal** — leadership directory, constituency MLA/MP listings, schemes, departments, announcements and maps
- **Public Accountability Portal** — file or track a complaint (tickets like CL-2025-000123), project progress and financials
- **Trust & Docs** — data sources and sync status

For authoritative answers, visit **india.gov.in**, **tn.gov.in** or **eci.gov.in**. Please try me again in a moment.`

// ── Handlers ──────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const ctx = await getMarkusContext()
    return ok({ ok: true, groundedAt: ctx.generatedAt, coverage: ctx.stats })
  } catch (e) {
    return handleError(e, 'GET /api/markus')
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (rateLimited(ip)) {
    return bad('Too many questions — please wait a few minutes before asking Markus again.', 429)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return bad('Invalid JSON body')
  }

  const parsed = markusRequest.safeParse(body)
  if (!parsed.success) {
    return bad(parsed.error.issues[0]?.message ?? 'Invalid request')
  }

  const { message, history, page } = parsed.data

  try {
    const ctx = await getMarkusContext()

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      { role: 'assistant', content: buildSystemPrompt(ctx.generatedAt, ctx.text, page, message) },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ]

    const reply = await generateMarkusCompletion(messages)
    return ok({ reply, groundedAt: ctx.generatedAt, fallback: false })
  } catch (e) {
    console.error('[POST /api/markus]', e)
    // Preserve a useful experience: return a structured fallback rather than a raw 500.
    return ok({ reply: FALLBACK_REPLY, groundedAt: null, fallback: true })
  }
}
