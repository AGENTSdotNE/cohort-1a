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
