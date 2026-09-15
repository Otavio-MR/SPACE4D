import { Button } from '@/components/Button.tsx'
import { SegmentedControl } from '@/components/SegmentedControl.tsx'
import { Switch } from '@/components/Switch.tsx'
import { usePageTitle } from '@/hooks/usePageTitle.ts'

import { useSettings, type MotionPreference, type TextScale } from '../store.ts'

const MOTION_OPTIONS: Array<{ value: MotionPreference; label: string }> = [
  { value: 'system', label: 'Seguir o sistema' },
  { value: 'full', label: 'Com animação' },
  { value: 'reduced', label: 'Sem animação' },
]

const TEXT_OPTIONS: Array<{ value: TextScale; label: string }> = [
  { value: 'normal', label: 'Padrão' },
  { value: 'large', label: 'Grande' },
  { value: 'larger', label: 'Maior' },
]

export function SettingsPage() {
  usePageTitle('Preferências')
  const settings = useSettings()

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="font-display text-3xl font-semibold">Preferências</h1>
      <p className="mt-2 max-w-prose text-fg-muted">
        As escolhas ficam salvas neste aparelho e valem para todas as telas.
      </p>

      <section className="mt-8 divide-y divide-border" aria-labelledby="secao-apresentacao">
        <h2 id="secao-apresentacao" className="pb-2 font-display text-xl font-semibold">
          Apresentação
        </h2>

        <SegmentedControl
          legend="Movimento"
          description="Controla a rotação dos modelos e as transições. “Seguir o sistema” usa a configuração de redução de movimento do seu aparelho."
          value={settings.motion}
          onChange={settings.setMotion}
          options={MOTION_OPTIONS}
        />

        <SegmentedControl
          legend="Tamanho do texto"
          description="Aumenta o texto de todo o app. O zoom do navegador continua funcionando normalmente."
          value={settings.textScale}
          onChange={settings.setTextScale}
          options={TEXT_OPTIONS}
        />
      </section>

      <section className="mt-10 divide-y divide-border" aria-labelledby="secao-ar">
        <h2 id="secao-ar" className="pb-2 font-display text-xl font-semibold">
          Realidade aumentada
        </h2>

        <Switch
          label="Narração por voz"
          description="Lê a descrição do corpo celeste em voz alta assim que a carta é reconhecida."
          checked={settings.speech}
          onChange={settings.setSpeech}
        />
        <Switch
          label="Vibrar ao reconhecer"
          description="Um toque curto confirma que a carta foi encontrada, sem precisar olhar para a tela."
          checked={settings.haptics}
          onChange={settings.setHaptics}
        />
        <Switch
          label="Mostrar o nome sobre o modelo"
          description="Exibe o nome do corpo celeste no topo da tela durante o rastreamento."
          checked={settings.arLabels}
          onChange={settings.setArLabels}
        />
      </section>

      <div className="mt-10">
        <Button variant="danger" onClick={settings.reset}>
          Restaurar padrões
        </Button>
      </div>
    </div>
  )
}
