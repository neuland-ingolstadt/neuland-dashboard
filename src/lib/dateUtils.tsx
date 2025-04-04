import { differenceInDays, format, isSameDay } from 'date-fns'

export function formatDateInterval(
  startTime: Date | null,
  endTime: Date | null,
  rrule: string | null
) {
  if (!startTime) {
    return <span />
  }

  if (!endTime) {
    return <span>{`${format(startTime, 'HH:mm')} Uhr`}</span>
  }

  if (rrule) {
    if (isSameDay(startTime, endTime)) {
      return (
        <span>{`${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')} Uhr`}</span>
      )
    }

    return (
      <div>
        <span>
          {format(startTime, 'HH:mm')} Uhr - {format(endTime, 'HH:mm')} Uhr
        </span>{' '}
        <span className="text-xs text-muted-foreground">
          (+{differenceInDays(endTime, startTime)}{' '}
          {differenceInDays(endTime, startTime) > 1 ? 'Tage' : 'Tag'})
        </span>
      </div>
    )
  }

  if (isSameDay(startTime, endTime)) {
    return `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')} Uhr`
  }

  return (
    <span>
      {`${format(startTime, 'dd.MM.yyyy HH:mm')} - ${format(
        endTime,
        'dd.MM.yyyy HH:mm'
      )}`}
    </span>
  )
}
