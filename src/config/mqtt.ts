export const DEFAULT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt'

const BASE = 'fiap/3espw/roger-iot-7k3'

export const TOPICS = {
    temperatura: `${BASE}/sensor/temperatura`,
    umidade: `${BASE}/sensor/umidade`,
    comando: `${BASE}/lampada/comando`,
    estado: `${BASE}/lampada/estado`,
} as const