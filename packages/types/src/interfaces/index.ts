export interface INode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: Record<string, any>;
}

export interface IConnections {
  [nodeId: string]: {
    inputs: string[];
    outputs: string[];
  };
}
