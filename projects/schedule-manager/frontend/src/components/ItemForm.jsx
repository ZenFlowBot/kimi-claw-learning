import React, { useState } from 'react'
import { X } from 'lucide-react'

const PRIORITIES = [
  { value: 'high', label: '高优先级', color: 'text-red-600' },
  { value: 'medium', label: '中优先级', color: 'text-yellow-600' },
  { value: 'low', label: '低优先级', color: 'text-green-600' },
]

export default function ItemForm({ initial = {}, onSave, onCancel, hideFields = [] }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    tags: '',
    reminder_days_before: 1,
    ...initial,
    tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : (initial.tags || ''),
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    onSave({ ...form, tags })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
        <input
          required
          value={form.title}
          onChange={e => set('title', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入事项标题..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="详细描述..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
          <select
            value={form.priority}
            onChange={e => set('priority', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PRIORITIES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {!hideFields.includes('due_date') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
            <input
              type="date"
              value={form.due_date}
              onChange={e => set('due_date', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">标签 (逗号分隔)</label>
          <input
            value={form.tags}
            onChange={e => set('tags', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="工作, 个人, 重要..."
          />
        </div>
        {!hideFields.includes('reminder_days_before') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">提前提醒 (天)</label>
            <input
              type="number"
              min={0}
              max={30}
              value={form.reminder_days_before}
              onChange={e => set('reminder_days_before', parseInt(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">取消</button>
        <button type="submit" className="btn-primary">保存</button>
      </div>
    </form>
  )
}
