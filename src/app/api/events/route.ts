import { db } from '@/lib/db'
import { handleError, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const events = await db.calendarEvent.findMany({
      orderBy: { startsAt: 'asc' },
    })
    return ok({ events })
  } catch (e) {
    return handleError(e, 'GET /api/events')
  }
}
