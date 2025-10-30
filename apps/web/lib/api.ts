export const BACKEND_BASE_URL = "http://localhost:8080"
export const EXECUTOR_BASE_URL = "http://localhost:8090"

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path: string, init?: RequestInit, base: 'backend' | 'executor' = 'backend') {
  const baseUrl = base === 'backend' ? BACKEND_BASE_URL : EXECUTOR_BASE_URL
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed: ${res.status}`)
  }
  const contentType = res.headers.get('content-type') || ''
  return contentType.includes('application/json') ? res.json() : res.text()
}

export type CreateWorkflowPayload = {
  name: string
  status?: 'ACTIVE' | 'INACTIVE'
  nodes: any[]
  connections: Record<string, any>
}

export async function getAllWorkflows() {
  return request('/api/workflow', { method: 'GET' })
}

export async function getWorkflowById(id: number | string) {
  return request(`/api/workflow/${id}`, { method: 'GET' })
}

export async function createWorkflow(payload: CreateWorkflowPayload) {
  return request('/api/workflow', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateWorkflow(id: number | string, data: Partial<CreateWorkflowPayload>) {
  return request(`/api/workflow/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteWorkflow(id: number | string) {
  return request(`/api/workflow/${id}`, { method: 'DELETE' })
}

export async function executeWorkflow(webhookId: string, triggerData: Record<string, any>) {
  return request(`/webhook/handler/${webhookId}`, { method: 'POST', body: JSON.stringify(triggerData) }, 'executor')
}


