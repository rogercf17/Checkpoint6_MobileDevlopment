const mqtt = require('mqtt');

// Mantenha igual ao src/config/mqtt.ts do app
const BROKER_URL = process.env.BROKER_URL || 'wss://broker.emqx.io:8084/mqtt';
const BASE = process.env.TOPIC_BASE || 'fiap/3espw/roger-iot-7k3';

const TOPICS = {
    temperatura: `${BASE}/sensor/temperatura`,
    umidade: `${BASE}/sensor/umidade`,
    comando: `${BASE}/lampada/comando`,
    estado: `${BASE}/lampada/estado`,
};

let lampState = 'OFF';
let temperature = 24;
let humidity = 58;

const log = (...args) => console.log(new Date().toLocaleTimeString('pt-BR'), ...args);
const randomStep = (max) => (Math.random() - 0.5) * 2 * max;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const client = mqtt.connect(BROKER_URL, {
    clientId: `iotcontrol_sim_${Math.random().toString(16).slice(2, 10)}`,
    reconnectPeriod: 3000,
    connectTimeout: 5000,
});

function publishTemperature() {
    temperature = clamp(temperature + randomStep(0.8), 15, 35);
    const payload = JSON.stringify({ value: Number(temperature.toFixed(1)) });
    client.publish(TOPICS.temperatura, payload);
    log('>> temperatura', payload);
}

function publishHumidity() {
    humidity = clamp(humidity + randomStep(2), 30, 90);
    const payload = JSON.stringify({ value: Math.round(humidity) });
    client.publish(TOPICS.umidade, payload);
    log('>> umidade', payload);
}

function publishLampState() {
    const payload = JSON.stringify({ state: lampState });
    // retain: o app recebe o último estado assim que se inscreve
    client.publish(TOPICS.estado, payload, { retain: true });
    log('>> estado', payload);
}

let timers = [];

client.on('connect', () => {
    log(`Conectado a ${BROKER_URL}`);
    log(`Prefixo dos tópicos: ${BASE}`);

    client.subscribe(TOPICS.comando, (err) => {
        if (err) log('Erro ao inscrever no comando:', err.message);
        else log('Aguardando comandos em', TOPICS.comando);
    });

    // Evita timers duplicados após uma reconexão
    timers.forEach(clearInterval);
    publishTemperature();
    publishHumidity();
    publishLampState();
    timers = [
        setInterval(publishTemperature, 3000),
        setInterval(publishHumidity, 4000),
    ];
});

client.on('message', (topic, buffer) => {
    if (topic !== TOPICS.comando) return;
    const raw = buffer.toString();
    log('<< comando', raw);

    try {
        const { action } = JSON.parse(raw);
        if (action === 'ON' || action === 'OFF') {
        lampState = action;
        publishLampState(); // confirma o novo estado para o app
        } else {
        log('Comando ignorado (action inválida):', action);
        }
    } catch {
        log('Comando ignorado (JSON inválido)');
    }
});

client.on('reconnect', () => log('Reconectando...'));
client.on('offline', () => log('Offline'));
client.on('error', (err) => log('Erro:', err.message));

process.on('SIGINT', () => {
    log('Encerrando simulador...');
    timers.forEach(clearInterval);
    client.end(false, {}, () => process.exit(0));
});