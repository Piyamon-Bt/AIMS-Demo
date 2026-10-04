import { deviceById, devices } from '../../content/devices'
import { useIsDesktop } from '../../hooks/useMediaQuery'
import { useAssessment } from '../../state/AssessmentContext'
import { EmptyMedia } from '../media/EmptyMedia'
import { MediaSlot } from '../media/MediaSlot'
import { ChoiceGroup } from '../ui/ChoiceGroup'

const options = devices.map((d) => ({ value: d.id, label: d.label }))

/** 3D model of the currently selected device (or a quiet empty state). */
export function DeviceModel({ emptyLabel = 'Select a device to preview it in 3D.' }: { emptyLabel?: string }) {
  const { state } = useAssessment()
  const device = state.confirmedCategory ? deviceById[state.confirmedCategory] : null
  if (!device) return <EmptyMedia aspectRatio="1 / 1" label={emptyLabel} />
  return <MediaSlot asset={device.model} />
}

/**
 * Device type selection. The selected device's 3D model sits in the section's
 * right-hand column on desktop and directly below the choices on smaller screens.
 */
export function DevicePicker() {
  const { state, actions } = useAssessment()
  const isDesktop = useIsDesktop()

  return (
    <div className="space-y-6">
      <ChoiceGroup
        legend="Which device are you assessing?"
        hint="One device per assessment. You can change this later in Review."
        name="device-type"
        value={state.confirmedCategory}
        options={options}
        onChange={actions.setCategory}
      />
      {!isDesktop && state.confirmedCategory && (
        <div className="mx-auto max-w-xs sm:max-w-sm">
          <DeviceModel />
        </div>
      )}
    </div>
  )
}
