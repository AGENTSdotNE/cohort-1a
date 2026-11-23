import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type QuickFilter = 'overdue' | 'due_soon' | 'unassigned' | 'foi'

type Tile = { key: QuickFilter; label: string; count: number }

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
        className="text-left"
      >
        <Card className={cn('gap-1 p-4', active === tile.key && 'border-2 border-primary')}>
          <span className={cn('text-4xl font-bold', tile.key === 'overdue' && 'text-[var(--tag-red-text)]')}>
            {tile.count}
          </span>
          <span className="text-base text-muted-foreground">{tile.label}</span>
        </Card>
      </button>
    ))}
  </div>
)
