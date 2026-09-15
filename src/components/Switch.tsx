import { useId } from 'react'

import { cn } from '@/lib/cn.ts'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}

/**
 * Interruptor liga/desliga construído sobre um `<input type="checkbox">` real:
 * herda teclado, foco e semântica nativos em vez de recriá-los com ARIA.
 */
export function Switch({ checked, onChange, label, description, disabled }: SwitchProps) {
  const id = useId()
  const descriptionId = description ? `${id}-desc` : undefined

  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer font-medium text-fg">
          {label}
        </label>
        {description ? (
          <p id={descriptionId} className="mt-1 text-sm text-fg-muted">
            {description}
          </p>
        ) : null}
      </div>

      <div className="relative shrink-0">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          aria-describedby={descriptionId}
          onChange={(event) => onChange(event.target.checked)}
          className="peer absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        <span
          aria-hidden="true"
          className={cn(
            'flex h-7 w-12 items-center rounded-full border p-0.5 transition-colors',
            'peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-accent',
            checked ? 'border-primary bg-primary' : 'border-border-strong bg-surface-2',
            disabled && 'opacity-50',
          )}
        >
          <span
            className={cn(
              'size-5 rounded-full transition-transform duration-150',
              checked ? 'translate-x-5 bg-on-primary' : 'translate-x-0 bg-fg-subtle',
            )}
          />
        </span>
      </div>
    </div>
  )
}
