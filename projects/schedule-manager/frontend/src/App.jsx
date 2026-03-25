import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Dashboard from './components/views/Dashboard'
import YearView from './components/views/YearView'
import QuarterView from './components/views/QuarterView'
import MonthView from './components/views/MonthView'
import WeekView from './components/views/WeekView'
import DayView from './components/views/DayView'
import SOPManager from './components/SOPManager'
import TodoList from './components/TodoList'
import ReminderSettings from './components/ReminderSettings'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(o => !o)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/year" element={<YearView />} />
            <Route path="/quarter" element={<QuarterView />} />
            <Route path="/month" element={<MonthView />} />
            <Route path="/week" element={<WeekView />} />
            <Route path="/day" element={<DayView />} />
            <Route path="/sops" element={<SOPManager />} />
            <Route path="/todos" element={<TodoList />} />
            <Route path="/reminders" element={<ReminderSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
