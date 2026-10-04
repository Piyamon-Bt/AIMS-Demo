import { useNavigation } from '../../state/Navigation'

export function Wordmark() {
  const { goToSection } = useNavigation()
  return (
    <a
      href="#upload"
      onClick={(e) => {
        e.preventDefault()
        goToSection('upload')
      }}
      className="inline-flex min-h-11 items-center text-[19px] font-semibold tracking-[-0.02em] text-ink"
      aria-label="ReLoop — go to the start"
    >
      ReLoop
    </a>
  )
}
