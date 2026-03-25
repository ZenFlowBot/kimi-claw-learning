import React, { useState } from 'react'
import ScheduleView from '../ScheduleView'
import dayjs from 'dayjs'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
dayjs.extend(quarterOfYear)

function currentQuarter() {
  const now = dayjs()
  return { year: now.year(), q: now.quarter() }
}

function quarterKey(year, q) { return `${year}-Q${q}` }
function quarterLabel(year, q) { return `${year} 年 Q${q}` }
function navigate(year, q, d) {
  let nq = q + d, ny = year
  if (nq > 4) { nq = 1; ny++ }
  if (nq < 1) { nq = 4; ny-- }
  return { year: ny, q: nq }
}

export default function QuarterView() {
  const init = currentQuarter()
  const [year, setYear] = useState(init.year)
  const [q, setQ] = useState(init.q)
  const handleNav = (d) => {
    const next = navigate(year, q, d)
    setYear(next.year); setQ(next.q)
  }
  return (
    <ScheduleView
      period="quarter"
      periodKey={quarterKey(year, q)}
      title={quarterLabel(year, q)}
      onNavigate={handleNav}
    />
  )
}
