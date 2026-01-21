import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'


export default function AppLayout() {
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
      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1"><Outlet /></main>
      </div>
    </div>
  )
}
