import React, { useEffect, useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, Edit2 } from 'lucide-react'
import { getSops, createSop, updateSop, deleteSop, getSopCategories } from '../api/client'

function StepEditor({ steps, onChange }) {
  const add = () => onChange([...steps, { step: steps.length + 1, action: '', detail: '', checklist: [] }])
  const update = (i, field, val) => {
    const next = [...steps]
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }
  const remove = (i) => onChange(steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, step: idx + 1 })))

  return (
    <div className="space-y-2">
      {steps.map((s, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
            <input
              value={s.action}
              onChange={e => update(i, 'action', e.target.value)}
              placeholder="步骤名称"
              className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button onClick={() => remove(i)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14} /></button>
          </div>
          <textarea
            value={s.detail}
            onChange={e => update(i, 'detail', e.target.value)}
            placeholder="步骤详情（可选）"
            rows={2}
            className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>
      ))}
      <button onClick={add} className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 mt-1">
        <Plus size={14} /> 添加步骤
      </button>
    </div>
  )
}

function SOPForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: '', category: '通用', description: '', trigger: '', tags: '', steps: [],
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SOP 名称 *</label>
          <input required value={form.title} onChange={e => set('title', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例：月度复盘流程" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
          <input value={form.category} onChange={e => set('category', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例：管理 / 运营 / 研发" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">触发场景</label>
        <input value={form.trigger} onChange={e => set('trigger', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="什么情况下使用这个 SOP" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
        <input value={form.tags} onChange={e => set('tags', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="工作, 团队, 月度..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">执行步骤</label>
        <StepEditor steps={form.steps} onChange={v => set('steps', v)} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">取消</button>
        <button type="submit" className="btn-primary">保存 SOP</button>
      </div>
    </form>
  )
}

function SOPCard({ sop, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">{sop.title}</h3>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{sop.category}</span>
            <span className="text-xs text-gray-400">v{sop.version}</span>
            {sop.tags?.map(t => (
              <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{t}</span>
            ))}
          </div>
          {sop.trigger && <p className="text-xs text-gray-500 mt-1">触发场景：{sop.trigger}</p>}
          {sop.description && <p className="text-sm text-gray-600 mt-1">{sop.description}</p>}
          <p className="text-xs text-gray-400 mt-1">共 {sop.steps?.length || 0} 个步骤</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(sop)} className="btn-ghost p-1.5"><Edit2 size={14} /></button>
          <button onClick={() => onDelete(sop)} className="btn-ghost p-1.5 hover:text-red-500"><Trash2 size={14} /></button>
          <button onClick={() => setExpanded(e => !e)} className="btn-ghost p-1.5">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && sop.steps?.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
          {sop.steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{step.step}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">{step.action}</p>
                {step.detail && <p className="text-xs text-gray-500 mt-0.5">{step.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SOPManager() {
  const [sops, setSops] = useState([])
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editSop, setEditSop] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [s, c] = await Promise.all([getSops(), getSopCategories()])
    setSops(s); setCategories(c)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleSave = async (form) => {
    if (editSop) await updateSop(editSop.id, form)
    else await createSop(form)
    setShowForm(false); setEditSop(null); load()
  }

  const handleDelete = async (sop) => {
    if (!confirm(`确认删除「${sop.title}」SOP？`)) return
    await deleteSop(sop.id); load()
  }

  const filtered = filter === 'all' ? sops : sops.filter(s => s.category === filter)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">SOP 流程库</h2>
          <p className="text-sm text-gray-500 mt-1">标准作业程序，结构化你的重复工作</p>
        </div>
        <button onClick={() => { setEditSop(null); setShowForm(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> 新建 SOP
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', ...categories].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${filter === cat ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            {cat === 'all' ? '全部' : cat}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="card mb-4">
          <h3 className="font-medium text-gray-900 mb-4">{editSop ? '编辑 SOP' : '新建 SOP'}</h3>
          <SOPForm initial={editSop || {}} onSave={handleSave} onCancel={() => { setShowForm(false); setEditSop(null) }} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">📖</div>
          <p>暂无 SOP，点击「新建 SOP」开始</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(sop => (
            <SOPCard key={sop.id} sop={sop}
              onEdit={s => { setEditSop(s); setShowForm(true) }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
