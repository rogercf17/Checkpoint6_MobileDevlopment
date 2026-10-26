import mqtt, { MqttClient } from "mqtt";
import { TOPICS } from "../config/mqtt"
import { ConnectionStatus, HistoryMessage, LampState, MessageDirection } from "../types/mqtt";

type StatusListener = (status: ConnectionStatus, errorMessage?: string) => void
type MessageListener = (message: HistoryMessage) => void
type Unsubscribe = () => void

const SUBSCRIBE_TOPICS: string[] = [TOPICS.temperatura, TOPICS.umidade, TOPICS.estado]

function parseJson(payload: string): unknown {
    try {
        return JSON.parse(payload)
    }catch {
        return null
    }
}

export function parseSensorValue(payload: string): number | null {
    const data = parseJson(payload)

    if (typeof data === 'object' && data !== null && 'value' in data) {
        const value = (data as { value: unknown }).value
        if (typeof value === 'number' && Number.isFinite(value)) return value;
    }

    return null
}

export function parseLampState(payload: string): LampState | null {
    const data =  parseJson(payload)

    if (typeof data === 'object' && data !== null && 'state' in data) {
        const state = (data as { state: unknown }).state
        if (state === 'ON' || state === 'OFF') return state
    }

    return null
}

class MqttService {
    private client: MqttClient | null = null;
    private status: ConnectionStatus = 'disconnected';
    private lastUrl: string | null = null;
    private counter = 0;
    private statusListeners = new Set<StatusListener>();
    private messageListeners = new Set<MessageListener>();

    getStatus(): ConnectionStatus {
        return this.status;
    }

    onStatusChange(listener: StatusListener): Unsubscribe {
        this.statusListeners.add(listener);
        return () => {
        this.statusListeners.delete(listener);
        };
    }

    onMessage(listener: MessageListener): Unsubscribe {
        this.messageListeners.add(listener);
        return () => {
        this.messageListeners.delete(listener);
        };
    }

    connect(url: string): void {
        this.disconnect();
        this.lastUrl = url;
        this.setStatus('connecting');

        let client: MqttClient;
        try {
        client = mqtt.connect(url, {
            clientId: `iotcontrol_${Math.random().toString(16).slice(2, 10)}`,
            clean: true,
            reconnectPeriod: 3000,
            connectTimeout: 5000,
        });
        } catch (e) {
        this.setStatus('error', e instanceof Error ? e.message : 'URL inválida');
        return;
        }
        this.client = client;

        client.on('connect', () => {
        this.setStatus('connected');
        client.subscribe(SUBSCRIBE_TOPICS, { qos: 0 }, (err) => {
            if (err) this.setStatus('error', err.message);
        });
        });

        client.on('reconnect', () => this.setStatus('connecting'));

        client.on('error', (err) => this.setStatus('error', err.message));

        client.on('close', () => {
        if (this.client === client && this.status !== 'error') {
            this.setStatus('disconnected');
        }
        });

        client.on('message', (topic, payload) => {
        this.emitMessage(topic, payload.toString(), 'received');
        });
    }

    disconnect(): void {
        const client = this.client;
        if (!client) {
        this.setStatus('disconnected');
        return;
        }
        this.client = null;
        client.removeAllListeners();
        client.on('error', () => {}); 
        client.end(true);
        this.setStatus('disconnected');
    }

    reconnect(): void {
        if (this.lastUrl) this.connect(this.lastUrl);
    }

    publish(topic: string, payload: string): Promise<void> {
        return new Promise((resolve, reject) => {
        const client = this.client;
        if (!client || !client.connected) {
            reject(new Error('Não conectado ao broker. Conecte antes de enviar comandos.'));
            return;
        }
        client.publish(topic, payload, { qos: 0 }, (err) => {
            if (err) {
            reject(err);
            return;
            }
            this.emitMessage(topic, payload, 'sent');
            resolve();
        });
        });
    }

    sendLampCommand(action: LampState): Promise<void> {
        return this.publish(TOPICS.comando, JSON.stringify({ action }));
    }

    private setStatus(status: ConnectionStatus, errorMessage?: string): void {
        this.status = status;
        this.statusListeners.forEach((l) => l(status, errorMessage));
    }

    private emitMessage(topic: string, payload: string, direction: MessageDirection): void {
        const message: HistoryMessage = {
        id: `${Date.now()}-${this.counter++}`,
        topic,
        payload,
        direction,
        timestamp: Date.now(),
        };
        this.messageListeners.forEach((l) => l(message));
    }
}

export const mqttService = new MqttService()