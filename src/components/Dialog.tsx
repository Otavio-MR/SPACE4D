import { useEffect, useRef, type ReactNode } from 'react'

import { IconButton } from './IconButton.tsx'
import { XIcon } from './icons.tsx'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Modal sobre o elemento nativo `<dialog>`: o navegador cuida do foco preso,
 * do fechamento com Esc e do `aria-modal`. Reimplementar isso à mão costuma
 * deixar buracos de acessibilidade.
 */
export function Dialog({ open, onClose, title, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="dialog-title"
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-border bg-bg-elevated p-0 text-fg backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border p-5">
        <h2 id="dialog-title" className="font-display text-xl font-semibold">
          {title}
        </h2>
        <IconButton label="Fechar" icon={<XIcon />} onClick={onClose} className="size-11 -mt-1.5" />
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  )
}
