export interface INode {
    id: string;
    name: string;
    typeVersion: number;
    type: string;
    position: [number, number];
    disabled?: boolean;
    notes?: string;
    retryOnFail?: boolean;
    maxTries?: number;
    waitBetweenTries?: number;
    executeOnce?: boolean;
    continueOnFail?: boolean;
    parameters: INodeParameters;
    credentials?: INodeCredentials;
    webhookId?: string;
    extendsCredential?: string;
  }
  
  export interface INodeParameters {
    [key: string]: any; // ToDo
  }
  
  export interface INodeCredentials {
    [credType: string]: {
      id: string | null;
      name: string;
    };
  }
  
  export interface IConnections {
    [node: string]: INodeConnections;
  }
  
  export interface INodeConnections {
    [nodeInput: string]: NodeInputConnections;
  }
  
  export type NodeInputConnections = Array<IConnection[] | null>;
  
  export interface IConnection {
    // The node the connection is to
    node: string;
  
    // The type of the input on destination node (for example "main")
    type: NodeConnectionType;
  
    // The output/input-index of destination node (if node has multiple inputs/outputs of the same type)
    index: number;
  }
  
  export const NodeConnectionTypes = {
    AiAgent: 'ai_agent',
    AiChain: 'ai_chain',
    AiDocument: 'ai_document',
    AiEmbedding: 'ai_embedding',
    AiLanguageModel: 'ai_languageModel',
    AiMemory: 'ai_memory',
    AiOutputParser: 'ai_outputParser',
    AiRetriever: 'ai_retriever',
    AiReranker: 'ai_reranker',
    AiTextSplitter: 'ai_textSplitter',
    AiTool: 'ai_tool',
    AiVectorStore: 'ai_vectorStore',
    Main: 'main',
  } as const;
  
  export type NodeConnectionType = (typeof NodeConnectionTypes)[keyof typeof NodeConnectionTypes];