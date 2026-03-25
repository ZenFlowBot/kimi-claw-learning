import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboard } from '../../api/client'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
dayjs.extend(weekOfYear)

const PRIORITY_BADGE = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' }
const PRIORITY_LABEL = { high: '高', medium: '中', low: '低' }

function Section({ title, items, emptyText, color, onClick }) {
  return (
    <div className="card">
      <div className={`flex items-center gap-2 mb-3`}>
        <span className={`w-2 h-2 rounded-full ${color}`} />
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 py-3 text-center">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {items.slice(0, 5).map(item => (
            <li key={item.id} className="flex items-start gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => onClick && onClick(item)}>
              <span className={PRIORITY_BADGE[item.priority]}>{PRIORITY_LABEL[item.priority]}</span>
              <span className="flex-1 truncate text-gray-700">{item.title}</span>
              {item.due_date && <span className="text-xs text-gray-400 shrink-0">{item.due_date}</span>}
            </li>
          ))}
          {items.length > 5 && <li className="text-xs text-gray-400 text-center pt-1">还有 {items.length - 5} 项...</li>}
        </ul>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getDashboard().then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>
  if (!data) return <div className="text-center py-20 text-red-400">加载失败，请检查后端服务</div>

  const today = dayjs()
  const overdue = [...(data.overdue_items || []), ...(data.overdue_todos || [])]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">总览仪表盘</h2>
        <p className="text-gray-500 text-sm mt-1">
          {today.format('YYYY年MM月DD日')} · 第 {today.week()} 周
        </p>
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-medium text-red-700">
            ⚠️ 您有 {overdue.length} 个已逾期事项，请及时处理
          </p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '今日事项', count: data.today?.length || 0, color: 'text-blue-600 bg-blue-50', path: '/day' },
          { label: '本周事项', count: data.this_week?.length || 0, color: 'text-purple-600 bg-purple-50', path: '/week' },
          { label: '本月事项', count: data.this_month?.length || 0, color: 'text-green-600 bg-green-50', path: '/month' },
          { label: '待办清单', count: data.pending_todos?.length || 0, color: 'text-orange-600 bg-orange-50', path: '/todos' },
        ].map(stat => (
          <div
            key={stat.label}
            className="card cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(stat.path)}
          >
            <div className={`text-2xl font-bold ${stat.color.split(' ')[0]} ${stat.color.split(' ')[1]} w-10 h-10 rounded-lg flex items-center justify-center mb-2`}>
              {stat.count}
            </div>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Section title="今日待办" items={data.today || []} emptyText="今天没有日程事项" color="bg-blue-500"
          onClick={() => navigate('/day')} />
        <Section title="本周事项" items={data.this_week || []} emptyText="本周没有周计划" color="bg-purple-500"
          onClick={() => navigate('/week')} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <Section title="本月计划" items={data.this_month || []} emptyText="本月暂无计划" color="bg-green-500"
          onClick={() => navigate('/month')} />
        <Section title="本季度目标" items={data.this_quarter || []} emptyText="本季度暂无目标" color="bg-yellow-500"
          onClick={() => navigate('/quarter')} />
        <Section title="全年规划" items={data.this_year || []} emptyText="年度规划暂为空" color="bg-red-500"
          onClick={() => navigate('/year')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Section title="临时待办" items={data.pending_todos || []} emptyText="没有临时待办" color="bg-orange-500"
          onClick={() => navigate('/todos')} />
        <Section title="逾期事项" items={overdue} emptyText="暂无逾期事项 👍" color="bg-red-600" />
      </div>
    </div>
  )
}
