import type { SVGProps } from 'react'

/**
 * Ícones desenhados como traço de 1.75px sobre grade de 24px.
 * Todos são decorativos (`aria-hidden`): o nome acessível vem sempre do texto
 * do botão ou da prop `label` do IconButton.
 */
type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="size-6"
      {...props}
    >
      {children}
    </svg>
  )
}

export const XIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
)

export const CameraIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.8a1 1 0 0 0 .84-.46l.72-1.1A1 1 0 0 1 9.7 4h4.6a1 1 0 0 1 .84.45l.72 1.1a1 1 0 0 0 .84.45h1.8A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5Z" />
    <circle cx="12" cy="12.5" r="3.5" />
  </Icon>
)

export const GridIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </Icon>
)

export const SettingsIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3" />
  </Icon>
)

export const ArrowLeftIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </Icon>
)

export const SpeakerIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M11 5 6.5 8.5H3.5v7h3L11 19Z" />
    <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10" />
  </Icon>
)

export const StopIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </Icon>
)

export const PrinterIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 9V3.5h10V9" />
    <path d="M7 18H5.5A2.5 2.5 0 0 1 3 15.5v-4A2.5 2.5 0 0 1 5.5 9h13a2.5 2.5 0 0 1 2.5 2.5v4a2.5 2.5 0 0 1-2.5 2.5H17" />
    <rect x="7" y="14.5" width="10" height="6" rx="1.5" />
  </Icon>
)

export const RotateIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20 4v4.5h-4.5" />
  </Icon>
)

export const InfoIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.8v.2" />
  </Icon>
)

export const ScanIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 8.5v-2a3 3 0 0 1 3-3h2M15.5 3.5h2a3 3 0 0 1 3 3v2M20.5 15.5v2a3 3 0 0 1-3 3h-2M8.5 20.5h-2a3 3 0 0 1-3-3v-2" />
    <path d="M3.5 12h17" />
  </Icon>
)
