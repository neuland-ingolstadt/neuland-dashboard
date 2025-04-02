import { differenceInDays, format, isSameDay } from 'date-fns'

export function formatDateInterval(
  startTime: Date,
  endTime: Date | null,
  rrule: string | null
) {
  if (!endTime) {
    return format(startTime, 'dd.MM.yyyy HH:mm')
  }

  if (rrule) {
    if (isSameDay(startTime, endTime)) {
      return `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')} Uhr`
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
    return `${format(startTime, 'dd.MM.yyyy HH:mm')} - ${format(endTime, 'HH:mm')}`
  }

  return `${format(startTime, 'dd.MM.yyyy HH:mm')} - ${format(
    endTime,
    'dd.MM.yyyy HH:mm'
  )}`
}
