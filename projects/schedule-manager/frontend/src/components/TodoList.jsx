import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, CheckCircle, Circle, Clock } from 'lucide-react'
import { getTodos, createTodo, updateTodo, deleteTodo } from '../api/client'
import ItemForm from './ItemForm'

const STATUS_CYCLE = { pending: 'done', in_progress: 'done', done: 'pending' }
const STATUS_ICON = {
  pending: <Circle size={16} className="text-gray-400" />,
  in_progress: <Clock size={16} className="text-blue-500" />,
  done: <CheckCircle size={16} className="text-green-500" />,
}
const PRIORITY_BADGE = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' }
const PRIORITY_LABEL = { high: '高', medium: '中', low: '低' }

export default function TodoList() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTodo, setEditTodo] = useState(null)
  const [filter, setFilter] = useState('active')

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getTodos()
    setTodos(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async (form) => {
    if (editTodo) await updateTodo(editTodo.id, form)
    else await createTodo(form)
    setShowForm(false); setEditTodo(null); load()
  }

  const handleStatusToggle = async (todo) => {
    const next = STATUS_CYCLE[todo.status] || 'pending'
    await updateTodo(todo.id, { status: next })
    load()
  }

  const handleDelete = async (todo) => {
    if (!confirm(`确认删除「${todo.title}」？`)) return
    await deleteTodo(todo.id); load()
  }

  const filtered = todos.filter(t => {
    if (filter === 'active') return !['done', 'cancelled'].includes(t.status)
    if (filter === 'done') return t.status === 'done'
    return true
  })

  const stats = {
    total: todos.length,
    done: todos.filter(t => t.status === 'done').length,
    high: todos.filter(t => t.priority === 'high' && !['done', 'cancelled'].includes(t.status)).length,
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">临时待办</h2>
          <p className="text-sm text-gray-500 mt-1">
            共 {stats.total} 项 · {stats.done} 已完成 · {stats.high} 高优先级
          </p>
        </div>
        <button onClick={() => { setEditTodo(null); setShowForm(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> 快速添加
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {[['all', '全部'], ['active', '待处理'], ['done', '已完成']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${filter === v ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            {l}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="card mb-4">
          <h3 className="font-medium text-gray-900 mb-4">{editTodo ? '编辑待办' : '新增待办'}</h3>
          <ItemForm
            initial={editTodo || {}}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditTodo(null) }}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">✅</div>
          <p>{filter === 'done' ? '暂无已完成的待办' : '没有待处理事项，很棒！'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(todo => (
            <div key={todo.id}
              className={`card flex items-start gap-3 group hover:shadow-md transition-shadow ${todo.status === 'done' ? 'opacity-60' : ''}`}
            >
              <button onClick={() => handleStatusToggle(todo)} className="mt-0.5 shrink-0">
                {STATUS_ICON[todo.status] || STATUS_ICON.pending}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-medium text-sm ${todo.status === 'done' ? 'line-through text-gray-400' : ''}`}>
                    {todo.title}
                  </span>
                  <span className={PRIORITY_BADGE[todo.priority]}>{PRIORITY_LABEL[todo.priority]}</span>
                  {todo.tags?.map(t => (
                    <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{t}</span>
                  ))}
                </div>
                {todo.description && <p className="text-xs text-gray-400 mt-1 truncate">{todo.description}</p>}
                {todo.due_date && <p className="text-xs text-gray-400 mt-0.5">截止: {todo.due_date}</p>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => { setEditTodo(todo); setShowForm(true) }} className="text-xs text-gray-400 hover:text-blue-600 px-2 py-1 rounded">编辑</button>
                <button onClick={() => handleDelete(todo)} className="text-xs text-gray-400 hover:text-red-600 px-2 py-1 rounded"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
