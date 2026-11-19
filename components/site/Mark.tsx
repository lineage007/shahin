// The Shahin mark: a falcon in a stoop, wings swept back into one downward line.
export function Mark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path
        d="M2.5 7.5c7.2.4 11.6 4.6 13.5 13.2 1.9-8.6 6.3-12.8 13.5-13.2-5.6 3.3-9.6 8.7-13.5 20.9C12.1 16.2 8.1 10.8 2.5 7.5Z"
        fill="currentColor"
      />
      <circle cx="16" cy="6.2" r="2.4" fill="currentColor" />
    </svg>
  )
}
