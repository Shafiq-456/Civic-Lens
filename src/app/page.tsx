'use client'

import { useSyncExternalStore } from 'react'
import Header, { PORTALS, type PortalId } from '@/components/civic/Header'
import Footer from '@/components/civic/Footer'
import InfoPortal from '@/components/civic/info/InfoPortal'
import AccountabilityPortal from '@/components/civic/accountability/AccountabilityPortal'
import UpdatesPortal from '@/components/civic/updates/UpdatesPortal'
import AdminPortal from '@/components/civic/admin/AdminPortal'
import TrustPortal from '@/components/civic/trust/TrustPortal'
import NewsPortal from '@/components/civic/news/NewsPortal'
import MarkusChat from '@/components/civic/MarkusChat'

type PortalListeners = Set<() => void>
const portalListeners: PortalListeners = new Set()

function subscribePortal(listener: () => void) {
  portalListeners.add(listener)
  return () => portalListeners.delete(listener)
}

function getPortalSnapshot(): string {
  try {
    return window.sessionStorage.getItem('civic-lenz-portal') ?? 'info'
  } catch {
    return 'info'
  }
}

function getPortalServerSnapshot(): string {
  return 'info'
}

function isPortal(v: string): v is PortalId {
  return PORTALS.some((p) => p.id === v)
}

export default function Home() {
  const stored = useSyncExternalStore(subscribePortal, getPortalSnapshot, getPortalServerSnapshot)
  const portal: PortalId = isPortal(stored) ? stored : 'info'

  const changePortal = (p: PortalId) => {
    try { window.sessionStorage.setItem('civic-lenz-portal', p) } catch { /* ignore */ }
    portalListeners.forEach((l) => l())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header portal={portal} onPortalChange={changePortal} />
      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {portal === 'info' ? (
          <InfoPortal onPortalChange={changePortal} />
        ) : portal === 'accountability' ? (
          <AccountabilityPortal />
        ) : portal === 'updates' ? (
          <UpdatesPortal />
        ) : portal === 'admin' ? (
          <AdminPortal />
        ) : portal === 'trust' ? (
          <TrustPortal />
        ) : (
          <NewsPortal />
        )}
      </main>
      <Footer />
      <MarkusChat portal={portal} />
    </div>
  )
}
