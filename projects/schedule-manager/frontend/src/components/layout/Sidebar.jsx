import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, CalendarRange, Calendar,
  CalendarCheck, Clock, BookOpen, CheckSquare, Bell
} from 'lucide-react'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: '总览仪表盘' },
  { to: '/year', icon: CalendarRange, label: '全年规划' },
  { to: '/quarter', icon: CalendarDays, label: '季度目标' },
  { to: '/month', icon: Calendar, label: '月度计划' },
  { to: '/week', icon: CalendarCheck, label: '每周安排' },
  { to: '/day', icon: Clock, label: '每日事项' },
  null,
  { to: '/sops', icon: BookOpen, label: 'SOP 流程' },
  { to: '/todos', icon: CheckSquare, label: '临时待办' },
  { to: '/reminders', icon: Bell, label: '提醒设置' },
]

export default function Sidebar({ open }) {
  if (!open) return null
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col py-4 shrink-0">
      <div className="px-4 mb-6">
        <h1 className="text-lg font-bold text-blue-700 flex items-center gap-2">
          <span>📅</span> 日程管理
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">全维度计划管理平台</p>
      </div>
      <nav className="flex-1 px-2 space-y-0.5">
        {nav.map((item, i) => {
          if (!item) return <div key={i} className="my-3 border-t border-gray-100" />
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={16} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
