import { NavList } from './NavList'
import { StartOverDialog } from './StartOverDialog'
import { Wordmark } from './Wordmark'

/** Fixed desktop sidebar (≥1024px). */
export function AppSidebar() {
  return (
    <aside
      data-print="hide"
      className="fixed inset-y-0 left-0 z-30 hidden w-[var(--sidebar-w)] flex-col border-r border-line bg-white px-5 py-8 lg:flex"
    >
      <Wordmark />
      <nav aria-label="Assessment sections" className="mt-12 -ml-4">
        <NavList />
      </nav>
      <div className="mt-auto flex flex-col items-start gap-3">
        <DemoBadge />
        <StartOverDialog />
      </div>
    </aside>
  )
}

export function DemoBadge() {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-[12px] text-muted">
      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      Demo Mode
    </p>
  )
}
