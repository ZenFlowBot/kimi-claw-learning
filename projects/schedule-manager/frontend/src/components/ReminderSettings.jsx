import React, { useEffect, useState } from 'react'
import { Bell, Mail, Webhook, Send } from 'lucide-react'
import { getReminderSettings, updateReminderSettings, sendTestReminder, triggerDigest } from '../api/client'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_LABELS = { Monday: '周一', Tuesday: '周二', Wednesday: '周三', Thursday: '周四', Friday: '周五', Saturday: '周六', Sunday: '周日' }

export default function ReminderSettings() {
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)
  const [testMsg, setTestMsg] = useState('')

  useEffect(() => {
    getReminderSettings().then(setSettings)
  }, [])

  const toggleChannel = (ch) => {
    setSettings(s => {
      const channels = s.channels.includes(ch) ? s.channels.filter(c => c !== ch) : [...s.channels, ch]
      return { ...s, channels }
    })
  }

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    await updateReminderSettings(settings)
    setSaving(false)
    setTestMsg('设置已保存 ✓')
    setTimeout(() => setTestMsg(''), 2000)
  }

  const handleTest = async () => {
    await sendTestReminder()
    setTestMsg('测试提醒已发送，请检查配置的渠道 ✓')
    setTimeout(() => setTestMsg(''), 3000)
  }

  const handleDigest = async (type) => {
    await triggerDigest(type)
    setTestMsg(`${type === 'daily' ? '每日' : type === 'weekly' ? '每周' : '每月'}摘要已触发 ✓`)
    setTimeout(() => setTestMsg(''), 3000)
  }

  if (!settings) return <div className="text-center py-12 text-gray-400">加载中...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">提醒设置</h2>
        <p className="text-sm text-gray-500 mt-1">配置日程提醒的时间和渠道</p>
      </div>

      {testMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{testMsg}</div>
      )}

      {/* Channels */}
      <div className="card mb-4">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Bell size={16} /> 提醒渠道</h3>
        <div className="space-y-3">
          {[
            { id: 'terminal', icon: '💻', label: '终端输出', desc: '在服务器终端直接打印提醒信息' },
            { id: 'email', icon: '📧', label: '邮件通知', desc: '发送提醒邮件到指定邮箱' },
            { id: 'webhook', icon: '🔗', label: 'Webhook 推送', desc: '推送到钉钉/企业微信/Slack 机器人' },
          ].map(ch => (
            <label key={ch.id} className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={settings.channels.includes(ch.id)}
                onChange={() => toggleChannel(ch.id)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-lg">{ch.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">{ch.label}</p>
                <p className="text-xs text-gray-500">{ch.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Email config */}
      {settings.channels.includes('email') && (
        <div className="card mb-4">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Mail size={16} /> 邮件配置</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">接收邮箱</label>
            <input value={settings.email_to || ''} onChange={e => set('email_to', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com" />
            <p className="text-xs text-gray-400 mt-1">SMTP 配置请通过环境变量设置：SMTP_HOST / SMTP_USER / SMTP_PASS</p>
          </div>
        </div>
      )}

      {/* Webhook config */}
      {settings.channels.includes('webhook') && (
        <div className="card mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">Webhook 配置</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Webhook 类型</label>
              <select value={settings.webhook_type} onChange={e => set('webhook_type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="dingtalk">钉钉机器人</option>
                <option value="wecom">企业微信机器人</option>
                <option value="slack">Slack Webhook</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
              <input value={settings.webhook_url || ''} onChange={e => set('webhook_url', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://oapi.dingtalk.com/robot/send?access_token=..." />
            </div>
          </div>
        </div>
      )}

      {/* Schedule */}
      <div className="card mb-4">
        <h3 className="font-semibold text-gray-800 mb-4">定时摘要配置</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">每日推送时间</label>
            <input type="time" value={settings.daily_digest_time}
              onChange={e => set('daily_digest_time', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">每周摘要（星期）</label>
            <select value={settings.weekly_digest_day} onChange={e => set('weekly_digest_day', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">每月摘要（几号）</label>
            <input type="number" min={1} max={28} value={settings.monthly_digest_day}
              onChange={e => set('monthly_digest_day', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? '保存中...' : '保存设置'}
        </button>
        <button onClick={handleTest} className="btn-ghost border border-gray-300 flex items-center gap-2">
          <Send size={14} /> 发送测试
        </button>
        <button onClick={() => handleDigest('daily')} className="btn-ghost border border-gray-200 text-xs">
          触发每日摘要
        </button>
        <button onClick={() => handleDigest('weekly')} className="btn-ghost border border-gray-200 text-xs">
          触发每周摘要
        </button>
        <button onClick={() => handleDigest('monthly')} className="btn-ghost border border-gray-200 text-xs">
          触发每月摘要
        </button>
      </div>
    </div>
  )
}
