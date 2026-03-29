import React, { useState } from 'react'
import dayjs from 'dayjs'
import ScheduleView from '../ScheduleView'

function pad(n) { return String(n).padStart(2, '0') }

export default function MonthView() {
  const now = dayjs()
  const [year, setYear] = useState(now.year())
  const [month, setMonth] = useState(now.month() + 1)

  const handleNav = (d) => {
    const next = dayjs(`${year}-${pad(month)}-01`).add(d, 'month')
    setYear(next.year()); setMonth(next.month() + 1)
  }

  return (
    <ScheduleView
      period="month"
      periodKey={`${year}-${pad(month)}`}
      title={`${year} 年 ${month} 月计划`}
      onNavigate={handleNav}
    />
  )
}
