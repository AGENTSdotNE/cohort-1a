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

export const NoRequestsYet = () => (
  <EmptyState heading="There are no requests yet" body="New items will appear here when they come in." />
)

export const NoMatchingResults = ({ onClear }: { onClear: () => void }) => (
  <div role="status" className="grid gap-2 py-6">
    <h2 className="text-xl font-bold">No matching results</h2>
    <p>There are no requests that match your search or filters.</p>
    <p>You can:</p>
    <ul className="list-disc pl-6">
      <li>check your spelling</li>
      <li>remove a filter</li>
      <li>
        <button type="button" className="underline" onClick={onClear}>
          clear all filters
        </button>
      </li>
    </ul>
  </div>
)
