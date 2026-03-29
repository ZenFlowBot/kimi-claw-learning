import React, { useState } from 'react'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'
import ScheduleView from '../ScheduleView'
dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)

function pad(n) { return String(n).padStart(2, '0') }

export default function WeekView() {
  const now = dayjs()
  const [base, setBase] = useState(now)

  const year = base.year()
  const week = base.isoWeek()
  const periodKey = `${year}-W${pad(week)}`

  const weekStart = base.startOf('isoWeek').format('MM/DD')
  const weekEnd = base.endOf('isoWeek').format('MM/DD')

  const handleNav = (d) => setBase(b => b.add(d * 7, 'day'))

  return (
    <ScheduleView
      period="week"
      periodKey={periodKey}
      title={`第 ${week} 周（${weekStart} - ${weekEnd}）`}
      onNavigate={handleNav}
    />
  )
}
