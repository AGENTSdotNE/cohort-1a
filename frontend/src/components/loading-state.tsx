export const LoadingState = ({ label }: { label: string }) => (
  <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 py-16">
    <div className="size-6 animate-spin rounded-full border-4 border-muted border-t-[var(--govuk-brand)]" />
    <span className="text-base">{label}</span>
  </div>
)
