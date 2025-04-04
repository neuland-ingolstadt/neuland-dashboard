import { Switch } from '@/components/ui/switch'
import { useRecurrence } from '@/lib/providers/recurrenceProvider'
import React from 'react'

interface RecurringSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => boolean
}

const RecurringSwitch = React.memo(function RecurringSwitch({
  checked,
  onCheckedChange,
}: RecurringSwitchProps) {
  const { changeRecurrence } = useRecurrence()
  return (
    <Switch
      checked={checked || false}
      onCheckedChange={(checked) => {
        const valid = onCheckedChange(checked)
        if (!valid) {
          return
        }

        changeRecurrence({
          isRecurring: checked,
        })
      }}
      className="!mt-0"
    />
  )
})

export default RecurringSwitch
