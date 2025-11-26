import type { ReactNode } from 'react'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import Icon from './Icon'

export default function AppLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <div className="relative flex min-h-screen w-full bg-background-light dark:bg-background-dark">
      <Sidebar variant="desktop" />
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <Sidebar variant="mobile" onClose={() => setMobileOpen(false)} />
        </>
      )}
      <button
        aria-label="Open menu"
        className="md:hidden fixed top-4 left-4 z-50 inline-flex items-center justify-center rounded-lg bg-white dark:bg-background-dark border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 size-10 shadow-sm"
        onClick={() => setMobileOpen(true)}
      >
        <Icon name="menu" />
      </button>
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
