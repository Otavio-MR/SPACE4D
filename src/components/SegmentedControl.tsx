import { useId } from 'react'

import { cn } from '@/lib/cn.ts'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
}

export interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
  legend: string
  description?: string
  /** Espaçamento externo, definido por quem usa — o componente não o presume. */
  className?: string
}

/**
 * Escolha única entre poucas opções. Usa `<fieldset>` + radios nativos: as setas
 * do teclado navegam entre as opções sem nenhum JavaScript nosso.
 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  legend,
  description,
  className,
}: SegmentedControlProps<T>) {
  const name = useId()
  const descriptionId = description ? `${name}-desc` : undefined

  return (
    <fieldset className={cn('py-4', className)} aria-describedby={descriptionId}>
      {/*
       * `float-left w-full` não é enfeite: por padrão o navegador posiciona a
       * <legend> na BORDA do fieldset, fora da caixa de padding. O padding
       * superior então não a afasta de nada, e numa lista com `divide-y` a linha
       * divisória passa por cima do texto. Flutuando-a, ela volta ao fluxo normal
       * e respeita o padding — daí o `clear-both` no que vem depois.
       */}
      <legend className="float-left w-full font-medium text-fg">{legend}</legend>
      {description ? (
        <p id={descriptionId} className="mt-1 mb-3 clear-both text-sm text-fg-muted">
          {description}
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-2 clear-both">
        {options.map((option) => {
          const id = `${name}-${option.value}`
          const selected = option.value === value
          return (
            <div key={option.value} className="relative">
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="peer absolute inset-0 size-full cursor-pointer opacity-0"
              />
              <label
                htmlFor={id}
                className={cn(
                  'touch-target flex cursor-pointer items-center justify-center rounded-xl border px-4 py-2.5',
                  'text-sm font-medium transition-colors',
                  'peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-accent',
                  selected
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-border-strong bg-surface text-fg-muted hover:text-fg',
                )}
              >
                {option.label}
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
