import React, { useState } from 'react'
import dayjs from 'dayjs'
import ScheduleView from '../ScheduleView'

export default function DayView() {
  const [base, setBase] = useState(dayjs())
  const periodKey = base.format('YYYY-MM-DD')
  const title = `${base.format('YYYY年MM月DD日')} 日程`
  return (
    <ScheduleView
      period="day"
      periodKey={periodKey}
      title={title}
      onNavigate={d => setBase(b => b.add(d, 'day'))}
    />
  )
}
