import { cn } from '@/lib/utils'

export type QuickFilter = 'overdue' | 'due_soon' | 'unassigned' | 'foi'

export type Tile = { key: QuickFilter; label: string; count: number }

export const StatTiles = ({
  tiles,
  active,
  onSelect,
}: {
  tiles: Tile[]
  active: QuickFilter | null
  onSelect: (key: QuickFilter | null) => void
}) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
    {tiles.map((tile) => (
      <button
        key={tile.key}
        type="button"
        aria-pressed={active === tile.key}
        onClick={() => onSelect(active === tile.key ? null : tile.key)}
        className={cn(
          'grid gap-1 p-4 text-left text-white',
          active === tile.key ? 'bg-[var(--govuk-brand-dark)]' : 'bg-[var(--govuk-brand)]',
        )}
      >
        <span className="text-4xl font-bold">{tile.count}</span>
        <span className="text-base underline">{tile.label}</span>
      </button>
    ))}
  </div>
)
