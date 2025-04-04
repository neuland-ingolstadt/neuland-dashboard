import { useRecurrence } from '@/lib/providers/recurrenceProvider'
import React from 'react'

const RRuleText = React.memo(function RRuleText() {
  const { rrule } = useRecurrence()
  const rruleText = rrule?.toText() || 'Keine Wiederholung'

  return <span className="first-letter:capitalize">{rruleText}</span>
})

export default RRuleText
