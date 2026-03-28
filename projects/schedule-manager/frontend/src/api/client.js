import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// ─── Schedules ────────────────────────────────────────────────────────────────
export const getSchedules = (period, periodKey) =>
  api.get('/schedules', { params: { period, period_key: periodKey } }).then(r => r.data)

export const createSchedule = (data) =>
  api.post('/schedules', data).then(r => r.data)

export const updateSchedule = (id, period, periodKey, data) =>
  api.put(`/schedules/${id}`, data, { params: { period, period_key: periodKey } }).then(r => r.data)

export const deleteSchedule = (id, period, periodKey) =>
  api.delete(`/schedules/${id}`, { params: { period, period_key: periodKey } }).then(r => r.data)

export const getDashboard = () =>
  api.get('/schedules/dashboard').then(r => r.data)

// ─── SOPs ─────────────────────────────────────────────────────────────────────
export const getSops = (params = {}) =>
  api.get('/sops', { params }).then(r => r.data)

export const createSop = (data) =>
  api.post('/sops', data).then(r => r.data)

export const updateSop = (id, data) =>
  api.put(`/sops/${id}`, data).then(r => r.data)

export const deleteSop = (id) =>
  api.delete(`/sops/${id}`).then(r => r.data)

export const getSopCategories = () =>
  api.get('/sops/categories').then(r => r.data)

// ─── Todos ────────────────────────────────────────────────────────────────────
export const getTodos = (params = {}) =>
  api.get('/todos', { params }).then(r => r.data)

export const createTodo = (data) =>
  api.post('/todos', data).then(r => r.data)

export const updateTodo = (id, data) =>
  api.put(`/todos/${id}`, data).then(r => r.data)

export const deleteTodo = (id) =>
  api.delete(`/todos/${id}`).then(r => r.data)

// ─── Recurring Templates ──────────────────────────────────────────────────────
export const getRecurring = (periodType) =>
  api.get('/recurring', { params: periodType ? { period_type: periodType } : {} }).then(r => r.data)

export const createRecurring = (data) =>
  api.post('/recurring', data).then(r => r.data)

export const updateRecurring = (id, data) =>
  api.put(`/recurring/${id}`, data).then(r => r.data)

export const deleteRecurring = (id) =>
  api.delete(`/recurring/${id}`).then(r => r.data)

export const getCompletions = (periodKey) =>
  api.get(`/recurring/completions/${periodKey}`).then(r => r.data)

export const toggleCompletion = (periodKey, templateId, done) =>
  api.post(`/recurring/completions/${periodKey}/${templateId}`, null, { params: { done } }).then(r => r.data)

// ─── Reminders ────────────────────────────────────────────────────────────────
export const getReminderSettings = () =>
  api.get('/reminders/settings').then(r => r.data)

export const updateReminderSettings = (data) =>
  api.put('/reminders/settings', data).then(r => r.data)

export const sendTestReminder = () =>
  api.post('/reminders/test').then(r => r.data)

export const triggerDigest = (type) =>
  api.post(`/reminders/${type}`).then(r => r.data)
