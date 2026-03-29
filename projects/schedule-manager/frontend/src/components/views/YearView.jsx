import React, { useState } from 'react'
import ScheduleView from '../ScheduleView'

export default function YearView() {
  const [year, setYear] = useState(new Date().getFullYear())
  return (
    <ScheduleView
      period="year"
      periodKey={String(year)}
      title={`${year} 年度规划`}
      onNavigate={d => setYear(y => y + d)}
    />
  )
}
