export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error'

export type LampState = 'ON' | 'OFF'

export type MessageDirection = 'sent' | 'received'

export interface HistoryMessage {
    id: string;
    topic: string;
    payload: string;
    direction: MessageDirection;
    timestamp: number;
}

export interface SensorReading {
  value: number;
  timestamp: number;
}

export interface LampStatus {
  state: LampState;
  timestamp: number;
}