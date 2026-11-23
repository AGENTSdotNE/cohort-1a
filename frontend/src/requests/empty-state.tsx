type EmptyStateProps = {
  heading: string
  body: string
  actions?: string[]
}

export const EmptyState = ({ heading, body, actions }: EmptyStateProps) => (
  <div role="status" className="grid gap-2 py-6">
    <h2 className="text-xl font-bold">{heading}</h2>
    <p>{body}</p>
    {actions && actions.length > 0 && (
      <>
        <p>You can:</p>
        <ul className="list-disc pl-6">
          {actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </>
    )}
  </div>
)
