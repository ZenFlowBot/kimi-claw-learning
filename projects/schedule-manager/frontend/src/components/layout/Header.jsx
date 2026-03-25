import React from 'react'
import { Menu } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

export default function Header({ onToggleSidebar }) {
  const now = dayjs()
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shrink-0">
      <button onClick={onToggleSidebar} className="btn-ghost p-2">
        <Menu size={18} />
      </button>
      <div className="flex-1" />
      <div className="text-sm text-gray-500">
        {now.format('YYYY年MM月DD日 dddd')}
        <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
          第 {now.week()} 周
        </span>
      </div>
    </header>
  )
}
