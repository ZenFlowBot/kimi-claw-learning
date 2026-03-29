/**
 * Generic schedule view used by Year/Quarter/Month/Week/Day pages.
 * Handles: list, create, update status, delete.
 */
import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, CheckCircle, Clock, Circle, XCircle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, getRecurring, createRecurring, deleteRecurring, getCompletions, toggleCompletion } from '../api/client'
import ItemForm from './ItemForm'

const PRIORITY_BADGE = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' }
const PRIORITY_LABEL = { high: '高', medium: '中', low: '低' }
const STATUS_CYCLE = { pending: 'done', in_progress: 'done', done: 'pending' }
const STATUS_ICON = {
  pending: <Circle size={16} className="text-gray-400" />,
  in_progress: <Clock size={16} className="text-green-500" />,
  done: <CheckCircle size={16} className="text-green-500" />,
  cancelled: <XCircle size={16} className="text-gray-300" />,
}
const STATUS_LABEL = { pending: '待办', in_progress: '进行中', done: '完成', cancelled: '取消' }

export default function ScheduleView({ period, periodKey, title, onNavigate, extraFields }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [filter, setFilter] = useState('all')
  const [recurring, setRecurring] = useState([])
  const [completions, setCompletions] = useState([])
  const [showRecurringForm, setShowRecurringForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [data, rec, comp] = await Promise.all([
        getSchedules(period, periodKey),
        getRecurring(period),
        getCompletions(periodKey),
      ])
      setItems(data)
      setRecurring(rec)
      setCompletions(comp)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [period, periodKey])

  useEffect(() => { load() }, [load])

  const handleSave = async (form) => {
    if (editItem) {
      await updateSchedule(editItem.id, period, periodKey, form)
    } else {
      await createSchedule({ ...form, period, period_key: periodKey })
    }
    setShowForm(false)
    setEditItem(null)
    load()
  }

  const handleStatusToggle = async (item) => {
    const next = STATUS_CYCLE[item.status] || 'pending'
    await updateSchedule(item.id, period, periodKey, { status: next })
    load()
  }

  const handleDelete = async (item) => {
    if (!confirm(`确认删除「${item.title}」？`)) return
    await deleteSchedule(item.id, period, periodKey)
    load()
  }

  const handleRecurringSave = async (form) => {
    await createRecurring({ ...form, period_type: period })
    setShowRecurringForm(false)
    load()
  }

  const handleRecurringDelete = async (template) => {
    if (!confirm(`确认删除固定事项「${template.title}」？删除后所有周期都不再显示。`)) return
    await deleteRecurring(template.id)
    load()
  }

  const handleToggleCompletion = async (template) => {
    const isDone = completions.includes(template.id)
    await toggleCompletion(periodKey, template.id, !isDone)
    setCompletions(prev => isDone ? prev.filter(id => id !== template.id) : [...prev, template.id])
  }

  const filtered = items.filter(i => {
    if (filter === 'active') return !['done', 'cancelled'].includes(i.status)
    if (filter === 'done') return i.status === 'done'
    return true
  })

  const stats = {
    total: items.length,
    done: items.filter(i => i.status === 'done').length,
    active: items.filter(i => !['done', 'cancelled'].includes(i.status)).length,
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            {onNavigate && (
              <>
                <button onClick={() => onNavigate(-1)} className="btn-ghost p-1"><ChevronLeft size={16} /></button>
                <button onClick={() => onNavigate(1)} className="btn-ghost p-1"><ChevronRight size={16} /></button>
              </>
            )}
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <span className="text-sm text-gray-400 font-normal">{periodKey}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            共 {stats.total} 项 · {stats.done} 已完成 · {stats.active} 待处理
          </p>
        </div>
        <button onClick={() => { setEditItem(null); setShowForm(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> 新增事项
        </button>
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>完成进度</span>
            <span>{Math.round((stats.done / stats.total) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(stats.done / stats.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Recurring templates section */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RefreshCw size={14} className="text-green-500" />
            <span className="text-sm font-semibold text-gray-700">固定重复事项</span>
            <span className="text-xs text-gray-400">每个{period === 'week' ? '周' : period === 'month' ? '月' : period === 'day' ? '天' : period === 'quarter' ? '季度' : '年'}自动出现</span>
          </div>
          <button onClick={() => setShowRecurringForm(v => !v)} className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1">
            <Plus size={12} /> 添加固定事项
          </button>
        </div>

        {showRecurringForm && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <ItemForm
              initial={{}}
              onSave={handleRecurringSave}
              onCancel={() => setShowRecurringForm(false)}
              hideFields={['due_date', 'reminder_days_before']}
            />
          </div>
        )}

        {recurring.length === 0 && !showRecurringForm ? (
          <p className="text-xs text-gray-400 text-center py-2">暂无固定事项，点击「添加固定事项」设置</p>
        ) : (
          <div className="space-y-1.5">
            {recurring.map(t => {
              const done = completions.includes(t.id)
              return (
                <div key={t.id} className={`flex items-center gap-2 group p-1.5 rounded-lg hover:bg-gray-50 ${done ? 'opacity-50' : ''}`}>
                  <button onClick={() => handleToggleCompletion(t)} className="shrink-0">
                    {done ? <CheckCircle size={16} className="text-green-500" /> : <Circle size={16} className="text-gray-300" />}
                  </button>
                  <span className={`flex-1 text-sm ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{t.title}</span>
                  <span className={PRIORITY_BADGE[t.priority]}>{PRIORITY_LABEL[t.priority]}</span>
                  {t.tags?.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">#{tag}</span>
                  ))}
                  <button onClick={() => handleRecurringDelete(t)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity">
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[['all', '全部'], ['active', '进行中'], ['done', '已完成']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
              filter === v ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-4">
          <h3 className="font-medium text-gray-900 mb-4">{editItem ? '编辑事项' : '新增事项'}</h3>
          <ItemForm
            initial={editItem || {}}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditItem(null) }}
          />
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">📋</div>
          <p>暂无事项，点击「新增事项」开始添加</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered
            .sort((a, b) => {
              const po = { high: 0, medium: 1, low: 2 }
              return (po[a.priority] || 1) - (po[b.priority] || 1)
            })
            .map(item => (
              <div
                key={item.id}
                className={`card flex items-start gap-3 group hover:shadow-md transition-shadow ${
                  item.status === 'done' ? 'opacity-60' : ''
                }`}
              >
                <button onClick={() => handleStatusToggle(item)} className="mt-0.5 shrink-0">
                  {STATUS_ICON[item.status]}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium text-sm ${item.status === 'done' ? 'line-through text-gray-400' : ''}`}>
                      {item.title}
                    </span>
                    <span className={PRIORITY_BADGE[item.priority]}>
                      {PRIORITY_LABEL[item.priority]}
                    </span>
                    <span className={`status-${item.status}`}>{STATUS_LABEL[item.status]}</span>
                    {item.tags?.map(t => (
                      <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{t}</span>
                    ))}
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-1 truncate">{item.description}</p>
                  )}
                  {item.due_date && (
                    <p className="text-xs text-gray-400 mt-0.5">截止: {item.due_date}</p>
                  )}
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => { setEditItem(item); setShowForm(true) }}
                    className="text-xs text-gray-400 hover:text-green-600 px-2 py-1 rounded"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-xs text-gray-400 hover:text-red-600 px-2 py-1 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
