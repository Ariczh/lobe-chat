// ─── Device Info ───

export interface DeviceAttachment {
  connectedAt: number;
  deviceId: string;
  hostname: string;
  platform: string;
}

// ─── WebSocket Protocol Messages (mirrors apps/device-gateway/src/types.ts) ───

// Client → Server
export interface HeartbeatMessage {
  type: 'heartbeat';
}

export interface ToolCallResponseMessage {
  requestId: string;
  result: {
    content: string;
    error?: string;
    success: boolean;
  };
  type: 'tool_call_response';
}

// Server → Client
export interface HeartbeatAckMessage {
  type: 'heartbeat_ack';
}

export interface AuthExpiredMessage {
  type: 'auth_expired';
}

export interface ToolCallRequestMessage {
  requestId: string;
  toolCall: {
    apiName: string;
    arguments: string;
    identifier: string;
  };
  type: 'tool_call_request';
}

export type ClientMessage = HeartbeatMessage | ToolCallResponseMessage;
export type ServerMessage = AuthExpiredMessage | HeartbeatAckMessage | ToolCallRequestMessage;

// ─── Client Types ───

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

export interface GatewayClientEvents {
  auth_expired: () => void;
  connected: () => void;
  disconnected: () => void;
  error: (error: Error) => void;
  heartbeat_ack: () => void;
  reconnecting: (delay: number) => void;
  status_changed: (status: ConnectionStatus) => void;
  tool_call_request: (request: ToolCallRequestMessage) => void;
}
