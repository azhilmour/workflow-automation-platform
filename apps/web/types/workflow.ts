export type WorkflowStatus = 'ACTIVE' | 'INACTIVE'

export interface INode {
  id: string
  name: string
  type: string
  typeVersion: number
  position: [number, number]
  disabled?: boolean
  notes?: string
  parameters: Record<string, any>
  credentials?: Record<string, { id: string | null; name: string }>
  webhookId?: string
}

export interface IConnection {
  node: string
  type: string
  index: number
}

export type NodeInputConnections = Array<IConnection[] | null>

export interface INodeConnections {
  [nodeInput: string]: NodeInputConnections
}

export interface IConnections {
  [node: string]: INodeConnections
}

export interface WorkflowDTO {
  id: number
  name: string
  status: WorkflowStatus
  nodes: INode[]
  connections: IConnections
  triggerCount: number
  userId: string
}


